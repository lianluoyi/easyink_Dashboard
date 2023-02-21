<!--
 * @Description: 客户活跃度详情弹窗
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <el-dialog
    v-bind="$attrs"
    class="spread-dialog"
    width="1050px"
    :close-on-click-modal="false"
    :title="`${getUserName}的客户活跃度详情`"
    v-on="$listeners"
    @close="onClose"
  >
    <div class="spread-dialog-content">
      <el-input
        v-model="query.customerName"
        placeholder="请输入客户昵称，回车搜索"
        clearable
        class="search-input"
        style="width: 240px"
        @keydown.enter.native="getList(true)"
      />
      <el-table
        v-loading="loading"
        :data="list"
      >
        <template slot="empty">
          <empty-default-icon :length="list.length" />
        </template>
        <el-table-column
          prop="codeUrl"
          label="客户"
        >
          <template slot-scope="{ row }">
            <UserItem :data="row" />
          </template>
        </el-table-column>
        <el-table-column prop="customerSendMessageCnt" label="客户发送消息数" />
        <el-table-column prop="userSendMessageCnt" label="员工发送消息数" />
      </el-table>
      <pagination
        :total="total * 1"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        @pagination="getList()"
      />
    </div>
  </el-dialog>
</template>
<script>
import { PAGE_LIMIT } from '@/utils/constant';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import UserItem from './userItem.vue';
import {
  getCustomerActivityOfUserDetail
} from '@/api/statistics';
export default {
  name: '',
  components: { EmptyDefaultIcon, UserItem },
  props: {
    // 员工详情的员工资料
    showDetailsClient: {
      type: Object,
      default: () => {}
    },
    // 父组件查询参数
    parentQuery: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // 活跃度详情表格数据
      list: [],
      // 表格数据总数
      total: 0,
      // 表格loading
      loading: false,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        // 搜索的客户昵称
        customerName: ''
      }
    };
  },
  computed: {
    getUserName() {
      return this.showDetailsClient?.userName;
    },
    getUserId() {
      return this.showDetailsClient?.userId;
    }
  },
  watch: {},
  methods: {
    /**
     * @description 获取搜索的传参
     */
    getSearchPayload() {
      // 此处顺序不可变 保证能覆盖掉 pageNum
      return { ...this.parentQuery, ...this.query, userId: this.showDetailsClient?.userId };
    },
    // 获取表格数据
    getList(initPage) {
      initPage ? this.query.pageNum = 1 : null;
      this.loading = true;
      getCustomerActivityOfUserDetail(this.getSearchPayload()).then(res => {
        this.list = res.rows;
        this.total = res.total || 0;
      }).finally(() => {
        this.loading = false;
      });
    },
    // 重置搜索参数
    resetQuery() {
      this.query = {
        customerName: '',
        pageSize: PAGE_LIMIT
      };
    },
    // 关闭弹窗
    onClose() {
      this.$emit('update:visible', false);
      this.resetQuery();
    }
  }

};
</script>
<style scoped lang='scss'>
.search-input {
  margin-bottom: 22px;
}
</style>
