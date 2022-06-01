<!--
 * @Description: 如何创建客户群
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-drawer
    title="如何创建客户群"
    v-bind="$attrs"
    :before-close="handleClose"
    :append-to-body="true"
    class="get-qrcode-drawer"
    size="780px"
    v-on="$listeners"
  >
    <el-tabs tab-position="left">
      <el-tab-pane label="电脑端">
        <div class="step-title">
          如何在Windows电脑端创建客户群？
        </div>
        <div class="section-item">
          <div class="content-text">打开企业微信应用，进入工作台下的「客户群」，点击“创建一个客户群”按钮，完成创建。</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/客户群pc1.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/客户群pc1.png')]"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="移动端">
        <div class="step-title">
          如何在移动端创建客户群？
        </div>
        <div class="section-item">
          <div class="content-text">打开企业微信APP，进入工作台下的「客户群」，点击“创建一个客户群”按钮，完成创建。</div>
          <div class="part-div wider-part-div" style="width: 538px;">
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/客户群移动1.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/客户群移动1.png')]"
            />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/客户群移动2.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/客户群移动2.png')]"
            />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/客户群移动3.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/客户群移动3.png')]"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
    };
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    }
  }
};
</script>
<style lang="scss" src="./style.scss" scoped>
</style>
<style lang="scss"  scoped>
.wider-part-div {
    .part-img {
        width: 182px !important;
    }
}
.part-div {
    justify-content: space-between;
}
</style>
