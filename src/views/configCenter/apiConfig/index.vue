<!--
 * @Description: api配置
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="app-container">
    <div class="top-explain">
      <div class="left-icon">
        <img :src="DEFAULT_ICON" :height="140" alt="">
      </div>
      <div class="right-text">
        <div class="explain-title">API配置</div>
        <div class="explain-info">
          EasyInk开放部分接口，若您的企业有开发能力，可以借助接口实现企业服务及企业微信的集成。
        </div>
      </div>
    </div>
    <!-- TODO 若需要多种api的配置 可将 step-content 类抽取 成组件 -->
    <div class="step-content">
      <div class="content-title">
        接口开发信息
        <el-divider direction="vertical" />
        <span class="title-extra theme-text-color" @click="checkApiWord"> 查看接口文档 </span>
      </div>
      <div class="content dev-info">
        <div class="content-info mb20">
          <i class="el-icon-warning" />
          企业可通过EasyInk提供的API，实现企业内部数据与企业微信的数据互通，包括且不限于获取客户资料、打标签、数据统计。
        </div>
        <el-form
          :model="apiInfo"
          label-width="80px"
          style="width: 620px"
        >
          <el-form-item label="AppID">
            <div class="flex">
              <el-input
                v-model="apiInfo.appId"
                placeholder=""
                style="width: 430px"
                disabled
              />
              <el-button
                v-if="!apiInfo.appSecret"
                type="text"
                class="ml10 f14"
                @click="createDevAccount"
              >生成开发账号</el-button>
            </div>
            <div class="form-tips">企业调用API的身份凭证</div>
          </el-form-item>
          <el-form-item label="AppSecret">
            <el-input
              v-model="apiInfo.appSecret"
              :type="apiInfo.pwdVisible ? 'password' : 'text'"
              autocomplete="new-password"
              clearable
              disabled
              style="width: 430px"
              placeholder=""
            />
            <el-button
              v-if="apiInfo.appSecret"
              type="text"
              class="ml10 f14"
              @click="refresh"
            >重置</el-button>
            <div class="form-tips">
              企业调用API的密钥，请妥善保管，泄露可能会导致重要数据泄露或损坏
            </div>
            <i
              :class="[apiInfo.pwdVisible ? 'icon-ciphertext' : 'icon-plaintext', 'iconfont']"
              @click="() => changePwdVisible('apiInfo')"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="step-content">
      <div class="content-title">消息订阅</div>
      <div class="content">
        <div class="content-info mb20">
          <i class="el-icon-warning" />
          为提高实时性，企业可设置接收事件服务器，成员添加、删除客户时将以事件形式推送到指定URL，企业接收到消息后响应处理。
        </div>
        <el-form
          ref="msgSubForm"
          :model="msgSubForm"
          label-width="130px"
          label-position="right"
          style="width: 680px"
        >
          <div v-for="(item,index) in msgSubForm.messageSubList" :key="item.id" class="aic">
            <div class="message-sub">
              <el-form-item
                :key="item.id"
                label="回调地址"
                :prop="'messageSubList.' + index + '.callbackUrl'"
                :rules="[
                  { required: true,validator:callbackUrlValidator, trigger: ['blur','change']}
                ]"
              >
                <el-input
                  v-model="item.callbackUrl"
                  placeholder="以http://或https://开头"
                  style="width: 430px"
                  clearable
                />
                <el-button
                  v-show="item.originalCallbackUrl !== item.callbackUrl"
                  type="text"
                  class="ml10 f14"
                  style="border:none"
                  @click="save(item)"
                >保存</el-button>
              </el-form-item>
              <el-form-item
                label="Token"
                :rules="[{ required: true }]"
              >
                <el-input
                  v-model="token"
                  placeholder=""
                  disabled
                  style="width: 430px"
                />
                <el-button
                  v-copy="token"
                  type="text"
                  class="ml10 f14"
                >复制</el-button>
              </el-form-item>
              <el-form-item
                label="EncodingAESKey"
                :rules="[{ required: true }]"
              >
                <el-input
                  v-model="encodingAesKey"
                  disabled
                  style="width: 430px"
                  placeholder=""
                />
                <el-button
                  v-copy="encodingAesKey"
                  type="text"
                  class="ml10 f14"
                >复制</el-button>
              </el-form-item>
            </div>
            <div v-if="item.showDel" class="delete fcc ml20" title="删除" @click="deleteMsgSub(item)">
              <i class="el-icon-delete" />
            </div>
          </div>
        </el-form>
        <el-button
          v-show="showAddAddress"
          icon="el-icon-plus"
          type="primary"
          plain
          @click="addAddress"
        >添加地址</el-button>
      </div>
    </div>
    <div class="step-content">
      <div class="content-title">在SCRM系统嵌入EasyInk侧边栏</div>
      <div class="content">
        <div class="content-info mb20">
          <i class="el-icon-warning" />
          可在第三方SCRM系统中嵌入EasyInk的侧边栏，便于员工在与客户沟通过程中查看客户资料，发送素材和话术等物料。
        </div>
        <el-steps direction="vertical" space="120px" class="steps" :active="10">
          <el-step title="填写SCRM提供的开发信息">
            <template #description>
              <el-form
                ref="form"
                :model="form"
                label-width="80px"
                :rules="rules"
                label-position="right"
                style="width: 630px"
              >
                <el-form-item label="AppID" prop="appId">
                  <el-input
                    v-model="form.appId"
                    placeholder="请输入SCRM的AppID"
                    style="width: 430px"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="AppSecret" prop="appSecret">
                  <el-input
                    v-model="form.appSecret"
                    :type="form.pwdVisible ? 'password' : 'text'"
                    autocomplete="new-password"
                    clearable
                    style="width: 430px"
                    placeholder="请输入SCRM的AppSecret"
                  />
                  <i
                    :class="[form.pwdVisible ? 'icon-ciphertext' : 'icon-plaintext', 'iconfont','scrm-appsecret']"
                    @click="() => changePwdVisible('form')"
                  />
                  <el-button
                    type="primary"
                    class="ml10 f14"
                    @click="submitForm"
                  >保存</el-button>
                </el-form-item>
              </el-form>
            </template>
          </el-step>
          <el-step title="复制页面路径配置到SCRM">
            <template #description>
              <el-form
                ref="domainForm"
                label-width="68px"
                label-position="right"
              >
                <el-form-item label="素材库">
                  <el-input
                    :value="materialDomain"
                    placeholder=""
                    style="width: 430px"
                    disabled
                  />
                  <el-button
                    v-show="!(form.appId && form.appSecret) || !H5Domain"
                    type="text"
                    class="ml10 f14"
                    @click="copyText"
                  >复制</el-button>
                  <el-button
                    v-show="H5Domain && form.appId && form.appSecret"
                    v-copy="materialDomain"
                    type="text"
                    class="ml10 f14"
                  >复制</el-button>
                </el-form-item>
                <el-form-item label="客户画像">
                  <el-input
                    :value="customerPortraitDomain"
                    placeholder=""
                    style="width: 430px"
                    disabled
                  />
                  <el-button
                    v-show="!(form.appId && form.appSecret) || !H5Domain"
                    type="text"
                    class="ml10 f14"
                    @click="copyText"
                  >复制</el-button>
                  <el-button
                    v-show="H5Domain && form.appId && form.appSecret"
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
  </div>
