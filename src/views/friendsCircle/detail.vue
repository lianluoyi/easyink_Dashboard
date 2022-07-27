<!--
 * @Description: 发布详情
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import TabContent from './TabContent.vue';
import { getMomentTaskBasicInfo } from '@/api/friends';
import Statistics from '@/components/Statistics';
import VerbalTrickImgLink from './Link.vue';
import ContentVideo from './ContentVideo.vue';
import { MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_VIDEO, MEDIA_TYPE_TEXT, FRIEND_SELECT_USER, FRIEND_PUSH_RANGE } from '@/utils/constant';
// 发布类型  1:个人 0：企业
const SELF = 1;
// 任务类型（0：立即发送 1：定时发送）
const TASKTYPE = 0;
import { getTotal } from '@/api/friends';
export default {
  components: {
    TabContent, Statistics, VerbalTrickImgLink, ContentVideo
  },
  props: {},
  data() {
    return {
      data: {},
      SELF,
      TASKTYPE,
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_TEXT,
      // 可见范围
      text: '全部客户',
      numsList: {},
      uptime: '',
      colList: [
        { title: '员工总数', showPopover: true, content: '需要发布该朋友圈的员工数量' },
        { title: '已发布员工', showPopover: true, content: '收到通知后48小时内发布朋友圈的员工' },
        { title: '待发布员工', showPopover: true, content: '发出通知后48小时内没有发布朋友圈的员工' },
        { title: '过期朋友圈', showPopover: true, content: '收到通知后没有在48小时内发布朋友圈的员工，若48小时后发布，仍视为过期' }
      ]
    };
  },
  computed: {},
  watch: {},
  created() {
    this.getMomentTaskBasicInfo();
    this.getTotal();
  },
  mounted() {
  },
  methods: {
    getTotal() {
      getTotal({ momentTaskId: this.$route.query.id }).then(({ data }) => {
        this.numsList = data;
        this.uptime = data.updateTime;
      });
    },
    getMomentTaskBasicInfo() {
      getMomentTaskBasicInfo({ momentTaskId: this.$route.query.id }).then(({ data }) => {
        this.data = data;
        var tagLength = data.tagList ? data.tagList.length : 0;
        // 可见范围是部分客户
        if (data.pushRange === FRIEND_PUSH_RANGE.PART_CLIENR) {
          // 只设置员工 没设置标签
          if (data.selectUser === FRIEND_SELECT_USER.IS_SELECT && tagLength === 0) {
            this.text = '部分客户';
          }
          // 设置了标签
          if (tagLength !== 0) {
            // 是否设置员工
            this.text = data.selectUser === FRIEND_SELECT_USER.NO_SELECT ? '客户被打上标签' : '部分员工下客户被打上标签';
          }
        }
      });
    },
    handleGoBack() {
      const apiQuery = {};
      Object.keys(this.$route.query).forEach(key => {
        if (key.includes('_')) {
          apiQuery[key.slice(0, -1)] = this.$route.query[key];
        }
      });
      this.$router.push({
        path: '/operationsCenter/moments/record',
        query: apiQuery
      });
    },
    // 刷新发布统计的数据
    refshTime() {
      this.getTotal();
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
      <div>
        <el-image
          class="part-img"
          :src="require('@/assets/image/moment.png')"
        />
      </div>
      <div>
        <div class="creator-div">
          <div class="label">创建时间：</div>
          <span>{{ data.sendTime }}</span>
          <div class="label">创建人：</div>
          <span>{{ data.createBy }}</span>
          <div class="label">发布类型：</div>
          <span v-if="data.type ===SELF"> 个人 </span>
          <span v-if="data.type !==SELF"> 企业 </span>
          <div class="label">发布时间：</div>
          <span>{{ data.taskType===0 ? '立即发送' : data.sendTime }}</span>
        </div>
        <div>
          <div class="mt15">
            <div class="taglist">
              <div>
                <span>可见范围：</span>
                <span style="color:#333333">{{ text }}</span>
              </div>
              <el-tag v-for="item in data.tagList" :key="item.tagId" class="tag ml5">{{ item.name }}</el-tag>
            </div>
          </div>
        </div>
        <div class="mt15 flex aic">
          <div class="content">发布内容：</div>
          <div class="message-content">
            <div v-if="data.mediaType === Number(MEDIA_TYPE_IMGLINK)">
              <div class="message-text">{{ data.content }}</div>
              <VerbalTrickImgLink :title="data.weWordsDetailList[0].title" :cover-url="data.weWordsDetailList[0].coverUrl" />
            </div>
            <div v-if="data.mediaType === Number(MEDIA_TYPE_POSTER)">
              <div class="message-text">{{ data.content }}</div>
              <div class="flex mt5">
                <div v-for="item in data.weWordsDetailList" :key="item.id">
                  <el-image
                    style="width: 78px; height: 78px;margin-right:4px;"
                    :src="item.url"
                    fit="fill"
                  />
                </div>
              </div>
            </div>
            <div v-if="data.mediaType === Number(MEDIA_TYPE_VIDEO)" class="message-content">
              <div class="message-text">{{ data.content }}</div>
              <ContentVideo :data="data.weWordsDetailList[0]" />
            </div>
            <!-- 没有附件 -->
            <div v-if="[null, Number(MEDIA_TYPE_TEXT)].includes(data.mediaType)" class="message-content">
              <div class="message-text">{{ data.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <Statistics
      :nums-list="numsList"
      :show-uptime="true"
      :uptime="uptime"
      :col-list="colList"
      title="发布统计"
    />

    <el-tabs v-if="data.momentTaskId" class="group-message-detail-page-table mt15">
      <TabContent :users-id="data.users" :moment-task-id="data.momentTaskId" :send-time="data.sendTime" :type="data.type" @refshTime="refshTime" />
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.part-img {
  margin-right: 15px;
  width:100px;
  height:100px;
  margin-top: 8px;
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
.tag {
  background-color: #F0F8F7 ;
  height: 26px;
  border-radius: 4px;
  text-align: center;
  line-height: 26px;
  color:#6BB4AB;
  border: 1px solid #E1F0EE;
  vertical-align: text-bottom;
}
.taglist {
  color: #999;
  display: flex;
  align-items: center;
}
.content {
  color: #999;
  font-size: 14px;
  width: 70px;
  text-align: right;
}
</style>
