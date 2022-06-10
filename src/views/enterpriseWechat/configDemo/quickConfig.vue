<script>
import { getAdminLoginQrcode, checkAdminLoginQrcode, autoConfig } from '@/api/admin';
import * as api from '@/api/enterpriseId';
import { syncUser as syncPersonal } from '@/api/organization';
import { sync as customerSync } from '@/api/customer/index';
import { sync as groupSync } from '@/api/customer/group';
import { syncTag } from '@/api/customer/tag';
import { setDefaultConfig } from '@/utils/enterpriseWechat';
import { validURL } from '@/utils/validate';
import ClipboardJS from 'clipboard';
import { Notification } from 'element-ui';
import { ENTERPRISE_CONFIG_TIP, SERVER_TYPE_THIRD } from '@/utils/constant';
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
      domainConfig: {
        sidebarDomain: '',
        sidebarPort: '8092',
        dashboardDomain: '',
        dashboardPort: '8091',
        weComSystemDomain: '',
        weComSystemPort: '8090'
      },
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
      secretRuleForm: {
        agentSecret: [
          { required: true, message: '请输入应用Secret', trigger: 'blur' }
        ],
        contactSecret: [
          { required: true, message: '请输入通讯录Secret', trigger: 'blur' }
        ],
        customSecret: [
          { required: true, message: '请输入客户联系Secret', trigger: 'blur' }
        ]
      },
      secretConfig: {
        agentSecret: '',
        contactSecret: '',
        customSecret: ''
      },
      configLoad: false,
      checkTimeStart: true,
      // 是否为第三方应用
      isThirdType: this.$store.state.serverInfo && this.$store.state.serverInfo.serverType === SERVER_TYPE_THIRD,
      tel: '',
      //  是否需要验证码
      needCode: false,
      tlKey: '',
      // 是否在二维码上显示刷新
      refresh: false
    };
  },
  computed: {},
  watch: {
    /**
       * 抽屉显示状态更改
       */
    extraDrawer(val) {
      this.checkTimeStart = val;
    }
  },
  created() {},
  mounted() {
    // 第三方应用需要获取域名配置信息
    if (this.isThirdType) {
      this.initConfig();
    }
    this.clipboard = new ClipboardJS('.copy-btn');

    this.clipboard.on('success', (e) => {
      Notification.closeAll();
      this.$notify({
        title: '成功',
        message: '内容已复制到剪切板，可粘贴。',
        type: 'success'
      });
    });

    this.clipboard.on('error', (e) => {
      this.msgError('内容复制失败');
    });
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
      this.active = 2;
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
          msg: '当前扫码企业与现有企业不一致，若继续，则easyWeCom下所有在线员工将被强制下线，原有企业数据不可查看，是否继续？'
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
     * 校验输入的服务器信息配置是否为空
     * @returns true(全部填写)/false(部分未填写)
     */
    checkInput() {
      const { sidebarDomain, sidebarPort, dashboardDomain, dashboardPort, weComSystemDomain, weComSystemPort } = this.domainConfig;
      if (!sidebarDomain || !sidebarPort || !dashboardDomain || !dashboardPort || !weComSystemDomain || !weComSystemPort) {
        return false;
      }
      return true;
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
      this.scanLoginError = false;
      this.checkTimeStart = true;
      this.timerCount = TIMER_COUNT;
      this.getQrcode();
    },
    async onNext() {
      const { sidebarDomain, dashboardDomain } = this.domainConfig;
      if (!this.checkInput()) {
        this.msgInfo('请输入完整的服务器信息');
        return;
      }
      if (!validURL(sidebarDomain) || !validURL(dashboardDomain)) {
        this.msgInfo('域名格式有误');
        return;
      }
      this.initConfig();
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
      } else {
        // 当token/encodingAesKey没有值时，进行更新
        if (!this.form.token || !this.form.encodingAesKey) {
          const newParams = setDefaultConfig({});
          this.updateConfig(newParams, () => {});
        }
      }
      this.nextStep();
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
      // 内部应用需要校验填入的服务器信息是否完整
      if (!this.isThirdType && !this.checkInput()) {
        this.msgInfo('请输入完整的服务器信息');
        return;
      }
      let domainParams = {};
      // 三方应用使用接口获取的域名配置
      if (this.isThirdType) {
        let defaultDomainParams = { ...this.defaultDomain };
        // 确保已经获取到默认域名数据才进行自动化配置，若没有获取到则再次获取
        if (!defaultDomainParams.dashboard || !defaultDomainParams.sidebar || !defaultDomainParams.scrm) {
          const defaultDomainRes = await getDefaultDomainConfig({});
          defaultDomainParams = { ...defaultDomainRes.data };
        }
        domainParams = {
          dashboardDomain: defaultDomainParams.dashboard,
          sidebarDomain: defaultDomainParams.sidebar,
          weComSystemDomain: defaultDomainParams.scrm
        };
      } else {
        const { sidebarDomain, sidebarPort, dashboardDomain, dashboardPort, weComSystemDomain, weComSystemPort } = this.domainConfig;
        domainParams = {
          dashboardDomain: `${dashboardDomain}:${dashboardPort}`,
          sidebarDomain: `${sidebarDomain}:${sidebarPort}`,
          weComSystemDomain: `${weComSystemDomain}:${weComSystemPort}`
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
      this.$alert(ENTERPRISE_CONFIG_TIP,
        '配置成功',
        {
          confirmButtonText: '我知道了',
          dangerouslyUseHTMLString: true
        }
      );
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
    },
    /**
     * 保存secret
     */
    saveSecret() {
      this.$refs.secretRuleForm.validate((valid) => {
        if (valid) {
          let newParams = {
            id: this.configId,
            ...this.secretConfig
          };
          newParams = setDefaultConfig(newParams);
          this.updateConfig(newParams, () => {
            this.active = this.active + 1;
            this.syncData();
          });
        }
      });
    },
    /**
     * 是否显示下一步的按钮
     */
    showNext() {
      return this.active === 0 && this.checkInput();
    },
    /**
     * 显示保存按钮
     */
    renderSave(secretConfig) {
      const { agentSecret, contactSecret, customSecret } = secretConfig;
      if (!agentSecret || !contactSecret || !customSecret) {
        return false;
      }
      return true;
    },
    /**
     * 初始化配置成功后去同步数据
     */
    syncData() {
      // 同步员工
      syncPersonal();
      // 客户同步
      customerSync();
      // 客户群同步
      groupSync();
      // 标签同步
      syncTag();
    }
  }
};
</script>

