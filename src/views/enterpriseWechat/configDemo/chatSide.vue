<!--
 * @Description: 代开发聊天工具栏
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="part">
      <div class="content-text">
        （1）登录企业微信后台
        <el-link
          type="primary"
          href="https://work.weixin.qq.com/wework_admin/frame#apps"
          target="_blank"
        >【应用管理】</el-link>，进入easyWeCom应用，点 击“配置”聊天工具栏。
      </div>
      <el-image
        class="part-img"
        :src="require('@/assets/example/demo/chatside-step1.png')"
        :preview-src-list="[
          require('@/assets/example/demo/chatside-step1.png'),
        ]"
      />
    </div>
    <div class="part">
      <div class="content-text">
        （2）点击“配置页面”按钮，将【聊天工具栏】生成的链接分别复制并填入弹窗，完成配置。
      </div>
      <el-image
        class="part-img"
        :src="require('@/assets/example/demo/chatside-step2.png')"
        :preview-src-list="[
          require('@/assets/example/demo/chatside-step2.png'),
        ]"
      />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped></style>
