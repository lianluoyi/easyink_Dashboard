<script>
import * as api from '@/api/enterpriseId';
import { AUTH_ENADLE, NORMAL } from '@/utils/constant/index';
// 定义一个TIME常量作为页面加载的时候调用定时器的间隔时间
const TIME = 3000;
// 定义一个常量作为截取字符串的长度值
const NUMBER = '2';
// 定义一个常量延迟时间用做重新配置，目前暂不实现
const DELAYTIME = 10000;
export default {
  props: {
    // 接收一个reset的布尔值判断组件是否是重新配置的时候显示
    reset: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 定时器循环调用管理员是否扫描二维码的函数
      settime: '',
      // 代开发应用企微配置正常和未授权安装应用
      NORMAL,
      // 代开发应用企微配置授权未启用
      AUTH_ENADLE,
      active: 0,
      // 是否授权
      dialogVisible: false,
      // 完成应用安装和配置的弹窗
      endConfig: false,
      // 未完成应用安装和配置的弹窗
      notEndConfig: false,
      // 代开发应用客服授权码
      qrcodeUrl: ''
    };
  },
  computed: {
    enterPriseWechatConfig() {
      return this.$store.state.enterPriseWechatConfig;
    }
  },
  watch: {},
  created() {
    this.isAuth();
    this.getDkQrCode();
    if (!this.reset) {
      // 设置一个定时器每隔TIME秒调用函数判断管理员是否扫描二维码
      this.settime = setInterval(this.isScanCode, TIME);
      this.isScanCode();
    } else {
      this.dialogVisible = false;
      this.active = 0;
      // 设置一个定时器延迟调用判断管理员是否扫描二维码的函数，因为重新配置后，后端可能有延迟
      setTimeout(() => {
        this.settime = setInterval(this.isScanCode, TIME);
        this.isScanCode();
      }, DELAYTIME);
    }
  },
  mounted() {},
  methods: {
    // 判断是否完成配置处理页面跳转和弹窗显示
    isAuth() {
      // 当客服人员未授权时,此时状态为0，corpId是wp开头,提醒授权的弹窗打开  authorized判断是否授权
      if (this.enterPriseWechatConfig.status === NORMAL && (this.enterPriseWechatConfig.corpId.substring(0, NUMBER) === 'wp' && !this.enterPriseWechatConfig.authorized)) {
        this.dialogVisible = true;
      }
      // 当客服人员授权完成但是未启用时,此时状态为2，corpId是ww开头，页面显示的时候将active的值变为1
      if (this.enterPriseWechatConfig.status === AUTH_ENADLE && (this.enterPriseWechatConfig.corpId.substring(0, NUMBER) === 'ww' || this.enterPriseWechatConfig.authorized)) {
        this.active = 1;
      }
    },
    /**
     * 获取代开发应用客服授权码
     */
    async getDkQrCode() {
      const getCode = await api.getDkQrCode({});
      this.qrcodeUrl = getCode.data;
    },
    /**
     * 判断管理员是否扫描二维码
     */
    async isScanCode() {
      const getStatus = await api.isScanCode({});
      // 当用户扫描二维码之后，将active状态改为1.并清除settime定时器
      if (getStatus.data.authSuccess) {
        // 用户扫码后将vuex中存的企微配置状态修改
        const getNowConfigRes = await api.getNowConfig({});
        this.$store.commit('SET_CONFIG', getNowConfigRes.data);
        this.active = 1;
        clearInterval(this.settime);
      }
    },
    // 前往授权
    onGotoAutoConfig() {
      this.dialogVisible = false;
    },
    // 完成了可见范围的配置之后页面跳转到完成的页面
    completeConfiguration() {
      this.endConfig = false;
      this.$emit('changeConfiguration', true);
    },
    /**
     * 判断是否完成应用安装或配置
     */
    async callBackTotal() {
      const getNowConfigRes = await api.getNowConfig({});
      if ((getNowConfigRes.data.corpId.substring(0, NUMBER) === 'ww' || getNowConfigRes.data.authorized) && getNowConfigRes.data.status === NUMBER) {
        // 未完成完成应用安装和配置的弹窗
        this.notEndConfig = true;
      } else {
        // 完成配置弹窗
        this.$store.commit('SET_CONFIG', getNowConfigRes.data);
        this.endConfig = true;
      }
    }
  }
};
</script>

