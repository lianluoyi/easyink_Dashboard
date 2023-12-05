<!--
 * @Description: 智能表单管理列表区域
 * @Author: xulinbin
 * @LastEditors: wJiaaa
-->
<template>
  <div class="intelligent-form-list-wrap">
    <RightContainer>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :model="query"
          :inline="true"
          label-width="100px"
          class="top-search"
        >
          <el-form-item prop="formName">
            <el-input
              v-model="query.formName"
              placeholder="请输入表单名称"
              clearable
              @keyup.enter.native="onSearch(true)"
            />
          </el-form-item>
          <el-form-item prop="enableFlag">
            <el-select v-model="query.enableFlag" clearable placeholder="请选择启用状态">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="timeSection"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label=" ">
            <el-button
              v-preventReClick="200"
              type="primary"
              :loading="searchButtonLoading"
              @click="()=>{
                searchButtonLoading = true;
                onSearch(true)
              }"
            >查询</el-button>
            <el-button
              v-preventReClick="200"
              class="btn-reset"
              :loading="resetButtonLoading"
              @click="()=>{
                resetButtonLoading = true;
                resetQuery();
                getFormList();
              }"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:operate-btn>
        <div v-if="roleKey" class="operate-btn">
          <el-button class="btn-reset" @click="batchUpdateGroup">批量修改分组</el-button>
          <el-button class="btn-reset" @click="batchDelete">批量删除</el-button>
          <el-button type="primary" @click="addForm">新增表单</el-button>
        </div>
      </template>
      <template v-slot:data>
        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
          <template slot="empty">
            <empty-default-icon
              :length="list.length"
            />
          </template>
          <el-table-column
            type="selection"
            width="55"
            fixed="left"
          />
          <el-table-column
            prop="formName"
            label="表单名称"
            align="center"
            width="180"
            fixed="left"
          />
          <el-table-column
            prop="submitCount"
            label="提交人数"
            align="center"
          >
            <template slot-scope="scope">
              <div class="submit-count">
                {{ scope.row.submitCount || 0 }}
                <el-popover
                  placement="top"
                  content="当前表单未绑定公众号，数据收集将受影响"
                  trigger="hover"
                  popper-class="tip-popover"
                >
                  <i
                    v-if="!scope.row.bindWeChatPublicPlatformFlag"
                    slot="reference"
                    class="iconfont icon-InfoCircleOutlined"
                    style="color: red; font-size: 14px;"
                  />
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="enableFlag"
            label="启用状态"
            align="center"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.enableFlag"
                @change="(value) => changeEnableFlag(value, scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="groupName"
            label="所属分组"
            align="center"
          />
          <el-table-column
            prop="createBy"
            label="创建人"
            align="center"
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
            align="center"
            width="200"
          />
          <el-table-column
            label="操作"
            align="center"
            width="120"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="flex-column">
                <el-button
                  size="mini"
                  type="text"
                  @click="handleSpread(scope.row)"
                >推广</el-button>
                <el-button
                  size="mini"
                  type="text"
                  @click="handleDetails(scope.row)"
                >详情</el-button>
                <el-button
                  v-if="roleKey"
                  size="mini"
                  type="text"
                  @click="handleEdit(scope.row)"
                >编辑</el-button>
                <el-button
                  v-if="roleKey"
                  size="mini"
                  type="text"
                  @click="handleDelete(scope.row.id)"
                >删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="list.length > 0"
          :total="total"
          :disabled="loading"
          :limit.sync="query.pageSize"
          :page.sync="query.pageNum"
          :select-data-len="multiSelect.length"
          @pagination="() => onSearch()"
        />
      </template>
    </RightContainer>
    <BatchUpdateGroup
      :visible.sync="batchVisible"
      :group-tree-data="selectGroupTreeData"
      :multi-select="multiSelect"
      :get-list="() => onSearch()"
    />
    <SpreadDialog
      ref="SpreadDialog"
      :visible.sync="spreadVisible"
      :form-row-data="formRowData"
    />
  </div>
