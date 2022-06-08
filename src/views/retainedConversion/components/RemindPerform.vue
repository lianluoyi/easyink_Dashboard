<!--
 * @Description: 提醒时间
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="remind-perform-div">
    <div v-if="sopType === SOP_TYPE['newCustomer']">
      <template v-if="alertType === RULE_PERFORM_TYPE['hourMinute']">客户添加员工 <span>{{ `${alertData1}小时 ${alertData2}分钟` }}</span> {{ `后提醒${showExtraText ? '员工发送以下内容' : ''}` }}</template>
      <template v-if="alertType === RULE_PERFORM_TYPE['dayTime']">客户添加员工第 <span>{{ `${alertData1}天 ${alertData2}` }}</span> 提醒员工发送内容</template>
    </div>
    <div v-if="sopType === SOP_TYPE['activity']">
      <template v-if="alertType === RULE_PERFORM_TYPE['time']"><span>{{ alertData2 }}</span> {{ `提醒${extraText}` }}</template>
    </div>
    <div v-if="sopType === SOP_TYPE['birthday']">
      <template v-if="alertType === RULE_PERFORM_TYPE['dayTime']">客户生日 <span>{{ `第${alertData1}天 ${alertData2}` }}</span> 提醒员工发送内容 </template>
      <template v-if="alertType === RULE_PERFORM_TYPE['beforeDayTime']">客户生日 <span>{{ `前${alertData1}天 ${alertData2}` }}</span> 提醒员工发送内容 </template>
    </div>
    <div v-if="sopType === SOP_TYPE['timing']">
      <template v-if="alertType === RULE_PERFORM_TYPE['hourMinute']">
        群聊加入SOP <span>{{ `${alertData1}小时 ${alertData2}分钟` }}</span> {{ `后提醒${extraText}` }}
      </template>
      <template v-if="alertType === RULE_PERFORM_TYPE['dayTime']">
        群聊加入SOP第 <span>{{ `${alertData1}天 ${alertData2}` }}</span> {{ `提醒${extraText}` }}
      </template>
    </div>
    <div v-if="sopType === SOP_TYPE['cycle']">
      <template v-if="alertType === RULE_PERFORM_TYPE['everydayTime']">
        群聊加入SOP后，每天 <span>{{ alertData2 }}</span> {{ `提醒${extraText}` }}
      </template>
      <template v-if="alertType === RULE_PERFORM_TYPE['everyWeekTime']">
        群聊加入SOP后，每周 <span>{{ `周${transToCN} ${alertData2}` }}</span> {{ `提醒${extraText}` }}
      </template>
      <template v-if="alertType === RULE_PERFORM_TYPE['everyMonthTime']">
        群聊加入SOP后，每月 <span>{{ `${alertData1}号 ${alertData2}` }}</span> {{ `提醒${extraText}` }}
      </template>
    </div>
    <div v-if="sopType === SOP_TYPE['groupCalendar']">
      <template v-if="alertType === RULE_PERFORM_TYPE['time']"><span>{{ alertData2 }}</span> {{ `提醒${extraText}` }}</template>
    </div>
  </div>
</template>
<script>
import { SOP_TYPE, RULE_PERFORM_TYPE } from '@/utils/constant';
export default {
  name: '',
  components: {},
  props: {
    ruleItem: {
      type: Object,
      default: () => {}
    },
    sopType: {
      type: Number,
      default: null
    },
    showExtraText: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      SOP_TYPE,
      RULE_PERFORM_TYPE
    };
  },
  computed: {
    alertType() {
      return this.ruleItem.alertType;
    },
    alertData1() {
      const ruleItem = this.ruleItem;
      const alertData1 = ruleItem.alertData1;
      return (alertData1 || alertData1 === 0) ? alertData1 : ruleItem.alertDay;
    },
    alertData2() {
      const ruleItem = this.ruleItem;
      const alertData2 = ruleItem.alertData2;
      return (alertData2 || alertData2 === 0) ? alertData2 : ruleItem.alertTime;
    },
    extraText() {
      return this.showExtraText ? '员工发送内容' : '';
    },
    transToCN() {
      const num = this.alertData1;
      /* eslint-disable */
      const transEnum = {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '天'
      };
      /* eslint-enable */
      return transEnum[num];
    }
  },
  created() {},
  mounted() {
  }

};
</script>
<style scoped lang='scss'>
@import '~@/styles/mixin.scss';
.remind-perform-div {
  span {
    @include text_btn_color($color-theme2-1);;
    font-weight: bold;
  }
}
</style>
