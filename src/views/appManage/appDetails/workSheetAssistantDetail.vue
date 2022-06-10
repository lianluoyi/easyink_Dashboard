<!--
 * @Description: 工单助手功能介绍
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="tab">
    <div>
      <div class="tab-title">功能介绍</div>
      <div class="tab-des">
        <span class="tab-des-circle" />
        <span>群聊关联客户：企微群聊关联工单系统客户关系对应；</span>
      </div>
      <div class="tab-des">
        <span class="tab-des-circle" />
        <span>自动获取工单信息：根据NLP自动获取信息，形成工单；</span>
      </div>
      <div class="tab-des">
        <span class="tab-des-circle" />
        <span>自动回复工单信息：工单状态变更，自动群聊@工单反馈人员，自动告知状态；</span>
      </div>
      <div class="tab-des">
        <span class="tab-des-circle" />
        <span>工单报表：自动发送当日工单报表；</span>
      </div>
      <div class="tab-title">使用说明</div>
      <div class="tab-des">
        <span>
          使用该应用需进行初始化操作，进行工单系统注册、客服人员账号注册、客户资料维护；若您有疑问请扫描以下二维码，添加客服，咨询初始化操作事宜。
        </span>
      </div>
      <div class="tab-img">
        <el-image
          :src="appDetail.consultingService"
          alt=""
          style="width: 150px;height: 150px;"
          :preview-src-list="[appDetail.consultingService]"
        />
        <p>扫码添加客服</p>
      </div>
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
      default: () => {}
    }
  }
};
</script>
<style scoped lang='scss' src="./styles/detail.scss">
</style>
