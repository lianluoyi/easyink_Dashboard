<!-- 敏感词设置页面 -->
<template>
  <div class="add-sensitive-word">
    <el-form :inline="true" :model="form" class="demo-form-inline" @submit.native.prevent>
      <el-button
        v-hasPermi="['wecom:sensitive:add']"
        type="primary"
        class="add-btn"
        icon="el-icon-plus"
        @click="addSensitive"
      >添加敏感词</el-button>
      <el-form-item>
        <el-input
          v-model="form.keyWord"
          placeholder="请输入策略名称/敏感词，回车搜索"
          style="width:300px"
          @keyup.enter.native="getSettingList"
        />
        <el-button
          class="btn-reset"
          @click="resetQuery()"
        >重置</el-button>
      </el-form-item>
    </el-form>
    <div class="strategy-list">
      <empty-default-icon
        :length="tableData.length"
        text="暂无敏感词"
        btn-text="添加敏感词"
        btn-icon="el-icon-plus"
        :btn-click="addSensitive"
        :btn-show-condition="{ keyWord: form.keyWord }"
      >
        <ul>
          <li v-for="strategyItem in tableData" :key="strategyItem.id">
            <StrategyItem
              :item="strategyItem"
              :handle-status-change="handleStatusChange"
              :handle-update="handleUpdate"
              :handle-delete="handleDelete"
            />
          </li>
        </ul>
      </empty-default-icon>
    </div>
    <!-- 添加敏感词 -->
    <el-dialog
      class="foot-button-reverse-dialog-wrapper"
      :title="submitFlag === 'modify' ? '修改敏感词' : '添加敏感词'"
      :visible.sync="open"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
      @open="openDialog"
    >
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="rules"
        label-width="130px"
      >
        <el-form-item label="敏感词策略名称" prop="strategyName">
          <el-input v-model="addForm.strategyName" placeholder="例：红包" />
        </el-form-item>
        <el-form-item label="敏感词" prop="patternWords">
          <el-input
            v-model="addForm.patternWords"
            placeholder="例：红包,hongbao,hb"
          />
          <div class="sub-title">敏感词间用英文逗号隔开</div>
        </el-form-item>
        <el-form-item label="审计范围">
          <div class="tag-input" @click="openAuditUserRange">
            <span
              v-if="!auditUserRange.length"
              class="tag-place"
            >请选择<span
              class="prompt-title"
            >若不选择，则默认全体成员</span>
            </span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in auditUserRange"
                :key="unique"
                type="info"
              >{{ unit.name }}</el-tag>
            </template>
          </div>
        </el-form-item>
        <el-form-item label="审计人" :required="true" :error="errorMsg">
          <div class="tag-input" @click="openAuditUser">
            <span
              v-if="!auditUser.length"
              class="tag-place"
            >请选择<span class="prompt-title">请选择部门负责人</span></span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in auditUser"
                :key="unique"
                type="info"
              >{{ unit.name }}</el-tag>
            </template>
          </div>
        </el-form-item>
        <el-form-item label="消息通知">
          <el-switch
            v-model="alertFlag"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addSensitiveForm">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择审计范围弹窗 -->
    <SelectUser
      :is-only-leaf="false"
      :visible.sync="dialogVisibleSelectUser"
      title="选择审计范围"
      :ignore-permission="true"
      :select-user-list="auditUserRange"
      @success="selectedUser"
    />
    <!-- 选择审计人弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectAuditUser"
      title="选择添加人"
      is-sigle-select
      :ignore-permission="true"
      :select-user-list="auditUser"
      @success="selectedAuditUser"
    />
  </div>
