<!--
 * @Description: 验证码验证组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="tel-validation">
    <span>为确保企业帐号安全，请输入发送至
      {{ dealTel(tel) }} 的6位验证码。如未收到，请尝试重新获取验证码</span>
    <div class="input-countdown">
      <el-input
        v-model="validateCode"
        maxlength="6"
        class="code-input"
        placeholder="请输入6位验证码"
      />
      <span v-if="!isAgainGetCode" class="code-time">{{ codeTime }}s后可重新获取</span>
      <el-button v-else type="text" class="code-time" @click="againGetCode">重新获取</el-button>
    </div>
    <!-- <el-button @click="closeTime">关闭定时器</el-button> -->
    <RequestButton
      button-type="validate"
      :request-method="validate"
      type="primary"
    >验证</RequestButton>
  </div>
</template>

<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
// 定时器定时1s
const GET_CODE_TIME = 1000;
// 倒计时
const AGAIN_GET_CODE = 60;
// eslint-disable-next-line no-magic-numbers
const CONTRAST_ARR = [3, 4, 5, 6];
export default {
  components: { RequestButton },
  props: {
    tel: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      // 短信验证码
      validateCode: '123456',
      // 重新获取
      isAgainGetCode: true,
      // 倒计时
      codeTime: AGAIN_GET_CODE,
      // 倒计时定时器
      codeTimer: null
    };
  },
  watch: {
  },
  methods: {
    /**
     * 处理手机号,将部分位数隐藏，仅展示前后几位
     */
    dealTel(tel) {
      let newTel = '';
      for (let i = 0; i < tel.toString().length; i++) {
        if (!CONTRAST_ARR.includes(i)) {
          newTel = newTel + tel.toString()[i];
        } else {
          newTel = newTel + '*';
        }
      }
      return newTel;
    },
    /**
     * 验证短信验证码是否正确
     */
    validate() {
      if (!this.validateCode) {
        changeButtonLoading(this.$store, 'validate');
        return this.msgWarn('验证码不能为空');
      }
      //   在此处判断验证码是否正确
      // setTimeout(() => {
      //   this.msgError('短信验证码错误');
      //   changeButtonLoading(this.$store, 'validate');
      // }, GET_CODE_TIME);
      setTimeout(() => {
        this.$emit('loginSuccessAndConfig');
        changeButtonLoading(this.$store, 'validate');
      }, GET_CODE_TIME);
      // setTimeout(() => {
      // this.countDownTime();
      //   changeButtonLoading(this.$store, 'validate');
      // }, GET_CODE_TIME);
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
      //   触发接口获取验证码
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
