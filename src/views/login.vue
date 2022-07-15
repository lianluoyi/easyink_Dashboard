<template>
  <div style="width: 100%;">
    <div v-loading="webLoginLoading" class="login">
      <img class="login-logo" :style="'top:' + logoTop + 'px'" src="@/assets/image/login_logo.svg" alt="">

      <div class="login-wrap">
        <div class="login-tab-wrap">
          <div v-show="!isAuth" :class="['login-tab', activeTab === qrCodeLoginType ? 'active' : '']" @click="changeActiveTab(qrCodeLoginType)">
            <div style="color:#6bb4ab" class="login-tab-text">扫码登录</div>
            <div class="login-tab-after" />
          </div>
          <div v-show="!isThird" :class="['login-tab', 'login-tab2', activeTab === passwordLoginType ? 'active' : '']" @click="changeActiveTab(passwordLoginType)">
            <div class="login-tab-before" />
            <div class="login-tab-text">账密登录</div>
            <div class="login-tab-after" />
          </div>
          <div v-show="isAuth" :class="['login-tab', 'active']" @click="changeActiveTab(qrCodeLoginType)">
            <div class="login-tab-text">企业注册</div>
            <div class="login-tab-after" />
          </div>
        </div>
        <div class="login-form-wrap">
          <div v-show="isThird && !isAuth && isEnterPriseUnAuth" class="login-third-err-wrap">
            <div class="err-title">登录失败</div>
            <div class="err-info">
              <p>所在企业未授权easyWeCom应用</p>
              <p>请联系企业管理员前往授权</p>
            </div>
            <el-button type="primary" class="primary-btn" @click="isAuth = true;isEnterPriseUnAuth = false;">我是企业管理员，去授权</el-button>
          </div>
          <div v-show="isThird && !isAuth && isEnterPriseUnConfig" class="login-third-err-wrap">
            <div class="err-title">登录失败</div>
            <div class="err-info">
              <p>所在企业未配置通讯录</p>
              <p>请联系企业管理员登录系统并完善配置</p>
            </div>
            <el-button type="primary" @click="reThirdScan">已配置，重新扫码</el-button>
          </div>
          <div v-show="isThird && isAuth" class="login-third-auth-wrap">
            <div class="step">
              <p>① 使用easyWeCom需通过企业微信授权进行企业验证</p>
              <p>② 未注册企业微信的用户请先注册</p>
              <p>③ 完成授权后，需扫码登录系统完成初始化配置</p>
            </div>
            <div class="third-btn-area">
              <el-button v-show="!isGoneAuth" class="primary-btn" type="primary" @click="gotoAuth">我是企业管理员，去授权</el-button>
              <el-button v-show="isGoneAuth" class="primary-btn" type="primary" @click="isAuth = false; isGoneAuth = false; isEnterPriseUnAuth = false;">我已授权，去扫码登录</el-button>
              <el-button v-show="isGoneAuth" @click="gotoAuth">重新授权</el-button>
              <el-button @click="gotoRegister">还没有企业微信，去注册</el-button>
            </div>
          </div>
          <div
            v-show="isThird && !isAuth && !isEnterPriseUnAuth && !isEnterPriseUnConfig"
            class="login-third-wrap"
            :style="authRedict ? 'justify-content: center;' : ''"
          >
            <div v-if="!authRedict" class="step">
              <p>① 企业已注册easyWeCom，员工可直接扫码登录</p>
              <p>② 企业未注册easyWeCom，需要企业管理员前往授权</p>
            </div>
            <div v-show="isThird && !isAuth && !isEnterPriseUnAuth && !isEnterPriseUnConfig" class="third-btn-area">
              <el-button class="primary-btn" :loading="loginLoading" type="primary" @click="gotoLogin">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-work-logo" />
                </svg>企业微信扫码登录
              </el-button>
              <el-button v-if="!authRedict" style="color:#6bb4ab;" @click="isAuth = true">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-easyWeCom-logo" />
                </svg>授权easyWeCom
              </el-button>
            </div>
          </div>
          <div v-show="activeTab === qrCodeLoginType && !isThird" class="login-qrcode-wrap">
            <div v-show="hasEnterprise" class="login-info">
              <img src="@/assets/image/sound.png">
              <span>员工请在此使用企业微信扫码登录</span>
            </div>
            <div v-show="hasEnterprise" class="qrcode-area">
              <div id="qrcode" class="qrcode" />
            </div>
            <div v-show="!hasEnterprise" class="no-enterprise-info">
              <el-alert
                title="系统未配置有效企业，请联系系统管理员"
                type="warning"
                :closable="false"
                show-icon
              />
            </div>
          </div>
          <el-form
            v-show="activeTab === passwordLoginType"
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-alert
              title="系统超级管理员请在此登录"
              type="warning"
              :closable="false"
              show-icon
            />
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                auto-complete="off"
                placeholder="请输入账号"
                @change="autoSetPwd"
              />
              <i class="iconfont icon-account" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                :type="pwdVisible? 'text' : 'password'"
                auto-complete="off"
                placeholder="请输入密码"
              />
              <i class="iconfont icon-password" />
              <i
                :class="[!pwdVisible ? 'icon-invisible' : 'icon-visible', 'iconfont']"
                @click="changePwdVisible"
              />
            </el-form-item>
            <el-form-item prop="code">
              <el-input
                v-model="loginForm.code"
                auto-complete="off"
                placeholder="请输入验证码"
                style="width: 63%"
                @keyup.enter.native="handleLogin"
              />
              <i class="iconfont icon-verification" />
              <div class="login-code">
                <img :src="codeUrl" class="login-code-img" @click="getCode">
              </div>
            </el-form-item>
            <el-checkbox
              v-model="loginForm.rememberMe"
              class="fl"
              style="margin:0px 0px 25px 0px;padding: 10px 0 0 5px;"
            >记住密码</el-checkbox>
            <el-form-item style="width:100%;">
              <el-button
                :loading="loading"
                size="medium"
                type="primary"
                style="width:100%;"
                class="primary-btn"
                @click.native.prevent="handleLogin"
              >
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>
          </el-form>
          <img v-if="isEnterPriseUnAuth" class="login-bg-error" :src="require('@/assets/image/login-unauth-bg.svg')" alt="">
          <img v-else-if="isEnterPriseUnConfig" class="login-bg-error" :src="require('@/assets/image/login-unconfig-bg.svg')" alt="">
          <img v-else class="login-bg-default" :src="require('@/assets/image/login_bg.svg')" alt="">
        </div>
      </div>
    </div>
    <div class="cp" style="position: absolute; bottom: 20px; width: 100%; text-align: center; color: #999;" @click="openLink">{{ icp }}</div>
  </div>
