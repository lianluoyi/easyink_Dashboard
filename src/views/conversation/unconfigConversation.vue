<!--
 * @Description: 会话存档secret未配置时显示的页面
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="un-config-chat">
    <div class="header">
      <img :src="icon" :height="140">
      <div class="right">
        <div class="title">{{ moduleTile }}</div>
        <div class="desc">{{ moduleDesc }}</div>
      </div>
    </div>
    <div class="content">
      <el-alert
        v-if="configAlertTip"
        :title="configAlertTip"
        type="warning"
        show-icon
        :closable="false"
      />
      <div class="tip-item">
        <div class="title section-title-border">已开通</div>
        <div class="des">若您已在企业微信开通会话存档功能，且您有系统设置的操作权限，请前往【系统设置】-【企微设置】，根据客户联系下的“如何获取”提示，完成会话存档的配置。</div>
      </div>
      <div class="tip-item">
        <div class="title section-title-border">未开通</div>
        <div v-if="$store.state.serverInfo.serverType === serverTypeThird" class="des">若您未在企业微信开通会话存档功能，请扫描以下二维码，添加客服，免费咨询开通事宜。</div>
        <div v-if="$store.state.serverInfo.serverType === serverTypeInternal" class="des">若您未在企业微信开通会话存档功能，请联系客服咨询开通事宜。</div>
        <div v-if="$store.state.serverInfo.serverType === serverTypeThird" class="customer-service">
          <img src="@/assets/image/customer-service-qrcode.png" width="220">
          <div>扫码添加客服</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DEFAULT_ICON from '@/assets/image/conversation-unconfig.svg';
import { SERVER_TYPE_THIRD, SERVER_TYPE_INTERNAL } from '@/utils/constant';

export default {
  components: {},
  props: {
    icon: {
      type: String,
      default: DEFAULT_ICON
    },
    moduleTile: {
      type: String,
      default: ''
    },
    moduleDesc: {
      type: String,
      default: ''
    },
    configAlertTip: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      serverTypeThird: SERVER_TYPE_THIRD,
      serverTypeInternal: SERVER_TYPE_INTERNAL
    };
  },
  methods: {

  }
};
</script>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.un-config-chat {
  display: flex;
  flex-direction: column;
  .header, .content {
    background-color: #fff;
  }
  .header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .title {
      color: $black;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .desc {
      font-size: 16px;
    }
  }
  .content {
    padding: 15px;
    flex: 1;
    /deep/ .el-alert {
      margin-bottom: 20px;
      border: 1px solid #FFE58F;
      .el-alert__title {
        color: $black;
      }
    }
    .tip-item {
      margin-bottom: 40px;
      .title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 15px;
      }
      .des {
        padding-left: 15px;
      }
      .customer-service {
        margin: 10px 0 0 15px;
        width: 220px;
        color: #7f7f7f;
        text-align: center;
        img {
          border: 1px solid $borderColor;
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
