<!--
 * @Description:  客户记录
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import SelectUser from '@/components/SelectUser/index.vue';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { PAGE_LIMIT, WX_TYPE, AUTOLABEL_TYPE } from '@/utils/constant/index';
import { goRouteWithQuery } from '@/utils';
import loadingMixin from '@/mixin/loadingMixin';
import { dealAtInfo } from '@/utils/common';
import { getTriggerDetail, getKeyWordRecordList, getGroupRecordList, getCustomerRecordList, getKeyWordCount, getCustomerCount, getGroupCount } from '@/api/customer/auto';
const ACTIVENAME = '1'; // 从客户详情跳转回来后规则详情tab值
export default {
  name: 'LabelDetail',
  components: { SelectUser, RightContainer, EmptyDefaultIcon },
  mixins: [loadingMixin],
  props: {},
  inject: ['labelRuleInfo'],
  data() {
    return {
      ACTIVENAME,
      AUTOLABEL_TYPE,
      // 触发关键词请求参数
      triggerDetailQuery: {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        customerName: '', // "客户名称",
        groupName: '', // 客户群昵称
        beginTime: '', // "开始时间",
        endTime: '' // "结束时间"
      },
      selectUserList: [], // 搜索框选择的添加人
      // 客户类型  微信还是企业
      wxType: WX_TYPE,
      dateRange: [], // 添加日期
      // 去重后的客户总数
      ignoreDuplicateCount: 0,
      // 客户总数
      totalCount: 0,
      // 客户记录总记录数
      total: 1,
      loading: false,
      // 客户记录列表
      list: [],
      // 选择员工弹窗
      dialogVisibleSelectUser: false,
      // 触发详情弹窗
      triggerDetailDialogVisible: false,
      // 触发详情内输入框值的关键词
      triggerKeywords: '',
      // 触发详情列表
      triggerKeywordsList: [],
      // 触发详情总记录数
      triggerTotal: 0,
      // 触发详情客户员工信息
      triggerList: {
        customerId: '',
        userId: ''
      },
      triggerLoading: false
    };
  },
  computed: {
    //   自动标签类型
    labelType() {
      return this.labelRuleInfo.labelType;
    },
    // 规则id 用来查询场景
    ruleId() {
      return this.labelRuleInfo.ruleId;
    }
  },
  watch: {
    // 监听触发详情弹窗状态
    triggerDetailDialogVisible() {
      // 设置触发关键词为空
      this.triggerKeywords = '';
      this.triggerDetailQuery = {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      };
    }
  },
  created() {
    const searchQuery = this.$store.getters.searchQuery[this.$route.name];
    if (this.$store.getters.saveCondition && Object.keys(searchQuery || {}).length) {
      const { beginTime, endTime } = searchQuery;
      if (beginTime && endTime) {
        this.dateRange = [beginTime, endTime];
      }
      this.selectUserList = searchQuery.selectUserList;
      delete searchQuery.selectUserList;
      this.query = searchQuery;
    }
    this.getRecordList();
    this.getRecordCount();
  },
  mounted() {},
  methods: {
    /**
     * 查询
     */
    onSearch() {
      this.query.beginTime = this.dateRange[0];
      this.query.endTime = this.dateRange[1];
      this.getRecordList({ pageNum: 1 });
    },
    // 获取客户记录统计
    async getRecordCount() {
      let result;
      switch (this.labelType) {
        case AUTOLABEL_TYPE['keyWords']:
          // 获取关键词客户记录
          result = await getKeyWordCount(this.ruleId);
          break;
        case AUTOLABEL_TYPE['intoGroup']:
          result = await getGroupCount(this.ruleId);
          break;
        case AUTOLABEL_TYPE['newCustomer']:
          result = await getCustomerCount(this.ruleId);
          break;
      }
      this.ignoreDuplicateCount = result?.data?.distinctCount || 0;
      this.totalCount = result?.data?.count || 0;
    },
    /**
     * 重置
     */
    resetForm() {
      this.query = {
        customerName: '',
        groupName: '',
        beginTime: null,
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        endTime: null
      };
      this.selectUserList = [];
      this.dateRange = [];
      this.getRecordList();
    },
    /**
     * 跳转到客户详情
     */
    goRoute(row) {
      window.sessionStorage.setItem('DetailActive', ACTIVENAME);
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: { ...this.query, selectUserList: this.selectUserList }
      });
      goRouteWithQuery(this.$router, 'customerDetail',
        {}, {
          id: row.customerId,
          userId: row.userId,
          prePageType: 'labelDetail'
        });
    },
    //   选择员工
    selectedUser(list) {
      this.selectUserList = list;
      this.query.userIdList = list.map((user) => user.userId);
    },
    // 获取触发详情列表
    getTriggerDetail(params = {}) {
      this.triggerDetailDialogVisible = true;
      if (params.pageNum === 1) {
        this.triggerDetailQuery = {
          pageNum: 1,
          pageSize: PAGE_LIMIT
        };
      }
      const query = this.triggerDetailQuery;
      const newParams = {
        ...query,
        ...params,
        ...this.triggerList,
        ruleId: this.ruleId,
        keyword: this.triggerKeywords
      };
      this.triggerLoading = true;
      getTriggerDetail(newParams).then(res => {
        this.triggerKeywordsList = res.rows;
        this.triggerTotal = res.total;
      }).finally(() => {
        this.triggerLoading = false;
      });
    },
    // 设置触发详情查询的员工客户参数
    setTriggerDetail(row) {
      this.triggerList = {
        userId: row.userId,
        customerId: row.customerId
      };
      this.getTriggerDetail();
    },
    // 搜索的输入框内容删除到为空时
    inputChange() {
      if (!this.triggerKeywords) {
        this.getTriggerDetail({ pageNum: 1 });
      }
    },
    // 获取客户记录列表
    async getRecordList(params = {}) {
      try {
        const query = this.query;
        const newParams = {
          ...query,
          ruleId: this.ruleId,
          ...params
        };
        let listRes;
        this.loading = true;
        switch (this.labelType) {
          case AUTOLABEL_TYPE['keyWords']:
          // 获取关键词客户记录
            listRes = await getKeyWordRecordList(newParams);
            break;
          case AUTOLABEL_TYPE['intoGroup']:
            listRes = await getGroupRecordList(newParams);
            break;
          case AUTOLABEL_TYPE['newCustomer']:
            listRes = await getCustomerRecordList(newParams);
            break;
        }
        this.total = listRes?.total || 0;
        this.list = listRes?.rows || [];
        this.loading = false;
        this.modifyButtonStatus();
      } catch (error) {
        this.loading = false;
        this.modifyButtonStatus();
      }
    },
    // 处理名字
    renderUserInfo(item) {
      return dealAtInfo(item);
    }
  }
};
</script>

