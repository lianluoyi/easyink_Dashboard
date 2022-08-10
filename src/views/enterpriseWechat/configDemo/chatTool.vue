<script>
import { SERVER_TYPE_THIRD } from '@/utils/constant';
import { replaceUrlProtocol } from '@/utils/common';

export default {
  components: {},
  props: {
    defaultDomain: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      active: 0,
      STEP_TEXT: {
        0: '完成验证，下一步',
        1: '已配置，完成'
      },
      // 是否为第三方应用
      isThirdType: this.$store.state.serverInfo && this.$store.state.serverInfo.serverType === SERVER_TYPE_THIRD
    };
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    next() {
      if (this.active !== 1) {
        this.active = this.active + 1;
      } else {
        this.$emit('closeDrawer');
      }
    },
    previousStep() {
      // eslint-disable-next-line no-magic-numbers
      if (this.active-- < 0) this.active = 2;
    },
    replaceUrl(url) {
      return replaceUrlProtocol(url);
    }
  }
};
</script>

<template>
  <div class="contact-demo enterprise-wechat-demo">
    <div>
      <el-steps class="step-div" :active="active" align-center>
        <el-step title="配置可信域名" description="配置侧边栏可访问的可信域名" />
        <el-step title="配置侧边栏" description="企微后台配置侧边栏访问地址" />
      </el-steps>
    </div>
    <div v-if="active === 0" class="content-div">
      <div class="part">
        <div v-if="isThirdType" class="content-title">（1）域名备案：{{ replaceUrl(defaultDomain.sidebar) }}</div>
        <div v-else>
          <div class="content-title">（1）域名备案。</div>
          <div class="content-text">如果WeComSidebar部署在本地，将服务映射到完成备案的域名，如 www.easyink.net:8092。</div>
        </div>
      </div>
      <div class="part">
        <div class="content-title">（2）应用配置可信域名。</div>
        <div class="content-text">进入
          <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps" target="_blank">【应用管理】</el-link>
          ，找到并进入联络易应用，滑至页面底部，点击【网页授权及JS-SDK】，打开弹窗，将在（1）中准备的域名填入表单。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/chat-step1-1.jpg')"
          :preview-src-list="[require('@/assets/example/demo/chat-step1-1.jpg')]"
        />
      </div>
      <div class="part">
        <div class="content-title">（3）校验域名。</div>
        <div class="content-text">
          填写完域名后点击“申请校验域名”，将校验文件下载到本地，在表单中上传，回到弹窗中点击确定按钮，完成验证。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/chat-step1-2.jpg')"
          :preview-src-list="[require('@/assets/example/demo/chat-step1-2.jpg')]"
        />
      </div>
    </div>
    <div v-if="active === 1" class="content-div">
      <div class="part">
        <div class="content-title">（1）将上一步完成校验的域名拼接上http://或https://，填入【聊天工具栏】配置表单并保存。</div>
      </div>
      <div class="part">
        <div class="content-title">（2）可信域名链接配置后，自动生成素材库和客户画像的链接。</div>
      </div>
      <div class="part">
        <div class="content-title">（3）登录企业微信后台
          <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps" target="_blank">【应用管理】</el-link>
          ，进入联络易应用，点击“配置”聊天工具栏。</div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/chat-step2-1.jpg')"
          :preview-src-list="[require('@/assets/example/demo/chat-step2-1.jpg')]"
        />
      </div>
      <div class="part">
        <div class="content-title">（4）点击“配置页面”按钮，将【聊天工具栏】生成的链接分别复制并填入弹窗，完成配置。</div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/chat-step2-2.jpg')"
          :preview-src-list="[require('@/assets/example/demo/chat-step2-2.jpg')]"
        />
      </div>
    </div>
    <div class="btn-div">
      <el-button v-if="active != 0" style="margin-top: 12px;" @click="previousStep">上一步</el-button>
      <el-button type="primary" style="margin-top: 12px;" @click="next">{{ STEP_TEXT[active] }}</el-button>
    </div>
  </div>
</template>
<style lang="scss" src="./styles/common.scss" scoped>
</style>
