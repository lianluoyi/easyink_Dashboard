<script>
import { FIRST_STEP, SECOND_STEP, ENTERPRISE_WECHAT_CONFIG_STEP_TEXT, PUBLIC_KEY_BEGIN, PUBLIC_KEY_END } from '@/utils/constant/index';
import { handleGetChatPublicKey } from '@/utils/enterpriseWechat';

export default {
  components: {},
  props: {},
  data() {
    return {
      active: FIRST_STEP,
      STEP_TEXT: ENTERPRISE_WECHAT_CONFIG_STEP_TEXT,
      PUBLIC_KEY: '',
      PUBLIC_KEY_BEGIN,
      PUBLIC_KEY_END,
      FIRST_STEP,
      SECOND_STEP
    };
  },
  computed: {
    showPublicKey() {
      return `${this.PUBLIC_KEY_BEGIN}\n${this.PUBLIC_KEY}\n${this.PUBLIC_KEY_END}`;
    }
  },
  watch: {},
  created() {},
  methods: {
    next() {
      if (this.active === FIRST_STEP) {
        this.active = SECOND_STEP;
      } else {
        this.$emit('closeDrawer');
      }
    },
    previousStep() {
      this.active = FIRST_STEP;
    },
    async getPublicKey() {
      const data = await handleGetChatPublicKey();
      this.PUBLIC_KEY = data;
    }
  }
};
</script>

<template>
  <div class="contact-demo enterprise-wechat-demo">
    <div>
      <el-steps class="step-div" :active="active" align-center>
        <el-step title="申请会话存档" description="上传开通确认函" />
        <el-step title="获取会话存档Secret" description="完成会话存档配置" />
      </el-steps>
    </div>
    <div v-if="active === FIRST_STEP" class="content-div">
      <div class="part">
        <div class="content-text">会话存档功能为企业微信的收费功能，可免费试用30天，进入
          <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#financial/corpEncryptData" target="_blank">【管理工具】-【会话内容存档】</el-link>，上传《企业微信会话内容存档开通确认函》开启。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/customer-step2-1.jpg')"
          :preview-src-list="[require('@/assets/example/demo/customer-step2-1.jpg')]"
        />
      </div>
    </div>
    <div v-if="active === SECOND_STEP" class="content-div">
      <div class="part">
        <div class="content-title">
          （1）设置可信IP地址。
        </div>
        <div class="content-text">将EasyInk的IP地址加入可信IP地址（如没有部署在本地，则联系客服获取IP）。</div>
      </div>
      <div class="part">
        <div class="content-title">
          （2）消息加密公钥。
        </div>
        <div class="content-text"> 点击“消息加密公钥”旁设置按钮，根据提示进行管理员身份认证。认证后，将以下公钥复制到弹窗中保存即可。</div>
        <div class="copy-content">
          <div v-if="PUBLIC_KEY" class="content-text-box" style="width: 606px">
            {{ PUBLIC_KEY_BEGIN }}<br>
            {{ PUBLIC_KEY }}
            <br>{{ PUBLIC_KEY_END }}
          </div>
          <div v-else class="content-text-box" style="width: 606px">
            未配置公钥，请联系运维/技术
          </div>
          <el-button
            v-if="PUBLIC_KEY"
            v-copy="showPublicKey"
            size="mini"
            type="text"
          >复制</el-button>
        </div>
      </div>
      <div class="part">
        <div class="content-title">
          （3）获取会话内容存档Secret。
        </div>
        <div class="content-text"> 点击Secret旁“查看”按钮，即可收到“企业微信团队”发出的消息，查看并复制会话内容存档Secret。</div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/customer-step3-1.jpg')"
          :preview-src-list="[require('@/assets/example/demo/customer-step3-1.jpg')]"
        />
      </div>
    </div>
    <div class="btn-div">
      <el-button v-if="active != FIRST_STEP" style="margin-top: 12px;" @click="previousStep">上一步</el-button>
      <el-button type="primary" style="margin-top: 12px;" @click="next">{{ STEP_TEXT[active] }}</el-button>
    </div>
  </div>
</template>
<style lang="scss" src="./styles/common.scss" scoped>
</style>
<style lang="scss" scoped>
    .copy-content {
        margin-left: 28px;
        margin-top: 10px;
        display: flex;
        align-items: flex-end;
        button {
            height: 16px;
            font-size: 14px;
            padding: 0;
            color: $light-blue;
            margin-left: 8px;
        }
    }
</style>
