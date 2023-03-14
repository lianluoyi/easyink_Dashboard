<script>
import { getAdminLoginQrcode, checkAdminLoginQrcode, autoConfig } from '@/api/admin';
import * as api from '@/api/enterpriseId';
import { setDefaultConfig } from '@/utils/enterpriseWechat';
import { SERVER_TYPE_THIRD } from '@/utils/constant';
import { getDefaultDomainConfig } from '@/api/admin';
import CodeValidata from '../codeValidata.vue';
let qrcodeTimer = null;
const TIMER_COUNT = 200;
const PERCENTAGE = 100;
const STEP_OF_PERCENTAGE = 10;
export default {
  components: { CodeValidata },
  props: {
    configId: {
      type: String,
      default: ''
    },
    extraDrawer: {
      type: Boolean,
      default: false
    },
    form: {
      type: Object,
      default: () => ({})
    },
    defaultDomain: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      active: 0,
      qrcodeUrl: '',
      // 二维码框显示加载状态
      qrcodeLoad: false,
      qrcodeKey: '',
      // 扫码登录是否失败
      scanLoginError: false,
      // 扫码登录失败提示文字
      scanLoginErrText: '登录失败',
      //   qrcodeTimer: null,
      configPercentage: 0,
      timerCount: TIMER_COUNT,
      // 配置进度条定时器
      progressTimer: null,
      /**
       * 配置状态
       */
      configStatus: '',
      configErrTip: '配置失败',
      configLoad: false,
      checkTimeStart: true,
      // 是否为第三方应用
      isThirdType: this.$store.state.serverInfo && this.$store.state.serverInfo.serverType === SERVER_TYPE_THIRD,
      // eslint-disable-next-line no-magic-numbers
      tel: '',
      // // 是否需要验证码
      needCode: false,
      tlKey: '',
      refresh: false
    };
  },
  computed: {},
  watch: {
    /**
       * 抽屉显示状态更改
       */
    extraDrawer(val) {
      if (val) {
        this.reGetQrcode();
      }
      this.checkTimeStart = val;
    }
  },
  created() {},
  mounted() {
    // 第三方应用需要获取域名配置信息
    if (this.isThirdType) {
      this.initConfig();
    }
  },
  methods: {
    async checkQrcode(qrcodeKey) {
      await checkAdminLoginQrcode({
        qrcodeKey: qrcodeKey,
        status: 'QRCODE_SCAN_NEVER'
      }).then(res => {
        switch (res.data.status) {
          // 未扫码
          case 'QRCODE_SCAN_NEVER': {
            break;
          }
          // 二维码过期
          case 'QRCODE_EXPIRE': {
            this.scanLoginError = true;
            this.scanLoginErrText = '二维码已过期';
            this.stopTimer();
            break;
          }
          // 扫码成功
          case 'QRCODE_SCAN_SUCC': {
            this.loginSuccessAndConfig();
            break;
          }
          // 登录失败
          case 'QRCODE_LOGIN_FAIL': {
            this.scanLoginError = true;
            this.scanLoginErrText = '登录失败';
            this.stopTimer();
            break;
          }
          // 扫码登录时企业不匹配
          case 'QRCODE_LOGIN_FAIL_CORP_MISMATCH': {
            this.dealScanInconformity();
            break;
          }
          // 扫码登录时需要验证码
          case 'NEED_MOBILE_CONFIRM': {
            this.stopTimer();
            this.refresh = true;
            this.scanLoginError = true;
            this.scanLoginErrText = '登录中';
            this.needCode = true;
            this.tlKey = res.data.tlKey;
            this.tel = res.data.tel;
            break;
          }
          // 等待验证码
          case 'WAIT_MOBILE_CONFIRM': {
            this.stopTimer();
            this.needCode = true;
            break;
          }
          default: {
            break;
          }
        }
        if (this.checkTimeStart && this.timerCount >= 0) {
          this.timerCount = this.timerCount - 1;
          clearTimeout(qrcodeTimer);
          qrcodeTimer = setTimeout(() => {
            this.checkQrcode(qrcodeKey);
            clearTimeout(qrcodeTimer);
          // eslint-disable-next-line no-magic-numbers
          }, 2500);
        }
      });
    },
    // 扫码登录成功且
    loginSuccessAndConfig() {
      // eslint-disable-next-line no-magic-numbers
      this.active = 1;
      this.stopTimer();
      this.startAutoConfig();
    },
    // 处理扫码登录企业不一致情况
    dealScanInconformity() {
      // 第三方应用
      if (this.isThirdType) {
        this.scanLoginError = true;
        this.scanLoginErrText = '与注册企业不一致';
        this.stopTimer();
      } else {
        this.qrcodeLoad = true;
        this.stopTimer();
        this.confirmModal({
          msg: '当前扫码企业与现有企业不一致，若继续，则EasyInk下所有在线员工将被强制下线，原有企业数据不可查看，是否继续？'
        }, () => {
          this.loginSuccessAndConfig();
        }, () => {
          this.$emit('closeDrawer');
          this.init();
          this.qrcodeUrl = '';
          this.qrcodeLoad = false;
        });
      }
    },
    /**
     * 停止扫码状态校验定时器
     */
    stopTimer() {
      clearTimeout(qrcodeTimer);
      this.checkTimeStart = false;
    },
    /**
     * 添加企微配置
     */
    async addConfig(newParams) {
      let flag = true;
      await api.add(newParams)
        .then((res) => {
          this.$emit('getNowConfig');
          flag = true;
        })
        .catch((err) => {
          console.error('添加企微配置失败', err);
          this.msgError(err.msg || '企微配置添加失败');
          flag = false;
        });
      return flag;
    },
    /**
     * 重新获取二维码
     */
    reGetQrcode() {
      this.qrcodeUrl = '';
      this.needCode = false;
      this.tlKey = '';
      this.tel = '';
      this.scanLoginError = false;
      this.checkTimeStart = true;
      this.timerCount = TIMER_COUNT;
      this.getQrcode();
    },
    /**
     * 初始化企微配置
     */
    async initConfig() {
      // 还未创建过配置
      if (!this.configId) {
        const newParams = setDefaultConfig({
          status: 0
        });
        const addFlag = await this.addConfig(newParams);
        if (!addFlag) return;
      }
      this.getQrcode();
    },

    /**
     * 获取企微后台登录二维码
     */
    async getQrcode() {
      getAdminLoginQrcode({}).then(res => {
        this.qrcodeUrl = res.data.qrcodeUrl;
        this.qrcodeKey = res.data.qrcodeKey;
        this.checkQrcode(res.data.qrcodeKey);
      });
    },
    nextStep() {
      this.active = this.active + 1;
    },
    /**
     * 重新配置
     */
    reStartAutoConfig() {
      this.configPercentage = 0;
      this.configStatus = '';
      this.configErrTip = '配置失败';
      this.startAutoConfig();
    },
    /**
     * 自动化配置
     */
    async startAutoConfig() {
      // 防止正在调用自动化配置的时候重复调用
      if (this.configLoad) {
        return;
      }
      let domainParams = {};
      if (!this.defaultDomain || !Object.keys(this.defaultDomain).length) {
        // 获取服务器配置的域名
        const defaultDomainData = await getDefaultDomainConfig({});
        this.defaultDomain = defaultDomainData.data;
      }
      // 三方应用使用接口获取的域名配置
      if (this.isThirdType) {
        domainParams = {
          dashboardDomain: this.defaultDomain.dashboard,
          sidebarDomain: this.defaultDomain.sidebar,
          weComSystemDomain: this.defaultDomain.scrm
        };
      }
      this.loadProgress();
      this.configLoad = true;
      this.handleAutoConfig({
        ...domainParams,
        qrcodeKey: this.qrcodeKey
      });
    },
    /**
     * 企微自动配置接口调用
     */
    handleAutoConfig(params) {
      autoConfig(params).then(res => {
        this.configLoad = false;
        clearInterval(this.progressTimer);
        this.configStatus = 'success';
        this.configPercentage = PERCENTAGE;
        this.nextStep();
        this.$emit('getNowConfig');
      }).catch(err => {
        this.configLoad = false;
        clearInterval(this.progressTimer);
        this.configPercentage = PERCENTAGE;
        this.configStatus = 'exception';
        this.configErrTip = err ? (err.msg || '配置失败') : '配置失败';
      });
    },
    /**
     * 自动化配置的进度条设置
     */
    loadProgress() {
      this.progressTimer = setInterval(() => {
        if (this.configPercentage < PERCENTAGE - STEP_OF_PERCENTAGE) {
          this.configPercentage = this.configPercentage + STEP_OF_PERCENTAGE;
        } else {
          clearInterval(this.progressTimer);
        }
      // eslint-disable-next-line no-magic-numbers
      }, 800);
    },
    init() {
      clearTimeout(qrcodeTimer);
      this.active = 0;
      this.checkTimeStart = true;
      this.timerCount = TIMER_COUNT;
    },
    /**
     * 完成配置
     */
    finishConfig() {
      this.checkTimeStart = false;
      this.init();
      this.$emit('closeDrawer');
    },
    /**
     * 更新企微配置
     */
    updateConfig(newParams, callback) {
      api.update(newParams)
        .then(() => {
          callback();
          this.$emit('getNowConfig');
        })
        .catch((err) => {
          this.msgError(err.msg || '企微配置更新失败');
        });
    }
  }
};
</script>