<template>
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
        <el-form-item>
          <el-input v-model="query.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item v-if="labelType === AUTOLABEL_TYPE['intoGroup']">
          <el-input
            v-model="query.groupName"
            placeholder="请输入客户群昵称"
          />
        </el-form-item>
        <el-form-item v-if="labelType !== AUTOLABEL_TYPE['intoGroup']">
          <div class="tag-input" @click="dialogVisibleSelectUser = true">
            <span v-if="!selectUserList.length" class="tag-place">请选择员工</span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in selectUserList"
                :key="unique"
                type="info"
              >{{ unit.name }}</el-tag>
            </template>
          </div>
        </el-form-item>
        <el-form-item v-if="labelType === AUTOLABEL_TYPE['newCustomer']">
          <el-date-picker
            v-model="dateRange"
            value-format="yyyy-MM-dd"
            type="daterange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
        </el-form-item>
        <el-form-item label=" ">
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
      <div class="total-text">
        <template>
          共
          <span class="theme-text-color">{{ totalCount }}</span> 个客户触发规则
        </template>
        <template v-if="labelType !== AUTOLABEL_TYPE['intoGroup']">
          ,去重后
          <span class="theme-text-color">{{ ignoreDuplicateCount }}</span>
          个客户
        </template>
        <el-popover
          placement="top-start"
          trigger="hover"
          popper-class="tip-popover"
        >
          <div>若客户添加多个员工，不重复计数</div>
          <i
            slot="reference"
            class="iconfont icon-question"
            style="font-size: 14px"
          />
        </el-popover>
      </div>
    </template>

    <template v-slot:data>
      <el-table v-loading="loading" :data="list">
        <template slot="empty">
          <empty-default-icon
            text="暂无数据"
            :length="list.length"
          />
        </template>
        <el-table-column label="客户" align="left">
          <template slot-scope="{ row }">
            <div class="customer-info cp">
              <img :src="row.avatar">
              <div class="customer-name">
                <div class="intwoline">
                  <span>{{ row.customerName }}</span>
                  <span v-if="row.corpFullName || row.type === wxType " :class="row.type === wxType ? 'wx-type-flag' : 'corp-type-name'">{{
                    renderUserInfo(row)
                  }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="labelType !== AUTOLABEL_TYPE['intoGroup']"
          class="trest1"
          label="员工"
          align="center"
          prop="userName"
        />
        <el-table-column align="center">
          <template slot="header">
            <div>
              <span>客户标签</span>
              <el-popover
                placement="top"
                trigger="hover"
                popper-class="tip-popover"
              >
                <div>触发规则后被打上的客户标签</div>
                <i
                  slot="reference"
                  class="iconfont icon-question"
                  style="font-size: 14px"
                />
              </el-popover>
            </div>
          </template>
          <template slot-scope="scope">
            <div class="tag-list">
              <el-tag v-for="(item,index) in scope.row.tagNameDistinctList" :key="index" type="info">
                {{ item }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="labelType === AUTOLABEL_TYPE['keyWords']" align="center" prop="hitCount">
          <template slot="header">
            <div>
              <span>触发的关键词</span>
              <el-popover
                placement="top-start"
                trigger="hover"
                popper-class="tip-popover"
              >
                <div>点击数字查看触发详情</div>
                <i
                  slot="reference"
                  class="iconfont icon-question"
                  style="font-size: 14px"
                />
              </el-popover>
            </div>
          </template>
          <template slot-scope="scope">
            <div class="theme-text-color" @click="setTriggerDetail(scope.row)">
              {{ scope.row.hitCount }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="labelType === AUTOLABEL_TYPE['intoGroup']"
          label="进去的客户群"
          align="center"
          prop="groupName"
        >
          <template slot-scope="scope">
            <div class="user-info">{{ scope.row.groupName }}</div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="labelType === AUTOLABEL_TYPE['intoGroup']"
          label="进入群聊时间"
          align="center"
          prop="joinTime"
        >
          <template slot-scope="scope">
            <div class="user-info">{{ scope.row.joinTime }}</div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="labelType === AUTOLABEL_TYPE['newCustomer']"
          label="添加时间"
          align="center"
          prop="addTime"
        >
          <template slot-scope="scope">
            <div class="user-info">{{ scope.row.addTime }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="goRoute(scope.row)"
            >客户详情</el-button>
            <el-button
              v-if="labelType === AUTOLABEL_TYPE['keyWords']"
              size="mini"
              type="text"
              @click="setTriggerDetail(scope.row)"
            >触发详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :disabled="loading"
        :total="total"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        @pagination="getRecordList()"
      />
      <!-- 选择添加人弹窗 -->
      <SelectUser
        :visible.sync="dialogVisibleSelectUser"
        title="选择添加人"
        :selected-user-list="selectUserList"
        @success="selectedUser"
      />
      <div class="trigger-detail">
        <!-- 触发详情弹窗 -->
        <el-dialog title="触发详情" :visible.sync="triggerDetailDialogVisible">
          <el-input
            v-model="triggerKeywords"
            style="width: 240px; height: 32px"
            placeholder="请输入关键词，回车搜索"
            @input="inputChange()"
            @keydown.enter.native="getTriggerDetail({ pageNum: 1 })"
          />
          <el-table
            v-loading="triggerLoading"
            height="300px"
            style="font-size: 14px"
            :data="triggerKeywordsList"
            class="mt15"
          >
            <template slot="empty">
              <empty-default-icon
                text="暂无数据"
                :length="triggerKeywordsList.length"
              />
            </template>
            <el-table-column label="关键词" align="center" prop="keyword" width="180" />
            <el-table-column label="触发时间" align="center" prop="createTime" width="164" />
            <el-table-column label="触发文本" align="center">
              <template slot-scope="scope">
                <el-popover
                  :open-delay="600"
                  placement="top"
                  trigger="hover"
                  width="400"
                  :content="`${scope.row.fromText}`"
                >
                  <span slot="reference" class="intwoline">{{ scope.row.fromText }}</span>
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="triggerTotal > 0"
            class="page"
            :total="triggerTotal"
            :disabled="triggerLoading"
            :page.sync="triggerDetailQuery.pageNum"
            :limit.sync="triggerDetailQuery.pageSize"
            @pagination="getTriggerDetail()"
          />
        </el-dialog>
      </div>
    </template>
  </RightContainer>
</template>

<style scoped lang="scss">
.operate-container .operate-left > div {
  padding-bottom: 0;
}

.customer-info{
  .customer-name {
    display: flex;
    align-items:center
  }
}
.intwoline {
  overflow: visible !important;
  line-height:16px !important;
}
.tag-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.trigger-detail {
  /deep/ .el-dialog__wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /deep/.el-dialog {
    width: 800px;
  }
  /deep/.el-dialog__body {
    padding: 6px 20px;
  }

}
</style>