</template>

<script>
import { getCodeImg, findWxQrLoginInfo, getPreAuthCode, getPreLoginParam, getPermanentCode, webLogin } from '@/api/login';
import Cookies from 'js-cookie';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import { clearSearchWithoutReload, getNowTheme } from '@/utils/common';
import { Notification } from 'element-ui';
import { SERVER_TYPE_THIRD } from '@/utils/constant';
import { setToken } from '@/utils/auth';

const CODE = 'CODE';
const STATE = 'STATE';
const TAB_LOGIN_BY_QRCODE = 1;
const TAB_LOGIN_BY_PASSWORD = 2;
const COOKIE_EXPIRE = 30;
const AUTH_STATE = 'AUTH_STATE';
const THIRD_LOGIN_STATE = 'THIRD_LOGIN_STATE';
const SERVER_TYPE = 'SERVER_TYPE';
const WEB_LOGIN = 'WEB_LOGIN';
// 企业未授权code
const ENTERPRISE_UNAUTH_CODE = 1001;
// 未配置通讯录code
const ENTERPRISE_UNCONFIG_CODE = 1000;
export default {
  name: 'Login',
  data() {
    return {
      activeTab: TAB_LOGIN_BY_QRCODE,
      hasEnterprise: true,
      codeUrl: '',
      cookiePassword: '',
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        code: ''
      },
      loginRules: {
        username: [
          { required: true, trigger: 'submit', message: '用户名不能为空' }
        ],
        password: [
          { required: true, trigger: 'submit', message: '密码不能为空' }
        ],
        code: [
          { required: true, trigger: 'submit', message: '验证码不能为空' }
        ]
      },
      loading: false,
      redirect: undefined,
      dialogVisible: true,
      isDemonstrationLogin: false,
      pwdVisible: false,
      logoTop: 0,
      isThird: Cookies.get(SERVER_TYPE) === SERVER_TYPE_THIRD || false, // 是否为3方登录
      isAuth: false, // 是否在授权tab
      isGoneAuth: false, // 是否跳转过授权页
      authRedict: false, // 是否从授权页重定向到该页面
      thirdLoginUrl: '', // 三方登录url
      isEnterPriseUnAuth: false, // 登录验证企业是否未授权
      isEnterPriseUnConfig: false, // 登录验证是否未配置完善
      qrCodeLoginType: TAB_LOGIN_BY_QRCODE,
      passwordLoginType: TAB_LOGIN_BY_PASSWORD,
      loginLoading: false,
      // 免密登录加载状态
      webLoginLoading: false,
      // 网站备案
      icp: ''
    };
  },

  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  mounted() {
    this.setLogoTop();
    window.addEventListener('resize', this.setLogoTop);
    this.getServerType();
    this.checkCode();
    this.checkAuthCode();
  },
  created() {
    getNowTheme();
  },
  methods: {
    // 检查是否为非三方扫码回调
    checkCode() {
      const search = window.location.href;
      const code = Cookies.get(CODE);
      const state = Cookies.get(STATE);
      // 已经登录
      if (code) {
        if (state === WEB_LOGIN) {
          const WEB_LOGIN_CODE = search.match(/code=(.*)&state/)[1];
          const WEB_LOGIN_STATE = search.match(/state=(.*)#/)[1];
          const params = {
            code: WEB_LOGIN_CODE,
            state: WEB_LOGIN_STATE
          };
          webLogin(params).then(res => {
            Cookies.remove(CODE);
            Cookies.remove(STATE);
          })
            .catch(() => {
              Cookies.remove(CODE);
              Cookies.remove(STATE);
            });
        } else {
          this.wecomLogin(code, state);
        }
      } else if (search.includes('code=') && !search.includes('auth_code=') && search.includes('&state=')) {
        const code = search.match(/code=(.*)&state/)[1];
        // 免密登录
        if (search.match(/state=(.*)#/)[1] === WEB_LOGIN) {
          const state = search.match(/state=(.*)#/)[1];
          Cookies.set(CODE, code);
          Cookies.set(STATE, state);
          const params = {
            code: code,
            state: state
          };
          this.webLoginLoading = true;
          webLogin(params).then(res => {
            setToken(res.data.token);
            this.$router.push({ path: this.redirect || '/' });
            Cookies.remove(CODE);
            Cookies.remove(STATE);
            this.webLoginLoading = false;
          })
            .catch(() => {
              this.webLoginLoading = false;
              Cookies.remove(CODE);
              Cookies.remove(STATE);
            });
        } else {
          const state = Number(search.match(/state=(.*)&/)[1]);
          Cookies.set(CODE, code);
          Cookies.set(STATE, state);
          window.location.href = '/';
        }
      }
    },
    // 检查是否为三方登录/授权回调
    checkAuthCode() {
      const search = window.location.href;
      if (search.includes('auth_code=')) {
        const authCode = search.match(/auth_code=(.*)&state/)[1];
        // 授权回调
        if (search.includes(`state=${AUTH_STATE}`)) {
          this.authRedict = true;
          getPermanentCode({
            authCode
          }).then(() => {
            clearSearchWithoutReload();
          });
        } else if (search.includes(`state=${THIRD_LOGIN_STATE}`)) {
          // 三方登录扫码回调
          this.qrcodeLogin3rd(authCode);
        }
      }
    },
    // 跳转至企微注册页
    gotoRegister() {
      window.location.href = 'https://work.weixin.qq.com/wework_admin/register_wx';
    },
    // 跳转至三方登录页
    gotoLogin() {
      window.location.href = this.thirdLoginUrl;
    },
    // 跳转至授权页
    async gotoAuth() {
      this.isGoneAuth = true;
      const newWindow = window.open(); // //先打开临时窗体，由于是点击事件内触发不是异步接口返回触发，所以不会被拦截
      getPreAuthCode().then(res => {
        const { suiteId, preAuthCode } = res.data;
        const redirect_uri = encodeURIComponent(window.location.origin);
        newWindow.location.href = `https://open.work.weixin.qq.com/3rdapp/install?suite_id=${suiteId}&pre_auth_code=${preAuthCode}&redirect_uri=${redirect_uri}&state=${AUTH_STATE}`;
      }).catch((e) => {
        newWindow.close(); // 如果接口报错，关闭该窗口
        console.error('error:', e);
      });
    },
    // 配置企微后重新扫码
    reThirdScan() {
      this.isEnterPriseUnConfig = false;
      this.isEnterPriseUnAuth = false;
    },
    // 获取服务商类型：三方/非三方
    getServerType() {
      this.$store.dispatch('GetServerType').then(res => {
        this.isThird = res.data.serverType === SERVER_TYPE_THIRD;
        Cookies.set(SERVER_TYPE, res.data.serverType);
        this.getWxConfig(this.isThird);
        this.icp = res?.data?.icp;
      });
    },
    getWxConfig(isThird) {
      if (isThird) {
        getPreLoginParam().then(res => {
          const { appid } = res.data;
          const usertype = 'member';
          const redirectUri = encodeURIComponent(window.location.origin);
          this.thirdLoginUrl = `https://open.work.weixin.qq.com/wwopen/sso/3rd_qrConnect?appid=${appid}&redirect_uri=${redirectUri}&state=${THIRD_LOGIN_STATE}&usertype=${usertype}`;
        });
        return;
      }
      findWxQrLoginInfo().then(res => {
        if (res.data) {
          const { corpId, agentId, status, h5DoMainName } = res.data;
          const WwLogin = window.WwLogin;
          new WwLogin({
            id: 'qrcode',
            'appid': corpId,
            'agentid': agentId,
            'redirect_uri': (h5DoMainName.match(/https?:\/\/(.*)/) ? '' : 'http://') + h5DoMainName.slice(0, h5DoMainName.lastIndexOf(':') === -1 ? h5DoMainName.length : h5DoMainName.lastIndexOf(':')) + ':' + window.location.port,
            'state': status,
            href: 'https://wechattest-1253559996.cos.ap-guangzhou.myqcloud.com/qrcode.css',
            'lang': 'zh'
          });
        } else {
          this.hasEnterprise = false;
          this.changeActiveTab(TAB_LOGIN_BY_PASSWORD);
        }
      }).catch(() => {
        this.hasEnterprise = false;
        this.changeActiveTab(TAB_LOGIN_BY_PASSWORD);
      });
    },
    wecomLogin(code, state) {
      this.$store
        .dispatch('Login', { code, state, type: 'qrcode' })
        .then(() => {
          this.$router.push({ path: this.redirect || '/' });
          Cookies.remove(CODE);
          Cookies.remove(STATE);
        })
        .catch(() => {
          Cookies.remove(CODE);
          Cookies.remove(STATE);
        });
    },
    qrcodeLogin3rd(authCode) {
      this.loginLoading = true;
      clearSearchWithoutReload();
      this.$store
        .dispatch('Login', { authCode, type: 'third' })
        .then(() => {
          this.$router.push({ path: this.redirect || '/' });
        })
        .catch((err) => {
          this.loginLoading = false;
          if (err.code === ENTERPRISE_UNAUTH_CODE) {
            this.isEnterPriseUnAuth = true;
          } else if (err.code === ENTERPRISE_UNCONFIG_CODE) {
            this.isEnterPriseUnConfig = true;
          } else {
            Notification.error({
              title: err.msg
            });
          }
        });
    },
    changeActiveTab(tab) {
      this.activeTab = tab;
      if (tab === TAB_LOGIN_BY_PASSWORD) this.getCode();
    },
    setLogoTop() {
      // eslint-disable-next-line no-magic-numbers
      this.logoTop = (document.getElementsByClassName('login')[0]?.offsetTop - 52) / 2;
    },
    getCode() {
      getCodeImg().then((res) => {
        this.codeUrl = 'data:image/gif;base64,' + res.img;
        this.uuid = res.uuid;
      });
    },
    getCookie(username) {
      const password = Cookies.get(username);
      const rememberMe = Cookies.get('rememberMe');
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password:
          password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      };
    },
    autoSetPwd() {
      this.getCookie(this.loginForm.username);
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set(this.loginForm.username, encrypt(this.loginForm.password), {
              expires: COOKIE_EXPIRE
            });
            Cookies.set('rememberMe', this.loginForm.rememberMe, {
              expires: COOKIE_EXPIRE
            });
          } else {
            Cookies.remove(this.loginForm.username);
            Cookies.remove('rememberMe');
          }
          this.loginForm.uuid = this.uuid;
          this.$store
            .dispatch('Login', this.loginForm)
            .then(() => {
              if (!this.hasEnterprise) {
                this.$router.push({ path: '/system/sysSetting/enterpriseWechat', query: null });
              } else {
                this.$router.push({ path: this.redirect || '/', query: null });
              }
            })
            .catch(() => {
              this.loading = false;
              this.getCode();
            });
        }
      });
    },
    changePwdVisible() {
      this.pwdVisible = !this.pwdVisible;
    },
    openLink() {
      const ICP_LINK = 'https://beian.miit.gov.cn/';
      window.open(ICP_LINK);
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '~@/styles/mixin.scss';
.login-wrap {
  position: relative;
}
.login-tab-wrap {
  position: absolute;
  left: 0;
  top: -38px;
  display: flex;
}
.login-tab {
  font-size: 13px;
  height: 38px;
  line-height: 38px;
  color: #AAAAAA;
  background: transparent;
  display: flex;
  cursor: pointer;
  &.login-tab2 {
    margin-left: -25px;
  }
  .login-tab-text {
    width: 95px;
    text-align: center;
    background: #C1DDD8;
    color: $green;
  }
  .login-tab-before {
    width: 0;
    height: 0;
    border-bottom: 38px solid #C1DDD8;
    border-left: 25px solid transparent;
  }
  .login-tab-after {
    width: 0;
    height: 0;
    border-bottom: 38px solid #C1DDD8;
    border-right: 25px solid transparent;
  }
  &.active {
    z-index: 99;
    .login-tab-text {
      background: #fff;
    }
    .login-tab-before, .login-tab-after {
      border-bottom-color: #fff;
    }
  }
}

.login-qrcode-wrap {
  width: 310px;
  .el-alert {
    margin-left: -20px;
    margin-top: 140px;
  }
}
#qrcode {
  height: 230px;
}
.qrcode-area {
  /* width: 200px; */
  color: #7f7f7f;
  font-size: 13px;
  text-align: center;
  img {
    margin-bottom: 10px;
    width: 198px;
  }
  a img {
    width: unset;
  }
}
.login-info {
  padding-top: 20px;
  display: flex;
  align-items: center;
  color: #F59A23;
  font-size: 14px;
  span {
    margin-top: -3px;
  }
  img {
    margin-right: 10px;
  }
}

