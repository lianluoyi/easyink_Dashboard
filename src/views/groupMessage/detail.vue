<!--
 * @Description: 群发详情
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import { getDetail } from '@/api/groupMessage';
import AppendixList from '@/components/AppendixList';
import TabContent from './TabContent.vue';
import { MEDIA_TYPE_TEXT, GROUP_MESSAGE_PUSH_TYPE } from '@/utils/constant';

export default {
  components: {
    AppendixList, TabContent
  },
  props: {},
  data() {
    return {
      data: {},
      activeName: '0',
      total1: 0,
      total0: 0,
      appendixList: [],
      GROUP_MESSAGE_PUSH_TYPE
    };
  },
  computed: {},
  watch: {},
  created() {
    getDetail(this.$route.query.id).then(({ data }) => {
      this.data = data;
      this.appendixList = data.seedMessageList.slice(1);
    });
  },
  mounted() {},
  methods: {
    notice() {},
    getTextMessageList(msgList) {
      const textArr = [];
      msgList.map(item => { item.messageType === MEDIA_TYPE_TEXT && textArr.push(item.content); });
      return textArr.join(',');
    },
    handleGoBack() {
      const apiQuery = {};
      Object.keys(this.$route.query).forEach(key => {
        if (key.includes('_')) {
          apiQuery[key.slice(0, -1)] = this.$route.query[key];
        }
      });
      this.$router.push({
        path: '/operationsCenter/groupMessage/record',
        query: apiQuery
      });
    }
  }
};
</script>

<template>
  <div class="group-message-detail-page">
    <el-card shadow="hover" class="mb10">
      <div class="back-area">
        <i class="iconfont icon-restore" @click="handleGoBack" />
        <span @click="handleGoBack">返回</span>
      </div>
      <i class="iconfont icon-published theme-text-color" />
      <div>
        <div class="creator-div">
          <div class="label">任务名称：</div>
          <span>{{ data.taskName }}</span>
        </div>
        <div class="creator-div">
          <div class="label">创建时间：</div>
          <span>{{ data.sendTime }}</span>
          <div class="label">创建人：</div>
          <span>{{ data.sender }}</span>
          <div class="label">群发类型：</div>
          <span>{{ GROUP_MESSAGE_PUSH_TYPE[data.pushType] }}</span>
          <div class="label">发送时间：</div>
          <span>{{ !data.settingTime ? '立即发送' : data.settingTime.slice(0, -3) }}</span>
        </div>
        <div class="mt15 flex aic">
          <div class="label">消息内容：</div>
          <div class="message-content">
            <div v-if="data.content" class="message-text">{{ getTextMessageList(data.seedMessageList || []) }}</div>
            <AppendixList :list="appendixList" />
          </div>
        </div>
      </div>

    </el-card>
    <el-tabs v-model="activeName" class="group-message-detail-page-table">
      <el-tab-pane :label="'待执行'" name="0">
        <TabContent type="0" :total.sync="total0" :push-type="data.pushType" />
      </el-tab-pane>
      <el-tab-pane :label="'已执行'" name="1">
        <TabContent type="1" :total.sync="total1" :push-type="data.pushType" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.icon-published {
  font-size: 100px;
  margin-right: 15px;
}
.el-card {
  overflow: unset;
}
.back-area {
  position: absolute;
  left: 0;top: 0;
  width: 100%;
  height: 48px;
  line-height: 48px;
  padding-left: 15px;
  border-bottom: 1px solid #eee;
  i, span {
    cursor: pointer;
  }
  i {
    margin-right: 10px;
  }
}
.label {
  color: #999;
  font-size: 14px;
  width: 70px;
  text-align: right;
}
.mb10 {
  .creator-div {
    display: flex;
    &:nth-of-type(1) {
      margin-top: 10px;
    }
    &:nth-of-type(2) {
      margin-top: 15px;
    }
    span {
      margin-right: 30px;
      color: #333;
    }
  }
  .mt15 {
    position: relative;
    align-items: flex-start;
    display: flex;
    .message-content {
      flex: 1;
      .message-text {
        margin-bottom: 15px;
      }
    }
  }
}
.send-alert {
  margin: 10px 0;
}
.group-message-detail-page{
  flex: 1;
  display: flex;
  flex-direction: column;
  /deep/ .el-tabs__header {
    background: #fff;
    margin: 0;
  }
  /deep/ .el-card__body {
    display: flex;
    position: relative;
    padding-top: 60px;
  }
  /deep/ .el-tabs__item {
    width: 100px;
    text-align: center;
    padding: 0;
  }
  /deep/ .el-tabs__active-bar {
    width: 100px!important;
  }
}
.group-message-detail-page-table{
    flex: 1;
    display: flex;
    flex-direction: column;
}
.group-message-detail-page-table .el-tabs__content{
      flex: 1;
    background: #fff;
}
</style>