<template>
  <div class="quick-demo enterprise-wechat-demo">
    <div class="quick-div">
      <el-alert
        title="即将为你自动创建easyWeCom应用，并配置相关信息，若原来有创建过该应用，将会覆盖，请谨慎操作。"
        type="warning"
        show-icon
        :closable="false"
      />
      <div class="step-div">
        <el-steps direction="vertical" :active="active" finish-status="success">
          <el-step v-if="!isThirdType" title="服务器信息">
            <template slot="description" class="first-desc">
              <div class="orange tip">将服务解析的域名填写如下，并确保可通过该端口号访问。</div>
              <div class="orange tip">域名的企业主体须与当前配置企业一致，否则会导致部分功能异常。</div>
              <div class="domain-config">
                <div class="domain-item">
                  <div class="label">
                    <span class="require">*</span>
                    Sidebar
                  </div>
                  <div class="input-item">
                    <div class="domain-pre">域名</div>
                    <el-input v-model="domainConfig.sidebarDomain" class="domain-input" placeholder="例：http://www.easywecom.com" />
                  </div>
                  <div class="input-item">
                    <div class="port-pre">端口号</div>
                    <el-input v-model="domainConfig.sidebarPort" class="port-input" />
                  </div>
                </div>
                <div class="domain-item">
                  <div class="label">
                    <span class="require">*</span>
                    Dashboard
                  </div>
                  <div class="input-item">
                    <div class="domain-pre">域名</div>
                    <el-input v-model="domainConfig.dashboardDomain" class="domain-input" placeholder="例：http://www.easywecom.com" />
                  </div>
                  <div class="input-item">
                    <div class="port-pre">端口号</div>
                    <el-input v-model="domainConfig.dashboardPort" class="port-input" />
                  </div>
                </div>
                <div class="domain-item">
                  <div class="label">
                    <span class="require">*</span>
                    WeComSystem
                  </div>
                  <div class="input-item">
                    <div class="domain-pre">域名</div>
                    <el-input v-model="domainConfig.weComSystemDomain" class="domain-input" placeholder="例：http://www.easywecom.com" />
                  </div>
                  <div class="input-item">
                    <div class="port-pre">端口号</div>
                    <el-input v-model="domainConfig.weComSystemPort" class="port-input" />
                  </div>
                </div>
              </div>
              <div
                v-if="showNext()"
              ><el-button type="primary" @click="onNext">下一步</el-button></div>
            </template>

          </el-step>
          <el-step v-if="active > 0" title="扫码登录">
            <template v-if="active === 1" slot="description" class="scan-login">
              <div class="orange tip">请使用企业微信管理员扫码登录，成功登录后将开始自动化配置</div>
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
              <CodeValidata v-if="needCode" :qrcode-key="qrcodeKey" :tel="tel" :tl-key="tlKey" @loginSuccessAndConfig="loginSuccessAndConfig" />
            </template>
          </el-step>
          <el-step v-if="active > 1" title="自动化配置">
            <template slot="description" class="auto-config">
              <div class="orange tip">自动化配置期间，请勿关闭当前界面</div>
              <div class="config-progress">
                <el-progress type="circle" :percentage="configPercentage" :status="configStatus" />
                <div v-if="configStatus === 'exception'" class="err-tip">{{ configErrTip }}</div>
              </div>
              <div v-if="configStatus === 'exception'">
                <el-button type="primary" @click="reStartAutoConfig">重新配置</el-button>
              </div>
            </template>
          </el-step>
          <el-step v-if="active > 2" title="填写Secret">
            <template v-if="active === 3" slot="description" class="auto-config">
              <div class="orange tip">请将企业微信客户端收到的Secret填写到表单中</div>
              <div class="secret-config">
                <el-form
                  ref="secretRuleForm"
                  :model="secretConfig"
                  :rules="secretRuleForm"
                  label-width="122px"
                  class="top-search"
                  label-position="left"
                >
                  <el-form-item label="应用Secret" prop="agentSecret">
                    <el-input v-model="secretConfig.agentSecret" placeholder="请输入应用Secret" />
                  </el-form-item>
                  <el-form-item label="通讯录Secret" prop="contactSecret">
                    <el-input v-model="secretConfig.contactSecret" placeholder="请输入通讯录Secret" />
                  </el-form-item>
                  <el-form-item label="客户联系Secret" prop="customSecret">
                    <el-input v-model="secretConfig.customSecret" placeholder="请输入客户联系Secret" />
                  </el-form-item>
                </el-form>
                <el-button v-if="renderSave(secretConfig)" type="primary" @click="saveSecret">保存</el-button>
              </div>
            </template>
          </el-step>
          <el-step v-if="active > 3" title="配置通讯录回调">
            <template slot="description" class="config-callback">
              <div class="orange tip">截止当前，已完成必要配置，如需实时获取成员或部门的变更数据，则按照下图步骤在企业微信后台配置</div>
              <div class="part">
                <div class="content-title">（1）进入
                  <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps/contactsApi" target="_blank">【管理工具】-【通讯录同步】</el-link>
                  页面。</div>
                <el-image
                  class="part-img"
                  :src="require('@/assets/example/demo/receive-step2-1.jpg')"
                  :preview-src-list="[require('@/assets/example/demo/receive-step2-1.jpg')]"
                />
              </div>
              <div class="part">
                <div class="content-title">
                  （2）点击“已设置接收事件服务器”旁编辑按钮，<span class="red">当前弹窗不要关闭，</span>此时企微客户端将收到一条企业微信团队发送的确认操作。
                </div>
                <el-image
                  class="part-img"
                  :src="require('@/assets/example/demo/receive-step2-2.jpg')"
                  :preview-src-list="[require('@/assets/example/demo/receive-step2-2.jpg')]"
                />
              </div>
              <div class="part">
                <div class="content-title">
                  （3）在客户端确认操作后，企微后台弹窗将自动切换为可编辑状态，将以下数据复制并填写到弹窗中，保存即可。
                </div>
                <div v-if="form" class="content-text content-text-box">
                  <div v-if="form.callbackUri" class="copy-item">
                    <span class="label">URL：</span>
                    <span>{{ form.callbackUri }}</span>
                    <el-button
                      size="mini"
                      type="text"
                      class="copy-btn"
                      :data-clipboard-text="form.callbackUri"
                    >复制</el-button>
                  </div>
                  <div v-if="form.token" class="copy-item">
                    <span class="label">Token：</span>
                    <span>{{ form.token }}</span>
                    <el-button
                      size="mini"
                      type="text"
                      class="copy-btn"
                      :data-clipboard-text="form.token"
                    >复制</el-button>
                  </div>
                  <div v-if="form.encodingAesKey" class="copy-item">
                    <span class="label">EncodingAESKey：</span>
                    <span>{{ form.encodingAesKey }}</span>
                    <el-button
                      size="mini"
                      type="text"
                      class="copy-btn"
                      :data-clipboard-text="form.encodingAesKey"
                    >复制</el-button>
                  </div>
                </div>
                <el-image
                  class="part-img"
                  :src="require('@/assets/example/demo/receive-step2-3.jpg')"
                  :preview-src-list="[require('@/assets/example/demo/receive-step2-3.jpg')]"
                />
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </div>
    <div v-if="active > 3" class="btn-div">
      <el-button type="primary" style="margin-top: 12px;" @click="finishConfig">完成配置</el-button>
    </div>
  </div>
</template>
<style lang="scss" src="./styles/common.scss" scoped>
</style>
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
                    .domain-pre, .port-pre {
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
