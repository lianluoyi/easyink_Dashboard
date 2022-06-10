<script>
import * as api from '@/api/enterpriseId';
import HeaderComponent from './header.vue';
import ConfigItemComponent from './configItem.vue';
import SelfListComponent from './selfList.vue';
import { NO_ENTERPRISE_CONFIG_CODE, SERVER_TYPE_THIRD } from '@/utils/constant';
import { getDefaultDomainConfig } from '@/api/admin';

export default {
  components: { HeaderComponent, ConfigItemComponent, SelfListComponent },
  props: {},
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: 1,
        companyName: '',
        status: 0
      },
      loading: true,
      form: {},
      // 企微配置修改前数据
      oldForm: {},
      dialogVisible: false,
      // 第三方应用域名配置
      defaultDomain: {
        dashboard: '',
        scrm: '',
        sidebar: ''
      },
      // 是否为第三方应用
      isThirdType: this.$store.state.serverInfo && this.$store.state.serverInfo.serverType === SERVER_TYPE_THIRD,
      // 是否为代开发应用
      isSelfCreate: false
    };
  },
  computed: {},
  watch: {},
  created() {
    this.isCustomizedApp();
  },
  mounted() {
    // 第三方应用需要获取域名配置信息
    if (this.isThirdType) {
      this.getDefaultDomain();
    }
  },
  methods: {
    /**
     * 判断是否是代开发应用
     */
    async isCustomizedApp() {
      this.loading = false;
      // 是否为代开发应用
      this.isSelfCreate = !!this.$store.state.serverInfo.dkCorp;
      if (!this.isSelfCreate) {
        this.checkGuide();
      }
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
    /**
     * 获取服务器配置的域名
     */
    getDefaultDomain() {
      getDefaultDomainConfig().then(res => {
        this.defaultDomain = res.data;
      });
    },
    /**
     * 设置回调地址
     */
    initCallBackUri() {
      const domainName = `${window.location.protocol}//${window.location.hostname}`;
      if (!this.form.callbackUri) {
        this.form.callbackUri = this.isThirdType ? this.defaultDomain.scrm + '/wecom/callback/recive' : (domainName + ':8090' + '/wecom/callback/recive');
      }
    },
    dealFormData(form) {
      this.form.certFileName = form.certFilePath ? form.certFilePath.slice(form.certFilePath.lastIndexOf('/') + 1) : '';
      this.initCallBackUri();
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
        // 没有创建过配置
        if (!getNowConfigRes.data) {
          return;
        }
        this.$store.dispatch('UpdateConfig', getNowConfigRes.data);
        const formData = getNowConfigRes.data || {};
        this.form = { ...formData };
        this.oldForm = { ...formData };
        this.dealFormData(this.form);
        return getNowConfigRes;
      } catch (err) {
        this.initCallBackUri();
        if (err.code !== NO_ENTERPRISE_CONFIG_CODE && err.msg) {
          this.msgError(err.msg);
        }
      }
    },
    onGotoAutoConfig() {
      this.dialogVisible = false;
      this.$refs.contactHeaderRef.extraDrawer = true;
    }
  }
};
</script>

