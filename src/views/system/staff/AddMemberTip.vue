<script>

export default {
  name: 'AddMemberTip',
  components: {},
  props: {
    type: {
      type: String,
      default: 'qrcode'
    }
  },
  data() {
    return {};
  }
};
</script>

<template>
  <div class="drawer-div">
    <el-tabs v-model="type" tab-position="left" class="drawer-tabs">
      <el-tab-pane label="扫码加入" name="qrcode">
        <div class="main-title">扫码后提示无法加入企业？</div>
        <div class="content-title">需要确认以下内容：</div>
        <div>
          <div class="content">
            1. 二维码是否在有效期内。每次从扫码加入弹窗获取的二维码，默认有效期是7天，如果过期，重新获取二维码，提供给员工扫码加入即可。<br>
            2. <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps/contactsApi" target="_blank">企业微信后台通讯录同步</el-link>配置中已开启手动编辑，如图所示。
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/tongxunlutongbu.png')"
            :preview-src-list="[require('@/assets/example/tongxunlutongbu.png')]"
          />
        </div>
        <div>
          <div class="content">
            3.  <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#profile/apply/setting" target="_blank">企业微信后台我的企业</el-link>
            申请加入设置中已开启可被邀请加入企业，如图所示。
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/shenqingjiaru.png')"
            :preview-src-list="[require('@/assets/example/shenqingjiaru.png')]"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="发起邀请" name="invite">
        <div class="main-title">未成功发起邀请？</div>
        <div>
          <div class="content-title">需要确认以下内容：</div>
          <div class="content">
            1.  <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps/contactsApi" target="_blank">企业微信后台通讯录同步</el-link>配置中须开启API编辑通讯录，如图所示。
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/tongxunlutongbu.png')"
            :preview-src-list="[require('@/assets/example/tongxunlutongbu.png')]"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.drawer-div {
    height: 100%;
  .orange {
    color: $orange;
  }
  .main-title, .second-title {
    color: $black;
    font-weight: 600;
  }
  .main-title {
    font-size: 18px;
    margin: 10px 0;
  }
  .second-title {
    font-size: 16px;
    margin: 10px 0;
  }
  .part-img {
    margin: 10px 0;
  }
  .content {
      color: $black;
    /deep/ .el-link {
      vertical-align: inherit;
      color: #409eff;
    }
  }
  /deep/ .el-tabs__content {
    padding: 0 5px;
    overflow: auto;
    height: 100%;
  }
  .drawer-tabs {
      height: 100%;
  }
  .content-title{
    color: rgba(51, 51, 51, 100);
    font-size: 16px;
    text-align: left;
    font-family: Arial-regular;
    font-weight: 500;
    margin-bottom: 10px;
  }
}
</style>