</template>
<script>
import * as sensitiveApis from '@/api/conversation/security';
import SelectUser from '@/components/SelectUser';
import { PAGE_LIMIT_INFINITE, SCOPE_TYPE } from '@/utils/constant';
import StrategyItem from './strategyItem.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
const ALL_USERID = '-1';
export default {
  components: {
    SelectUser,
    StrategyItem,
    EmptyDefaultIcon
  },
  data() {
    return {
      form: {
        pageSize: PAGE_LIMIT_INFINITE,
        pageNum: 1,
        keyWord: '' // 关键词
      },
      addForm: {
        strategyName: '', // 策略名称
        patternWords: '' // 敏感词
      },
      alertFlag: 0, // 消息通知
      tableData: [], // 敏感词列表
      errorMsg: '', // 审计人错误提示
      rangeErrorMsg: '', // 审计范围错误提示
      auditUserRange: [], // 审计范围
      auditUser: [], // 审计人
      total: 0,
      dialogVisibleSelectUser: false, // 是否显示审计范围
      dialogVisibleSelectAuditUser: false, // 是否显示审计人
      open: false, // 是否显示添加敏感词弹框
      submitFlag: '', // 添加或者修改
      rowId: '', // 修改的数据id
      rules: {
        strategyName: [
          { required: true, message: '敏感词策略不能为空', trigger: 'blur' }
        ],
        patternWords: [
          { required: true, message: '敏感词不能为空', trigger: 'blur' }
        ]
      }
    };
  },
  mounted() {
    this.getSettingList();
  },
  methods: {
    // 获取敏感词设置列表
    getSettingList() {
      sensitiveApis.getSettingSensitiveList(this.form).then((res) => {
        this.tableData = res.rows;
        this.total = Number(res.total);
      });
    },
    // 提交敏感词表单
    addSensitiveForm() {
      // console.log(this.auditUser)
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          if (this.auditUser.length === 0) {
            this.errorMsg = '请选择审计人';
            return;
          } else {
            this.rangeErrorMsg = '';
          }
          const params = this.addForm;
          const auditUserScope = [];
          // 由于弹窗中无法选择部门，所以scopeType直接传个人的类型
          if (this.auditUserRange.length === 1 && this.auditUserRange[0].department === SCOPE_TYPE['all']) {
            auditUserScope.push({
              auditScopeId: ALL_USERID,
              auditScopeName: '全部员工',
              scopeType: SCOPE_TYPE['all']
            });
          } else {
            this.auditUserRange.map(item => {
              const obj = {
                scopeType: SCOPE_TYPE['personal'],
                auditScopeId: item.userId,
                auditScopeName: item.name
              };
              auditUserScope.push(obj);
            });
          }
          if (auditUserScope.length === 0) {
            auditUserScope.push({
              auditScopeId: ALL_USERID,
              auditScopeName: '全部员工',
              scopeType: SCOPE_TYPE['all']
            });
          }
          params.auditUserScope = auditUserScope;
          params.auditUserId = this.auditUser.map((d) => d.userId) + '';
          params.auditUserName = this.auditUser.map((d) => d.name) + '';
          params.alertFlag = this.alertFlag;
          if (this.submitFlag === 'add') {
            sensitiveApis.addSettingSensitive(params).then((res) => {
              this.open = false;
              this.getSettingList();
            });
          }
          if (this.submitFlag === 'modify') {
            params.id = this.rowId;
            sensitiveApis.modifySettingSensitive(params).then((res) => {
              this.open = false;
              this.getSettingList();
            });
          }
        }
      });
    },
    // 打开审计范围
    openAuditUserRange() {
      this.dialogVisibleSelectUser = true;
    },
    // 打开审计人
    openAuditUser() {
      this.dialogVisibleSelectAuditUser = true;
    },
    resetForm() {
      this.addForm = {
        strategyName: '',
        patternWords: ''
      };
      this.auditUserRange = []; // 审计范围
      this.auditUser = []; // 审计人
      this.alertFlag = 0;
      this.errorMsg = '';
    },
    // 添加敏感词
    addSensitive() {
      this.submitFlag = 'add';
      this.resetForm();
      this.open = true;
    },
    selectedUser(list) {
      // debugger
      // console.log(list)
      this.auditUserRange = list;
      // this.form.scopeType = list.map(d => d.department) + ""
      // this.form.auditScopeId = list.map(d => d.userId) + ""
    },
    selectedAuditUser(list) {
      this.auditUser = list;
    },
    // 修改敏感词
    handleUpdate(row) {
      // console.log(row)
      this.submitFlag = 'modify';
      this.errorMsg = '';
      this.rowId = row.id;
      sensitiveApis.getSensitiveDetails(this.rowId).then((res) => {
        this.addForm.strategyName = res.data.strategyName;
        this.addForm.patternWords = res.data.patternWords;
        this.auditUser = [
          {
            name: res.data.auditUserName,
            userId: res.data.auditUserId
          }
        ];
        const newAuditUserRange = [];
        res.data.auditUserScope.map(item => {
          newAuditUserRange.push({
            name: item.auditScopeName,
            userId: item.auditScopeId,
            department: item.scopeType
          });
        });
        this.auditUserRange = newAuditUserRange;
        this.alertFlag = res.data.alertFlag;
      });
      this.open = true;
    },
    // 删除敏感词
    handleDelete(row) {
      this.confirmModal({
        msg: `删除敏感策略“${row.strategyName}”后不可撤销，是否继续？`
      }, () => {
        return sensitiveApis.deleteSensitive(row.id)
          .then((res) => {
            this.msgSuccess('删除成功');
            this.getSettingList();
          });
      });
    },
    /**
     * 设置消息通知开关
     */
    handleStatusChange(row) {
      sensitiveApis.modifySettingSensitive(row).then((res) => {
        this.getSettingList();
      });
    },
    /**
     * 点击查询敏感词列表
     */
    onSearch() {
      this.form.pageNum = 1;
      this.getSettingList(1);
    },
    /**
     * 重置查询条件
     */
    resetQuery() {
      this.form = {
        pageSize: PAGE_LIMIT_INFINITE,
        pageNum: 1,
        keyWord: '' // 关键词
      };
      this.onSearch();
    },
    openDialog() {
      this.$refs.addForm?.clearValidate();
    }
  }
};
</script>
<style lang="scss" scoped>
.add-sensitive-word {
  background-color: #fff;
  height: 100%;
  .strategy-list {
    // 63px为敏感消息记录tabs的高度
    height: calc(100% - 63px);
    overflow: auto;
    padding: 15px 20px 0 20px;
  }
}
.demo-form-inline {
  padding: 15px 20px 0;
  display: flex;
  align-items: center;
  .btn-reset {
    margin-left: 8px;
  }
  .el-form-item {
    padding: 0;
  }
}
/deep/ .add-btn {
  margin-right: 10px;
}
.content {
  margin-top: 15px;
  padding: 10px;
}
.prompt-title {
  margin-left: 10px;
  color: #999;
}
.tag-place {
  color: #1890ff;
}
.tag-input {
  width: 100%;
}
.sub-title {
  font-size: 13px;
  color: #999;
}
.audit-scope-column {
  .tab-item {
    display: inline-block;
    margin: 4px 5px 4px 0;
  }
}
</style>
