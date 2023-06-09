<template>
  <div class="batch-tag">
    <RightContainer>
      <template v-slot:header>
        <ReturnPage class="mb10" />
      </template>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          class="top-search"
        >
          <el-form-item>
            <el-input v-model="query.customerInfo" placeholder="请输入客户信息" clearable />
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="query.status"
              placeholder="请选择打标状态"
              clearable
            >
              <el-option
                v-for="item in TAG_STATUS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="onSearch"
            >查询</el-button>
            <el-button
              class="btn-reset"
              @click="onReset"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:operate-btn>
        <el-button v-hasPermi="['wecom:batchtag:export']" @click="exportReport">导出报表</el-button>
      </template>
      <template v-slot:data>
        <el-table
          ref="table"
          v-loading="loading"
          :data="taskDetailList"
          tooltip-effect="dark"
          size="medium"
        >
          <template slot="empty">
            <empty-default-icon
              text="暂无数据"
            />
          </template>
          <el-table-column label="external_userid" prop="importExternalUserid" align="left" />
          <el-table-column label="unionid" prop="importUnionId" align="left" />
          <el-table-column label="手机号" prop="importMobile" align="left" />
          <el-table-column label="打标状态" prop="status" align="left">
            <template slot-scope="{ row }">
              <div :class="TAG_STATUS[row.status].className">
                {{ TAG_STATUS[row.status].label }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" align="left" />
          <el-table-column label="操作">
            <template slot-scope="{ row }">
              <el-button
                type="text"
                size="medium"
                @click="goRoute(row)"
              >客户详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="total * 1"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="getTaskList()"
        />
      </template>
    </RightContainer>
  </div>
</template>

<script>
import ReturnPage from '@/components/ReturnPage.vue';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { goRouteWithQuery } from '@/utils';
import { PAGE_LIMIT, CUSTOMER_DEATIL_PATH } from '@/utils/constant';
import { selectBatchTaskDetailList, exportBatchTaskDetailList } from '@/api/batchTagTask';
// 打标签状态枚举
const TAG_TODO = 0;
const TAG_SUCCESS = 1;
const TAG_FAIL = 2;
const TAG_STATUS = {
  [TAG_TODO]: { className: 'tag-todo', label: '待执行', value: TAG_TODO },
  [TAG_SUCCESS]: { className: 'tag-success', label: '成功', value: TAG_SUCCESS },
  [TAG_FAIL]: { className: 'tag-fail', label: '失败', value: TAG_FAIL }
};
export default {
  name: 'TaskDetail',
  components: { RightContainer, EmptyDefaultIcon, ReturnPage },
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        customerInfo: void 0
      },
      taskDetailList: [],
      total: 0,
      taskId: void 0,
      taskName: void 0,
      loading: false,
      TAG_STATUS: Object.freeze(TAG_STATUS)
    };
  },
  beforeRouteEnter(to, from, next) {
    to.meta.keepAlive = true;
    next();
  },
  beforeRouteLeave(to, from, next) {
    from.meta.keepAlive = to.path === CUSTOMER_DEATIL_PATH;
    next();
  },
  created() {
    const routerQuery = this.$route.query;
    this.taskId = routerQuery.taskId;
    this.taskName = routerQuery.taskName;
    this.getTaskList();
  },
  methods: {
    getTaskList(page) {
      page && (this.query.pageNum = page);
      const params = {
        ...this.query,
        taskId: this.taskId
      };
      this.loading = true;
      selectBatchTaskDetailList(params).then((res) => {
        this.taskDetailList = res.rows;
        this.total = res.total;
      }).finally(() => {
        this.loading = false;
      });
    },
    onSearch() {
      this.getTaskList(1);
    },
    onReset() {
      this.query = this.$options.data().query;
      this.onSearch(1);
    },
    goRoute(row) {
      if (!row.tagExternalUserid) {
        this.msgWarn('Ta不是企业客户');
        return;
      }
      goRouteWithQuery(
        this.$router,
        'customerDetail',
        this.query,
        {
          id: row.tagExternalUserid,
          userId: row.tagUserId,
          prePageType: 'BatchTagTaskDetail'
        }
      );
    },
    /**
     * @description 导出报表
     */
    exportReport() {
      const { customerInfo, status } = this.query;
      const payload = {
        taskName: this.taskName,
        taskId: this.taskId,
        customerInfo,
        status
      };
      exportBatchTaskDetailList(payload).then((res) => {
        this.download(res.data.msg, true);
      }).catch(() => {
        this.msgError('导出失败!');
      });
    }
  }
};
</script>

<style  lang="scss" scoped>
.base-execute-status {
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: red;
    margin-right: 8px;
  }
}
.tag-success {
  @extend .base-execute-status;
  &::before {
    background-color: #51c41b;
  }
}
.tag-todo {
  @extend .base-execute-status;
  &::before {
    background-color: #BFBFBF;
  }
}
.tag-fail {
    @extend .base-execute-status;
  &::before {
    background-color: #F5232D;
  }
}
</style>
