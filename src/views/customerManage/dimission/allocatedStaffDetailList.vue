<script>
import {
  getAllocateCustomersPlus,
  getAllocateGroupsPlus
} from '@/api/customer/dimission';
import { PAGE_LIMIT, DIMISSION_STATUS_MAP, INHERIT_STATUS_INHERITING, CUSTOMER_DEATIL_PATH } from '@/utils/constant';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import AllocateModal from './allocateModal.vue';

const DATE_RANGE_LENGTH = 2;
const ALLOCATE_FAIL = '0';

export default {
  name: 'AllocatedStaffDetailList',
  components: { EmptyDefaultIcon, AllocateModal },
  props: {
    dateRange: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'customer'
    }
  },
  data() {
    return {
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        beginTime: undefined,
        endTime: undefined
      },
      loading: false,
      total: 0,
      list: [],
      dialogVisibleSelectUser: false,
      currentRows: []
    };
  },
  computed: {},
  watch: {
    dateRange(val, old) {
      // 重置后手动触发获取接口,不然dateRange还是之前的值
      if (val.length === 0 && old.length === DATE_RANGE_LENGTH) {
        this.getList();
      }
    }
  },
  created() {},
  mounted() {
    this.query.recordId = this.$route.query.id;
    this.getList();
  },
  methods: {
    /** 查询 */
    getList(page) {
      if (this.dateRange && this.dateRange.length === DATE_RANGE_LENGTH) {
        this.query.beginTime = this.dateRange[0];
        this.query.endTime = this.dateRange[1];
      } else {
        this.query.beginTime = '';
        this.query.endTime = '';
      }
      page && (this.query.pageNum = page);
      this.loading = true;
      (this.type === 'customer' ? getAllocateCustomersPlus : getAllocateGroupsPlus)(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    gotoDetail(scope, type) {
      if (type === 'group') {
        this.$router.push({
          path: '/customerManage/customerCenter/groupDetail',
          query: scope.row
        });
      } else {
        this.$router.push({
          path: CUSTOMER_DEATIL_PATH,
          query: {
            id: scope.row.externalUserid,
            userId: scope.row.handoverUserId,
            prePageType: 'allocatedStaffDetailList',
            dimissionTime: scope.row.dimissionTime }
        });
      }
    },
    getInheritStatusText(item) {
      return DIMISSION_STATUS_MAP[item.status] ?? (item?.allocateResult === ALLOCATE_FAIL ? '失败' : '成功');
    },
    showReAllocate(item) {
      return item.status
        ? item.status > INHERIT_STATUS_INHERITING
        : item.allocateResult === ALLOCATE_FAIL;
    },
    /**
     * 重新分配
     */
    reAllocate(scope) {
      this.dialogVisibleSelectUser = true;

      // 补充 userId 属性
      if (!scope.row.userId) {
        scope.row.userId = scope.row.takeOverUserId || scope.row.oldOwner;
      }

      this.currentRows = [scope.row];
    }
  }
};
</script>

<template>
  <div class="page">
    <el-table
      ref="multipleTable"
      :data="list"
      tooltip-effect="dark"
      style="width: 100%"
    >
      <template slot="empty">
        <empty-default-icon
          text="暂无数据"
        />
      </template>
      <el-table-column
        v-if="type === 'customer'"
        prop="customerName"
        label="客户"
      />
      <el-table-column v-else prop="groupName" label="客户群" />
      <el-table-column
        :prop="type === 'customer' ? 'takeUserName' : 'newOwnerName'"
        label="继承员工"
      />
      <el-table-column
        prop="mainDepartmentName"
        label="继承员工所属部门"
        show-overflow-tooltip
      />
      <el-table-column
        prop="allocateTime"
        label="继承时间"
        show-overflow-tooltip
      />
      <el-table-column
        prop="status"
        label="分配结果"
        show-overflow-tooltip
      >
        <template #header>
          <span>分配结果</span>
          <el-popover
            placement="top-start"
            content="分配成功仅表示客户/客户群进入分配流程，并不代表最终分配成功"
            trigger="hover"
            popper-class="tip-popover"
          >
            <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
          </el-popover>
        </template>
        <template slot-scope="scope">
          <div>{{ getInheritStatusText(scope.row) }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="failReason"
        label="备注"
        show-overflow-tooltip
      />
      <el-table-column label="操作" width="110">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="type === 'customer' ? ['customerManage:customer:view'] : ['customerManage:group:view']"
            size="small"
            type="text"
            @click="type==='customer' ? gotoDetail(scope, 'customer') : gotoDetail(scope, 'group')"
          >详情</el-button>
          <!-- 分配失败且不是已分配才显示重新分配按钮 -->
          <el-button
            v-if="showReAllocate(scope.row)"
            size="small"
            type="text"
            @click="() => reAllocate(scope)"
          >重新分配</el-button>
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
    <AllocateModal
      :dialog-visible-select-user.sync="dialogVisibleSelectUser"
      :current-rows="currentRows"
      :get-list="getList"
      :type="type === 'group' ? 'reAllocateCustomerGroup' : 'reAllocateCustomer'"
    />
  </div>
</template>

<style lang="scss" scoped></style>
