<script>
import * as api from '@/api/organization';
import { PAGE_LIMIT, STATUS_ACTIVATE, STATUS_DIMISION } from '@/utils/constant';

export default {
  name: 'Organization',
  components: {},
  props: {},
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        isActivate: '',
        department: ''
      },
      dateRange: [],
      treeData: [],
      userList: [],
      status: {
        0: '启用',
        1: '禁用',
        [STATUS_DIMISION]: '离职'
      },
      statusActivate: STATUS_ACTIVATE,
      total: 0,
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      form: {},
      dialogVisible: false,
      disabled: false,
      loading: false,
      multipleSelection: [],
      formDepart: {},
      dialogVisibleDepart: false,
      dialogVisibleAvatar: false,
      queryImg: {
        pageNum: 1,
        pageSize: PAGE_LIMIT + PAGE_LIMIT
      },
      totalImg: 0,
      // 表单校验
      rules: Object.freeze({
        name: [{ required: true, message: '必填项', trigger: 'blur' }],
        userId: [{ required: true, message: '必填项', trigger: 'blur' }],
        mainDepartment: [{ required: true, message: '必填项', trigger: 'change' }],
        joinTime: [{ required: true, message: '必填项', trigger: 'blur' }],
        wxAccount: [{ required: true, message: '必填项', trigger: 'blur' }],
        email: [
          { required: true, message: '必填项', trigger: 'blur' },
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          { required: true, message: '必填项', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      })
    };
  },
  computed: {},
  watch: {},
  created() {
    this.getTree();
    this.getList();
  },
  mounted() {},
  methods: {
    getTree() {
      api.getTree().then(({ data }) => {
        this.treeData = this.handleTree(data);
      });
    },
    getList(page) {
      // console.log(this.dateRange);
      if (this.dateRange) {
        this.query.beginTime = this.dateRange[0];
        this.query.endTime = this.dateRange[1];
      } else {
        this.query.beginTime = '';
        this.query.endTime = '';
      }
      page && (this.query.pageNum = page);
      this.loading = true;
      api
        .getList(this.query)
        .then(({ rows, total }) => {
          this.userList = rows;
          this.total = +total;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleNodeClick(data) {
      this.query.department = Number(data.id) === 1 ? '' : data.id;
      this.getList(1);
    },
    edit(data, type) {
      this.$refs['form'] && this.$refs['form'].clearValidate();
      this.form = Object.assign({}, data || { _new: true });
      this.dialogVisible = true;
      type || !data ? (this.disabled = false) : (this.disabled = true);
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const form = JSON.parse(JSON.stringify(this.form));
          if (!form.name || !form.userId || !form.mobile || !form.mainDepartment) {
            this.msgError('请填写必填项');
            return;
          }
          form.department = form.mainDepartment;
          form.department += '';
          form.isLeaderInDept += '';
          api[form._new ? 'addUser' : 'updateUser'](form)
            .then(() => {
              this.msgSuccess('操作成功');
              this.dialogVisible = false;
              this.getList(form._new && 1);
            })
            .catch(() => {
              this.dialogVisible = false;
            });
        }
      });
    },
    startOrStop(data) {
      // 0: 启用，1：禁用
      const params = {
        userId: data.userId,
        enable: Number(data.enable) === 1 ? 0 : 1
      };
      api.startOrStop(params).then(() => {
        this.msgSuccess('操作成功');
        this.getList();
      });
    },
    /** 删除按钮操作 */
    remove(id) {
      this.confirmModal({
        msg: '删除后，该成员将从企业下移除，是否继续？'
      }, () => {
        return api.remove(id)
          .then(() => {
            this.getList();
            this.msgSuccess('删除成功');
          });
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    syncUser() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      api.syncUser().then(() => {
        loading.close();
        this.msgSuccess('操作成功');
        this.getList();
      });
    },
    batchImport() {},
    departEdit(data, type) {
      this.formDepart = Object.assign(
        {},
        type ? data : { parentId: data.id, pName: data.name }
      );
      this.dialogVisibleDepart = true;
    },
    departRemove(id) {
      this.confirmModal({
        msg: '是否确认删除吗'
      }, () => {
        return api.removeDepart(id)
          .then(() => {
            this.getTree();
            this.msgSuccess('删除成功');
          });
      });
    },
    departSubmit() {
      api[this.formDepart.id ? 'updateDepart' : 'addDepart'](this.formDepart)
        .then(() => {
          this.msgSuccess('操作成功');
          this.dialogVisibleDepart = false;
          this.getTree();
        })
        .catch(() => {
          this.dialogVisibleDepart = false;
        });
    },
    showAvatarDialog() {
      this.dialogVisibleAvatar = true;
      this.getImgList(1);
    },
    getImgList() {
      // todo get imgage list
    },
    submitAvatar() {
      // this.form.avatarMediaid = g;
    }
  }
};
</script>

<template>
  <div>
    <el-form
      ref="queryForm"
      class="top-search"
      :model="query"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="姓名" prop="title">
        <el-input v-model="query.name" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="入职时间">
        <el-date-picker
          v-model="dateRange"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        />
      </el-form-item>
      <el-form-item label="加入状态">
        <el-select v-model="query.isActivate">
          <el-option label="已加入" :value="1" />
          <el-option label="待加入" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label>
        <el-button
          type="primary"
          @click="getList(1)"
        >查询</el-button>
      </el-form-item>
    </el-form>

    <div class="ar mb15">
      <el-button
        v-hasPermi="['contacts:organization:sync']"
        type="primary"
        @click="syncUser"
      >同步成员</el-button>
      <!-- <el-button
        v-hasPermi="['contacts:organization:import']"
        type="info"
        @click="batchImport"
        >批量导入</el-button
      > -->
      <!-- <el-button
        v-hasPermi="['contacts:organization:addMember']"
        type="primary"
        icon="el-icon-plus"
        @click="edit()"
        >添加成员</el-button
      > -->
    </div>
    <el-row type="flex" justify="space-between">
      <!--部门数据-->
      <el-col :span="6">
        <div class="head-container">
          <!-- <div>部门架构</div> -->
          <!-- :filter-node-method="filterNode" -->
          <el-tree
            ref="tree"
            class="left-tree"
            :data="treeData"
            :props="defaultProps"
            :expand-on-click-node="false"
            default-expand-all
            @node-click="handleNodeClick"
          >
            <div slot-scope="{ node, data }" class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span class="fr">
                <i
                  v-if="node.level !== 1"
                  v-hasPermi="['system:dept:edit']"
                  class="iconfont icon-tool-edit"
                  title="编辑"
                  @click.stop="departEdit(data, 1)"
                />
                <i
                  v-hasPermi="['system:dept:add']"
                  class="iconfont icon-add"
                  title="添加"
                  @click.stop="departEdit(data, 0)"
                />
                <i
                  v-if="node.level !== 1"
                  v-hasPermi="['system:dept:remove']"
                  class="iconfont icon-tool-delete"
                  title="删除"
                  @click.stop="departRemove(data.id)"
                />
              </span>
            </div>
          </el-tree>
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="17">
        <el-table
          v-loading="loading"
          :data="userList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column
            label="成员"
            align="center"
            prop="name"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="性别" align="center" prop="gender">
            <template slot-scope="scope">
              <i
                :title="[
                  'iconfont',
                  { 1: '男', 2: '女' }[scope.row.gender] || '未知性别'
                ]"
                :class="[
                  'iconfont',
                  { 1: 'icon-boy', 2: 'icon-girl' }[scope.row.gender] || 'icon-unknown-gender'
                ]"
              />
            </template>
          </el-table-column>
          <el-table-column label="职务" align="center" prop="position" />
          <el-table-column label="手机号" align="center" prop="mobile" />
          <el-table-column
            label="入职时间"
            align="center"
            prop="joinTime"
            width="160"
          >
            <!-- <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>-->
          </el-table-column>
          <el-table-column label="状态" align="center" prop="isActivate">
            <template slot-scope="scope">{{
              statusActivate[scope.row.isActivate]
            }}</template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="180"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['contacts:organization:info']"
                type="text"
                @click="edit(scope.row, 0)"
              >详情</el-button>
              <el-button
                v-if="scope.row.userId !== 1 && scope.row.enable < 2"
                v-hasPermi="['contacts:organization:forbidden']"
                type="text"
                @click="startOrStop(scope.row)"
              >{{ status[scope.row.enable] }}</el-button>
              <el-button
                v-if="scope.row.enable < 2"
                v-hasPermi="['contacts:organization:edit']"
                type="text"
                @click="edit(scope.row, 1)"
              >编辑</el-button>
              <el-button
                v-if="scope.row.enable < 2"
                v-hasPermi="['contacts:organization:removeMember']"
                type="text"
                @click="remove(scope.row.userId)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="getList()"
        />
      </el-col>
    </el-row>

    <!-- 人员弹窗 -->
    <el-dialog
      :title="(form.userId ? (disabled ? '成员详情' : '修改成员') : '添加成员')"
      :visible.sync="dialogVisible"
      class="member-info-modal"
      :close-on-click-modal="(form.userId ? (disabled ? true : false) : false)"
    >
      <el-row :gutter="10" class="modal-top">
        <el-col :span="4">
          <!-- <el-upload action :show-file-list="false" :on-success="d" :before-upload="d">
            <img v-if="form.avatarMediaid" :src="form.avatarMediaid" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>-->
          <div class="avatar-wrap ac" @click="showAvatarDialog">
            <img
              v-if="form.avatarMediaid"
              class="avatar"
              :src="form.avatarMediaid"
            >
            <i v-else class="el-icon-plus avatar-uploader-icon cc" />
          </div>
        </el-col>
        <el-col :span="11">
          <el-form
            ref="form"
            label-position="right"
            :model="form"
            :rules="rules"
            label-width="60px"
            :disabled="disabled"
          >
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="账号" prop="userId">
              <el-input
                v-model="form.userId"
                :disabled="!form._new"
                placeholder="成员唯一标识，不支持更改，不支持中文"
              />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="10" class="modal-bottom">
        <el-col :span="12">
          <div class="type-title">基本信息</div>
          <el-form
            ref="form"
            label-position="right"
            :model="form"
            :rules="rules"
            label-width="80px"
            :disabled="disabled"
          >
            <el-form-item label="昵称">
              <el-input
                v-model="form.alias"
                placeholder="可在新闻公告应用的生日祝福等场景使用"
              />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="form.mobile" />
            </el-form-item>
            <el-form-item label="生日">
              <el-date-picker
                v-model="form.birthday"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder
              />
            </el-form-item>
            <el-form-item label="身份证">
              <el-input v-model="form.idCard" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="QQ">
              <el-input v-model="form.qqAccount" />
            </el-form-item>
            <el-form-item label="地址">
              <el-input v-model="form.address" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <div class="type-title">企业信息</div>
          <el-form
            ref="form"
            label-position="right"
            :model="form"
            :rules="rules"
            label-width="80px"
            :disabled="disabled"
          >
            <el-form-item label="所在部门" prop="mainDepartment">
              <el-cascader
                v-model="form.mainDepartment"
                :options="treeData"
                :show-all-levels="false"
                :props="{
                  expandTrigger: 'hover',
                  checkStrictly: true,
                  /** multiple: true,*/ emitPath: false,
                  value: 'id',
                  label: 'name',
                }"
              />
            </el-form-item>
            <el-form-item label="职位">
              <el-input v-model="form.position" />
            </el-form-item>
            <el-form-item label="角色">
              <el-radio-group v-model="form.isLeaderInDept">
                <el-radio :label="0">普通成员</el-radio>
                <el-radio :label="1">上级</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="入职时间">
              <el-date-picker
                v-model="form.joinTime"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder
              />
            </el-form-item>
            <!-- <el-form-item label="备注">
              <el-input type="textarea" v-model="model"></el-input>
            </el-form-item>-->
          </el-form>
        </el-col>
      </el-row>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 部门弹窗 -->
    <el-dialog
      :title="(formDepart.id ? '修改' : '添加') + '部门'"
      :visible.sync="dialogVisibleDepart"
      :close-on-click-modal="false"
    >
      <el-form :model="formDepart" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="formDepart.name" />
        </el-form-item>
        <el-form-item v-if="formDepart.pName" label="所属部门">
          <el-input v-model="formDepart.pName" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisibleDepart = false">取 消</el-button>
        <el-button type="primary" @click="departSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 选择头像弹窗 -->
    <el-dialog :visible.sync="dialogVisibleAvatar" :close-on-click-modal="false">
      <div slot="title" class="fxbw aic">
        <span>选择头像</span>
        <el-pagination
          class="mr20"
          :current-page="queryImg.pageNum"
          :page-size="queryImg.pageSize"
          layout="total, prev, pager, next"
          :total="totalImg"
          @current-change="getImgList"
        />
      </div>
      <el-radio-group v-model="form.avatarMediaid" class="img-wrap">
        <el-radio v-for="(item, index) in 20" :key="index" :label="3">
          <img class="img-li" src="~@/assets/image/login-background.png" alt>
        </el-radio>
      </el-radio-group>
      <div slot="footer">
        <el-button @click="dialogVisibleAvatar = false">取 消</el-button>
        <el-button type="primary" @click="submitAvatar">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  .fr {
    .iconfont {
      font-size: 1em;
      margin-left: 8px;
    }
  }
}
.avatar-wrap {
  height: 137px;
  border: 1px solid #eee;
  border-radius: 50%;
  // border-radius: 5px;
  position: relative;
  overflow: hidden;
}
.avatar {
  height: 100%;
}
.avatar-uploader-icon {
  font-size: 58px;
  color: #ddd;
}
.img-wrap {
  height: 340px;
  overflow: auto;
  /deep/.el-radio__input {
    position: absolute;
    right: 0;
  }
}
.img-li {
  width: 115px;
  height: 160px;
}
.mb15 {
  text-align: left;
}
.member-info-modal {
  /deep/ .el-dialog__body {
    padding: 20px;
  }
  .modal-top {
    display: flex;
    align-items: center;
  }
  .modal-bottom {
    /deep/ .el-form-item__content {
      width: calc(100% - 80px);
      position: relative;
      .el-cascader, .el-date-editor {
        width: 100%;
      }
    }
    .type-title {
      border-left: 2px solid #2D8FF4;
      padding-left: 12px;
      margin-left: 8px;
      margin-bottom: 14px;
      color: #333;
      height: 20px;
      line-height: 20px;
    }
  }
}
</style>
