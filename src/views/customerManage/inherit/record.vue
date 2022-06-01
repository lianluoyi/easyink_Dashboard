<!--
 * @Description: 在职继承-分配记录
 * @Author: 佚名
 * @LastEditors: broccoli
-->
<template>
  <div>
    <RightContainer>
      <template v-slot:search>
        <ReturnPage class="mb10" />

        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          class="top-search"
        >
          <el-form-item prop="customerName">
            <el-input v-model="query.customerName" placeholder="请输入客户昵称" />
          </el-form-item>

          <el-form-item prop="takeoverUsername">
            <el-input v-model="query.takeoverUsername" placeholder="请输入接替员工姓名" />
          </el-form-item>

          <el-form-item>
            <el-select v-model="query.status" placeholder="请选择接替状态" clearable>
              <el-option
                v-for="([value,label]) in inheritStatusOption"
                :key="label"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
            />
          </el-form-item>

          <el-form-item label=" ">
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-slot:data>
        <el-table
          ref="table"
          :data="list"
          tooltip-effect="dark"
          align="left"
          highlight-current-row
          @selection-change="selection => selectedCustomers = selection"
        >
          <template slot="empty">
            <empty-default-icon text="暂无数据" />
          </template>

          <el-table-column label="客户">
            <template slot-scope="{ row }">
              <div class="customer-info" @click="goRoute(row)">
                <img :src="row.avatar">
                <div>
                  <div :title="(row.customerName) + renderUserInfo(row)">
                    <span>{{ row.customerName }}</span>
                    <span :style="{ color: isWXType(row.customerType) ? '#38AF70' : '#F2A622', 'margin-left': '2px' }">
                      {{ renderUserInfo(row) }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="原跟进员工">
            <template slot-scope="scope">
              <div class="al">
                <div class="cus-owner">{{ scope.row.hanoverUsername }}</div>
                <div class="cus-dept">{{ scope.row.handoverDepartmentName }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="接替员工">
            <template slot-scope="scope">
              <div class="al">
                <div class="cus-owner">{{ scope.row.takeoverUsername }}</div>
                <div class="cus-dept">{{ scope.row.takeoverDepartmentName }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="接替状态">
            <template slot-scope="scope">
              {{ getInheritStatus(scope.row.status) }}
            </template>
          </el-table-column>

          <el-table-column prop="transferTime" label="分配时间" />
          <el-table-column prop="remark" label="备注" />
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="getList()"
        />
      </template>
    </RightContainer>
  </div>
</template>
<script>
import { goRouteWithQuery } from '@/utils';
import { dealAtInfo } from '@/utils/common';
import { PAGE_LIMIT, WX_TYPE, INHERIT_STATUS_INHERITED, INHERIT_STATUS_INHERITING, INHERIT_STATUS_REFUSE,
  INHERIT_STATUS_FAIL, INHERIT_STATUS_USER_REACHED_UPPER_LIMIT } from '@/utils/constant';

import { getRecordList } from '@/api/transfer';

import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import ReturnPage from '@/components/ReturnPage';

const defaultQuery = {
  pageNum: 1,
  pageSize: PAGE_LIMIT
};

// 在职继承的接替状态
const INHERIT_STATUS_OPTIONS = {
  [INHERIT_STATUS_INHERITED]: '接替成功',
  [INHERIT_STATUS_INHERITING]: '接替中',
  [`${INHERIT_STATUS_REFUSE},${INHERIT_STATUS_USER_REACHED_UPPER_LIMIT},${INHERIT_STATUS_FAIL}`]: '接替失败'
};
// 在职继承的接替状态
const INHERIT_STATUS_MAP = {
  [INHERIT_STATUS_INHERITED]: '接替成功',
  [INHERIT_STATUS_INHERITING]: '接替中',
  [INHERIT_STATUS_REFUSE]: '接替失败',
  [INHERIT_STATUS_USER_REACHED_UPPER_LIMIT]: '接替失败',
  [INHERIT_STATUS_FAIL]: '接替失败'
};
export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon, ReturnPage },
  props: {},
  data() {
    return {
      query: { ...defaultQuery },
      total: 1,
      list: [],
      dateRange: [],
      inheritStatusOption: Object.entries(INHERIT_STATUS_OPTIONS)
    };
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    goRoute(row) {
      goRouteWithQuery(
        this.$router,
        '/customerManage/customerCenter/customerDetail',
        this.query,
        {
          id: row.externalUserid,
          userId: row.userId,
          prePageType: 'customer'
        }
      );
    },
    getList() {
      const params = {
        ...this.query,
        beginTime: this.dateRange[0],
        endTime: this.dateRange[1]
      };
      getRecordList(params).then(({ rows, total }) => {
        this.list = rows;
        this.total = +total;
      });
    },
    getInheritStatus(status) {
      return INHERIT_STATUS_MAP[status];
    },
    handleQuery() {
      this.query.pageNum = 1;
      this.getList();
    },
    isWXType(type) {
      return type === WX_TYPE;
    },
    renderUserInfo(item) {
      return dealAtInfo(item, 'customerType');
    },
    resetForm() {
      this.query = { ...defaultQuery };
      this.dateRange = [];
      this.getList();
    }
  }

};
</script>

<style scoped lang='scss'>
  .cus-owner {
    font-size: 14px;
    color: #333;
  }

  .cus-dept {
    font-size: 12px;
    color: #666;
  }
</style>