<template>
  <div class="quick-demo enterprise-wechat-demo">
    <div class="quick-div">
      <el-alert
        title="即将为你自动化配置侧边工具栏页面"
        type="warning"
        show-icon
        :closable="false"
      />
      <div class="step-div">
        <el-steps direction="vertical" :active="active" finish-status="success">
          <el-step title="扫码登录">
            <template v-if="active === 0" slot="description" class="scan-login">
              <div class="orange tip">
                请使用企业微信管理员扫码登录，成功登录后将开始自动化配置
              </div>
              <div v-if="qrcodeUrl && !qrcodeLoad" class="qrcode-div">
                <div v-if="scanLoginError" class="overdue-div">
                  <div><i class="el-icon-warning" /></div>
                  <div class="overdue-tip">
                    <span>{{ scanLoginErrText }}</span>
                    <span v-if="!refresh" class="reGet" @click="reGetQrcode">刷新</span>
                  </div>
                </div>
                <img :src="qrcodeUrl">
              </div>
              <div v-else class="qrcode-div">
                <div><i class="el-icon-loading" /></div>
              </div>
              <!-- 二维码校验 -->
              <CodeValidata v-if="needCode" :qrcode-key="qrcodeKey" :tl-key="tlKey" :tel="tel" @loginSuccessAndConfig="loginSuccessAndConfig" />
            </template>
          </el-step>
          <el-step v-if="active > 0 " title="自动化配置">
            <template slot="description" class="auto-config">
              <div v-if="active === 1">
                <div class="orange tip">自动化配置期间，请勿关闭当前界面</div>
                <div class="config-progress">
                  <el-progress type="circle" :percentage="configPercentage" :status="configStatus" />
                  <div v-if="configStatus === 'exception'" class="err-tip">
                    {{ configErrTip }}
                  </div>
                </div>
                <div v-if="configStatus === 'exception'">
                  <el-button type="primary" @click="reStartAutoConfig">重新配置</el-button>
                </div>
              </div>
              <div v-if="active > 1 ">
                <div v-if="configStatus === 'success'">
                  <div class="orange tip">已完成侧边工具栏配置</div>
                  <div class="config-progress">
                    <el-progress type="circle" :percentage="configPercentage" :status="configStatus" />
                  </div>
                  <div>
                    <el-button type="primary" style="margin-top: 12px" @click="finishConfig">完成配置</el-button>
                  </div>
                </div>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </div>
  </div>
