<!--
 * @Description: 消息审计页面
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div v-if="enterPriseWechatConfig[chatSecret]" class="security">
    <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
      <el-radio-button label="msg">敏感消息</el-radio-button>
      <el-radio-button label="action">敏感行为</el-radio-button>
    </el-radio-group>
    <sensitive-list v-if="activeName === 'msg'" />
    <alarming-sensitive v-if="activeName === 'action'" />
  </div>
  <UnconfigConversation
    v-else
    module-tile="消息审计"
    module-desc="设置敏感词，当监测到员工发送不文明用语等，主动向审计人员发出提醒，及时止损"
    config-alert-tip="当前企业还未开通/配置【会话存档】功能，无法使用消息审计功能"
    :icon="unconfigIcon"
  />
</template>
<script>
import alarmingSensitive from './securityPage/alarmingSensitive.vue';
import sensitiveList from './securityPage/sensitiveList.vue';
import UnconfigConversation from './unconfigConversation.vue';
import { CHAT_SECRET } from '@/utils/constant';
import UNCONFIG_ICON from '@/assets/image/security-unconfig.svg';

export default {
  components: {
    sensitiveList,
    alarmingSensitive,
    UnconfigConversation
  },
  data() {
    return {
      activeName: 'msg',
      enterPriseWechatConfig: this.$store.state.enterPriseWechatConfig,
      chatSecret: CHAT_SECRET,
      unconfigIcon: UNCONFIG_ICON
    };
  }
};
</script>
<style lang="scss" scoped>
.security {
  .radio-group-div {
    margin-bottom: 15px;
    /deep/ .el-radio-button {
      .el-radio-button__inner {
        height: 40px;
        line-height: 20px;
      }
    }
  }
}
</style>
