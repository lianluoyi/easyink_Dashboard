<!--
 * @Description: 自动标签列表公共样式
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="label-list-page">
    <RightContainer>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          class="top-search"
          size="small"
        >
          <el-form-item prop="name">
            <el-input v-model="query.ruleName" placeholder="请输入规则名称" clearable />
          </el-form-item>
          <el-form-item>
            <div class="tag-input" @click="selectTagVisible = true">
              <span v-if="!selectedTags.length" class="tag-place">请选择标签</span>
              <template v-else>
                <el-tag
                  v-for="(unit, unique) in selectedTags"
                  :key="unique"
                  type="info"
                  closable
                  @close="deleteTag(unit)"
                >
                  {{ unit.name }}
                </el-tag>
              </template>
            </div>
          </el-form-item>
          <el-form-item prop="user">
            <el-input v-model="query.createBy" placeholder="请输入创建人姓名" clearable />
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="query.status" placeholder="请选择启用状态" clearable>
              <el-option
                v-for="item in enabledStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              v-preventReClick="200"
              type="primary"
              :loading="searchButtonLoading"
              @click="()=>{
                searchButtonLoading = true;
                onSearch()
              }"
            >查询</el-button>
            <el-button
              v-preventReClick="200"
              class="btn-reset"
              :loading="resetButtonLoading"
              @click="()=>{
                resetButtonLoading = true;
                resetForm()
              }"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:data-stat>
        <div>
          {{ labelTip }}
        </div>
      </template>
      <template v-slot:operate-btn>
        <el-dropdown
          v-hasPermi="['wecom:autotag:enable']"
          class="dropdown-reset"
          split-button
          @click="() => handleBatchIsOpen(true)"
          @command="(e) => handleBatchIsOpen(e)"
        >
          批量开启
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item style="width: 108px" :command="false">批量关闭</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-hasPermi="['wecom:autotag:del']" @click="batchDel">批量删除</el-button>
        <el-button
          v-hasPermi="['wecom:autotag:add']"
          type="primary"
          @click="goRoute('addRule')"
        >新增规则</el-button>
      </template>
      <template v-slot:data>
        <el-table
          ref="table"
          :key="labelType"
          v-loading="loading"
          :data="list"
          tooltip-effect="dark"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              text="暂无数据"
            />
          </template>
          <el-table-column
            key="row-1"
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column key="row-2" label="规则名称" prop="ruleName" align="left" width="250" />
          <el-table-column key="row-3" label="标签" prop="tagList" align="left">
            <template #default="{ row }">
              <div class="tagList">
                <el-tag v-for="item in dealTagList(row.tagList)" :key="item.tagId" class="mb5" type="info">{{ item.tagName }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column key="row-4" prop="status" align="center" width="150">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :disabled="!checkPermi(['wecom:autotag:enable'])"
                @change="(value) => changeStatus(value, row)"
              />
            </template>
            <template #header>
              <div>
                <span>启用状态</span>
                <el-popover
                  placement="top"
                  trigger="hover"
                  popper-class="tip-popover"
                  content="关闭则规则不生效"
                >
                  <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column key="row-5" label="创建人" prop="createBy" align="left" width="199">
            <template slot-scope="{ row }">
              <div>
                <div style="color:#333333;font-size:14px">{{ row.createBy }}</div>
                <div class="cus-dept">{{ row.mainDepartmentName || '' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column key="row-6" label="创建时间" prop="createTime" align="left" width="199" />
          <el-table-column key="row-7" label="操作" width="199">
            <template slot-scope="{ row }">
              <el-button
                type="text"
                size="small"
                @click="goRoute('labelDetail', { id: row.id })"
              >详情</el-button>
              <el-button v-hasPermi="['wecom:autotag:edit']" type="text" size="small" @click="goRoute('addRule', { id: row.id })">编辑</el-button>
              <el-button v-hasPermi="['wecom:autotag:del']" type="text" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="total * 1"
          :disabled="loading"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          :select-data-len="multipleSelection.length"
          @pagination="getLabelList()"
        />
      </template>
    </RightContainer>
    <!-- 选择标签弹窗 -->
    <SelectTag
      type="query"
      title="选择标签"
      :visible.sync="selectTagVisible"
      :selected="selectedTags"
      @success="submitSelectTag"
    />
  </div>

</template>

<script>
import RightContainer from '@/components/RightContainer';
import SelectTag from '@/components/SelectTag';
import { getKeyWordList, getGroupList, getCustomerList, updateStatus, deleteKeyWordRule, deleteGroupRule, deleteCustomerRule } from '@/api/customer/auto';
import { AUTOLABEL_TYPE, PAGE_LIMIT } from '@/utils/constant/index';
import { goRouteWithQuery } from '@/utils';
import { checkPermi } from '@/utils/permission';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon, SelectTag },
  mixins: [loadingMixin],
  props: {
    labelType: {
      type: Number,
      default: null
    },
    labelTip: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedTags: [], // 选择的标签
      selectTagVisible: false, // 选择标签弹窗显隐
      // 启用状态
      enabledStatus: [{
        label: '全部',
        value: -1
      }, {
        label: '启用',
        value: true
      }, {
        label: '关闭',
        value: false
      }],
      //   自动打标签类型
      AUTOLABEL_TYPE,
      //   查询参数
      query: {
        ruleName: '',
        createBy: '',
        tagIdList: [],
        status: null,
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      //   总条数
      total: 0,
      // 规则列表
      list: [],
      // 多选数组
      multipleSelection: [],
      loading: false
    };
  },
  computed: {
    // 处理标签
    dealTagList() {
      return function(tagList) {
        return (tagList && tagList.filter(item => item !== null)) || [];
      };
    }
  },
  watch: {
    labelType() {
      this.$nextTick(() => {
        this.query.pageNum = 1;
        this.multipleSelection = [];
        this.getLabelList();
      });
    }
  },
  created() {
    const searchQuery = this.$store.getters.searchQuery[this.$route.name];
    if (this.$store.getters.saveCondition && Object.keys(searchQuery || {}).length) {
      this.selectedTags = searchQuery.selectedTags;
      delete searchQuery.selectedTags;
      this.query = searchQuery;
    }
    this.getLabelList();
  },
  mounted() {},
  methods: {
    checkPermi(key) {
      return checkPermi(key);
    },
    /**
     * 查询
     */
    onSearch() {
      this.getLabelList({ pageNum: 1 });
    },
    /**
       * 重置
       */
    resetForm() {
      this.query = {
        ruleName: '',
        createBy: '',
        status: null,
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        tagIdList: []
      };
      this.selectedTags = [];
      this.getLabelList();
    },
    //   获取标签列表数据
    async getLabelList(params = {}) {
      const query = this.query;
      const newParams = {
        ...query,
        status: query.status === -1 ? null : query.status,
        ...params
      };
      const GET_LIST_FUNC_MAP = {
        [AUTOLABEL_TYPE['keyWords']]: getKeyWordList,
        [AUTOLABEL_TYPE['intoGroup']]: getGroupList,
        [AUTOLABEL_TYPE['newCustomer']]: getCustomerList
      };
      this.loading = true;
      GET_LIST_FUNC_MAP[this.labelType](newParams, {
        pageNum: newParams.pageNum,
        pageSize: newParams.pageSize
      }).then((listRes) => {
        this.total = listRes?.total || 0;
        this.list = listRes?.rows || [];
      }).finally(() => {
        this.modifyButtonStatus();
        this.loading = false;
      });
    },

    /**
     * 删除单个规则
     * @param row 对应标签规则数据
     */
    handleDelete(row) {
      this.deleteRule({
        //   需要删除的标签规则id列表
        idList: [row.id]
      });
    },

    /*
    * 批量删除
    */
    batchDel() {
      if (this.multipleSelection.length <= 0) {
        this.msgWarn('请至少选择一个规则');
        return;
      }
      this.deleteRule({
        idList: this.multipleSelection.map(item => item.id)
      }, 'batch');
    },

    /**
     * 删除规则
     * @param
     * "idList": []
     */
    async deleteRule(params, type) {
      this.confirmModal({
        msg: `选中的规则删除后，将不再生效，客户已被打上的标签不会被移除，是否继续？`
      }, async() => {
        let delRes;
        switch (this.labelType) {
          case AUTOLABEL_TYPE['keyWords']:
            delRes = await deleteKeyWordRule(params);
            break;
          case AUTOLABEL_TYPE['intoGroup']:
            delRes = await deleteGroupRule(params);
            break;
          case AUTOLABEL_TYPE['newCustomer']:
            delRes = await deleteCustomerRule(params);
            break;
        }
        if (delRes) {
          this.msgSuccess('删除成功');
          const removeLength = type ? this.multipleSelection.length : 1;
          // 删除的时候页码跳到上一页，获取上一页数据
          const page = this.list.length === removeLength && this.query.pageNum > 1
            ? this.query.pageNum - 1
            : this.query.pageNum;
          this.getLabelList({ pageNum: page });
        }
      });
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },
    /**
     * 修改单个启用状态
     */
    changeStatus(value, row) {
      this.confirmModal({
        msg: value ? '选中的规则开启后，若客户满足设置的场景，系统自动给客户打上标签，是否继续？'
          : '选中的规则关闭后，将不再生效，不会自动给客户打上标签，是否继续？'
      }, () => {
        this.batchSwitchSop({
          status: value,
          idList: [row.id]
        });
      }, () => {
        row.status = !value;
      });
    },
    /**
     * 批量修改启用状态
     * @param value 启用状态
     */
    handleBatchIsOpen(value) {
      if (this.multipleSelection.length === 0) {
        this.msgWarn('请至少选择一个规则');
        return;
      }
      this.confirmModal({
        msg: value ? '选中的规则开启后，若客户满足设置的场景，系统自动给客户打上标签，是否继续？'
          : '选中的规则关闭后，将不再生效，不会自动给客户打上标签，是否继续？'
      }, () => {
        this.batchSwitchSop({
          status: value,
          idList: this.multipleSelection.map(item => item.id)
        });
      });
    },
    /**
     * 修改启用状态
     */
    batchSwitchSop(params) {
      updateStatus(params).then(res => {
        if (res) {
          this.msgSuccess('设置成功');
          this.getLabelList();
        }
      });
    },

    // 路由跳转
    goRoute(path, params = {}) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: { ...this.query, selectedTags: this.selectedTags }
      });
      goRouteWithQuery(this.$router, path, {}, { ...params, labelType: this.labelType });
    },
    // 选择的标签
    submitSelectTag(selected) {
      this.query.tagIdList = selected.map(tag => tag.tagId);
      this.selectedTags = [...selected];
      this.selectTagVisible = false;
    },
    // 删除标签
    deleteTag(tag) {
      const index = this.selectedTags.findIndex(tag_ => tag_.tagId === tag.tagId);
      this.selectedTags.splice(index, 1);
      this.query.tagIdList = this.selectedTags.map((item) => item.tagId);
    }
  }
};
</script>

<style scoped>
.tagList {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.cus-dept {
  font-size: 12px;
  color: #666666;
}
</style>

