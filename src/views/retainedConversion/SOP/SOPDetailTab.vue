<!--
 * @Description: sop详情tab页
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="sop-detail-tab">
    <el-card shadow="hover" class="mb10 detail-card-div">
      <svg class="icon-task" :width="100" :height="100">
        <use href="#icon-task" />
      </svg>
      <div class="info-div ml15">
        <div class="title mb15">
          {{ sopDetail.name }}
        </div>
        <div class="creator-div flex">
          <div class="task-item flex">
            <div class="label">创建时间：</div>
            <span>{{ sopDetail.createTime }}</span>
          </div>
          <div class="task-item flex">
            <div class="label">创建人：</div>
            <span>{{ sopDetail.createUserName }}</span>
          </div>
        </div>
        <div v-if="sopType === SOP_TYPE['cycle']" class="cycle-div flex">
          <div v-if="sopDetail.sopFilter" class="mt5 task-item flex">
            <div class="label">循环周期：</div>
            <span>{{ sopDetail.sopFilter.cycleStart }} ~ {{ sopDetail.sopFilter.cycleEnd }}</span>
          </div>
        </div>
        <div class="mt5 flex task-item">
          <div class="label">{{ dealUserTitle() }}</div>
          <div v-if="(userOrGroupList && userOrGroupList.length) || (getDepartmentList && getDepartmentList.length)" class="message-content">
            <div v-if="!isGroup" class="flex">
              <ByLengthUserShow
                :max-length="maxShowLength"
                :user-list="userOrGroupList.filter(item => item.userId)"
                :department-list="getDepartmentList.filter(item => item.departmentId)"
                :usename="isActivity ? 'name' : 'userName'"
              />
              <span v-if="userAndDetList.length > maxShowLength">
                等{{ userAndDetList.length }}{{ isGroup ? '个群' : '个' }}
                <span class="look-more ml10 theme-text-color" @click="onShowMore">查看</span>
              </span>
            </div>
            <template v-else>
              <span v-for="(userItem, userIndex) in userOrGroupList.slice(0, maxShowLength)" :key="userIndex">
                {{ dealName(userOrGroupList, userItem, userIndex) }}</span>
              <span v-if="userOrGroupList && userOrGroupList.length > maxShowLength">
                等{{ userOrGroupList.length }}{{ isGroup ? '个群' : '个' }}
                <span class="look-more ml10 theme-text-color" @click="onShowMore">查看</span>
              </span>
            </template>
          </div>
        </div>
        <div v-if="showCustomerTag" class="mt15 flex task-item">
          <div class="label">客户标签：</div>
          <div class="message-content">
            <el-tag
              v-for="(item, index) in sopDetail.sopCustomerFilter.tagList"
              :key="index"
              type="info"
            >{{ item.name }}</el-tag>
          </div>
        </div>
      </div>
    </el-card>
    <div class="rule-list-container">
      <div class="rule-list-header mb20 flex">
        <div class="config-title">SOP规则</div>
        <div>
          <el-radio-group v-if="sopType === SOP_TYPE['groupCalendar']" v-model="ruleListType" class="rule-type" size="medium">
            <el-radio-button label="calendar">日历</el-radio-button>
            <el-radio-button label="timeline">时间轴</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <SOPRuleList v-if="ruleListType === 'timeline'" :rule-list="ruleList" :sop-type="sopType" />
      <div v-if="ruleListType === 'calendar'" class="calendar-div">
        <SopCalendar
          ref="sopCalendarRef"
          :rule-list="ruleList"
          @handleEditCalendarItem="handleEditCalendarItem"
        />
      </div>
    </div>
    <UseEmployeeModal
      :title="isGroup ? '使用群聊' : isActivity ? '客户范围' : '使用员工'"
      :visible.sync="useEmployeeVisible"
      :user-list="userOrGroupList"
      :department-list="getDepartmentList"
      :is-group="isGroup"
      :sop-type="sopType"
      :is-activity="isActivity"
    />
    <AddRuleDrawer
      ref="addRuleDrawer"
      title="编辑规则"
      :visible.sync="addRuleDrawerVisible"
      :disable-edit="true"
    />
  </div>
</template>
<script>
import SOPRuleList from '../components/SOPRuleList.vue';
import { RULE_PERFORM_TYPE, SOP_TYPE } from '@/utils/constant';
import UseEmployeeModal from '../components/UseEmployeeModal.vue';
import SopCalendar from './sopCalendar.vue';
import AddRuleDrawer from '../components/AddRuleDrawer.vue';
import ByLengthUserShow from '@/components/ByLengthUserShow';

