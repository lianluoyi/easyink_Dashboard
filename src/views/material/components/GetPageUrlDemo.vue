<!--
 * @Description: 获取小程序页面路径教程
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import { WX_PAAS_URL } from '@/utils/constant/index';
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
      <el-tab-pane label="方法一">
        <div class="content">
          1. 登录小程序后台<el-link type="primary" href="https://mp.weixin.qq.com/" target="_blank">https://mp.weixin.qq.com/</el-link>，
          点击【工具】，选择【生成小程序码】
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/page-url-demo-1-1.png')"
          :preview-src-list="[require('@/assets/example/demo/page-url-demo-1-1.png')]"
        />
        <div class="content">
          2. 鼠标移到【获取更多页面路径】上，在弹窗中填入小程序项目成员的微信号，点击【开启】
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/page-url-demo-1-2.png')"
          :preview-src-list="[require('@/assets/example/demo/page-url-demo-1-2.png')]"
        />
        <div class="content">
          3. 项目成员访问小程序，进入指定页面，点击右上角菜单后，复制当前页面路径
        </div>
        <el-image
          style="width:250px;height:529px"
          class="part-img"
          :src="require('@/assets/example/demo/page-url-demo-1-3.png')"
          :preview-src-list="[require('@/assets/example/demo/page-url-demo-1-3.png')]"
        />
      </el-tab-pane>
      <el-tab-pane label="方法二">
        <div class="content">
          登录小程序后台<el-link type="primary" href="https://mp.weixin.qq.com/" target="_blank">https://mp.weixin.qq.com/</el-link>，
          进入【统计】，查看【平台数据-页面分析】的页面路径
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/page-url-demo-2-1.png')"
          :preview-src-list="[require('@/assets/example/demo/page-url-demo-2-1.png')]"
        />
        <div class="content">
          切换到【平台数据-页面分析】，在详细数据中可查看到页面路径，注意复制下来要拼上“.html”
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/page-url-demo-2-2.png')"
          :preview-src-list="[require('@/assets/example/demo/page-url-demo-2-2.png')]"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.drawer-div {
  height: 100%;
  margin-right: 50px;
  .part-img {
    border: 1px solid #D7D7D7;
    margin: 10px 50px 10px 0;
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

