<script>
import { ENTERPRISE_WECHAT_CONFIG_STEP_TEXT, PUBLIC_KEY_BEGIN, PUBLIC_KEY_END } from '@/utils/constant';
import { handleGetChatPublicKey } from '@/utils/enterpriseWechat';

export default {
  components: {},
  props: {},
  data() {
    return {
      active: 0,
      STEP_TEXT: ENTERPRISE_WECHAT_CONFIG_STEP_TEXT,
      PUBLIC_KEY: '',
      PUBLIC_KEY_END,
      PUBLIC_KEY_BEGIN
    };
  },
  computed: {
    showPublicKey() {
      return `${this.PUBLIC_KEY_BEGIN}\n${this.PUBLIC_KEY}\n${this.PUBLIC_KEY_END}`;
    }
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    next() {
      // eslint-disable-next-line no-magic-numbers
      if (this.active !== 2) {
        this.active = this.active + 1;
      } else {
        this.$emit('closeDrawer');
      }
    },
    previousStep() {
      // eslint-disable-next-line no-magic-numbers
      if (this.active-- < 0) this.active = 2;
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
        <el-step title="获取客户联系Secret" description="配置外部联系人相关功能" />
        <el-step title="申请会话存档" description="上传开通确认函" />
        <el-step title="获取会话存档Secret" description="完成会话存档配置" />
      </el-steps>
    </div>
    <div v-if="active === 0" class="content-div">
      <div class="part">
        <div class="content-title">（1）权限配置。</div>
        <div class="content-text">企业管理员扫码登录
          <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/loginpage_wx" target="_blank">企业微信后台</el-link>，进入
          <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#customer/group" target="_blank">【客户联系】-【权限配置】</el-link>，修改客户联系的使用范围，范围下的员工可以在EasyInk下使用客户相关功能。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/customer-step1-1.jpg')"
          :preview-src-list="[require('@/assets/example/demo/customer-step1-1.jpg')]"
        />
      </div>
      <div class="part">
        <div class="content-title">（2）获取客户管理Secret。</div>
        <div class="content-text">进入
          <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#customer/analysis" target="_blank">【客户联系】 -【客户】</el-link>，点击“API”展开按钮，点击Secret旁“查看”按钮，即可收到“企业微信团队”发出的消息，查看并复制客户联系Secret。
        </div>
        <div class="content-text">点击“可调用应用”的设置按钮，勾选应用“联络易”即可。</div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/customer-step1-2.jpg')"
          :preview-src-list="[require('@/assets/example/demo/customer-step1-2.jpg')]"
        />
      </div>
    </div>
    <div v-if="active === 1" class="content-div">
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
    <div v-if="active === 2" class="content-div">
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
        <!-- 建议使用openssl 来生成rsa pkcs1 2048格式的公私钥。例如可使用：openssl genrsa -out private.pem 2048 来生成私钥，并使用openssl rsa -in private.pem -pubout -out public.pem从私钥来产生公钥。 -->
        <div class="content-text">点击“消息加密公钥”旁设置按钮，根据提示进行管理员身份认证。认证后，将以下公钥复制到弹窗中保存即可。</div>
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
      <el-button v-if="active != 0" style="margin-top: 12px;" @click="previousStep">上一步</el-button>
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