<template>
  <div v-if="loading" class="delay-icon">
    <i class="el-icon-loading" />
  </div>
  <div v-else class="enterprise-wechat-config">
    <div>
      <!-- 如果是代开发应用渲染这个组件，否则渲染下面的这个组件 -->
      <template v-if="isSelfCreate">
        <div>
          <SelfListComponent />
        </div>
      </template>
      <template v-else>
        <el-alert
          class="warn-tip"
          title="请根据配置教程完成以下打*的配置，否则可能导致系统功能异常。"
          type="warning"
          show-icon
        />
        <div class="step-item">
          <HeaderComponent
            ref="contactHeaderRef"
            title="通讯录"
            tip="如何获取？"
            drawer-title="如何获取通讯配置内容"
            type="contact"
            extra="步骤太繁琐？我要快捷配置"
            extra-title="快捷配置"
            :config-id="form.id"
            :form="form"
            :default-domain="defaultDomain"
            @getNowConfig="getNowConfig"
          />
          <ConfigItemComponent
            :params="[
              {
                label: '企业ID',
                type: 'input',
                required: true,
                field: 'corpId',
              },
              {
                label: '应用ID',
                type: 'input',
                required: true,
                field: 'agentId',
              },
              {
                label: '应用Secret',
                type: 'input',
                required: true,
                field: 'agentSecret',
              },
              {
                label: '通讯录Secret',
                type: 'input',
                required: true,
                field: 'contactSecret',
                btnText: '保存',
                btnType: 'saveAll',
              },
            ]"
            tip="用于企业员工扫码登录系统，获取企业下员工和部门的信息"
            :form="form"
            :old-form="oldForm"
            @getNowConfig="getNowConfig"
          />
        </div>
        <div class="step-item">
          <HeaderComponent
            title="接收消息"
            tip="如何配置？"
            drawer-title="如何配置接收消息"
            type="receive"
          />
          <ConfigItemComponent
            :params="[
              {
                label: '回调地址',
                type: 'input',
                btnText: '复制',
                btnType: 'copy',
                required: true,
                field: 'callbackUri',
                iconLabel: 'el-icon-question',
                toolTipText:
                  '拼接规则为【http://ip:port/wecom/callback/receive】，若有变更端口号，请自行替换。',
              },
              {
                label: 'Token',
                type: 'input',
                btnText: '复制',
                btnType: 'copy',
                required: true,
                field: 'token',
              },
              {
                label: 'EncodingAESKey',
                type: 'input',
                btnText: '复制',
                btnType: 'copy',
                required: true,
                field: 'encodingAesKey',
              },
            ]"
            tip="当外部联系人变更或企业信息变更，主动推送通知给应用。"
            :form="form"
          />
        </div>
        <div class="step-item">
          <HeaderComponent
            title="客户联系"
            tip="如何获取？"
            drawer-title="如何获取客户联系配置内容"
            type="customer"
          />
          <ConfigItemComponent
            :params="[
              {
                label: '客户联系Secret',
                type: 'input',
                btnText: '保存',
                btnType: 'save',
                required: true,
                field: 'customSecret',
              },
              {
                label: '会话存档Secret',
                type: 'input',
                btnText: '保存',
                btnType: 'save',
                required: false,
                field: 'chatSecret',
              },
            ]"
            tip="用于管理企业客户、客户群等，可查看员工的聊天记录并做企业风控。"
            :form="form"
            @getNowConfig="getNowConfig"
          />
        </div>
        <div class="step-item">
          <HeaderComponent
            title="聊天工具栏"
            tip="如何配置？"
            drawer-title="如何配置聊天工具栏"
            type="chat"
            :default-domain="defaultDomain"
          />
          <ConfigItemComponent
            :params="[
              {
                label: 'Sidebar服务域名',
                placeholder:
                  '请输入Sidebar服务域名，需与企微后台一致，例http://www.easywecom.com:8092',
                type: 'input',
                btnText: '保存',
                btnType: 'save',
                field: 'h5DoMainName',
                disabledInput: isThirdType,
              },
              {
                label: '域名校验文件',
                type: 'upload',
                required: false,
                field: 'chatSecret',
              },
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
            @getNowConfig="getNowConfig"
          />
        </div>
        <el-dialog
          class="quick-config-dialog"
          :append-to-body="false"
          title="快捷配置"
          :visible.sync="dialogVisible"
          width="450px"
        >
          <i class="iconfont icon-arrow" />
          <div class="quick-tip">
            第一次配置系统，可使用快捷配置，仅需
            <span class="green theme-text-color">3</span>
            步就可快速接入企业微信，实现员工扫码登录，现在进入快捷配置？
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">不，我要手动配置</el-button>
            <el-button
              type="primary"
              @click="onGotoAutoConfig"
            >好的，现在就去</el-button>
          </span>
        </el-dialog>
      </template>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.quick-tip {
  line-height: 22px;
  text-indent: 2em;
}
.delay-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  .el-icon-loading {
    font-size: 40px;
  }
}
.enterprise-wechat-config {
  position: relative;
  .warn-tip {
    margin-bottom: 15px;
  }
  .quick-config-dialog {
    position: absolute;
    right: 0;
    /deep/ .el-dialog {
      position: absolute;
      right: 226px;
      left: auto;
      top: 170px;
      margin: 0 !important;
      .icon-arrow {
        font-size: 104px;
        color: #fff;
        position: absolute;
        top: -117px;
        right: -44px;
      }
    }
  }
  .step-item {
    margin-bottom: 10px;
  }
}
</style>
