<!--
 * @Description: 客户概览
 * @Author: xulinbin
 * @LastEditors: wJiaaa
-->
<template>
  <div class="overview-page">
    <!-- 选择员工/部门弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择员工/部门"
      is-dep-linkage
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
            <el-input v-model="query.position" placeholder="请输入员工职务" />
          </el-form-item>
          <el-form-item>
            <el-button
              v-preventReClick="200"
              type="primary"
              :loading="searchButtonLoading"
              @click="()=>{
                searchButtonLoading = true;
                onSearch();
              }"
            >查询</el-button>
            <el-button
              v-preventReClick="200"
              class="btn-reset"
              :loading="resetButtonLoading"
              @click="()=>{
                resetButtonLoading = true;
                resetForm();
              }"
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
                    <p>客户总数：截止到查询时间，员工没有删除的客户数，未去重</p>
                    <p>留存客户总数：截止到查询时间，未将员工删除、拉黑的客户总数，未去重</p>
                    <p>新增客户数：查询时间内员工添加的客户数量</p>
                    <p>流失客户数：查询时间内，把员工删除或拉黑的客户数量</p>
                    <p>新客留存率：查询时间内，未将员工删除或拉黑的新增客户/新增客户</p>
                    <p>新客开口率：查询时间内，在添加当天给员工发消息的新增客户/新增客户</p>
                    <p>服务响应率：查询时间内，员工首次向客户发送消息后，客户在30分钟内回复/会话客户</p>
                  </div>
                  <div class="line" />
                  <div class="notice">
                    注意：新客开口率、服务响应率的统计数据来源于会话存档，若员工未开启会话存档或客户拒绝存档，统计数将受影响
                  </div>
                </div>
                <div slot="reference" class="statistic theme-text-color">统计说明</div>
              </el-popover>
            </template>
          </Statistics>
        </div>
        <div class="table-overview">
          <div class="detail-title">
            数据详情
          </div>
          <div class="forms-handle-btn">
            <el-radio-group v-model="dimensionType" class="radio-group-div" size="medium" @input="dimensionTypeChange">
              <el-radio-button :label="STAFF_DIMENSION">员工维度</el-radio-button>
              <el-radio-button :label="DATE_DIMENSION">日期维度</el-radio-button>
              <el-radio-button :label="DEPARTMENT_DIMENSION">部门维度</el-radio-button>
            </el-radio-group>
            <el-button
              v-hasPermi="['statistic:customerContact:export']"
              class="btn-reset btn-export"
              @click="exportForms"
            >导出报表</el-button>
          </div>
          <p v-if="dimensionType === DEPARTMENT_DIMENSION" class="department-notice">只统计单部门数据，若部门下存在子部门，则不会计入子部门的数据</p>
          <el-table
            ref="showTable"
            :key="dimensionType"
            v-loading="loading"
            :data="list"
            :default-sort="{prop: 'totalAllContactCnt', order: 'descending'}"
            @sort-change="changeTableSort"
          >
            <template slot="empty">
              <empty-default-icon :length="list.length" />
            </template>
            <template v-if="dimensionType === STAFF_DIMENSION">
              <el-table-column
                prop=""
                label="员工"
                min-width="200"
              >
                <template #default="{ row }">
                  <UserItem :data="row" :is-staff="true" />
                </template>
              </el-table-column>
              <el-table-column prop="position" label="员工职务" min-width="180" />
              <el-table-column prop="parentDepartmentName" label="所属上级部门" min-width="180">
                <template #default="{ row }">
                  {{ row.parentDepartmentName || '-' }}
                </template>
              </el-table-column>
            </template>
            <el-table-column
              v-else-if="dimensionType === DATE_DIMENSION"
              prop="xtime"
              label="日期"
              min-width="200"
            >
              <template #default="{ row }">
                {{ row.xtime }}
              </template>
            </el-table-column>
            <template v-else-if="dimensionType === DEPARTMENT_DIMENSION">
              <el-table-column
                label="部门名"
                min-width="200"
              >
                <template #default="{ row }">
                  <p style="font-size: 14px;">{{ row.departmentName }}</p>
                  <p style="color: #999; font-size: 12px;">{{ row.parentDepartmentName || '-' }}</p>
                </template>
              </el-table-column>
              <el-table-column
                prop="userCount"
                label="员工数"
                min-width="150"
              />
            </template>
            <el-table-column sortable="custom" prop="totalAllContactCnt" label="客户总数" min-width="180" />
            <el-table-column sortable="custom" prop="totalContactCnt" label="留存客户总数" min-width="180" />
            <el-table-column sortable="custom" prop="contactLossCnt" label="流失客户数" min-width="180" />
            <el-table-column sortable="custom" prop="newContactCnt" label="新增客户数" min-width="180" />
            <el-table-column v-if="dimensionType === DEPARTMENT_DIMENSION" sortable="custom" prop="newCustomerRetentionCnt" label="新增留存数" min-width="180" />
            <el-table-column sortable="custom" prop="newContactRetentionRate" label="新客留存率" min-width="180">
              <template #default="{ row }">
                {{ row.newContactRetentionRate === DATA_STATISTICS_DEFAULT_SHOW ? DATA_STATISTICS_DEFAULT_SHOW : row.newContactRetentionRate + '%' }}
              </template>
            </el-table-column>
            <el-table-column sortable="custom" prop="newContactStartTalkRate" label="新客开口率" min-width="180">
              <template #default="{ row }">
                {{ row.newContactStartTalkRate + '%' }}
              </template>
            </el-table-column>
            <el-table-column sortable="custom" prop="serviceResponseRate" label="服务响应率" min-width="180">
              <template #default="{ row }">
                {{ row.serviceResponseRate + '%' }}
              </template>
            </el-table-column>
          </el-table>
          <pagination
            :disabled="loading"
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
import { PAGE_LIMIT, DATE_DIMENSION, STAFF_DIMENSION, DATA_STATISTICS_DEFAULT_SHOW, DEPARTMENT_DIMENSION } from '@/utils/constant/index';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import UserItem from '@/components/UserItem.vue';
import TagUserShow from '@/components/TagUserShow';
import SelectUser from '@/components/SelectUser/index.vue';
import { groupByScopeType } from '@/utils/common';
import { YESTERDAY_TIME, FIXED_DAYS_AGO_TIME } from '@/utils/common';
import {
  getCustomerOverView,
  getCustomerOverViewOfUser,
  exportCustomerOverViewOfUser,
  getCustomerOverViewOfDate,
  exportCustomerOverViewOfDate,
  exportCustomerOverViewOfDepartment,
  getCustomerOverViewOfDepartment
} from '@/api/statistics';
import loadingMixin from '@/mixin/loadingMixin';
// 排序字段
const SORT = {
  'ascending': 'ASC',
  'descending': 'DESC'
};
export default {
  name: '',
  components: { RightContainer, Statistics, EmptyDefaultIcon, UserItem, TagUserShow, SelectUser },
  mixins: [loadingMixin],
  data() {
    return {
      DATE_DIMENSION,
      STAFF_DIMENSION,
      DEPARTMENT_DIMENSION,
      DATA_STATISTICS_DEFAULT_SHOW,
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
            // 根据 selectMonthLimit 计算时间范围
            const selectedDate = new Date(this.pickerMinDate);
            const minDate = new Date(selectedDate);
            const maxDate = new Date(selectedDate);

            // 设置最小日期为选中日期减去 selectMonthLimit 个月
            minDate.setMonth(selectedDate.getMonth() - this.selectMonthLimit);
            // 设置最大日期为选中日期加上 selectMonthLimit 个月
            maxDate.setMonth(selectedDate.getMonth() + this.selectMonthLimit);

            return v.getTime() > maxDate.getTime() || v.getTime() < minDate.getTime() || v.getTime() < new Date(FIXED_DAYS_AGO_TIME).getTime() || v.getTime() > new Date(YESTERDAY_TIME).getTime();
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
        endTime: undefined
      },
      // 排序参数
      sortParams: {
        // 员工默认排序
        staffSort: {
          totalAllContactCnt: 'descending'
        },
        dateSort: {
          sortName: 'totalAllContactCnt', // 默认降序
          sortType: null
        },
        departmentSort: {}
      },
      // 总条数
      total: 0,
      // 客户概览表格数据
      list: [],
      // 表格loading
      loading: false,
      // 数据总览
      colList: [],
      dimensionType: STAFF_DIMENSION,
      selectMonthLimit: 1
    };
  },
  created() {
    this.onSearch();
    const { selectMonthLimit } = this.$store.state.app.systemSetting;
    this.selectMonthLimit = selectMonthLimit;
  },
  methods: {
    dimensionTypeChange() {
      if (this.dimensionType === STAFF_DIMENSION) {
        Object.keys(this.sortParams.staffSort).forEach((key) => {
          this.$refs?.showTable?.sort(key, this.sortParams.staffSort[key]);
        });
      } else if (this.dimensionType === DATE_DIMENSION) {
        const { sortName, sortType } = this.sortParams.dateSort;
        this.$refs?.showTable?.sort(sortName, sortType);
      } else if (this.dimensionType === DEPARTMENT_DIMENSION) {
        const keys = Object.keys(this.sortParams.departmentSort);
        if (keys.length) {
          this.$refs?.showTable?.sort(keys[0], this.sortParams.departmentSort[keys[0]]);
        } else {
          this.getList(true);
        }
      }
    },
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
            totalAllContactCnt: res?.data?.totalAllContactCnt,
            title: '客户总数',
            filed: 'totalAllContactCnt'
          },
          {
            totalContactCnt: res?.data?.totalContactCnt,
            title: '留存客户总数',
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
      const api = {
        [STAFF_DIMENSION]: getCustomerOverViewOfUser,
        [DATE_DIMENSION]: getCustomerOverViewOfDate,
        [DEPARTMENT_DIMENSION]: getCustomerOverViewOfDepartment
      };
      const getListFn = api[this.dimensionType];
      getListFn(this.getSearchPayload()).then((res) => {
        this.list = this.dimensionType === STAFF_DIMENSION ? res.rows : this.dealPaging(res.rows);
        this.total = res.total || 0;
      }).finally(() => {
        this.loading = false;
        this.modifyButtonStatus();
      });
    },
    /**
     * @description 处理日期维度表格数据分页
     */
    dealPaging(list) {
      const { sortType } = this.sortParams.dateSort;
      if (!sortType) {
        return list;
      }
      const { pageNum, pageSize } = this.query;
      return list.slice((pageNum - 1) * pageSize, pageNum * pageSize);
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
      if (this.dimensionType === STAFF_DIMENSION) {
        this.sortParams.staffSort = this.$options.data().sortParams.staffSort;
        this.$refs?.showTable?.sort('totalAllContactCnt', 'descending'); // 重置为默认排序(此处自行进行请求表单数据)
      } else if (this.dimensionType === DATE_DIMENSION) {
        this.sortParams.dateSort = this.$options.data().sortParams.dateSort;
        this.$refs?.showTable?.sort('totalAllContactCnt', null);
      } else if (this.dimensionType === DEPARTMENT_DIMENSION) {
        this.sortParams.departmentSort = this.$options.data().sortParams.departmentSort;
        this.getList(true);
      }
      this.getDataOverview();
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
      let sortPayload = {};
      if (this.dimensionType === STAFF_DIMENSION) {
        Object.keys(this.sortParams.staffSort).forEach((key) => {
          sortPayload[`${key}Sort`] = SORT[this.sortParams.staffSort[key]];
        });
      } else if (this.dimensionType === DATE_DIMENSION) {
        const { sortName, sortType } = this.sortParams.dateSort;
        sortPayload = {
          sortName: sortName + 'Sort',
          sortType: SORT[sortType]
        };
      } else if (this.dimensionType === DEPARTMENT_DIMENSION) {
        Object.keys(this.sortParams.departmentSort).forEach((key) => {
          sortPayload[`${key}Sort`] = SORT[this.sortParams.departmentSort[key]];
        });
      }
      return { ...this.query, ...sortPayload };
    },
    // 导出报表
    exportForms() {
      const exportFn = {
        [STAFF_DIMENSION]: exportCustomerOverViewOfUser,
        [DATE_DIMENSION]: exportCustomerOverViewOfDate,
        [DEPARTMENT_DIMENSION]: exportCustomerOverViewOfDepartment
      }[this.dimensionType];
      exportFn(this.getSearchPayload()).then((res) => {
        this.download(res.data.msg, true);
      }).catch(() => {
        this.msgError('导出失败!');
      });
    },
    // 表格排序
    changeTableSort({ prop, order }) {
      if (this.dimensionType === STAFF_DIMENSION) {
        this.sortParams.staffSort = {
          [prop]: order
        };
      } else if (this.dimensionType === DATE_DIMENSION) {
        this.sortParams.dateSort = {
          sortName: prop,
          sortType: order
        };
      } else if (this.dimensionType === DEPARTMENT_DIMENSION) {
        this.sortParams.departmentSort = {
          [prop]: order
        };
      }
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
     .detail-title {
      font-size: 24px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 15px;
    }
    .forms-handle-btn {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    .department-notice {
      font-size: 12px;
      color: #999;
      margin-top: -5px;
      margin-bottom: 10px;
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
