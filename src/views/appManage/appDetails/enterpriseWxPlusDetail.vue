<!--
 * @Description: 企微pro功能介绍
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="tab">
    <div>
      <div class="tab-title">功能介绍</div>
      <div class="tab-des">
        <span class="tab-des-circle" />
        <span>企微号聚合管理：多个企微号同时管理，无需多个客户端切换，提高服务能效，降低人工成本。</span>
      </div>
      <div class="tab-des">
        <span class="tab-des-circle" />
        <span>辅助营销：一键批量定时群发，突破限制，促活拉新，优化营销效果。</span>
      </div>
      <div class="tab-des">
        <span class="tab-des-circle" />
        <span>智能AI：智能机器人，自动通过好友、关键词自动回复、固定时间段自动回复、问答库，快速响应，给客户最佳的服务体验。</span>
      </div>
      <div class="tab-des">
        <span class="tab-des-circle" />
        <span>企业风控：历史消息留存，设置敏感词监管，保证服务标准化、专业化，避免客户流失及不当营销。</span>
      </div>
      <div class="tab-title">使用说明</div>
      <div class="tab-des">
        <span>
          {{
            $store.state.serverInfo.serverType === serverTypeThird ?
              '使用该应用需要安装系统服务，若您未安装，请扫描以下二维码，添加客服，咨询开通事宜。'
              :
              '使用该应用需要安装系统服务，若您未安装，请联系客服咨询开通事宜。'
          }}
        </span>
      </div>
      <div v-if="$store.state.serverInfo.serverType === serverTypeThird" class="tab-img">
        <img src="https://ylf-1253559996.cos.ap-nanjing.myqcloud.com/2021/10/19/客服入口(开通功能).png" alt="">
        <p>扫码添加客服</p>
      </div>
    </div>
  </div>
</template>
<script>
import { SERVER_TYPE_THIRD } from '@/utils/constant';

export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      serverTypeThird: SERVER_TYPE_THIRD
    };
  }
};
</script>
<style scoped lang='scss' src="./styles/detail.scss">
</style>
