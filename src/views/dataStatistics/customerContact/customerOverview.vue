<!--
 * @Description: 客户概览
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div class="overview-page">
    <!-- 选择员工/部门弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择员工/部门"
      :is-only-leaf="false"
      :selected-user-list="userAndDepartmentList"
      @success="selectedUserOrDepartment"
    />
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
            <div class="tag-input" @click="dialogVisibleSelectUser = true">
              <span v-if="!userAndDepartmentList.length" class="tag-place">请选择员工/部门</span>
              <template v-else>
                <el-tag
                  v-for="(unit, unique) in userAndDepartmentList"
                  :key="unique"
                  class="theme-text-color user-tag iaic"
                >
                  <TagUserShow :name="unit.name" :show-icon="!unit.userId" />
                </el-tag>
              </template>
            </div>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              :clearable="false"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="onSearch"
            >查询</el-button>
            <el-button
              class="btn-reset"
              @click="resetForm"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:data>
        <div class="data-overview">
          <Statistics
            title="数据总览"
            :col-list="colList"
          >
            <template slot="operate">
              <el-popover
                trigger="hover"
                placement="left-start"
              >
                <div class="popover-content">
                  <div class="info">
                    <p>客户总数：截止到查询时间，未将员工删除、拉黑的客户总数</p>
                    <p>新增客户数：查询时间内员工添加的客户数量</p>
                    <p>流失客户数：查询时间内添加的客户，把员工删除/拉黑的数量</p>
                    <p>新客留存率：查询时间内，未将员工删除、拉黑的新增客户/新增客户</p>
                    <p>新增开口率：查询时间内，在添加当天给员工发消息的新增客户/新增客户</p>
                    <p>服务响应率：查询时间内，员工首次向客户发送消息后，客户在30分钟内回复/会话客户</p>
                  </div>
                  <div class="line" />
                  <div class="notice">
                    注意：新增开口率、服务响应率的统计数据来源于会话存档，若员工未开启会话存档或客户拒绝存档，统计数将受影响
                  </div>
                </div>
                <div slot="reference" class="statistic theme-text-color">统计说明</div>
              </el-popover>
            </template>
          </Statistics>
        </div>
        <div class="table-overview">
          <div class="forms-handle-btn">
            <!-- <el-button
              v-hasPermi="['statistic:customerContact:export']"
              class="btn-reset"
              @click="exportForms"
            >导出报表</el-button> -->
          </div>
          <el-table
            ref="showTable"
            v-loading="loading"
            :data="list"
            :default-sort="{prop: 'totalContactCnt', order: 'descending'}"
            @sort-change="changeTableSort"
          >
            <template slot="empty">
              <empty-default-icon :length="list.length" />
            </template>
            <el-table-column
              prop=""
              label="员工"
              min-width="200"
            >
              <template #default="{ row }">
                <UserItem :data="row" :is-staff="true" />
              </template>
            </el-table-column>
            <el-table-column prop="totalContactCnt" label="客户总数" min-width="180" />
            <el-table-column prop="contactLossCnt" label="流失客户数" min-width="180" />
            <el-table-column prop="newContactCnt" label="新增客户数" min-width="180" />
            <el-table-column prop="newContactRetentionRate" label="新客留存率" min-width="180">
              <template #default="{ row }">
                {{ row.newContactRetentionRate + '%' }}
              </template>
            </el-table-column>
            <el-table-column prop="newContactStartTalkRate" label="新客开口率" min-width="180">
              <template #default="{ row }">
                {{ row.newContactStartTalkRate + '%' }}
              </template>
            </el-table-column>
            <el-table-column prop="serviceResponseRate" label="服务响应率" min-width="180">
              <template #default="{ row }">
                {{ row.serviceResponseRate + '%' }}
              </template>
            </el-table-column>
          </el-table>
          <pagination
            :total="total * 1"
            :page.sync="query.pageNum"
            :limit.sync="query.pageSize"
            @pagination="getList()"
          />
        </div>
      </template>
    </RightContainer>
  </div>
