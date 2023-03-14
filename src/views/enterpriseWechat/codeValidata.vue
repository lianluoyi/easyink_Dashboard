<!--
 * @Description: 验证码验证组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="tel-validation">
    <span>为确保企业帐号安全，请输入发送至
      {{ tel }}  的6位验证码。如未收到，请尝试重新获取验证码</span>
    <div class="input-countdown">
      <el-input
        v-model="captcha"
        maxlength="6"
        class="code-input"
        placeholder="请输入6位验证码"
      />
      <span v-if="!isAgainGetCode" class="code-time">{{ codeTime }}s后可重新获取</span>
      <el-button v-else type="text" class="code-time" @click="againGetCode">重新获取</el-button>
    </div>
    <RequestButton
      button-type="validate"
      :request-method="validate"
      type="primary"
    >验证</RequestButton>
  </div>
</template>

<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import { confirmMobileCaptcha, sendCaptcha } from '@/api/admin';
import { changeButtonLoading } from '@/utils/common';
// 定时器定时1s
const GET_CODE_TIME = 1000;
// 倒计时
const AGAIN_GET_CODE = 60;
export default {
  components: { RequestButton },
  props: {
    tel: {
      type: String,
      default: null
    },
    tlKey: {
      type: String,
      default: ''
    },
    qrcodeKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 短信验证码
      captcha: '',
      // 重新获取
      isAgainGetCode: false,
      // 倒计时
      codeTime: AGAIN_GET_CODE,
      // 倒计时定时器
      codeTimer: null
    };
  },
  watch: {
  },
  mounted() {
    this.countDownTime();
  },
  methods: {
    /**
     * 验证短信验证码是否正确
     */
    validate() {
      if (!this.captcha) {
        changeButtonLoading(this.$store, 'validate');
        return this.msgWarn('验证码不能为空');
      }
      const params = {
        captcha: this.captcha,
        tlKey: this.tlKey,
        qrcodeKey: this.qrcodeKey
      };
      confirmMobileCaptcha(params).then((res) => {
        changeButtonLoading(this.$store, 'validate');
        this.$emit('loginSuccessAndConfig');
        this.closeTime();
      });
    },
    // 关闭定时器
    closeTime() {
      clearInterval(this.codeTimer);
    },
    // 倒计时定时器
    countDownTime() {
      this.codeTimer = setInterval(() => {
        this.codeTime -= 1;
        if (!this.codeTime) {
          clearInterval(this.codeTimer);
          this.isAgainGetCode = true;
        }
      }, GET_CODE_TIME);
    },
    /**
     * 重新获取验证码
     */
    againGetCode() {
      this.codeTime = AGAIN_GET_CODE;
      this.isAgainGetCode = false;
      this.countDownTime();
      sendCaptcha({ tlKey: this.tlKey, qrcodeKey: this.qrcodeKey }).then(() => {
        this.msgSuccess('发送成功');
      });
    }
  }
};
</script>

<style scoped lang='scss'>
.tel-validation {
  margin-top: 10px;
  color: black;
  .input-countdown {
    display: flex;
    color: #999999;
    align-items: center;
    margin: 17px 0 15px 0;
    /deep/ .el-input {
      width: 180px;
    }
    .code-time {
      text-align: center;
      margin-left: 10px;
    }
  }
}
</style>
