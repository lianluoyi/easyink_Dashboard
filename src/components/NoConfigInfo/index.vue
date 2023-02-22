<script>
import store from '@/store';
const NO_CONFIG_CONTACT_SECRET = '当前企业尚未配置“通讯录”功能';
const NO_CONFIG_CUSTOM_SECRET = '当前企业尚未配置“客户联系”功能';
const NO_CONFIG_SESSION_ARCHIVE_SECRET = '当前企业尚未配置“会话存档”功能';
const NO_CONFIG_CUSTOM_SECRET_AND_CONTACT_SECRET = '当前企业尚未配置“通讯录”和“客户联系”功能';
const NO_CONFIG_INFO_TAIL = '，无法[pageTitle]，请联系系统管理员前往【系统设置】完成企微配置';
function getMessageByOneConfigKeys(configKeys) {
  if (configKeys.indexOf('contactSecret') >= 0) {
    return NO_CONFIG_CONTACT_SECRET + NO_CONFIG_INFO_TAIL;
  }
  // 如果只判断客户联系
  if (configKeys.indexOf('customSecret') >= 0) {
    return NO_CONFIG_CUSTOM_SECRET + NO_CONFIG_INFO_TAIL;
  }
  // 如果只判断会话存档
  if (configKeys.indexOf('chatSecret') >= 0) {
    return NO_CONFIG_SESSION_ARCHIVE_SECRET + NO_CONFIG_INFO_TAIL;
  }
}
function getMessageByTowEnterPriseWechatConfig(enterPriseWechatConfig) {
  // 如果只存在通讯录
  if (enterPriseWechatConfig['contactSecret'] && !enterPriseWechatConfig['customSecret']) {
    return NO_CONFIG_CUSTOM_SECRET + NO_CONFIG_INFO_TAIL;
  }
  // 如果只存在客户联系
  if (!enterPriseWechatConfig['contactSecret'] && enterPriseWechatConfig['customSecret']) {
    return NO_CONFIG_CONTACT_SECRET + NO_CONFIG_INFO_TAIL;
  }
  // 如果都不存在
  if (!enterPriseWechatConfig['contactSecret'] && !enterPriseWechatConfig['customSecret']) {
    return NO_CONFIG_CUSTOM_SECRET_AND_CONTACT_SECRET + NO_CONFIG_INFO_TAIL;
  }
}
export default {
  name: 'NoConfigInfo',
  components: {},
  props: {
    /**
     * 配置提醒文字
     */
    message: {
      type: String,
      default: ''
    },
    /**
     * 配置对应secret key的数组
     */
    configKeys: {
      type: Array,
      default: () => []
    },
    /**
     * 内联样式
     */
    alertStyle: {
      type: String,
      default: ''
    },
    /**
     * 当前页配置对应功能
     */
    pageTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    let showMessage = this.message;
    if (!this.message && this.configKeys.length > 0) {
      if (this.configKeys.length === 1) {
        showMessage = getMessageByOneConfigKeys(this.configKeys);
      } else {
        showMessage = getMessageByTowEnterPriseWechatConfig(store.getters.enterPriseWechatConfig);
      }
      showMessage = showMessage && showMessage.replace('[pageTitle]', this.pageTitle);
    }
    const showAlert = this.configKeys.length > 0 && showMessage;
    return {
      showAlert,
      showMessage
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
};
</script>

<template>
  <el-alert
    v-if="showAlert && !configKeys.every(key => !!($store.getters.enterPriseWechatConfig && $store.getters.enterPriseWechatConfig[key]))"
    :title="showMessage"
    type="warning"
    show-icon
    :style="alertStyle"
  />
</template>

<style lang="scss" scoped></style>

<docs lang="md">
配置提醒组件

## 示例

数据概览配置提醒:

```jsx
<NoConfigInfo :config-keys="['contactSecret', 'customSecret']" page-title="统计数据" />
```

</docs>
