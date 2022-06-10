<script>
import * as api from '@/api/customer/dimission';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { goRouteWithQuery } from '@/utils';
import { PAGE_LIMIT } from '@/utils/constant';
import AllocateModal from './allocateModal.vue';

export default {
  name: 'Dimission',
  components: { RightContainer, EmptyDefaultIcon, AllocateModal },
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
      isMoreFilter: false,
      total: 0,
      form: {
        user: '',
        region: ''
      },
      list: [],
      currentRows: [],
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
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>将离职成员的客户和客户群聊分配给其他成员继续提供服务</div>
      `
    );
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
      api
        .getNoAllocateList(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    resetForm(formName) {
      this.dateRange = [];
      this.$refs['queryForm'].resetFields();
    },
    showSelectDialog() {
      if (this.currentRows.length > 0) {
        this.dialogVisibleSelectUser = true;
      } else {
        this.msgWarn('请先选择一位员工');
      }
    },
    // 选中数据
    // handleCurrentChange(val) {
    //   console.log('val1', val);
    //   this.currentRows = val
    // },
    handleSelectionChange(valArr) {
      this.currentRows = valArr;
    },
    // 重置
    resetSearch() {
      this.resetForm('queryForm');
      this.getList(1);
    },
    goRoute() {
      goRouteWithQuery(this.$router, 'allocatedStaffList', this.query);
    }
  }
};
</script>

<template>
  <RightContainer :config-keys="['customSecret', 'contactSecret']" page-title="管理离职员工">
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
            type="daterange"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
        </el-form-item>

        <el-form-item label>
          <el-button
            type="primary"
            @click="getList(1)"
          >查询</el-button>
          <el-button
            class="btn-reset"
            @click="resetSearch"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:operate-btn>
      <el-button
        v-hasPermi="['customerManage:dimission:allocatedStaffList']"
        class="btn-reset"
        @click="goRoute"
      >已分配的离职员工</el-button>
      <el-button
        v-hasPermi="['customerManage:dimission:allocate']"
        class="btn-reset"
        @click="showSelectDialog"
      >分配给其他员工</el-button>
    </template>
    <template v-slot:data>
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="list"
        tooltip-effect="dark"
        style="width: 100%"
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <template slot="empty">
          <empty-default-icon
            text="暂无数据"
          />
        </template>
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column prop="userName" label="已离职员工" />
        <el-table-column prop="mainDepartmentName" label="所属部门" />
        <el-table-column
          prop="allocateCustomerNum"
          label="待分配客户"
          show-overflow-tooltip
        />
        <el-table-column
          prop="allocateGroupNum"
          label="待分配客户群"
          show-overflow-tooltip
        />
        <el-table-column
          prop="dimissionTime"
          label="离职时间"
          show-overflow-tooltip
        >
          <template slot-scope="scope">{{ scope.row.dimissionTime }}</template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        :select-data-len="currentRows.length"
        @pagination="getList()"
      />
      <!-- 选择添加人弹窗 -->
      <AllocateModal :dialog-visible-select-user.sync="dialogVisibleSelectUser" :current-rows="currentRows" :get-list="getList" />
    </template>
  </RightContainer>

</template>

<style lang="scss" scoped>
.el-input,
.el-select {
  width: 220px;
}
</style>
