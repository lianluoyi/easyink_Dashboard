<!--
 * @Description: 朋友圈发布记录详情列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import { sendToUser, refreshMomentTask } from '@/api/friends.js';
import {
  PAGE_LIMIT
} from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { listOfMomentPublishDetail } from '@/api/friends';
import { getHeadImgUrl } from '@/utils/common';
const MAX_SEND_TARGET_NUM = 5;
// 待发布
const RELEASED = 0;
// 已发布
const PUBLISHED = 1;
// 已过期
const OVERDUE = 2;
// 不可发布
const NOTRELEASE = 3;
export default {
  components: { RightContainer, EmptyDefaultIcon },
  props: {
    usersId: {
      type: Array,
      default: () => []
    },
    momentTaskId: {
      type: String,
      default: ''
    },
    sendTime: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      RELEASED,
      PUBLISHED,
      OVERDUE,
      NOTRELEASE,
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        momentTaskId: this.momentTaskId,
        publishStatus: '',
        userName: ''
      },
      total: 0,
      loading: false,
      list: [],
      options: [{ label: '待发布', value: '0' }, { label: '已发布', value: '1' }, { label: '已过期', value: '2' }, { label: '不可发布', value: '3' }],
      publishStatus: { [RELEASED]: '待发布', [PUBLISHED]: '已发布', [OVERDUE]: '已过期', [NOTRELEASE]: '不可发布' }
    };
  },
  computed: {},
  watch: {},
  created() {
    this.listOfMomentPublishDetail();
  },
  mounted() {},
  methods: {
    getHeadImgUrl,
    // 查询
    listOfMomentPublishDetail(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      const query = { ...this.query };
      listOfMomentPublishDetail(query).then(({ rows, total }) => {
        this.list = rows;
        this.total = total;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    // 重置
    resetQuery() {
      this.query.userName = '';
      this.query.publishStatus = '';
      this.listOfMomentPublishDetail(1);
    },
    // 刷新
    refresh() {
      // 点击刷新时通过父组件将请求传给兄弟组件
      refreshMomentTask({
        momentTaskId: this.momentTaskId
      }).then(res => {
        this.msgSuccess('刷新成功');
        this.$emit('refshTime');
        this.listOfMomentPublishDetail(1);
      });
    },
    // 提醒
    notify(pushResult, userType) {
      let userIds = [];
      const sendTime = this.sendTime;
      const type = this.type;
      const momentTaskId = this.momentTaskId;
      if (userType === 0) {
        const { userId } = pushResult;
        userIds.push(userId);
        sendToUser({
          userIds, sendTime, type, momentTaskId
        }).then(res => {
          this.msgSuccess('提醒成功');
        });
      } else {
        userIds = this.usersId;
        this.$confirm('向未发布朋友圈的员工发出任务提醒，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          sendToUser({
            userIds, sendTime, type, momentTaskId
          }).then(res => {
            this.msgSuccess('提醒成功');
          });
        });
      }
    },
    // 处理触达对象
    getSendTargets(pushResult) {
      // 判断触达对象是否为空
      if (pushResult.customerName === null) {
        return ' ';
      } else {
        return pushResult.customerName.split(',').length > MAX_SEND_TARGET_NUM
          ? pushResult.customerName.split(',').slice(0, MAX_SEND_TARGET_NUM).join(',') + '等' + pushResult.customerName.split(',').length + '人'
          : pushResult.customerName;
      }
    }
  }
};
</script>

<template>
  <div class="push-result-wrapper">
    <RightContainer>
      <template v-slot:data>
        <div class="search-form flex">
          <el-input v-model="query.userName" placeholder="请输入员工姓名" size="small" />
          <el-select v-model="query.publishStatus" placeholder="请选择发布状态">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button type="primary" @click="listOfMomentPublishDetail(1)">查询</el-button>
          <el-button class="btn-reset" @click="resetQuery">重置</el-button>
          <div class="button-right">
            <el-button class="btn-reset" @click="refresh">刷新数据</el-button>
            <el-button type="primary" @click="notify(list,1)">一键提醒</el-button>
          </div>

        </div>
        <el-table v-loading="loading" :data="list">
          <template slot="empty">
            <empty-default-icon :length="list.length" />
          </template>
          <el-table-column class="trest1" label="员工" align="center" prop="userName">
            <template slot-scope="scope">
              <div class="user-info">
                <img :src="getHeadImgUrl(scope.row.headImageUrl)">
                <span>{{ scope.row.userName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center">
            <template slot="header">
              <div>
                <span>发布状态</span>
                <el-popover
                  placement="bottom-start"
                  trigger="hover"
                  popper-class="tip-popover"
                >
                  <div>已发布：发出通知后48小时内，发布到朋友圈</div>
                  <div>待发布：发出通知后48小时内，未发布朋友圈</div>
                  <div>已过期：发出通知后48小时后发布或未发布朋友圈</div>
                  <div>不可发布：员工不在应用的可见范围内</div>
                  <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
                </el-popover>
              </div>
            </template>
            <template slot-scope="scope">
              {{ publishStatus[scope.row.publishStatus] }}
            </template>
          </el-table-column>
          <el-table-column label="发布时间" align="center" prop="publishTime">
            <template slot-scope="scope">
              <div class="user-info">
                {{ scope.row.publishTime }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="触达对象" align="center" prop="customerName">
            <template slot-scope="scope">
              {{ getSendTargets(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="备注"
            align="center"
          />
          <el-table-column label="操作" align="center" width="180">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                :disabled=" !(scope.row.publishStatus === RELEASED) "
                :style="`${ (scope.row.publishStatus === RELEASED) ? '':'color:#AAAAAA'}`"
                @click="notify(scope.row,0)"
              >提醒发布</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="listOfMomentPublishDetail()"
        />
      </template>
    </RightContainer>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.search-form {
  margin-bottom: 15px;
}
.el-input, .el-select {
  width: 240px;
  margin-right: 8px;
}
.el-button + .el-button {
  margin-left: 8px;
}
.user-info {
  display: flex;
  align-items: center;
  i {
    font-size: 35px;
    @include text_btn_color($color-theme2-1);
  }
  img {
    width: 35px;
    height: 35px;
  }
  span {
    color: #333;
    padding-left: 5px;
  }
}
.push-result-wrapper {
  /deep/ .el-table__body-wrapper .el-table__cell:nth-child(1) {
    .cell {
      line-height: 35px;
    }
  }
}
.button-right {
  margin-left: auto;
}
</style>