.el-alert {
  background: #fff;
  color: #F59A23;
  font-size: 14px;
  margin-left: -30px;
}

.login-logo {
  position: absolute;
}
.login {
  width: 100%;
  height: 570px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 90px 0 100px;
  background-image: url('../assets/image/login_bg1.svg');
  background-size: cover;
}

.login-form {
  background: #ffffff;
  border-radius: 30px;
  padding-top: 20px;
  position: relative;
  width: 310px;
  .input-icon {
    height: 42px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 90px;
  height: 32px;
  float: right;
  img {
    cursor: pointer;
    height: 32px;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 38px;
}
.login /deep/.el-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0vh !important;
}
.el-dialog__body {
  padding: 0px 20px;
}
.login-form-wrap {
  position: relative;
  border-radius: 0 30px 30px 30px;
  background: #fff;
  height: 331px;
  width: 749px;
  margin: 0 auto;
  display: flex;
  padding: 0 32px;
}
.login-bg-default, .login-bg-error {
  width: 322px;
  height: 243px;
  margin-top: 60px;
  margin-left: 25px;
}
.login-bg-error {
  margin-top: 45px;
}
.el-form-item {
  padding: 5px!important;
  position: relative;
  i {
    position: absolute;
    left: 6px;
    top: 1px;
    color: #a6a6a6;
  }
  .icon-invisible, .icon-visible {
    left: unset;
    right: 26px;
    top: 2px;
  }
  .icon-invisible {
    font-size: 8px;
  }
  .icon-visible{
    font-size: 11px;
  }
}
.el-form-item:hover {
  background: none;
}
.el-button {
  font-size: 18px;
  height: 36px;
  padding: 0;
  width: 280px!important;
}
.login-third-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 320px;
  padding: 30px 0 50px;
  svg {
    width: 25px;
    height: 21px;
    margin-right: 10px;
  }
}
.login-third-auth-wrap {
  padding-top: 30px;
  padding-bottom: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.step {
  border: 1px solid #aaa;
  padding: 15px;
  font-size: 12px;
  color: #7F7F7F;
  line-height: 20px;
  border-radius: 3px;
}
.third-btn-area {
  width: 100%;
  /deep/ .el-button {
    margin-left: 0;
    margin-top: 10px;
    font-size: 14px;
    line-height: 32px;
    width: 100%!important;
    border-radius: 5px;
    &.el-button--primary {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    >span {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
.login-third-err-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 330px;
  .err-title {
    font-size: 24px;
    color: #333;
    font-weight: 700;
    margin-bottom: 15px;
  }
  .err-info {
    color: #7f7f7f;
    font-size: 14px;
    text-align: center;
    line-height: 18px;
  }
  .el-button {
    height: 36px;
    padding: 0 15px;
    margin-top: 35px;
    font-size: 13px;
    width: unset!important;
  }
}
.el-button--default {
  color:$baseColor !important;
}
.el-button--default:hover {
  background-color: $color-theme2-4!important;
  color:$baseColor !important;
  border: 1px solid $baseColor;
}
/deep/ .el-input__inner:focus{
  border: 1px solid $baseColor;
}

/deep/ .is-checked >.el-checkbox__inner {
  background-color: $baseColor!important;
  border-color: $baseColor!important;
  box-shadow: -1px 0 0 0 $baseColor!important;
}
/deep/ .is-checked >.el-checkbox__label {
color: $baseColor!important;
}
.primary-btn {
  background-color: $green;
  border-color: $green;
  &:hover, &:focus {
    border-color: $green;
    background-color: $green;
  }
}
</style>
