<!--
 * @Description: 青鸾智能工单助手配置管理界面
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="work-sheet-assistant-config config-tab">
    <div class="tab-title">功能介绍</div>
    <div class="tab-des">
      企业开通「{{ appDetail && appDetail.name }}」后，员工可从【我的应用】直接进入工单系统处理业务。
    </div>
    <div class="tab-title">开通/咨询</div>
    <div class="tab-des">
      若您的企业需要开通「{{ appDetail && appDetail.name }}」或在使用过程中遇到问题，请扫描以下二维码，添加客服 ，了解应用更多信息。
    </div>
    <div class="tab-img">
      <el-image
        :src="appDetail && appDetail.consultingService || require('@/assets/image/workSheetCustomerService.png')"
        alt=""
        style="width: 150px;height: 150px;"
        :preview-src-list="[appDetail && appDetail.consultingService || require('@/assets/image/workSheetCustomerService.png')]"
      />
      <p>扫码添加客服</p>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    appDetail: {
      type: Object,
      default: () => {
        return { name: '青鸾智能工单系统' };
      }
    }
  },
  data() {
    return {
    };
  }
};
</script>
<style scoped lang='scss' src="./styles/config.scss">
</style>
