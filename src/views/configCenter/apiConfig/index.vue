<!--
 * @Description: api配置
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="app-container">
    <div class="top-explain">
      <div class="left-icon">
        <img
          :src="DEFAULT_ICON"
          :height="140"
          alt=""
        >
      </div>
      <div class="right-text">
        <div class="explain-title">API配置</div>
        <div class="explain-info">
          EasyInk与第三方系统对接的相关配置信息
        </div>
      </div>
    </div>
    <div class="step-content">
      <div class="content-title">打通SCRM侧边栏</div>
      <div class="content-info mb20 mt20 ml10">可在SCRM侧边栏嵌入EasyInk的侧边栏页面，便于在与客户沟通时查看对应的客户资料，发送EasyInk素材，话术等。</div>
      <el-steps direction="vertical" space="120px" class="steps" :active="10">
        <el-step title="填写SCRM的API配置信息">
          <template #description>
            <el-form ref="form" :model="form" label-width="80px" :rules="rules" label-position="right" style="width: 600px" class="mb50">
              <el-form-item label="AppID" prop="appId">
                <el-input v-model="form.appId" placeholder="请输入SCRM的AppID" style="width: 430px" clearable />
              </el-form-item>
              <el-form-item label="AppSecret" prop="appSecret">
                <el-input
                  v-model="form.appSecret"
                  :type="pwdVisible? 'text' : 'password'"
                  autocomplete="new-password"
                  clearable
                  style="width: 430px"
                  placeholder="请输入SCRM的AppSecret"
                />
                <i
                  :class="[!pwdVisible ? 'icon-ciphertext' : 'icon-plaintext', 'iconfont']"
                  @click="changePwdVisible"
                />
                <el-button type="primary" class="ml10 f14" @click="submitForm">保存</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-step>
        <el-step title="在SCRM配置侧边栏页面">
          <template #description>
            <el-form ref="domainForm" label-width="68px" label-position="right">
              <el-form-item label="素材库">
                <el-input :value="materialDomain" placeholder="" style="width: 430px" disabled />
                <el-button
                  v-show="!(form.appId && form.appSecret) || !H5Domain"
                  type="text"
                  class="ml10 f14"
                  @click="copyText"
                >复制</el-button>
                <el-button
                  v-show="H5Domain && (form.appId && form.appSecret)"
                  v-copy="materialDomain"
                  type="text"
                  class="ml10 f14"
                >复制</el-button>
              </el-form-item>
              <el-form-item label="客户画像">
                <el-input :value="customerPortraitDomain" placeholder="" style="width: 430px" disabled />
                <el-button
                  v-show="!(form.appId && form.appSecret) || !H5Domain"
                  type="text"
                  class="ml10 f14"
                  @click="copyText"
                >复制</el-button>
                <el-button
                  v-show="H5Domain && (form.appId && form.appSecret)"
                  v-copy="customerPortraitDomain"
                  type="text"
                  class="ml10 f14"
                >复制</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-step>
      </el-steps>
    </div>
  </div>

</template>
<script>
import { getLockSideBar, putLockSideBar } from '@/api/common';
import DEFAULT_ICON from '@/assets/image/api-config.svg';
export default {
  data() {
    return {
      DEFAULT_ICON,
      // 自建应用微信公众号对应配置表单
      form: {
        appId: '',
        appSecret: ''
      },
      rules: {
        appId: [
          { required: true, message: '请填写AppID', trigger: 'change' }
        ],
        appSecret: [
          { required: true, message: '请填写AppSecret', trigger: 'change' }
        ]
      },
      // 密码型输入框内容显隐
      pwdVisible: false
    };
  },
  computed: {
    customerPortraitDomain() {
      return this.H5Domain + '/#/portrait?appId=' + this.form.appId + '&type=lock';
    },
    materialDomain() {
      return this.H5Domain + '/#/chat?appId=' + this.form.appId + '&type=lock';
    },
    H5Domain() {
      return this.$store.state.enterPriseWechatConfig.h5DoMainName;
    }
  },
  created() {
    this.lockSideBar();
  },
  methods: {
    lockSideBar() {
      getLockSideBar().then((res) => {
        this.form = { ...this.form, ...res.data?.[0] };
      });
    },
    /**
     * @description: 改变密码型输入框内容显隐
     * @return {*}
     */
    changePwdVisible() {
      this.pwdVisible = !this.pwdVisible;
    },
    /**
     * @description: 微信公众号配置提交
     * @return {*}
     */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const { appId, appSecret } = this.form;
          putLockSideBar({
            appId,
            appSecret
          }).then(() => {
            this.msgSuccess('操作成功');
          });
        }
      });
    },
    copyText() {
      const message = !this.H5Domain ? '请前往【企微配置】填写Sidebar服务域名' : '请填写SCRM的API配置信息';
      this.msgWarn(message);
    }
  }
};
</script>
<style lang="scss" scoped>
  .el-form-item {
    padding: 5px!important;
    position: relative;
    margin-bottom: 10px !important;
    i {
      position: absolute;
      color: #a6a6a6;
    }
    .icon-ciphertext, .icon-plaintext {
      right: 110px;
      top: 2px;
    }
  }
  .el-form-item:hover {
    background: none;
  }
  /deep/ .el-step__head.is-finish{
    color: black;
    border-color: black !important;
  }
  /deep/ .el-step__line-inner {
    border-color: #B9BDC5 !important;
  }
  /deep/ .el-step__title.is-finish {
    font-weight: bold;
    color: black !important;
  }
  .app-container {
    width: 100%;
    height: 100%;
    padding: 0;
    // 功能说明
    .top-explain {
      display: flex;
      align-items: center;
      width: 100%;
      height: 140px;
      margin-bottom: 10px;
      background-color: white;
      .left-icon {
        width: 140px;
        height: 140px;
      }
      .right-text {
        .explain-title {
          font-size: 20px;
          line-height: 23px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .explain-info {
          font-size: 16px;
          .el-button {
            font-size: 16px;
            padding: 0;
          }
        }
      }
    }
    .step-content {
      background-color: white;
      width: 100%;
      height: calc(100% - 150px);
      padding: 20px;
      overflow: scroll;
      .content-title {
        border-left: 3px solid #6BB4AB;
        font-size: 18px;
        text-align: left;
        font-family: Roboto;
        font-weight: bold;
        padding-left: 10px;
      }
      .content-info  {
        font-size: 16px;
      }
    }
  }
</style>
