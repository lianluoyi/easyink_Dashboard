<!--
 * @Description: 如何获取二维码示例抽屉
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-drawer
    title="如何获取二维码"
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
          如何在电脑端获取客户群的二维码？
        </div>
        <div class="section-item">
          <div class="content-text">1. 打开企业微信应用，进入工作台，查看客户群列表。</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/desktop-step-1.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/desktop-step-1.png')]"
          />
        </div>
        <div class="section-item">
          <div class="content-text">
            2. 在客户群列表，找到目标群聊并单击，在右侧详情面板中，点击二维码图标，进入下载弹窗，下载的图片包含其他信息，
            <span>使用时注意裁剪并只保留二维码。</span>
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/desktop-step-2.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/desktop-step-2.png')]"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="移动端">
        <div class="step-title">
          如何在移动端获取客户群的二维码？
        </div>
        <div class="second-title">方式一：工作台</div>
        <div class="section-item">
          <div class="content-text">1. 打开企业微信APP，进入工作台，找到目标客户群，查看客户群的详情。</div>
          <div class="part-div">
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/mobile-step-1-1.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/mobile-step-1-1.png')]"
            />
            <i class="el-icon-d-arrow-right" />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/mobile-step-1-2.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/mobile-step-1-2.png')]"
            />
            <i class="el-icon-d-arrow-right" />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/mobile-step-1-3.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/mobile-step-1-3.png')]"
            />
          </div>
        </div>
        <div class="section-item">
          <div class="content-text">
            2. 进入客户群详情后，点击二维码图标，进入下载页面，下载的图片包含其他信息，
            <span>使用时注意裁剪并只保留二维码。</span>
          </div>
          <div class="part-div">
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/mobile-step-1-4.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/mobile-step-1-4.png')]"
            />
            <i class="el-icon-d-arrow-right" />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/mobile-step-1-5.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/mobile-step-1-5.png')]"
            />
          </div>
        </div>
        <div class="second-title">方式二：会话窗</div>
        <div class="section-item">
          <div class="content-text">
            打开企业微信APP，从消息列表找到目标客户群，进入会话窗，点击会话窗右上角的详情图标，进入客户群详情，在客户群详情页面，点击二维码图标，进入下载页面，下载的图片包含其他信息，
            <span>使用时注意裁剪并只保留二维码。</span>
          </div>
          <div class="part-div">
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/mobile-step-2-1.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/mobile-step-2-1.png')]"
            />
            <i class="el-icon-d-arrow-right" />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/mobile-step-2-2.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/mobile-step-2-2.png')]"
            />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="企业微信后台">
        <div class="step-title">
          如何在企业微信后台获取客户群的二维码？
        </div>
        <div class="section-item">
          <div class="content-text">1. 登录企业微信后台，进入
            <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#customer/analysis" target="_blank">【客户联系】</el-link>
            ，查看客户群列表。
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/background-step-1.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/background-step-1.png')]"
          />
        </div>
        <div class="section-item">
          <div class="content-text">
            2. 在客户群列表，找到目标群聊并单击，进入客户群详情页，在详情页中，点击右上角二维码图标，打开下载二维码的弹窗，点击“下载二维码”按钮获取图片，下载的图片包含其他信息，
            <span>使用时注意裁剪并只保留二维码。</span>
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/background-step-2.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/background-step-2.png')]"
          />
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
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    }
  }

};
</script>
<style lang="scss" src="./style.scss" scoped>
</style>
