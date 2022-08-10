<script>
import * as api from '@/api/enterpriseId';
import HeaderComponent from './header.vue';
import ConfigItemComponent from './configItem.vue';
import ConfigComponent from './configDemo/config.vue';
import { NO_ENTERPRISE_CONFIG_CODE, NORMAL } from '@/utils/constant';
import { getDefaultDomainConfig } from '@/api/admin';
// 定义一个常量作为获取字符串的位数
const SUBSTR = 2;
export default {
  components: { HeaderComponent, ConfigItemComponent, ConfigComponent },
  props: {},
  data() {
    return {
      NORMAL,
      form: {},
      dialogVisible: false,
      // 给configItem传递applicationType和from判断
      // applicationType控制列表的提示GENERATIONdEVELOPMENT
      APPLICATION_TYPE: 'generationDevelopment',
      APPLICATION_FROM_TYPE: 'generationDevelopment',
      // 给header传一个application判断是那个应用
      APPLICATION: 'application',
      // 代开发应用是否授权
      isConfiguration: false,
      // 是否重新配置应用
      reSet: false,
      // 服务器配置的域名
      defaultDomain: {}
    };
  },
  computed: {
    enterPriseWechatConfig() {
      return this.$store.state.enterPriseWechatConfig;
    }
  },
  watch: {},
  created() {
    this.checkGuide();
    this.getDefaultDomain();
    this.isAuth();
  },
  mounted() {},
  methods: {
    // 判断企微是否完成授权配置
    isAuth() {
      // 当客服人员安装完成时,此时状态为0，corpId是ww开头,代开发应用已授权
      if (this.$store.state.enterPriseWechatConfig.status === NORMAL && (this.enterPriseWechatConfig.corpId.substring(0, SUBSTR) === 'ww' || this.enterPriseWechatConfig.authorized)) {
        this.isConfiguration = true;
      }
    },
    /**
     * 获取服务器配置的域名
     */
    getDefaultDomain() {
      getDefaultDomainConfig().then(res => {
        this.defaultDomain = res.data;
      });
    },
    /**
     * 校验是否弹出引导语
     */
    async checkGuide() {
      try {
        const getConfigRes = await this.getNowConfig();
        if (!getConfigRes || !getConfigRes.data) {
          this.dialogVisible = true;
          return;
        }
        // 若应用id未配置则弹出引导语
        if (!getConfigRes.data.agentId) {
          this.dialogVisible = true;
        }
      } catch (err) {
        if (err.code === NO_ENTERPRISE_CONFIG_CODE) {
          console.error('获取企微配置异常', err);
          this.dialogVisible = true;
        }
      }
    },
    dealFormData(form) {
      this.form.certFileName = form.certFilePath ? form.certFilePath.slice(form.certFilePath.lastIndexOf('/') + 1) : '';
      const COMMON_URL_PRE = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${form.corpId}&redirect_uri=${encodeURIComponent(form.h5DoMainName)}%2F%23%2F`;
      const COMMON_URL_SUFFIX = `&response_type=code&scope=snsapi_base&state=${form.corpId}#wechat_redirect`;
      this.form.materialUrl = `${COMMON_URL_PRE}chat${COMMON_URL_SUFFIX}`;
      this.form.customerPortrait = `${COMMON_URL_PRE}portrait${COMMON_URL_SUFFIX}`;
      this.form.applicationTools = `${COMMON_URL_PRE}applicationSet${COMMON_URL_SUFFIX}`;
    },
    /**
     * 获取企微配置列表
     */
    async getNowConfig() {
      try {
        const getNowConfigRes = await api.getNowConfig({});
        this.$store.dispatch('UpdateConfig', getNowConfigRes.data);
        const formData = getNowConfigRes.data || {};
        this.form = { ...formData };
        this.dealFormData(this.form);
        return getNowConfigRes;
      } catch (err) {
        if (err.code !== NO_ENTERPRISE_CONFIG_CODE && err.msg) {
          this.msgError(err.msg);
        }
      }
    },
    // 子组件调用该方法，完成配置后改变代开发应用授权的状态渲染不同的页面
    changeConfiguration(params) {
      this.getNowConfig();
      this.isConfiguration = params;
    },
    // 重新配置应用
    reSetConfig(params) {
      this.reSet = true;
      this.isConfiguration = false;
    },
    // 调用Header子组件的onOpenPrimaryBtnDrawer方法打开快捷配置的窗口
    onOpenPrimaryBtnDrawer(type) {
      this.$refs[type].onOpenExtraDrawer();
    },
    // 调用Header子组件的onOpenDrawer方法打开如何配置的窗口
    onOpenDrawer(type) {
      this.$refs[type].onOpenDrawer();
    }
  }
};
</script>