<template>
  <div class="quick-demo">
    <div :style="`${active===0?' height: 500px;':''}`" class="quick-div">
      <el-alert
        v-if="active === 1"
        title="您的企业还未完成应用配置，请根据第二步提示操作。"
        type="warning"
        show-icon
        :closable="false"
      />
      <div class="step-div">
        <el-steps direction="vertical" :space="60" :active="active" finish-status="success">
          <el-step title="授权">
            <template v-if="active === 0" slot="description" class="scan-login">
              <div class="orange tip">
                请使用企业微信管理员扫描以下二维码授权，允许系统客服人员为您安装应用
              </div>
              <div class="qrcode-div">
                <el-image :src="qrcodeUrl" fit="fit" />
              </div>
            </template>
          </el-step>
          <el-step v-if="active === 1" title="安装应用">
            <template slot="description" class="config-callback">
              <div class="tip gray-color">
                完成授权后，客服人员将在2个工作日内为企业安装应用，请耐心等待。
              </div>
              <div class="orange tip">
                安装期间，您将收到企业微信团队发出的通知，请按照以下步骤，协助安装。
              </div>
              <div class="part">
                <div class="content-title">
                  <div class="content-title-text">
                    <div>
                      （1）
                    </div>
                    <div>
                      <span>授权应用权限；</span>
                      <div style="margin-top:10px">收到请求变更权限通知后，点击“查看详情”，进入变更权限页面，同意授权。操作后，等待客服人员上线应用。</div>
                      <div class="step-img">
                        <el-image
                          class="part-img"
                          :src="require('@/assets/example/demo/config-step2-(1)-1.png')"
                          :preview-src-list="[
                            require('@/assets/example/demo/config-step2-(1)-1.png'),
                          ]"
                        />
                        <i class="el-icon-d-arrow-right" />
                        <el-image
                          class="part-img"
                          :src="require('@/assets/example/demo/config-step2-(1)-2.png')"
                          :preview-src-list="[
                            require('@/assets/example/demo/config-step2-(1)-2.png'),
                          ]"
                        />
                        <i class="el-icon-d-arrow-right" />
                        <el-image
                          class="part-img"
                          :src="require('@/assets/example/demo/config-step2-(1)-3.png')"
                          :preview-src-list="[
                            require('@/assets/example/demo/config-step2-(1)-3.png'),
                          ]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="part">
                <div class="content-title">
                  <div class="content-title-text">
                    <div>
                      （2）
                    </div>
                    <div>
                      <span>配置应用可见范围；</span>
                      <div style="margin-top:10px">收到设置可见范围通知后，点击“查看详情”，进入配置页面，设置可见范围后，可见范围下员工可使用系统功能，请默认设置根部门。</div>
                      <div class="step-img">
                        <el-image
                          class="part-img"
                          :src="require('@/assets/example/demo/config-step2-(2)-1.png')"
                          :preview-src-list="[
                            require('@/assets/example/demo/config-step2-(2)-1.png'),
                          ]"
                        />
                        <i class="el-icon-d-arrow-right" />
                        <el-image
                          class="part-img"
                          :src="require('@/assets/example/demo/config-step2-(2)-2.png')"
                          :preview-src-list="[
                            require('@/assets/example/demo/config-step2-(2)-2.png'),
                          ]"
                        />
                        <i class="el-icon-d-arrow-right" />
                        <el-image
                          class="part-img"
                          :src="require('@/assets/example/demo/config-step2-(2)-3.png')"
                          :preview-src-list="[
                            require('@/assets/example/demo/config-step2-(2)-3.png'),
                          ]"
                        />
                        <i class="el-icon-d-arrow-right" />
                        <el-image
                          class="part-img"
                          :src="require('@/assets/example/demo/config-step2-(2)-4.png')"
                          :preview-src-list="[
                            require('@/assets/example/demo/config-step2-(2)-4.png'),
                          ]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="margin:15px 0;color:black">
                （3）配置完可见范围，点击该按钮，验证企微配置是否完成。
              </div>
              <el-button style="margin-left:30px;" type="primary" @click="callBackTotal">
                完成可见范围配置
              </el-button>
            </template>
          </el-step>
        </el-steps>
      </div>
      <el-dialog
        class="quick-config-dialog"
        :close-on-click-modal="false"
        :append-to-body="false"
        title="企微配置"
        :visible.sync="dialogVisible"
        width="450px"
      >
        <i class="iconfont icon-arrow" />
        <div class="quick-tip">
          您的企业还未安装应用，不能正常使用系统功能，该操作较复杂，请授权客服人员为您安装并配置应用信息。
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="onGotoAutoConfig"
          >前往授权</el-button>
        </span>
      </el-dialog>
      <el-dialog
        class="config-dialog"
        title="温馨提示"
        :visible.sync="endConfig"
        width="520px"
        :close-on-click-modal="false"
      >
        <div style="text-indent: 2em; font-size: 15px">
          恭喜，您已经完成当前企业的应用安装和配置，现在可以使用系统功能了，如需开启会话存档和侧边栏功能，
          请稍后根据页面中提示进行操作。
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="completeConfiguration"
          >知道了</el-button>
        </span>
      </el-dialog>
      <el-dialog
        class="config-dialog"
        title="操作须知"
        :visible.sync="notEndConfig"
        width="460px"
        :close-on-click-modal="false"
      >
        <div class="prompt">
          <div class="icon">
            <i class="el-icon-warning" />
          </div>
          <div class="text">
            <div>您的应用未安装或未完成可见范围配置。</div>
            <div style="margin-top: 10px">
              1. 如果未收到企业微信团队发出的安装通知，请耐心等待，客服人员将在收到授权请求后2个工作日内处理；
            </div>
            <div style="margin-top: 10px">
              2. 如果已收到安装通知，则请完成应用的可见范围配置。
            </div>
          </div>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="notEndConfig = false"
          >知道了</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<style lang="scss" src="./styles/common.scss" scoped />
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
    overflow-x:auto;
    position: relative;
    .quick-config-dialog {
    position: absolute;
    right: 0;
    /deep/ .el-dialog {
      position: absolute;
      left: 380px;
      top: 170px;
      top:50%;
      margin: 0 !important;
      .icon-arrow {
        transform:rotate(270deg);
        font-size: 130px;
        color: #fff;
        position: absolute;
        top: -50px;
        left: -164px;
      }
    }
  }
  }
}
.orange {
  color: $orange;
}
.step-div {
  margin-top: 30px;
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
  .qrcode-div {
    position: relative;
    display: flex;
    border: 1px solid $borderColor;
    width: 180px;
    height: 180px;
    padding: 10px;
    align-items: center;
    justify-content: center;
    img {
      width: 100%;
    }
  }
  .tip {
    margin-bottom: 5px;
  }
  .content-title {
    margin-top: 20px;
    font-size: 14px;
    color: $black;
    .red {
      color: $red;
    }
  }
}
.step-img{
  margin-top: 10px;
  display: flex;
  align-items: center;
}
.el-icon-d-arrow-right {
  font-size: 30px;
  display: flex;
  align-items: center;
  color: black;
  margin: 0 20px 0 20px;
}

.prompt {
  display: flex;
  .text {
    margin-left: 10px;
    font-size: 15px;
    margin-top: 7px;
  }
  .icon {
    /deep/.el-icon-warning {
        color:$orange;
        font-size: 25px;
    }
  }
}
.content-title-text {
  display: flex;
}
.part-img {
  width: 250px;
  height: 533px;
}
.gray-color {
  color: #666666;
}
</style>
