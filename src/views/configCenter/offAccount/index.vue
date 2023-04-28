<!--
 * @Description: 公众号管理页
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div class="app-container">
    <div class="top-explain">
      <div class="left-icon">
        <img :src="DEFAULT_ICON" :height="140">
      </div>
      <div class="right-text">
        <div class="explain-title">公众号管理</div>
        <div class="explain-info">
          雷达库等功能需要使用客户的唯一标识unionid，授权公众号后才可正常使用。
          <el-button type="text" class="blue-btn" @click="openBlackUrl(CONFIG_INTRODUCE_URL)">配置说明</el-button>
        </div>
      </div>
    </div>
    <div class="step-content">
      <el-steps direction="vertical" space="120px" class="steps" :active="10">
        <el-step title="绑定微信开发者ID">
          <template #description>
            <div class="f14 mb50">登录企业微信管理后台，进入<el-button type="text" class="blue-btn f14" @click="openBlackUrl(MANAGE_BACKSTAGE_URL)">【客户与上下游】 -【客户联系】</el-button>，绑定微信开发者ID</div>
          </template>
        </el-step>
        <!-- 自建应用 -->
        <el-step v-if="!isDKCorp" title="配置网页授权域名">
          <template #description>
            <div class="mb50">
              <div class="f14">复制以下链接，在<el-button type="text" class="blue-btn f14" @click="openBlackUrl(WX_PAAS_URL)">微信公众平台</el-button>给公众号配置网页授权域名，用于获取用户基本信息</div>
              <el-form ref="domainForm" label-width="80px" label-position="right">
                <el-form-item label="域名">
                  <el-input :value="domain" placeholder="网页授权域名" style="width: 430px" disabled />
                  <el-button
                    id="copy-domain"
                    v-copy="domain"
                    type="text"
                    class="ml10 f14"
                  >复制</el-button>
                </el-form-item>
              </el-form>
            </div>
          </template>
        </el-step>
        <el-step v-if="!isDKCorp" title="填写公众号信息">
          <template #description>
            <div class="f14 mb5" style="line-height: 28px">将公众号的开发信息填入以下表单</div>
            <el-form ref="form" :model="form" label-width="80px" :rules="rules" label-position="right" style="width: 600px">
              <el-form-item label="AppID" prop="officialAccountAppId">
                <el-input v-model="form.officialAccountAppId" placeholder="请输入公众号AppID" autocompleted="new-password" style="width: 430px" clearable />
              </el-form-item>
              <el-form-item label="AppSecret" prop="officialAccountAppSecret">
                <el-input
                  v-model="form.officialAccountAppSecret"
                  :type="pwdVisible? 'text' : 'password'"
                  auto-complete="new-password"
                  clearable
                  style="width: 430px"
                  placeholder="请输入公众号AppSecret"
                />
                <i
                  :class="[!pwdVisible ? 'icon-ciphertext' : 'icon-plaintext', 'iconfont']"
                  @click="changePwdVisible"
                />
                <el-button v-if="checkPermi(['officialAccountsManager:set'])" type="primary" class="ml10 f14" @click="submitForm">保存</el-button>
              </el-form-item>
            </el-form>
          </template>
        </el-step>
        <!-- 代开发 -->
        <el-step v-if="isDKCorp" title="授权已认证公众号">
          <template #description>
            <div class="mb20 f14">在EasyInk授权已认证且绑定微信开放平台的公众号（公众号的企业主体与当前企业须保持一致）</div>
            <el-button v-hasPermi="['officialAccountsManager:set']" class="mb15 f14" type="primary" :loading="authLoading" @click="authBtnClick">授权公众号</el-button>
            <div class="off-account-list-wrap">
              <div class="off-account-list">
                <OffAccountCard v-for="item in offAccountList" :key="item.id" :card-data="item" />
              </div>
            </div>
          </template>
        </el-step>
      </el-steps>
    </div>
  </div>

