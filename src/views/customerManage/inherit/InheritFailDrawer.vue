<!--
 * @Author: 佚名
 * @LastEditors: xulinbin
-->
<template>
  <el-drawer
    title="分配失败"
    :before-close="handleClose"
    size="780px"
    :visible="visible"
  >
    <div class="inherit-fail-drawer">
      <p>需要确认以下内容：</p>
      <p>
        1. <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps" target="_blank">企业微信后台【应用管理】</el-link>下联络易应用中可见范围有包含接替员工，如图所示。
        <el-image
          class="part-img"
          :src="require('@/assets/example/inherit/可见范围.png')"
          :preview-src-list="[require('@/assets/example/inherit/可见范围.png')]"
        />
      </p>
      <p>
        2. <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#customer/group" target="_blank">企业微信后台【客户联系】</el-link>下客户联系的使用范围包含接替员工，如图所示。
        <el-image
          class="part-img"
          :src="require('@/assets/example/inherit/客户联系使用范围.png')"
          :preview-src-list="[require('@/assets/example/inherit/客户联系使用范围.png')]"
        />
      </p>
      <p>3. 接替员工已激活且完成实名认证。</p>
    </div>
  </el-drawer>
</template>
<script>
export default {
  name: '',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    }
  }
};
</script>
<style scoped lang='scss'>
  .inherit-fail-drawer{
    margin: 0 20px;
    line-height: 2em;
  }
</style>
