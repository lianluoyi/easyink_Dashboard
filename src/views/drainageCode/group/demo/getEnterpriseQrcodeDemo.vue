<!--
 * @Description: 如何获取企微活码示例抽屉
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-drawer
    title="如何获取企微活码"
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
          如何在Windows电脑端获取企微活码？
        </div>
        <div class="section-item">
          <div class="content-text mb10"><span>注意：如果您的企业未认证，请在企业微信后台创建企微活码</span></div>
          <div class="content-text">1. 打开企业微信应用，进入工作台下的「客户群」，找到“加入群聊”入口。</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码pc1.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码pc1.png')]"
          />
        </div>
        <div class="section-item">
          <div class="content-text">
            2. 选择“通过二维码方式加入群聊”，点击进入设置页，选择客户扫码后要加入的群聊，完成选择后进入下一步，点击“下载”，得到一张企微活码。
          </div>
          <div class="part-div wider-part-div">
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码pc2.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码pc2.png')]"
            />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码pc3.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码pc3.png')]"
            />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码pc4.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码pc4.png')]"
            />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="移动端">
        <div class="step-title">
          如何在移动端获取企微活码？
        </div>
        <div class="section-item">
          <div class="content-text mb10"><span>注意：如果您的企业未认证，请在企业微信后台创建企微活码</span></div>
          <div class="content-text">1. 打开企业微信APP，进入工作台下的「客户群」，找到“加入群聊”入口，选择“通过二维码方式加入群聊”。</div>
          <div class="part-div" style="width: 538px;">
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动1.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动1.png')]"
            />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动2.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动2.png')]"
            />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动3.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动3.png')]"
            />
          </div>
        </div>
        <div class="section-item">
          <div class="content-text">
            2. 进入设置页，选择客户扫码后要加入的群聊，完成选择后进入下一步，点击“保存到相册”，得到一张企微活码。
          </div>
          <div class="part-div" style="width: 340px;">
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动4.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动4.png')]"
            />
            <el-image
              class="part-img"
              :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动5.png')"
              :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码移动5.png')]"
            />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="企业微信后台">
        <div class="step-title">
          如何在企业微信后台获取企微活码？
        </div>
        <div class="section-item">
          <div class="content-text">1. 登录企业微信后台，进入
            <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#customer/analysis" target="_blank">【客户联系】</el-link>
            ，找到“加入群聊”入口。
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码后台1.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码后台1.png')]"
          />
        </div>
        <div class="section-item">
          <div class="content-text">
            2. 选择“通过二维码方式加入群聊”，点击进入设置页，选择客户扫码后要加入的群聊，完成选择后创建，点击“下载”，得到一张企微活码。
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码后台2.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码后台2.png')]"
          />
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码后台3.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码后台3.png')]"
          />
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码后台4.png')"
            :preview-src-list="[require('@/assets/example/demo/customer-group-demo/enterprise-code-demo/企微活码后台4.png')]"
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
    return {};
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
