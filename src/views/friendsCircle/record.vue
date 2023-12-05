<!--
 * @Description: 发布记录
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import { goRouteWithQuery } from '@/utils';
import { MOMENT_RECORD } from '@/utils/constant/routePath';
import { PAGE_LIMIT } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import { getFriendsList, deleteMoment } from '@/api/friends';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import Content from './Content';
import loadingMixin from '@/mixin/loadingMixin';
// 发布类型（0：企业 1：个人）
const type = 1;
// 任务类型（0：立即发送 1：定时发送）
const taskType = 1;
// status状态判断按钮是否可以点击  0表示定时任务未发送 1表示开始创建任务，2表示正在创建任务中，3表示创建任务（已发送）
const HAS_SEND = 3;
const NOT_SEND = 0;
export default {
  name: 'Operlog',
  components: { RightContainer, Content, EmptyDefaultIcon },
  filters: {
    sendInfo(data) {
      return `已发布员工 ${data.publishNum}人\n待发布员工 ${data.notPublishNum}人`;
    }
  },
  mixins: [loadingMixin],
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      HAS_SEND,
      NOT_SEND,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      type,
      taskType,
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        beginTime: undefined,
        content: undefined,
        endTime: undefined,
        type: undefined
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now(); // 选当前时间之前的时间
        }
      },
      // 发布类型 发布类型（-1全部 0：企业 1：个人）
      options: [{ label: '全部', value: -1 }, { label: '个人', value: 1 }, { label: '企业', value: 0 }]
    };
  },
  created() {
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[MOMENT_RECORD] || {}).length) {
      const { beginTime, endTime } = this.$store.getters.searchQuery[MOMENT_RECORD];
      if (beginTime && endTime) {
        this.dateRange = [beginTime, endTime];
      }
      this.query = this.$store.getters.searchQuery[MOMENT_RECORD];
    }
    this.getFriendsCircleList();
  },
  methods: {
    // 获取发布记录列表
    getFriendsCircleList(page) {
      this.query.beginTime = this.dateRange[0];
      this.query.endTime = this.dateRange[1];
      if (this.query.type) {
        this.query.type = Number(this.query.type);
      }
      page && (this.query.pageNum = page);
      this.loading = true;
      getFriendsList(this.query).then(({ rows, total }) => {
        this.list = rows;
        this.total = +total;
      }).finally(() => {
        this.loading = false;
        this.modifyButtonStatus();
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.query = this.$options.data().query;
      this.getFriendsCircleList(1);
    },
    // 前往详情
    goRoute(id, path) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: MOMENT_RECORD,
        query: this.query
      });
      goRouteWithQuery(this.$router, path, {}, { id });
    },
    // 删除朋友圈 status  任务状态，整型，0表示定时任务未发送 3表示创建任务（已发送）
    deleteTask(task) {
      // 删除定时未发送提示该信息
      if (task.status === NOT_SEND) {
        this.confirmModal({
          msg: `该朋友圈删除后，员工将不接收发布通知，是否继续？`
        }, () => {
          deleteMoment({
            momentTaskId: task.momentTaskId
          }).then(res => {
            this.msgSuccess('操作成功');
            this.getFriendsCircleList();
          });
        });
      }
      // 删除已发送的朋友圈
      if (task.status === HAS_SEND) {
        this.confirmModal({
          msg: `该朋友圈发布记录将从系统删除，不会删除已发布到企业微信的记录，是否继续？`
        }, () => {
          deleteMoment({
            momentTaskId: task.momentTaskId
          }).then(res => {
            this.msgSuccess('操作成功');
            this.getFriendsCircleList();
          });
        });
      }
    },
    // 赋值编辑跳转方法
    goToGroupMessageAdd(_type, data) {
      const params = {};
      params.from = _type;
      // 将所属员工在路由中传递过去
      params.user = data.userList;
      params.momentTaskId = data.momentTaskId;
      goRouteWithQuery(this.$router, 'release', {}, params);
    }
  }
};
</script>
<template>
  <div>
    <RightContainer>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :model="query"
          :inline="true"
          class="top-search"
          label-width="100px"
        >
          <el-form-item>
            <el-input
              v-model="query.content"
              placeholder="请输入朋友圈内容"
              clearable
              @keyup.enter.native="getFriendsCircleList(1)"
              @clear="getFriendsCircleList(1)"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.type" placeholder="请选择发布类型" size="small">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              :picker-options="pickerOptions"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label=" ">
            <el-button
              v-preventReClick="200"
              type="primary"
              :loading="searchButtonLoading"
              @click="()=>{
                searchButtonLoading = true;
                getFriendsCircleList(1)
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
          v-loading="loading"
          :data="list"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              :length="list.length"
            />
          </template>
          <el-table-column label="朋友圈内容" align="center" prop="weWordsDetailList" width="300">
            <template slot-scope="scope">
              <div class="message-text intwoline">{{ scope.row.content }}</div>
              <Content :data="scope.row" />
            </template>
          </el-table-column>
          <el-table-column label="发布类型" align="center" prop="type">
            <template slot-scope="scope">
              <pre>{{ scope.row.type === type?'个人':'企业' }}</pre>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.taskType === taskType">
                <div>定时发布</div>
                {{ scope.row.sendTime }}
              </div>
              <div v-else>
                立即发布
              </div>
            </template>
          </el-table-column>
          <el-table-column label="发布结果" align="center" prop="sendInfo" width="160">
            <template slot-scope="scope">
              <pre>{{ scope.row | sendInfo }}</pre>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            width="180"
          />
          <el-table-column label="操作" align="center" width="180">
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['wecom:moments:detail']"
                size="mini"
                type="text"
                :disabled="scope.row.status !== HAS_SEND"
                :style="`${scope.row.status !== HAS_SEND?'color:#AAAAAA':''}`"
                @click="goRoute(scope.row.momentTaskId, 'detail')"
              >详情</el-button>
              <el-button
                size="mini"
                type="text"
                @click="goToGroupMessageAdd('copy', scope.row)"
              >复制</el-button>
              <el-button
                v-hasPermi="['wecom:moments:edit']"
                size="mini"
                type="text"
                :disabled="scope.row.status !== NOT_SEND"
                :style="`${scope.row.status !== NOT_SEND?'color:#AAAAAA':''}`"
                @click="goToGroupMessageAdd('edit', scope.row)"
              >编辑</el-button>
              <el-button
                v-hasPermi="['wecom:moments:del']"
                size="mini"
                type="text"
                @click="deleteTask(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>

        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :disabled="loading"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="getFriendsCircleList()"
        />
      </template>
    </RightContainer>
  </div>
</template>

<style lang="scss" scoped>
pre {
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
}
</style>