<template>
  <div class="enterprise-wechat-config">
    <!-- 如果代开发应用还未完成授权，渲染这里 -->
    <template v-if="!isConfiguration">
      <ConfigComponent :reset="reSet" @changeConfiguration="changeConfiguration" />
    </template>
    <div v-else>
      <div class="step-item">
        <!--  重新配置按钮代开发-->
        <!-- extraclick重新配置按钮，目前暂未实现 所以不展示 -->
        <HeaderComponent
          ref="contactHeaderRef"
          title="应用信息"
          extraclick=""
          :application-from-type="APPLICATION"
          @reSetConfig="reSetConfig"
        />
        <ConfigItemComponent
          :params="[
            {
              label: '企业ID',
              type: 'input',
              btnType: 'copy',
              required: false,
              field: 'corpId',
            },
            {
              label: '应用ID',
              type: 'input',
              btnType: 'copy',
              required: false,
              field: 'agentId',
            },
          ]"
          :form="form"
          :application-type="APPLICATION_TYPE"
          :application-from-type="APPLICATION_FROM_TYPE"
          @getNowConfig="getNowConfig"
        />
      </div>
      <div class="step-item">
        <HeaderComponent
          ref="customerChat"
          title="客户联系"
          drawer-title="如何获取客户联系配置内容"
          type="customerChat"
        >
          <template v-slot:generationDevelopment>
            <el-button size="mini" class="btn-reset mini-btn mini-btn-transparent" @click="onOpenDrawer('customerChat')">
              如何获取？
            </el-button>
          </template>
        </HeaderComponent>
        <ConfigItemComponent
          :params="[
            {
              label: '会话存档Secret',
              type: 'input',
              btnText: '保存',
              btnType: 'save',
              required: false,
              field: 'chatSecret',
            },
          ]"
          tip="需要先在企业微信后台开通会话存档功能，开通后可以查看员工的聊天记录并做企业风控"
          :form="form"
          :application-from-type="APPLICATION_FROM_TYPE"
          @getNowConfig="getNowConfig"
        />
      </div>
      <div class="step-item">
        <HeaderComponent
          ref="chatside"
          title="聊天侧边栏"
          drawer-title="如何配置聊天工具栏"
          extra-title="快捷配置"
          type="chatside"
          :default-domain="defaultDomain"
          :config-id="form.id"
          :form="form"
          @getNowConfig="getNowConfig"
        >
          <template v-slot:generationDevelopment>
            <el-button size="mini" class="btn-reset mini-btn mini-btn-transparent" @click="onOpenDrawer('chatside')">
              如何配置？
            </el-button>
            <el-button v-hasPermi="['wechat:corp:edit']" size="mini" type="primary" class="mini-btn" @click="onOpenPrimaryBtnDrawer('chatside')">
              自动配置，减少出错
            </el-button>
          </template>
        </HeaderComponent>
        <ConfigItemComponent
          :params="[
            {
              label: '素材库',
              type: 'input',
              btnText: '复制',
              btnType: 'copy',
              required: false,
              field: 'materialUrl',
            },
            {
              label: '客户画像',
              type: 'input',
              btnText: '复制',
              btnType: 'copy',
              required: false,
              field: 'customerPortrait',
            },
            {
              label: '应用工具',
              type: 'input',
              btnText: '复制',
              btnType: 'copy',
              required: false,
              field: 'applicationTools',
            },
          ]"
          tip="用于配置企业微信客户端侧边工具栏页面"
          :form="form"
          :application-from-type="APPLICATION_FROM_TYPE"
          @getNowConfig="getNowConfig"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';

.enterprise-wechat-config {
  position: relative;
  .step-item {
    margin-bottom: 10px;
  }
}
</style>