</template>
<script>
import RightContainer from '@/components/RightContainer';
import Statistics from '@/components/Statistics.vue';
import { PAGE_LIMIT } from '@/utils/constant';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import UserItem from './userItem.vue';
import TagUserShow from '@/components/TagUserShow';
import SelectUser from '@/components/SelectUser/index.vue';
import { groupByScopeType } from '@/utils/common';
import { YESTERDAY_TIME, FIXED_DAYS_AGO_TIME, ONE_MOUNTH_AGO, ONE_MOUNTH_LATER } from '@/utils/common';
import {
  getCustomerOverView,
  getCustomerOverViewOfUser,
  exportCustomerOverViewOfUser
} from '@/api/statistics';
// 排序字段
const SORT = {
  'ascending': 'asc',
  'descending': 'desc'
};
export default {
  name: '',
  components: { RightContainer, Statistics, EmptyDefaultIcon, UserItem, TagUserShow, SelectUser },
  data() {
    return {
      // 选择添加人弹窗显隐
      dialogVisibleSelectUser: false,
      // 搜索框选择的员工/部门
      userAndDepartmentList: [],
      // 日期选择器第一次选中的时间
      pickerMinDate: '',
      // 日期范围选择限定
      pickerOptions: {
        onPick: obj => {
          this.pickerMinDate = new Date(obj.minDate).getTime();
        },
        disabledDate: v => {
          if (this.pickerMinDate) {
            const minTime = new Date(ONE_MOUNTH_AGO(this.pickerMinDate)).getTime();
            const maxTime = new Date(ONE_MOUNTH_LATER(this.pickerMinDate)).getTime();
            return v.getTime() > maxTime || v.getTime() < minTime || v.getTime() < new Date(FIXED_DAYS_AGO_TIME).getTime() || v.getTime() > new Date(YESTERDAY_TIME).getTime();
          } else {
            return v.getTime() < new Date(FIXED_DAYS_AGO_TIME).getTime() || v.getTime() > new Date(YESTERDAY_TIME).getTime();
          }
        }
      },
      // 日期范围
      dateRange: [YESTERDAY_TIME, YESTERDAY_TIME],
      // 查询参数
      query: {
        departmentIds: [], // 部门id列表
        userIds: [], // 用户id列表
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        beginTime: undefined,
        endTime: undefined,
        totalContactCntSort: SORT['descending'] // 默认降序
      },
      // 排序参数
      sortParams: {},
      // 总条数
      total: 0,
      // 客户概览表格数据
      list: [],
      // 表格loading
      loading: false,
      // 数据总览
      colList: []
    };
  },
  created() {
    this.getDataOverview();
    this.getList(true);
  },
  methods: {
    /**
     * @description 选择员工/部门的回调
     */
    selectedUserOrDepartment(list) {
      this.userAndDepartmentList = list;
    },
    // 获取数据总览
    getDataOverview() {
      getCustomerOverView(this.getSearchPayload()).then(res => {
        this.colList = [
          {
            totalContactCnt: res?.data?.totalContactCnt,
            title: '客户总数',
            filed: 'totalContactCnt'
          },
          {
            newContactCnt: res?.data?.newContactCnt,
            title: '新增客户数',
            filed: 'newContactCnt'
          },
          {
            contactLossCnt: res?.data?.contactLossCnt,
            title: '流失客户数',
            filed: 'contactLossCnt'
          },
          {
            newContactRetentionRate: res?.data?.newContactRetentionRate,
            title: '新客留存率',
            unit: '%',
            filed: 'newContactRetentionRate'
          },
          {
            newContactStartTalkRate: res?.data?.newContactStartTalkRate,
            title: '新客开口率',
            unit: '%',
            filed: 'newContactStartTalkRate'
          },
          {
            serviceResponseRate: res?.data?.serviceResponseRate,
            title: '服务响应率',
            unit: '%',
            filed: 'serviceResponseRate'
          }
        ];
      }).catch(() => {
        this.colList = [];
      });
    },
    /**
     * @description: 获取客户概况表格数据
     * @param {*} initPage  是否重置为第一页
     * @return {*}
     */
    getList(initPage) {
      initPage ? this.query.pageNum = 1 : null;
      this.loading = true;
      getCustomerOverViewOfUser({ ...this.getSearchPayload(), ...this.sortParams }).then((res) => {
        this.list = res.rows;
        this.total = res.total || 0;
      }).finally(() => {
        this.loading = false;
      });
    },
    // 查询
    onSearch() {
      this.getDataOverview();
      this.getList(true);
    },
    // 重置
    resetForm() {
      this.userAndDepartmentList = [];
      this.query = this.$options.data().query;
      this.pickerMinDate = '';
      this.dateRange = [YESTERDAY_TIME, YESTERDAY_TIME];
      this.getDataOverview();
      this.$refs?.showTable?.sort('totalContactCnt', 'descending'); // 重置为默认排序(此处自行进行请求表单数据)
    },
    /**
     * @description 获取搜索的传参
     */
    getSearchPayload() {
      if (this.dateRange) {
        this.query.beginTime = this.dateRange[0];
        this.query.endTime = this.dateRange[1];
      } else {
        this.query.beginTime = '';
        this.query.endTime = '';
      }
      if (this.userAndDepartmentList && this.userAndDepartmentList.length > 0) {
        const allListObj = groupByScopeType(this.userAndDepartmentList);
        this.query.departmentIds = allListObj.useDepartmentList.map(item => item.id);
        this.query.userIds = allListObj.useEmployeesList.map(item => item.userId);
      } else {
        this.query.departmentIds = [];
        this.query.userIds = [];
      }
      return this.query;
    },
    // 导出报表
    exportForms() {
      exportCustomerOverViewOfUser(this.getSearchPayload()).then((res) => {
        this.download(res.data.msg, true);
      }).catch(() => {
        this.msgError('导出失败!');
      });
    },
    // 表格排序
    changeTableSort({ prop, order }) {
      // 清除默认排序
      delete this.query.totalContactCntSort;
      this.sortParams = {
        [`${prop}Sort`]: SORT[order]
      };
      this.getList(true);
    }
  }
};
</script>
<style scoped lang='scss'>
  .data-overview {
    height: 182px;
    width: 100%;
    background-color: #fff;
    margin-bottom: 10px;
  }
  .table-overview {
    padding: 15px;
    background-color: #fff;
    flex: 1;
    .forms-handle-btn {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 15px;
    }

  }
  /deep/ .show-data-wrapper {
    background-color: transparent;
    padding: 0;
    display: flex;
    .data-container {
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  }
  .statistic {
    width: 60px;
    font-size: 14px;
    cursor: default;
  }
  .popover-content {
    width: 390px;
    font-size: 12px;
    line-height: 20px;
    .line {
      margin: 10px 0 10px 0;
      width: 100%;
      height: 0;
      border-bottom: 1px solid #EEE;
    }
    .notice {
      color: #E29836;
    }
  }
</style>
