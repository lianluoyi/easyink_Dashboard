<!--
 * @Description: 企微plusp配置管理
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="enterprise-wx-plus-config config-tab">
    <el-alert
      v-if="!(oldConfig && oldConfig.url)"
      show-icon
      title="当前企业还未开通/配置「企微Plus」，员工无法正常使用该应用。"
      :closable="false"
      type="warning"
    />
    <div class="tab-title">配置</div>
    <div class="tab-des">
      企业已开通「企微Plus」，将系统访问地址填写到下面表单，员工可从【我的应用】直接进入。
    </div>
    <div class="tab-form">
      <el-input
        v-model="config.url"
        placeholder="请填写企微Plus的访问地址"
        class="pro-address"
      />
      <el-button type="primary" class="pro-address-save" @click="handleInstallApp">保存</el-button>
    </div>
    <div class="tab-title">开通/咨询</div>
    <div class="tab-des">
      {{
        $store.state.serverInfo.serverType === serverTypeThird ?
          '若您的企业未开通「企微Plus」或在使用过程中遇到问题，请扫描以下二维码，添加客服，了解应用更多信息。'
          :
          '若您的企业未开通「企微Plus」或在使用过程中遇到问题，请联系客服了解更多信息。'
      }}
    </div>
    <div v-if="$store.state.serverInfo.serverType === serverTypeThird" class="tab-img">
      <img src="https://ylf-1253559996.cos.ap-nanjing.myqcloud.com/2021/10/19/客服入口(开通功能).png" alt="">
      <p>扫码添加客服</p>
    </div>
  </div>
</template>
<script>
import { SERVER_TYPE_THIRD, SERVER_TYPE_INTERNAL } from '@/utils/constant';

export default {
  name: '',
  components: {},
  props: {
    oldConfig: {
      type: Object,
      default: () => {}
    },
    config: {
      type: Object,
      default: () => {}
    },
    updateMyApplicationConfig: {
      type: Function,
      default: () => {}
    },
    appId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      serverTypeThird: SERVER_TYPE_THIRD,
      serverTypeInternal: SERVER_TYPE_INTERNAL
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleInstallApp() {
      this.updateMyApplicationConfig({
        appid: this.appId,
        config: JSON.stringify(this.config)
      });
    }
  }

};
</script>
<style scoped lang='scss' src="./styles/config.scss">
</style>
<style scoped lang='scss'>
.enterprise-wx-plus-config {
    .pro-address{
        width: 370px;
        height: 32px;
        margin-right: 10px;
    }
    .tab-form {
      padding-left: 20px;
    }
}
</style>