const MAX_CUSTOMER_SHOW_LENGTH = 5;
const MAX_GROUP_SHOW_LENGTH = 3;
export default {
  name: '',
  components: { SOPRuleList, UseEmployeeModal, SopCalendar, AddRuleDrawer, ByLengthUserShow },
  props: {
    sopDetail: {
      type: Object,
      default: () => {}
    },
    sopType: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      SOP_TYPE,
      useEmployeeVisible: false,
      ruleListType: 'timeline',
      addRuleDrawerVisible: false
    };
  },
  computed: {
    maxShowLength() {
      return this.isGroup ? MAX_GROUP_SHOW_LENGTH : MAX_CUSTOMER_SHOW_LENGTH;
    },
    isActivity() {
      return this.sopType === SOP_TYPE['activity'];
    },
    isGroup() {
      return [SOP_TYPE['timing'], SOP_TYPE['cycle'], SOP_TYPE['groupCalendar']].includes(this.sopType);
    },
    /**
     * 员工和部门列表
     */
    userAndDetList() {
      return [...this.userOrGroupList, ...this.getDepartmentList];
    },
    ruleList() {
      let ruleList = [];
      ruleList = this.sopDetail.ruleList?.map(item => {
        const info = {};
        switch (item.alertType) {
          case RULE_PERFORM_TYPE['hourMinute']: {
            info.hourMinute = {
              hour: item.alertData1,
              minute: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['dayTime']: {
            info.dayTime = {
              day: item.alertData1,
              time: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['beforeDayTime']: {
            info.beforeDayTime = {
              day: item.alertData1,
              time: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['everydayTime']: {
            info.everydayTime = item.alertData2;
            break;
          }
          case RULE_PERFORM_TYPE['time']: {
            info.time = item.alertData2;
            break;
          }
          case RULE_PERFORM_TYPE['everyWeekTime']: {
            info.everyWeekTime = {
              week: item.alertData1,
              time: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['everyMonthTime']: {
            info.everyMonthTime = {
              month: item.alertData1,
              time: item.alertData2
            };
            break;
          }
        }
        return { ...item, alertInfo: info };
      });
      return ruleList;
    },
    /**
     * 使用员工/群聊
     */
    userOrGroupList() {
      const list = this.isGroup ? this.sopDetail.groupSopList : this.sopDetail.userList;
      return (list && [...list]) || [];
    },
    /**
     * @description: 获得使用员工的部门
     * @return {*}
     */
    getDepartmentList() {
      const list = this.sopDetail.departmentList;
      return (list && [...list]) || [];
    },
    showCustomerTag() {
      return this.sopType === SOP_TYPE['birthday'] && this.sopDetail?.sopCustomerFilter?.tagList;
    }
  },
  watch: {
    ruleList(val) {
      if (val && val.length && this.$refs?.sopCalendarRef) {
        this.$refs.sopCalendarRef.calendarVal = new Date(val[0].alertData2);
      }
    }
  },
  created() {
    // 群日历规则展示类型默认为日历形式
    if (this.sopType === SOP_TYPE['groupCalendar']) {
      this.ruleListType = 'calendar';
    }
  },
  mounted() {},
  methods: {
    onShowMore() {
      this.useEmployeeVisible = true;
    },
    dealUserList(item) {
      let name = (this.isGroup ? item.groupName : item.userName) || '';
      if (this.sopType === SOP_TYPE['activity']) name = item.name;
      return name;
    },
    dealName(list, userItem, userIndex) {
      const isGroup = this.isGroup;
      return `${isGroup ? '「' : ''}
      ${this.dealUserList(userItem)}
      ${this.dealSplit(list, userIndex)}
      ${isGroup ? '」' : ''}`;
    },
    dealUserTitle() {
      if (this.sopType === SOP_TYPE['activity']) return '客户范围：';
      return `使用${this.isGroup ? '群聊：' : '员工：'}`;
    },
    dealSplit(list, userIndex) {
      if (this.isGroup) return '';
      return ([list.length - 1, this.maxShowLength - 1].includes(userIndex)) ? '' : '、';
    },
    /**
     * 点击群日历的某个规则
     */
    handleEditCalendarItem(item) {
      this.addRuleDrawerVisible = true;
      this.$refs['addRuleDrawer'].formData = { ...item };
    }
  }

};
</script>
<style scoped lang='scss'>
@import '~@/styles/mixin.scss';
.sop-detail-tab {
    height: 100%;
    display: flex;
    flex-direction: column;
    .detail-card-div {
        /deep/ .el-card__body {
            display: flex;
            .info-div {
                .title {
                    font-size: 24px;
                }
                .task-item {
                    margin-right: 10px;
                    .label {
                        color: $grayColor;
                        line-height: 20px;
                    }
                    .look-more {
                        cursor: pointer;
                    }
                    .message-content {
                      line-height: 18px;
                    }
                }
            }
        }
    }
    .rule-list-container {
        background-color: #fff;
        flex: 1;
        padding: 20px;
        .rule-list-header {
          justify-content: space-between;
          .config-title {
              font-size: 14px;
              line-height: 20px;
              text-align: left;
              font-family: Roboto;
              @include border_style($width: 3px, $direction: left);
              padding-left: 15px;
              height: 20px;
          }
        }
        /deep/ .sop-rule-list {
            padding-left: 24px;
        }
    }
}
</style>