</template>
<script>
import OffAccountCard from './offAccountCard.vue';
import { getConfig, updateConfig, getWechatOpenAuthUrl, getWechatOpenDomain } from '@/api/wechatopen';
import { CONFIG_INTRODUCE_URL, WX_PAAS_URL, MANAGE_BACKSTAGE_URL } from '@/utils/constant';
import { checkPermi } from '@/utils/permission';
import DEFAULT_ICON from '@/assets/image/conversation-unconfig.svg';
export default {
  components: { OffAccountCard },
  data() {
    return {
      DEFAULT_ICON,
      CONFIG_INTRODUCE_URL,
      MANAGE_BACKSTAGE_URL,
      WX_PAAS_URL,
      // 添加授权公众号按钮loading
      authLoading: false,
      // 待开发应用公众号配置列表
      offAccountList: [],
      // 自建应用微信公众号对应配置表单
      form: {},
      // 网页授权域名
      domain: undefined,
      rules: {
        officialAccountAppId: [
          { required: true, message: '请输入appId', trigger: 'blur' }
        ],
        officialAccountAppSecret: [
          { required: true, message: '请输入appSecret', trigger: 'blur' }
        ]
      },
      // 密码型输入框内容显隐
      pwdVisible: false
    };
  },
  computed: {
    // 是否为代开发应用
    isDKCorp() {
      return this.$store.state.serverInfo.dkCorp;
    }
  },
  created() {
    this.pageInit();
  },
  methods: {
    /**
     * @description: 改变密码型输入框内容显隐
     * @return {*}
     */
    changePwdVisible() {
      this.pwdVisible = !this.pwdVisible;
    },
    /**
     * @description: 初始化
     * @return {*}
     */
    pageInit() {
      this.isDKCorp ? this.isDKCorpInit() : this.noDKCorpInit();
    },
    /**
     * @description: 权限校验
     * @param {*} key
     * @return {*}
     */
    checkPermi(key) {
      return checkPermi(key);
    },
    /**
     * @description: 打开新标签页
     * @param {*} url
     * @param {*} name
     * @return {*}
     */
    openBlackUrl(url, name) {
      window.open(url, name);
    },
    /**
     * @description: 微信公众号配置提交
     * @return {*}
     */
    submitForm() {
      this.$refs['form'].validate((idAndSecretValid) => {
        if (idAndSecretValid) {
          const { officialAccountAppId, officialAccountAppSecret } = this.form;
          this.handleUpdateConfig({
            officialAccountAppId,
            officialAccountAppSecret
          });
        }
      });
    },
    /**
    * @description: 自建应用修改公众号配置
    * @param {*} params
    * @return {*}
    */
    async handleUpdateConfig(params) {
      const res = await updateConfig(params);
      if (res) {
        this.handleGetConfig();
        this.msgSuccess('修改成功');
      }
    },
    /**
     * @description: 自建应用获取公众号配置
     * @return {*}
     */
    async handleGetConfig() {
      const res = await getConfig({});
      const domainRes = await getWechatOpenDomain({});
      domainRes.data ? this.domain = domainRes.data : null;
      res.data ? this.form = { ...res.data[0] } : null;
    },
    /**
     * @description: 自建应用初始化
     * @return {*}
     */
    async noDKCorpInit() {
      await this.handleGetConfig();
    },
    /**
     * @description: 待开发应用初始化
     * @return {*}
     */
    async isDKCorpInit() {
      getConfig({}).then(res => {
        this.offAccountList = res.data;
      });
    },
    /**
     * @description: 授权公众号
     * @return {*}
     */
    authBtnClick() {
      this.authLoading = true;
      getWechatOpenAuthUrl({}).then(res => {
        this.openBlackUrl(res.msg);
      }).finally(() => {
        this.authLoading = false;
      });
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
  .blue-btn {
    color: #409EFF;
  }
  /deep/ .el-steps {
    height: 100%;
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
  /deep/ .el-step__description.is-finish {
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
    }
    .off-account-list-wrap {
      width: 100%;
      .off-account-list{
        width: 100%;
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
</style>