</template>
<style lang="scss" src="./styles/common.scss" scoped></style>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.quick-demo {
  /deep/ .el-step__description {
    font-size: 14px;
  }
  /deep/ .el-step__title {
    padding-bottom: 20px;
    color: $black;
  }
  .quick-div {
    /deep/ .el-alert--warning {
      .el-alert__icon {
        font-size: 20px;
      }
      .el-alert__content {
        .el-alert__title {
          font-size: 14px;
        }
      }
    }
  }
}
.orange {
  color: $orange;
}
.step-div {
  margin-top: 20px;
  /deep/ .el-step.is-vertical .el-step__line {
    width: 1px;
  }
  /deep/ .el-step {
    .is-success {
      .el-step__line {
        .el-step__line-inner {
          border-width: 0px !important;
        }
      }
    }
  }
  /deep/ .el-step__line {
    @include bg_color($color-theme2-1);
  }
  .domain-config {
    border: 1px solid $borderColor;
    padding: 15px 10px 5px 10px;
    margin-bottom: 10px;
    .domain-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .label {
        color: $black;
        width: 110px;
        font-size: 14px;
        text-align: right;
        margin-right: 5px;
        .require {
          color: $red;
        }
      }
      .input-item {
        display: flex;
        align-items: center;
        position: relative;
        margin: 0 5px;
        .domain-pre {
          width: 50px;
        }
        .port-pre {
          width: 82px;
        }
        .domain-pre,
        .port-pre {
          /* text-align: center; */
          color: $grayColor;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d9d9d9;
          border-right: none;
        }
        /deep/ .el-input {
          input {
            border-top-left-radius: 0px;
            border-bottom-left-radius: 0px;
            padding: 0 5px;
          }
        }
        .domain-input {
          /deep/ input {
            width: 210px;
          }
        }
        .port-input {
          /deep/ input {
            width: 58px;
          }
        }
      }
    }
  }
  .qrcode-div {
    position: relative;
    display: flex;
    border: 1px solid $borderColor;
    width: 180px;
    height: 180px;
    padding: 10px;
    align-items: center;
    justify-content: center;
    .el-icon-loading {
      font-size: 32px;
      color: $grayColor;
    }
    img {
      width: 100%;
    }
    .overdue-div {
      .el-icon-warning {
        font-size: 30px;
        color: $orange;
      }
      .overdue-tip {
        margin-top: 14px;
        .reGet {
          color: $light-blue;
          margin-left: 12px;
          cursor: pointer;
        }
      }
      position: absolute;
      width: calc(100% - 20px);
      height: calc(100% - 20px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.8);
      color: #333;
      font-size: 14px;
    }
  }
  .tip {
    margin-bottom: 5px;
  }
  .content-title {
    color: $black;
    .red {
      color: $red;
    }
  }
  .content-text {
    .copy-item {
      margin-bottom: 2px;
      .label {
        display: inline-block;
        width: 124px;
        text-align: right;
      }
      button {
        padding: 0;
        margin-left: 10px;
        font-size: 14px;
      }
    }
  }
  .config-progress {
    display: flex;
    align-items: flex-end;
    margin: 10px 0 20px;
    .err-tip {
      color: $red;
    }
  }
  .secret-config {
    .top-search {
      margin-bottom: 15px;
      /deep/ .el-form-item {
        padding: 5px 0;
      }
    }
    /deep/ .el-form {
      .el-form-item {
        .el-form-item__content {
          .el-input {
            width: 395px;
          }
          .el-form-item__error {
            position: relative;
          }
        }
      }
    }
  }
}
</style>
