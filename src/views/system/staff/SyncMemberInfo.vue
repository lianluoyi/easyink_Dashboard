<script>
import {
  getAdminLoginQrcode,
  checkAdminLoginQrcode,
  getDepartMemberInfo
} from '@/api/admin';
import CodeValidata from '../../enterpriseWechat/codeValidata.vue';
let qrcodeTimer = null;
const TIMER_COUNT = 200;
// TODO 可与企微配置合并成一个？
export default {
  components: { CodeValidata },
  props: {
    extraDrawer: {
      type: Boolean,
      default: false
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
      timerCount: TIMER_COUNT,
      checkTimeStart: true,
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
      if (val) {
        this.reGetQrcode();
      }
      this.checkTimeStart = val;
    }
  },
  mounted() {
    this.getQrcode();
  },
  methods: {
    /**
     * @description 刷新员工
     */
    refreshStaff() {
      this.$emit('getList', 1);
      this.$emit('closeDrawer');
    },

    async checkQrcode(qrcodeKey) {
      await checkAdminLoginQrcode({
        qrcodeKey: qrcodeKey,
        status: 'QRCODE_SCAN_NEVER'
      }).then((res) => {
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

    /**
     * @description 扫码登录/验证码通过 登录成功回调
     */
    loginSuccessAndConfig() {
      getDepartMemberInfo({
        qrcodeKey: this.qrcodeKey
      }).then((res) => {
        // eslint-disable-next-line no-magic-numbers
        if (res.code === 200) {
          this.active = 1;
        }
      }).catch(() => {});
      this.stopTimer();
    },

    /**
     * @description 处理扫码登录企业不一致情况
     */
    dealScanInconformity() {
      // 第三方应用
      if (this.isThirdType) {
        this.scanLoginError = true;
        this.scanLoginErrText = '与注册企业不一致';
        this.stopTimer();
      } else {
        this.qrcodeLoad = true;
        this.stopTimer();
        this.confirmModal(
          {
            msg: '当前扫码企业与现有企业不一致，若继续，则EasyInk下所有在线员工将被强制下线，原有企业数据不可查看，是否继续？'
          },
          () => {
            this.loginSuccessAndConfig();
          },
          () => {
            this.$emit('closeDrawer');
            this.init();
            this.qrcodeUrl = '';
            this.qrcodeLoad = false;
          }
        );
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
     * 重新获取二维码
     */
    reGetQrcode() {
      this.active = 0;
      this.needCode = false;
      this.tlKey = '';
      this.tel = '';
      this.qrcodeUrl = '';
      this.scanLoginError = false;
      this.checkTimeStart = true;
      this.timerCount = TIMER_COUNT;
      this.getQrcode();
    },

    /**
     * 获取企微后台登录二维码
     */
    async getQrcode() {
      getAdminLoginQrcode({}).then((res) => {
        this.qrcodeUrl = res.data.qrcodeUrl;
        this.qrcodeKey = res.data.qrcodeKey;
        this.checkQrcode(res.data.qrcodeKey);
      });
    },

    init() {
      clearTimeout(qrcodeTimer);
      this.active = 0;
      this.checkTimeStart = true;
      this.timerCount = TIMER_COUNT;
    }
  }
};
</script>

<template>
  <div class="quick-demo enterprise-wechat-demo">
    <div class="quick-div">
      <el-alert
        title="由于企业微信官方调整，应用不可直接获取员工头像、手机号、邮箱等信息，请企业管理员扫码授权同步成员信息"
        type="warning"
        show-icon
        :closable="false"
      />
      <div class="step-div">
        <el-steps direction="vertical" :active="active" finish-status="success">
          <el-step title="扫码授权">
            <template v-if="active === 0" slot="description">
              <div class="orange tip">
                请使用企业微信管理员扫码授权，成功授权后将开始自动同步
              </div>
              <div v-if="qrcodeUrl && !qrcodeLoad" class="qrcode-div">
                <div v-if="scanLoginError" class="overdue-div">
                  <div><i class="el-icon-warning" /></div>
                  <div class="overdue-tip">
                    <span>{{ scanLoginErrText }}</span>
                    <span
                      v-if="!refresh"
                      class="reGet"
                      @click="reGetQrcode"
                    >刷新</span>
                  </div>
                </div>
                <img :src="qrcodeUrl">
              </div>
              <div v-else class="qrcode-div">
                <div><i class="el-icon-loading" /></div>
              </div>
              <!-- 二维码校验 -->
              <CodeValidata
                v-if="needCode"
                :qrcode-key="qrcodeKey"
                :tel="tel"
                :tl-key="tlKey"
                @loginSuccessAndConfig="loginSuccessAndConfig"
              />
            </template>
          </el-step>
          <el-step v-if="active === 1" title="同步成员信息">
            <template slot="description">
              <div class="sync-info">
                <div>已发起同步请求，请稍后刷新员工列表，若成员数据量大，会影响同步速度，请耐心等待</div>
                <div class="mt10">
                  <el-progress type="circle" :percentage="100" status="success" />
                </div>
                <el-button
                  type="primary"
                  style="margin-top: 12px"
                  @click="refreshStaff"
                >刷新员工</el-button>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
    .quick-demo {
        /deep/ .el-step__description {
            font-size: 14px;
            margin-bottom: 15px;
        }
        /deep/ .el-step__title {
            padding-bottom: 12px;
            color: $black;
        }
        /deep/ .el-step__head.is-success {
          min-height: 62px;
        }
        .quick-div {
            /deep/ .el-alert--warning {
                .el-alert__icon {
                    font-size: 16px;
                }
                .el-alert__content {
                    .el-alert__title {
                        font-size: 12px;
                    }
                }
            }
        }
    }
    .orange {
        color: $orange;
    }
    .sync-info {
      color: #333;
      .sync-success {
      }
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
          display: block;
            @include bg_color($color-theme2-1);
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
    }
</style>
