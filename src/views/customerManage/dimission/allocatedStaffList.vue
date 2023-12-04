<script>
import { getAllocateList } from '@/api/customer/dimission';
import { goRouteWithQuery } from '@/utils';
import { PAGE_LIMIT } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  name: 'AllocatedStaffList',
  components: { RightContainer, EmptyDefaultIcon },
  mixins: [loadingMixin],
  props: {},
  data() {
    return {
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        userName: undefined,
        beginTime: undefined,
        endTime: undefined
      },
      loading: false,
      total: 0,
      list: [],
      dialogVisibleSelectUser: false,
      dateRange: [] // 离职日期
    };
  },
  computed: {},
  watch: {},
  created() {
    if (this.$route.query) {
      Object.keys(this.query).forEach(key => {
        if (this.$route.query[key]) {
          this.query[key] = this.$route.query[key];
        }
      });
    }
    this.getList();
  },
  mounted() {},
  methods: {
    /** 查询 */
    getList(page) {
      if (this.dateRange) {
        this.query.beginTime = this.dateRange[0];
        this.query.endTime = this.dateRange[1];
      } else {
        this.query.beginTime = '';
        this.query.endTime = '';
      }
      page && (this.query.pageNum = page);
      this.loading = true;
      getAllocateList(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
        })
        .finally(() => {
          this.modifyButtonStatus();
          this.loading = false;
        });
    },
    resetForm(formName) {
      this.dateRange = [];
      this.$refs[formName].resetFields();
    },
    /**
     * 点击重置按钮
     */
    resetQuery() {
      this.resetForm('queryForm');
      this.$nextTick(() => {
        this.getList(1);
      });
    },
    goRoute(item) {
      goRouteWithQuery(this.$router, 'allocatedStaffDetail', this.query, { id: item.id });
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
      >
        <el-form-item prop="userName">
          <el-input v-model="query.userName" placeholder="请输入离职员工姓名" />
        </el-form-item>

        <el-form-item>
          <el-date-picker
            v-model="dateRange"
            value-format="yyyy-MM-dd"
            type="daterange"
            :picker-options="pickerOptions"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
        </el-form-item>
        <el-form-item label>
          <el-button
            v-preventReClick="200"
            type="primary"
            :loading="searchButtonLoading"
            @click="()=>{
              searchButtonLoading = true;
              getList(1)
            }"
          >查询</el-button>
          <el-button
            v-preventReClick="200"
            class="btn-reset"
            :loading="resetButtonLoading"
            @click="()=>{
              resetButtonLoading = true;
              resetQuery()
            }"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:data>
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="list"
        tooltip-effect="dark"
        style="width: 100%"
      >
        <template slot="empty">
          <empty-default-icon
            text="暂无数据"
          />
        </template>
        <el-table-column type="index" label="序号" width="55" />
        <el-table-column prop="userName" label="已离职员工" />
        <el-table-column prop="mainDepartmentName" label="所属部门" />
        <el-table-column
          prop="allocateCustomerNum"
          label="已分配客户"
          show-overflow-tooltip
        />
        <el-table-column
          prop="allocateGroupNum"
          label="已分配客户群"
          show-overflow-tooltip
        />
        <el-table-column
          prop="transferTime"
          label="分配时间"
          show-overflow-tooltip
        >
          <template slot-scope="scope">{{ scope.row.transferTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['customerManage:dimission/allocatedStaffDetail']"
              type="text"
              size="small"
              @click="goRoute(scope.row)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :disabled="loading"
        :total="total"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        @pagination="getList()"
      />
    </template>

  </RightContainer>
</template>

<style lang="scss" scoped></style>