</template>
<script>
import { getLockSideBar, putLockSideBar } from '@/api/common';
import { create, get, refreshSecret, list, add, del, edit } from '@/api/openapi';
import DEFAULT_ICON from '@/assets/image/api-config.svg';
const MAX_MESSAGE_SUB_LENGTH = 3;
const DOMAIN_REGEX = /(http|https):\/\/([\w.]+\/?)\S*/;
export default {
  data() {
    return {
      DEFAULT_ICON,
      // 接口开发信息
      apiInfo: {
        pwdVisible: true
      },
      msgSubForm: {
        // 消息订阅列表
        messageSubList: []
      },
      // SCRM提供的开发信息
      form: {
        appId: '',
        appSecret: '',
        // 密码型输入框内容显隐
        pwdVisible: true
      },
      rules: {
        appId: [{ required: true, message: '请填写AppID', trigger: 'change' }],
        appSecret: [
          { required: true, message: '请填写AppSecret', trigger: 'change' }
        ]
      },
      loading: null
    };
  },
  computed: {
    customerPortraitDomain() {
      return (
        this.H5Domain + '/#/portrait?appId=' + this.form.appId + '&type=lock'
      );
    },
    materialDomain() {
      return this.H5Domain + '/#/chat?appId=' + this.form.appId + '&type=lock';
    },
    H5Domain() {
      return this.$store.state.enterPriseWechatConfig.h5DoMainName;
    },
    showAddAddress() {
      return this.msgSubForm.messageSubList.length < MAX_MESSAGE_SUB_LENGTH;
    },
    token() {
      return this.$store.state.enterPriseWechatConfig.token;
    },
    encodingAesKey() {
      return this.$store.state.enterPriseWechatConfig.encodingAesKey;
    }
  },
  created() {
    this.lockSideBar();
    this.getDevAccount();
    this.getMsgSubList();
  },
  methods: {
    callbackUrlValidator(rule, value, callback) {
      if (value === '') {
        callback(new Error('请输入回调地址'));
      } else {
        if (!DOMAIN_REGEX.test(value)) {
          callback(new Error('回调地址需要以http://或https://开头'));
        } else {
          callback();
        }
      }
    },
    /**
     * @description 生成开发账号
     */
    createDevAccount() {
      this.openLoading();
      create().then((res) => {
        this.apiInfo = { ...this.apiInfo, ...res.data };
      }).finally(() => {
        this.loading.close();
      });
    },
    /**
     * @description 获取开发账号
     */
    getDevAccount() {
      get().then((res) => {
        this.apiInfo = { ...this.apiInfo, ...res.data };
      });
    },
    /**
     * @description 刷新接口开发信息的AppSecret
     */
    refresh() {
      this.openLoading();
      refreshSecret().then((res) => {
        this.apiInfo.appSecret = res.data.appSecret;
      }).finally(() => {
        this.loading.close();
      });
    },
    /**
     * @description 获取消息订阅列表
     */
    getMsgSubList() {
      list().then((res) => {
        if (!res.data.length) {
          this.addAddress();
        } else {
          this.msgSubForm.messageSubList = res.data.map((k) => {
            return {
              ...k,
              originalCallbackUrl: k.callbackUrl,
              showDel: true
            };
          });
        }
      });
    },

    lockSideBar() {
      getLockSideBar().then((res) => {
        this.form = { ...this.form, ...res.data?.[0] };
      });
    },
    /**
     * @description: 改变密码型输入框内容显隐
     * @return {*}
     */
    changePwdVisible(item) {
      this[item].pwdVisible = !this[item].pwdVisible;
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
      const message = !this.H5Domain
        ? '请前往【企微配置】填写Sidebar服务域名'
        : '请填写SCRM的API配置信息';
      this.msgWarn(message);
    },
    addAddress() {
      this.msgSubForm.messageSubList.push({
        id: this.msgSubForm.messageSubList.length + 1,
        callbackUrl: '',
        originalCallbackUrl: '',
        selfAdd: true,
        showDel: false
      });
    },
    checkApiWord() {
      window.open('https://xsxda94vjq.feishu.cn/docx/PIKrda8scosoKfxYb4IcWdnsnSd');
    },
    deleteMsgSub(item) {
      this.confirmModal({
        msg: `删除后，将不再向地址“${item.callbackUrl}”推送事件，是否继续？`
      }, () => {
        this.openLoading();
        del(item.id).then(() => {
          this.msgSubForm.messageSubList = this.msgSubForm.messageSubList.filter((k) => k.id !== item.id);
          this.msgSuccess('删除成功！');
        }).finally(() => {
          this.loading.close();
        });
      });
    },
    save(item) {
      if (!item.callbackUrl) {
        return this.msgWarn('请输入回调地址');
      }
      if (!DOMAIN_REGEX.test(item.callbackUrl)) {
        return this.msgWarn('回调地址需要以http://或https://开头');
      }
      const payload = {
        callbackUrl: item.callbackUrl,
        id: item.id
      };
      this.openLoading();
      // selfAdd 由于新增编辑接口分开 增加selfAdd 判断是否是新增
      if (item.selfAdd) {
        add(payload).then((res) => {
          this.msgSubForm.messageSubList = this.msgSubForm.messageSubList.map((k) => {
            if (k.id === item.id) {
              return {
                ...res.data,
                originalCallbackUrl: res.data.callbackUrl,
                showDel: true
              };
            }
            return k;
          });
          this.msgSuccess('保存成功！');
        }).finally(() => {
          this.loading.close();
        });
        return;
      }
      edit(payload).then(() => {
        this.msgSubForm.messageSubList = this.msgSubForm.messageSubList.map((k) => {
          if (item.id === k.id) {
            k.originalCallbackUrl = item.callbackUrl;
          }
          return k;
        });
        this.msgSuccess('保存成功！');
      }).finally(() => {
        this.loading.close();
      });
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    }
  }
};
</script>
<style lang="scss" scoped>
  .dev-info {
    /deep/ .el-form-item {
      padding: 0 !important;
    }
  }
  .el-form-item:hover {
    background: none;
  }
  .el-form-item {
    position: relative;
    i {
      position: absolute;
      color: #a6a6a6;
    }
    .icon-ciphertext, .icon-plaintext {
      right: 120px;
      top: 2px;
    }
    .scrm-appsecret {
      right: 130px;
    }
  }
