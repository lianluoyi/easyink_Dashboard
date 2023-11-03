<!--
 * @Description: 会话存档
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div v-if="enterPriseWechatConfig[chatSecret]" class="content">
    <el-tabs v-model="activeName" class="content-tabs white-tabs" @tab-click="handleClick">
      <el-tab-pane class="content-tab-pane" label="员工检索" name="1">
        <employee />
      </el-tab-pane>
      <el-tab-pane class="content-tab-pane" label="客户检索" name="2">
        <user v-if="activeName==2" />
      </el-tab-pane>
      <el-tab-pane class="content-tab-pane" label="全局检索" name="3">
        <role v-if="activeName==3" />
      </el-tab-pane>
    </el-tabs>
  </div>
  <UnconfigConversation
    v-else
    module-tile="会话存档"
    module-desc="在客户和员工同意的前提下，保存员工的工作沟通内容，支持多维度检索，满足企业外部监管合规需求"
    config-alert-tip="当前企业还未开通/配置【会话存档】功能，将会影响到聊天记录和消息审计部分功能"
  />
</template>
<script>

import employee from './page/employeeTest.vue';
import user from './page/userTest.vue';
import role from './page/roleTest.vue';
import UnconfigConversation from './unconfigConversation.vue';
import { CHAT_SECRET } from '@/utils/constant/index';
export default {
  components: { employee, user, role, UnconfigConversation },
  data() {
    return {
      activeName: '1',
      chatSecret: CHAT_SECRET
    };
  },
  computed: {
    enterPriseWechatConfig() {
      return this.$store.state.enterPriseWechatConfig;
    }
  },
  methods: {
    handleClick(tab, event) {
      // 点击tab栏时删除session
      sessionStorage.removeItem('list');
      sessionStorage.removeItem('insideList');
    }
  }
};
</script>
<style lang="scss" scoped>
 *{margin: 0;padding: 0;}
 .content-tabs {
    height: 100%;
    position: relative;
    /deep/ .el-tabs__header {
        height: 40px;
    }
    /deep/ .el-tabs__content {
        height: calc(100% - 55px);
        .content-tab-pane {
            height: 100%;
        }
    }
 }
</style>
