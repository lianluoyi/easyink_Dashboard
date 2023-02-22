<!--
 * @Description: 获取小程序appid教程
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<script>
import { WX_PAAS_URL } from '@/utils/constant';
export default {
  name: 'GetAppIDDemo',
  components: {},
  props: {

  },
  data() {
    return {
      WX_PAAS_URL
    };
  }
};
</script>

<template>
  <div class="drawer-div">
    <el-tabs tab-position="left" class="drawer-tabs">
      <el-tab-pane label="关联小程序">
        <div class="main-title">小程序如何关联到企业微信</div>
        <div class="content">应企业微信平台要求，使用小程序素材，要求<span class="orange">小程序必须与当前企业关联。</span></div>
        <div class="second-title">关联入口</div>
        <div>
          <div class="content">方式一：可前往
            <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps" target="_blank">企业微信管理后台</el-link>
            -进入应用-创建应用 关联小程序</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-1-1.svg')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-1-1.svg')]"
          />
        </div>
        <div>
          <div class="content">方式二：可前往
            <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps" target="_blank">企业微信管理后台</el-link>
            -进入应用-选择已有应用-设置主页 关联小程序</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-1-2.png')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-1-2.png')]"
          />
        </div>
        <div>
          <div class="content">登录
            <el-link type="primary" :href="WX_PAAS_URL" target="_blank">小程序管理后台</el-link>
            -设置-关联设置，找到关联到企业微信-前往关联的入口</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-1-3.svg')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-1-3.svg')]"
          />
        </div>
        <div class="second-title">关联步骤</div>
        <div>
          <div class="content">1. 找到上述3个关联入口进行关联</div>
          <div class="content">2. 关联需要小程序开发者授权，故会跳转到公众平台中进行一次授权扫码，请使用要关联的小程序所属的管理员微信号进行扫码授权</div>
          <div class="content">3. 在企微后台的应用中对小程序进行可见范围的设置</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-1-4.png')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-1-4.png')]"
          />
          <div class="content">4. 关联完成，设置了可见范围的企业成员可以在工作台看到关联的小程序。</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="微信公众平台获取">
        <div class="main-title">在微信公众平台获取AppID</div>
        <div>
          <div class="content">1. 前往
            <el-link type="primary" :href="WX_PAAS_URL" target="_blank">微信公众平台</el-link>
            ，登录企业的微信小程序</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-2-1.svg')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-2-1.svg')]"
          />
        </div>
        <div>
          <div class="content">2. 登录之后,点击左侧的"开发管理"==>点击"开发设置"</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-2-2.svg')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-2-2.svg')]"
          />
        </div>
        <div>
          <div class="content">3. 复制小程序的AppID</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="微信客户端获取">
        <div class="main-title">在微信客户端获取AppID</div>
        <div>
          <div class="content">1. 在微信客户端进入某个小程序，如图所示，点击右上角“···”，在弹出的菜单中，点击小程序的详情按钮</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-3-1.svg')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-3-1.svg')]"
          />
        </div>
        <div>
          <div class="content">2. 在小程序的详情页，点击“更多资料”</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-3-2.svg')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-3-2.svg')]"
          />
        </div>
        <div>
          <div class="content">3. 在“更多资料”页面中，找到AppID，长按并复制</div>
          <el-image
            class="part-img"
            :src="require('@/assets/example/demo/appid-demo-3-3.svg')"
            :preview-src-list="[require('@/assets/example/demo/appid-demo-3-3.svg')]"
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
    margin: 5px 0;
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
}
</style>