/deep/ .el-step__head.is-finish {
  color: #fff;
  border-color: #e0e3ea !important;
}
/deep/ .el-step__line-inner {
  border-color: #e0e3ea !important;
}
/deep/ .el-step__title.is-finish {
  color: #333 !important;
}
/deep/ .el-step__icon {
  background: #e0e3ea;
}
/deep/ .el-step__description:first {
  margin-bottom: 50px;
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
    width: 100%;
    .content {
      background-color: white;
      padding: 20px;
      .form-tips {
        color: #999;
        font-size: 12px;
        height: 24px;
        line-height: 24px;
      }
      .message-sub {
        border: 1px solid #eee;
        padding: 10px 0;
        width: fit-content;
        margin-bottom: 10px;
        padding-right: 10px;
        /deep/ .el-form-item__content {
          display: flex;
        }
      }
      .delete {
        padding: 10px;
        width: 30px;
        height: 30px;
        font-size: 14px;
        background: #f56c6c;
        border-radius: 50%;
        color: #fff;
        cursor: pointer;
      }
    }
    .content-title {
      border-left: 3px solid #6bb4ab;
      font-size: 18px;
      text-align: left;
      font-family: Roboto;
      font-weight: bold;
      padding-left: 10px;
      margin: 15px 0;
      color: #101010;
      .title-extra {
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }
    }
    .content-info {
      width: 760px;
      font-size: 12px;
      border: 1px solid #f2f2f3;
      height: 36px;
      line-height: 36px;
      border-radius: 3px;
      padding-left: 12px;
      background-color: #f2f2f3;
      color: #85888e;
      .el-icon-warning {
        color: #85888e;
        font-size: 16px;
        margin-right: 8px;
        vertical-align: text-bottom;
      }
    }
  }
}
</style>
