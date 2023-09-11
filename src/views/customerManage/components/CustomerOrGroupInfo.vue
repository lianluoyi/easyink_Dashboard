<template>
  <div v-loading="pageLoading" class="customer-info-list">
    <!-- 不直接使用showList是因为防止进页面的时候就显示空值 感观不好 -->
    <empty-default-icon
      :length="Number(!showEmptyIcon)"
      text="暂无数据"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in showList"
          :key="index"
          :timestamp="getTimeStamp(item)"
          placement="top"
        >
          <div v-for="(step, stepIndex) in item.list" :key="stepIndex">
            <div class="time">
              <div v-if="step.trajectoryType == CUSTOMER_DETAIL['todo']" class="sop-title">
                <template v-if="!isSop(step)">
                  {{ getTimeNotSeconds(step.startTime) + '~' + getTimeNotSeconds(step.endTime) }}
                </template>
                <template v-else>
                  {{ getTimeNotSeconds(step.startTime) }}
                  <div class="sop-sign">SOP</div>
                </template>
                <span :class="`${step.status === COMPELETE_TYPE ? 'finish' : 'not-finish '} sop-status`"> {{ step.status === COMPELETE_TYPE ? '已完成' : '待完成' }}</span>
              </div>
              <div v-else>
                {{ getTimeNotSeconds(step.startTime) }}
              </div>
            </div>
            <el-card v-if="activeTab !== CUSTOMER_DETAIL['todo']">
              <!-- 信息动态 -->
              <NewsContent v-if="activeTab === CUSTOMER_DETAIL['informationDynamics']" :news-item="step" />
              <!-- 活动轨迹 -->
              <template v-if="activeTab === CUSTOMER_DETAIL['activityTrack']">
                <template v-if="[ADD_USER, DEL_USER].includes(step.subType)">
                  <div class="step-content" v-html="dealActivity(step)" />
                </template>
                <span v-else class="step-content">{{ step.content }}</span>
              </template>
            </el-card>
            <!-- 待办事项 -->
            <div v-else :class="`${step.status === COMPELETE_TYPE ? 'finish-card' : ''}`">
              <!-- 待办 -->
              <template v-if="!isSop(step)">
                <el-card>
                  {{ step.content }}
                </el-card>
              </template>
              <template v-else>
                <RuleContent card-width="752px" :rule-item="step" />
              </template>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </empty-default-icon>
  </div>

</template>

<script>
import { CUSTOMER_DETAIL } from '@/utils/constant/index';
import { findTrajectory } from '@/api/customer/portrait';
import RuleContent from '@/components/RuleContent/index.vue';
import NewsContent from './NewsContent.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import moment from 'moment';
import { keyBy } from 'lodash';
const ADD_USER = 'add_user';
const DEL_USER = 'del_user';
const NOT_SOP_DETAIL = '-1';
// 待办类型（完成）
const COMPELETE_TYPE = '3';
export default {
  components: { RuleContent, NewsContent, EmptyDefaultIcon },
  props: {
    activeTab: {
      type: String,
      default: CUSTOMER_DETAIL['informationDynamics']
    },
    userId: {
      type: String,
      default: ''
    },
    externalUserid: {
      type: String,
      default: ''
    },
    /** 是否是客户群 */
    isGroup: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      CUSTOMER_DETAIL,
      COMPELETE_TYPE,
      ADD_USER,
      DEL_USER,
      showList: [],
      total: 0,
      pageLoading: true,
      showEmptyIcon: false
    };
  },
  watch: {
    activeTab(val) {
      this.showList = [];
      this.pageLoading = true;
      this.getList(val);
    },
    userId() {
      this.showList = [];
      this.pageLoading = true;
      this.getList();
    }
  },
  created() {
    this.getList(this.activeTab);
  },
  methods: {
    isSop(nItem) {
      return nItem.detailId && nItem.detailId !== NOT_SOP_DETAIL;
    },
    // TODO 要不要做缓存
    getList(type = this.activeTab) {
      const payload = {
        externalUserid: this.externalUserid,
        trajectoryType: +type,
        ...(!this.isGroup && { userId: this.userId })
      };
      //  trajectoryType 1：信息动态 3:活动轨迹 4：待办事项
      findTrajectory(payload).then((res) => {
        this.total = res.total;
        this.groupAndSortBtTime(res.rows);
      }).finally(() => {
        this.pageLoading = false;
        this.showEmptyIcon = Boolean(!this.showList.length);
      });
    },
    /**
     * @description 根据时间分组
     */
    groupAndSortBtTime(arr) {
      const newList = [];
      Object.keys(keyBy(arr || [], 'createDate')).forEach((item) => {
        const list = arr.filter((k) => k.createDate === item);
        newList.push({
          createDate: item,
          list
        });
      });
      this.showList = newList;
    },
    /**
     * @description 去掉时间中的秒
     */
    getTimeNotSeconds(time) {
      const timeArray = time.split(':');
      if (timeArray.length <= 0) {
        return time;
      }
      const newTime = timeArray[0] + ':' + timeArray[1];
      return newTime;
    },
    /**
     * @description 获取具体时间
     */
    getTimeStamp(item) {
      const time = moment(item.createDate).format('YYYY-MM-DD');
      const dateArray = time.split('-');
      const date = new Date(
        dateArray[0],
        parseInt(dateArray[1] - 1),
        dateArray[2]
      );
      return time + ' 星期' + '日一二三四五六'.charAt(date.getDay());
    },
    /**
     * 处理信息动态中图片内容
     */
    dealActivity(item) {
      let showHtml = item.content || '';
      showHtml = showHtml.replace('${picUrl}', `<img style="height:30px; width:30px; fit:cover; margin: 0 5px;" src=${item.detail || require('@/assets/image/card-avatar.svg')} />`);
      return showHtml;
    }
  }
};
</script>

<style lang="scss" scoped>
  .customer-info-list {
    background-color: #fff;
    padding: 0 20px;
    overflow: auto;
    padding-top: 20px;
    min-height: 500px;
    height: calc(100% - 39px);
    position: absolute;
    width: 100%;
  }
  /deep/ .el-timeline {
    .el-timeline-item__timestamp {
      color: #101010;
      font-size: 14px;
      font-weight: 600;
    }
    .time {
      margin: 10px 0;
      color: #AEAEAE;
      font-size: 12px;
      .sop-title {
        display: flex;
        align-items: center;
        width: 752px;
        position: relative;
      }
      .sop-sign {
        text-align: center;
        line-height: 20px;
        background-color: #E74E59;
        color: white;
        border: red 2px solid;
        border-radius: 4px;
        margin-left: 10px;
        font-size: 12px;
        width: 43px;
        height: 24px;
      }
      .finish {
        color: #AAAAAA;
      }
      .not-finish {
        color: #E74E59;
      }
      .sop-status {
        position: absolute;
        right: 0;
      }
    }
  }
  .finish-card {
    /deep/ .el-card {
      background-color: #F5F7FA;
    }
  }
  /deep/ .el-card {
    width: 752px;
    .el-card__body {
      padding: 15px;
    }
  }
  .step-content {
    display: flex;
    align-items: center;
  }
</style>
