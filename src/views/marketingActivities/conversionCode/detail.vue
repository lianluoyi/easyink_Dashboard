<!--
 * @Description: 兑换码详情
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
// TODO 滚动条样式修改
<template>
  <div>
    <ReturnPage path="/operationsCenter/conversionCode/list" />
    <RightContainer style="margin-top: 10px">
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          class="top-search"
        >
          <el-form-item prop="code">
            <el-input v-model="query.code" placeholder="请输入兑换码" />
          </el-form-item>
          <el-form-item prop="receiveName">
            <el-input
              v-model="query.receiveName"
              placeholder="请输入领取人昵称"
            />
          </el-form-item>
          <el-form-item prop="status">
            <el-select
              v-model="query.status"
              placeholder="请选择领取状态"
              size="small"
            >
              <el-option
                v-for="item in receiveOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList(1)">查询</el-button>
            <el-button class="btn-reset" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:operate-btn>
        <el-dropdown
          v-hasPermi="['redeeomCode:activity:edit']"
          class="dropdown-reset"
          split-button
          @click="() => handleConversionCode(true)"
          @command="(e) => handleConversionCode(e)"
        >
          导入兑换码
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              style="width: 108px"
              :command="SINGLE_ADD"
            >单个新增</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-hasPermi="['redeeomCode:activity:edit']" type="reset" class="btn-reset" @click="batchDel">批量删除</el-button>
      </template>
      <template v-slot:data>
        <el-table
          :data="list"
          max-height="600"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon :length="list.length" />
          </template>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="兑换码" align="center" prop="code" />
          <el-table-column align="center" width="150" prop="status">
            <template #default="{ row }">
              <div>{{ row.status?'已领取':'未领取' }}</div>
            </template>
            <template #header>
              <div>
                <span>领取状态</span>
                <el-popover
                  placement="top-start"
                  trigger="hover"
                  popper-class="tip-popover"
                  content="向客户发送兑换码，即视为领取，不是实际权益兑换结果"
                >
                  <i
                    slot="reference"
                    class="iconfont icon-question"
                    style="font-size: 14px"
                  />
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="有效期" align="center" prop="effectiveTime" />
          <el-table-column label="领取人" align="center" prop="receiveName">
            <template slot-scope="{ row }">
              <span class="receive-name" @click="goRoute(row)">
                {{ row.receiveName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="领取时间"
            align="center"
            prop="redeemTime"
            width="180"
          />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="{ row }">
              <el-button
                v-hasPermi="['redeeomCode:activity:edit']"
                type="text"
                @click="editConversionCode(row)"
              >编辑</el-button>
              <el-button
                v-hasPermi="['redeeomCode:activity:edit']"
                type="text"
                @click="handleDelete(row.code)"
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
        <div class="new-add">
          <el-dialog
            :close-on-click-modal="false"
            :title="(isSingleAdd ? '添加' : '编辑') + '兑换码'"
            :visible.sync="singleAddDialogVisible"
            width="500px"
          >
            <el-form
              ref="addForm"
              label-width="70px"
              :model="addForm"
              :rules="rules"
              class="form"
            >
              <el-form-item label="兑换码" prop="code">
                <el-input
                  v-model="addForm.code"
                  :disabled="!isSingleAdd"
                  style="width: 220px"
                  placeholder="请填写该活动下的兑换码"
                />
              </el-form-item>
              <el-form-item label="有效期">
                <el-date-picker
                  v-model="addForm.effectiveTime"
                  type="date"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
              <el-form-item v-if="!isSingleAdd" label="领取人">
                <el-select
                  ref="configSelect"
                  v-model="addForm.receiveName"
                  :multiple="false"
                  filterable
                  clearable
                  remote
                  reserve-keyword
                  placeholder="请填写客户昵称，回车搜索"
                  :loading="loading"
                  :no-data-text="matchText"
                  :remote-method="searchReceiveName"
                  style="width: 220px"
                  @change="selectReceiveUser"
                  @visible-change="visibleChange"
                  @clear="clear"
                  @keyup.enter.native="searchReceive"
                >
                  <el-option
                    v-for="item in receivePeople"
                    :key="item.externalUserid"
                    :label="item.name"
                    :value="item.externalUserid"
                  />
                </el-select>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button
                @click="cancel"
              >取 消</el-button>
              <RequestButton type="primary" :request-method="addConversionCode" button-type="save">确 定</RequestButton>
            </span>
          </el-dialog>
        </div>
      </template>
    </RightContainer>
    <ImportFile
      :visible.sync="importVisible"
      title="兑换码"
      :loading="importLoading"
      :import-info="importInfo"
      href="兑换码导入模板.xlsx"
      @handleImportFile="handleImportFile"
    />
  </div>
</template>

<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import ImportFile from '@/components/ImportFile.vue';
import { PAGE_LIMIT } from '@/utils/constant/index';
import { CUSTOMER_DEATIL_PATH } from '@/utils/constant/routePath';
import RightContainer from '@/components/RightContainer';
import * as conversionCode from '@/api/redeem';
import { goRouteWithQuery } from '@/utils';
const DEFAULT_PAGE_NUM = 1;
export default {
  name: 'List',
  components: { RightContainer, EmptyDefaultIcon, ImportFile, RequestButton },
  data() {
    return {
      query: {
        code: '',
        receiveStartTime: '', // 领取开始时间
        receiveEndTime: '', // 领取结束时间
        receiveName: '', // 领取人昵称
        // 领取状态
        status: undefined,
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT
      },
      addForm: {
        code: '', // 兑换码
        receiveName: '', // 领取人
        receiveUserId: '', // 领取人ID
        effectiveTime: '' // 有效期
      },
      rules: {
        code: [{ required: true, message: '请输入兑换码', trigger: 'blur' }]
      },
      // 远程搜索领取人的加载状态
      loading: false,
      list: [],
      total: 0,
      receivePeople: [], // 搜索的领取人
      dateRange: [],
      // 单个新增
      SINGLE_ADD: false,
      // 控制新增/编辑单个弹窗是否显示
      singleAddDialogVisible: false,
      // 判断是新增还是弹窗 true:新增
      isSingleAdd: true,
      // 领取状态（ 1：已领取 0：未领取）
      receiveOptions: [
        { label: '已领取', value: 1 },
        { label: '未领取', value: 0 }
      ],
      // 导入兑换码状态
      importLoading: false,
      // 导入兑换码弹窗
      importVisible: false,
      // 导入兑换码结果
      importInfo: {},
      // 选中数组
      codeList: [],
      // 用户未按下回车键提示语
      matchText: '回车搜索'
    };
  },
  watch: {
    'addForm.receiveName'(val) {
      if (!val) {
        this.matchText = '回车搜索';
      }
    }
  },
  created() {
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
      const { receiveStartTime, receiveEndTime } = this.$store.getters.searchQuery[this.$route.name];
      if (receiveStartTime && receiveEndTime) {
        this.dateRange = [receiveStartTime, receiveEndTime];
      }
      this.query = this.$store.getters.searchQuery[this.$route.name];
    }
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>客户通过兑换码领取内容商品等专属权益，帮助店铺快速引流、拓宽销售渠道、提高商品转化率</div>
      `
    );
    this.getList();
  },
  methods: {
    /**
     * 通过value判断是导入兑换码还是单个新增 value:true 导入 false :单个新增
     */
    handleConversionCode(value) {
      if (value) {
        this.importVerbalTrick();
      } else {
        this.addForm.code = '';
        this.addForm.effectiveTime = '';
        this.isSingleAdd = true;
        this.singleAddDialogVisible = true;
      }
    },
    /**
     * 多选框选中数据
     */
    handleSelectionChange(selection) {
      this.codeList = selection.map((item) => item.code);
    },
    /**
     * 下拉框选中数据
     * @param 选中人id
     */
    selectReceiveUser(value) {
      this.addForm.receiveUserId = value;
    },
    /**
     * 跳转到客户详情
     */
    goRoute(row) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.query
      });
      goRouteWithQuery(this.$router, CUSTOMER_DEATIL_PATH,
        {}, {
          id: row.receiveUserId,
          prePageType: 'conversionCodeDetail'
        });
    },
    /**
     * 搜索领取人
     * @param 领取人名
     */
    searchReceive() {
      const { receiveName } = this.addForm;
      // 点击回车后显示下拉框
      if (receiveName) {
        this.loading = true;
        conversionCode['codeReceivePeople']({ customerName: receiveName }).then((res) => {
          this.loading = false;
          this.matchText = '无数据';
          this.receivePeople = res.data.filter((item) => {
            return item.name.indexOf(receiveName) > -1;
          });
        });
      }
    },
    cancel() {
      this.singleAddDialogVisible = false;
      this.addForm.receiveName = '';
    },
    /**
     * 输入的搜索人名
     */
    searchReceiveName(query) {
      // 控制下拉框是否显示
      this.addForm.receiveName = query;
    },
    /**
     * 清空搜索的领取人列表
     */
    clear() {
      this.receivePeople = [];
    },
    /**
     * 下拉框状态改变时
     */
    visibleChange(value) {
      // 出现则为 true，隐藏则为 false
      if (!value) {
        this.receivePeople = [];
      }
    },
    /**
     * 重置
     */
    resetQuery() {
      this.dateRange = [];
      this.query = this.$options.data().query;
      this.getList(1);
    },
    /**
     * 打开导入兑换码弹窗
     */
    importVerbalTrick() {
      this.importVisible = true;
    },
    /**
     * 导入兑换码
     */
    handleImportFile(formData) {
      this.importLoading = true;
      conversionCode['importRedeemCode'](this.$route.query.id, formData).then(res => {
        const resData = res.data;
        this.importInfo = {
          successNum: resData.successNum,
          failNum: resData.failNum,
          url: resData.url
        };
        this.resetQuery();
      })
        .finally(() => {
          this.importLoading = false;
        });
    },
    /**
     * 获取兑换码列表
     */
    getList(pageNum) {
      this.query.receiveStartTime = this.dateRange && this.dateRange[0];
      this.query.receiveEndTime = this.dateRange && this.dateRange[1];
      this.query.activityId = this.$route.query.id;
      pageNum && (this.query.pageNum = pageNum);
      this.loading = true;
      conversionCode['getConversionCodeList'](this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /**
     * 提交 增加/修改兑换码
     */
    addConversionCode() {
      this.$refs['addForm'].validate((valid) => {
        if (!valid) { changeButtonLoading(this.$store, 'save'); return false; }
        const params = {
          code: this.addForm.code,
          effectiveTime: this.addForm.effectiveTime,
          activityId: this.$route.query.id,
          receiveUserId: !this.isSingleAdd ? this.addForm.receiveUserId : null
        };
        conversionCode[
          this.isSingleAdd ? 'addConversionCode' : 'updateConversionCode'
        ](params).then(() => {
          this.msgSuccess('操作成功');
          this.singleAddDialogVisible = false;
          this.resetQuery();
        }).finally(() => {
          changeButtonLoading(this.$store, 'save');
        });
      });
    },
    /**
     * 编辑兑换码
     * * @param 兑换码详情
     */
    editConversionCode(row) {
      this.isSingleAdd = false;
      this.addForm.code = row.code;
      this.addForm.effectiveTime = row.effectiveTime;
      this.singleAddDialogVisible = true;
      this.$refs['addForm'] && this.$refs['addForm'].clearValidate();
    },
    /**
     * 删除兑换码
     * @param
     * "idList": []
     */
    delConversionCode(params) {
      this.confirmModal(
        {
          msg: '<div style="line-height: 18px;">删除后，兑换码与客户的领取关系将被解除，且不可恢复，是否继续？ </br> <div style="margin-top:10px;" class="text-warning">注意：为保证客户拿到的兑换码有效，已被领取的兑换码删除后不要再次导入</div></div>',
          dangerouslyUseHTMLString: true
        },
        async() => {
          const delParams = {
            ...params,
            activityId: this.$route.query.id
          };
          conversionCode['deleteConversionCode'](delParams).then(() => {
            this.getList();
            this.msgSuccess('操作成功');
          });
        }
      );
    },
    /**
     * 删除单个兑换码
     * @param row 对应兑换码
     */
    handleDelete(code) {
      this.delConversionCode({
        // 需要删除的标签规则id列表
        codeList: [code]
      });
    },
    /*
     * 批量删除兑换码
     */
    batchDel() {
      if (this.codeList.length <= 0) {
        this.msgWarn('请至少选择一个兑换码');
        return;
      }
      this.delConversionCode({
        codeList: this.codeList
      });
    }
  }
};
</script>

<style scoped lang="scss">
.new-add {
  position: absolute;
  /deep/.el-dialog {
    position: relative;
    top: 15%;
    width: 800px;
  }
  /deep/.el-dialog__body {
    padding: 6px 20px;
  }
}
.receive-name {
  color :#3AB2A6;
  cursor: pointer;
}
</style>