</template>
<script>
import { goRouteWithQuery } from '@/utils';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import SpreadDialog from './spreadDialog.vue';
import BatchUpdateGroup from './batchUpdateGroup.vue';
import loadingMixin from '@/mixin/loadingMixin';
import { getFormPageList, changeEnableState, removeFormList } from '@/api/form';
import { INTELLIGENT_FORM_TYPE, PAGE_LIMIT, TREE_ALL_GROUP_ID } from '@/utils/constant/index';
export default {
  name: 'VerbalTrickList',
  components: {
    RightContainer,
    EmptyDefaultIcon,
    SpreadDialog,
    BatchUpdateGroup
  },
  mixins: [loadingMixin],
  inject: ['getDepartmentId'],
  props: {
    // 表单类型
    type: {
      type: Number,
      default: INTELLIGENT_FORM_TYPE['enterprise']
    },
    // 表单分组树结构
    groupTreeData: {
      type: Array,
      default: () => []
    },
    // 表单操作权限
    roleKey: {
      type: Boolean,
      default: true
    },
    // 选择的分组Id
    selectedGroupId: {
      type: String,
      default: ''
    },
    // 选中分组的父分组id
    selectGroupParentId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      INTELLIGENT_FORM_TYPE,
      TREE_ALL_GROUP_ID,
      // 启用状态选项
      options: [
        { label: '全部', value: null },
        { label: '启用', value: true },
        { label: '关闭', value: false }
      ],
      // 搜索的日期范围
      timeSection: undefined,
      // 搜索内容
      query: {
        formName: '', // 表单名称
        enableFlag: undefined, // 启用状态
        pageSize: PAGE_LIMIT,
        pageNum: 1,
        beginTime: undefined,
        endTime: undefined
      },
      // 表单总数
      total: 0,
      // 表单数据
      list: [],
      // 表格loading
      loading: false,
      // 添加/编辑话术抽屉显示
      addVerbalTrickDrawerVisible: false,
      // 已选中的话术
      multiSelect: [],
      // 批量修改所属分组
      batchVisible: false,
      // 推广弹窗显隐
      spreadVisible: false,
      // 推广弹窗所需表单数据
      formRowData: undefined
    };
  },
  computed: {
    // 修改分组时不显示“全部”节点
    selectGroupTreeData() {
      const list = [...this.groupTreeData];
      if (list[0] && list[0].id === TREE_ALL_GROUP_ID) {
        return list[0].children;
      } else {
        return list;
      }
    },
    // 部门id
    departmentId() {
      return this.getDepartmentId();
    }
  },
  watch: {
    selectedGroupId() {
      this.onSearch(true);
    }
  },
  created() {
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name].query || {}).length) {
      const { beginTime, endTime } = this.$store.getters.searchQuery[this.$route.name].query;
      if (beginTime && endTime) {
        this.timeSection = [beginTime, endTime];
      }
      this.query = this.$store.getters.searchQuery[this.$route.name].query;
    }
  },
  mounted() {},
  methods: {
    // 重置查询条件
    resetQuery() {
      this.query = this.$options.data().query;
      // 置空日期范围
      this.timeSection = undefined;
    },
    /**
     * @description: 推广
     * @param {*} data
     * @return {*}
     */
    handleSpread(data) {
      this.spreadVisible = true;
      const flag = data?.id !== this.formRowData?.id;
      this.formRowData = data;
      flag && this.$refs.SpreadDialog?.getNewSpreadData(data.id);
    },
    /**
     * @description: 详情
     * @param {*} data
     * @return {*}
     */
    handleDetails(data) {
      this.goRouterToForm('formDetail', { id: data.id });
    },
    /**
     * 编辑表单
     */
    handleEdit(data) {
      this.goRouterToForm('editForm', { id: data.id, sourceType: this.type });
    },
    /**
     * @description: 新增表单
     * @return {*}
     */
    addForm() {
      // 需要传当前分组所属类别和当前选择的分组id还有部门id 如果有父节点 父节点的id也需要传 用于回显详情
      const hasParentId = this.selectGroupParentId && this.selectGroupParentId !== TREE_ALL_GROUP_ID;
      const payload = {
        selectedGroup: this.selectedGroupId ? (hasParentId ? [this.selectGroupParentId, this.selectedGroupId] : [this.selectedGroupId]) : undefined,
        sourceType: this.type,
        departmentId: this.departmentId
      };
      this.goRouterToForm('editForm', payload);
    },
    /**
     * @description 前往表单 新增、编辑、详情页
     * @param paegPath 前往的页面路径
     * @param payload 携带的参数
     */
    goRouterToForm(paegPath, payload) {
      const hasParentId = this.selectGroupParentId && this.selectGroupParentId !== TREE_ALL_GROUP_ID;
      window.sessionStorage.setItem('intelligent_form_active', this.type);
      window.sessionStorage.setItem('intelligent_form_department_id', this.departmentId);
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: {
          query: this.query,
          selectedGroup: this.selectedGroupId ? (hasParentId ? [this.selectGroupParentId, this.selectedGroupId] : [this.selectedGroupId]) : undefined }
      });
      goRouteWithQuery(this.$router, paegPath, {}, payload);
    },
    /**
     * @description: 获取搜索表单数据传参
     * @param {*} params
     * @return {*}
     */
    getPayload() {
      if (this.timeSection) {
        this.query.beginTime = this.timeSection[0];
        this.query.endTime = this.timeSection[1];
      } else {
        this.query.beginTime = undefined;
        this.query.endTime = undefined;
      }
      let payload = {
        ...this.query,
        groupId: this.selectedGroupId,
        sourceType: this.type
      };
      if (this.type === INTELLIGENT_FORM_TYPE['department']) {
        payload = {
          ...payload,
          departmentId: this.departmentId
        };
      }
      return payload;
    },
    /**
     * @description: 进行表单数据的清空
     * @return {*}
     */
    clearFormData() {
      this.list = [];
      this.total = 0;
    },
    /**
     * @description: 获取表单数据
     * @param {*} params
     * @return {*}
     */
    getFormList() {
      this.loading = true;
      getFormPageList(this.getPayload()).then(res => {
        this.list = res.rows;
        this.total = res.total ? Number(res.total) : 0;
      }).catch(() => {
        this.clearFormData();
      }).finally(() => {
        this.modifyButtonStatus();
        this.loading = false;
      });
    },
    /**
     * @description: 查询表单数据
     * @param {*} initPage  是否重置为第一页
     * @return {*}
     */
    onSearch(initPage) {
      initPage ? this.query.pageNum = 1 : null;
      this.getFormList();
    },
    /**
     * 处理多选
     */
    handleSelectionChange(val) {
      this.multiSelect = val;
    },
    /**
     * @description: 删除表单
     * @param {*} params
     * @return {*}
     */
    async deleteForm(params = {}) {
      const delRes = await removeFormList(params);
      if (delRes) {
        this.msgSuccess('删除成功');
        this.onSearch();
      }
    },
    /**
     * 点击删除表单
     */
    handleDelete(id) {
      this.confirmModal({
        msg: '所选表单的数据将被删除，且不可撤回，是否继续？'
      }, () => {
        this.deleteForm({
          idList: [id]
        });
      });
    },
    /**
     * 批量删除表单
     */
    batchDelete() {
      if (this.multiSelect.length === 0) {
        this.msgWarn('请勾选要操作的表单');
        return;
      }
      const delIds = [];
      this.multiSelect.map(item => {
        delIds.push(item.id);
      });
      this.confirmModal({
        msg: '所选表单的数据将被删除，且不可撤回，是否继续？'
      }, () => {
        this.deleteForm({
          idList: delIds
        });
      });
    },
    /**
     * 批量修改分组
     */
    batchUpdateGroup() {
      if (this.multiSelect.length === 0) {
        this.msgWarn('请勾选要操作的表单');
        return;
      }
      this.batchVisible = true;
    },
    /**
     * 修改单个启用状态
     */
    changeEnableFlag(value, row) {
      changeEnableState({
        enableFlag: value,
        id: row.id
      }).then(res => {
        this.msgSuccess('操作成功');
      }).catch(() => {
        row.enableFlag = !value;
      });
    }
  }

};
</script>
<style scoped lang='scss'>
.intelligent-form-list-wrap {
  width: calc(100% - 310px);
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  .flex-column {
    width: 100%;
    height: 40px;
    display: flex;
    flex-wrap: wrap;
    .el-button--mini {
      padding: 3px 0 3px 0;
      margin: 0 20px 0 0;
    }
  }
  .icon-warning {
    margin-right: 5px;
    color: red;
    font-size: 14px;
  }
}
</style>
