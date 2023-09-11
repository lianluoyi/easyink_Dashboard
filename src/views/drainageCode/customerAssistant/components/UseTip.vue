<!--
 * @Description: 获客助手使用指引
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <el-drawer
    :append-to-body="true"
    title="获客助手使用指引"
    :visible.sync="Pvisible"
    size="780px"
    :wrapper-closable="true"
  >
    <div class="draw-body">
      <div class="tips">
        <span>
          获客助手为企业微信官方能力，EasyInk仅提供API接入能力，满足企业更复杂、个性化的获客需求，获客助手申请和额度购买均需在企业微信后台完成，更多说明见
          <el-link class="hyperlink" type="primary" href="https://doc.weixin.qq.com/doc/w3_AJEAgwZ_ACcP9hjGbh1TWKZ3UYtB0" target="_blank">官方介绍</el-link>。
          当前仅申请白名单的企业方可使用获客助手，
          <el-link class="hyperlink" type="primary" href="https://doc.weixin.qq.com/forms/AJEAIQdfAAoAJEAgwZ_ACc6l1c1NYlSIf#/fill" target="_blank">点击申请</el-link>
        </span>
        <div class="mt5">
          获客助手申请成功后，请按照以下步骤完成配置。
        </div>
      </div>
      <div class="draw-body-step">
        <div class="draw-body-title">一、开启API授权</div>
        <div v-if="isThirdApplication" class="draw-body-content">
          进入
          <el-link class="hyperlink" type="primary" href="https://work.weixin.qq.com/wework_admin/frame#/customer/customerAcquisition/index" target="_blank">【工具】-【获客助手】</el-link>
          ，点击"管理授权"按钮，点击“可调用应用”的设置按钮，同意授权“联络易助手”。
          <el-image
            class="part-img"
            :src="require('@/assets/image/linkUseTip-dk-1.png')"
            :preview-src-list="[
              require('@/assets/image/linkUseTip-dk-1.png'),
            ]"
          />
        </div>
        <div v-else class="draw-body-content">
          进入
          <el-link class="hyperlink" type="primary" href="https://work.weixin.qq.com/wework_admin/frame#customer/analysis" target="_blank">【客户联系】-【客户】</el-link>
          ，点击"API"展开按钮，点击“可调用应用”的设置按钮，勾选应用“easyInk”即可。
          <el-image
            class="part-img"
            :src="require('@/assets/image/linkUseTip-self-1.png')"
            :preview-src-list="[
              require('@/assets/image/linkUseTip-self-1.png'),
            ]"
          />
        </div>
      </div>
      <div class="draw-body-step">
        <div class="draw-body-title">二、创建获客链接</div>
        <div class="draw-body-content">在EasyInk上，点击“新增链接”，设置链接下的成员和欢迎语等信息，保存。
          <el-image
            class="part-img"
            :src="require('@/assets/image/linkUseTip-2-1.jpg')"
            :preview-src-list="[
              require('@/assets/image/linkUseTip-2-1.jpg'),
            ]"
          />
        </div>
      </div>
      <div class="draw-body-step">
        <div class="draw-body-title">三、投放链接</div>
        <div class="draw-body-content">复制获客链接，投放到App、公众号等渠道，用户点击后，直接跳转到微信添加好友界面。
          <div class="aic">
            <el-image
              class="part-three"
              :src="require('@/assets/image/linkUseTip-3-1.png')"
              :preview-src-list="[
                require('@/assets/image/linkUseTip-3-1.png'),
              ]"
            />
            <i class="el-icon-d-arrow-right" />
            <el-image
              class="part-three"
              :src="require('@/assets/image/linkUseTip-3-2.png')"
              :preview-src-list="[
                require('@/assets/image/linkUseTip-3-2.png'),
              ]"
            />
          </div>

        </div>
      </div>
    </div>

  </el-drawer>
</template>

<script>
import {
  SERVER_TYPE_THIRD
} from '@/utils/constant/index';
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    // 是否是三方
    isThirdApplication() {
      return this.$store.state.serverInfo && this.$store.state.serverInfo.serverType === SERVER_TYPE_THIRD;
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-drawer__header {
  margin-bottom: 26px
}
.draw-body {
    height: 100%;
    display: flex;
    flex-direction: column;
    .tips {
      margin-left: 20px;
      text-indent: 2em;
      margin-bottom: 20px;
      line-height: 20px;
      a {
        margin-top: -3px;
      }
    }
    .draw-body-title {
      margin-left: 20px;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 9px;
    }
    .draw-body-content {
      margin-bottom: 10px;
      line-height:20px;
      margin-left: 58px;
    }
    .confirm-div {
      display: inline-block;
      .confirm-btn-div {
        float: right;
        margin: 20px 20px;
        &::after{
          clear: both;
        }
      }
    }
}
.part-img {
  width: 520px;
  height: 300px;
  margin-top: 5px;
}
.part-three {
  width: 185px;
  height: 400px;
  margin-top: 5px;
}
.el-icon-d-arrow-right {
  font-size: 30px;
  margin: 0 20px;
}
</style>
