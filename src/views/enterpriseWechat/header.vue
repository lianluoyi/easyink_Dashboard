<script>
import Contact from './configDemo/contact.vue';
import ReceiveChange from './configDemo/receiveChange.vue';
import Customer from './configDemo/customer.vue';
import ChatTool from './configDemo/chatTool.vue';
import QuickConfig from './configDemo/quickConfig.vue';
import CustomerChat from './configDemo/custmoerChat.vue';
import AutoConfig from './configDemo/autoConfig.vue';
import ChatSide from './configDemo/chatSide.vue';

export default {
  components: {
    Contact,
    ReceiveChange,
    Customer,
    ChatTool,
    QuickConfig,
    CustomerChat,
    AutoConfig,
    ChatSide
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    tip: {
      type: String,
      default: ''
    },
    btnTip: {
      type: String,
      default: ''
    },
    primaryBtnTip: {
      type: String,
      default: ''
    },
    drawerTitle: {
      type: String,
      default: ''
    },
    extraTitle: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    extra: {
      type: String,
      default: ''
    },
    // 重新配置应用按钮
    extraclick: {
      type: String,
      default: ''
    },
    configId: {
      type: String,
      default: ''
    },
    form: {
      type: Object,
      default: () => ({})
    },
    defaultDomain: {
      type: Object,
      default: () => ({})
    },
    // 接收一个applicationFromType来判断是否是代开发，将应用信息右侧的竖线取消
    applicationFromType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      drawer: false,
      extraDrawer: false
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onOpenDrawer() {
      this.drawer = true;
    },
    handleClose() {
      this.drawer = false;
    },
    /**
     * 打开抽屉
     */
    onOpenExtraDrawer() {
      this.extraDrawer = true;
    },
    onOpenPrimaryBtnDrawer() {
      this.extraDrawer = true;
    },
    /**
     * 关闭抽屉
     */
    handleCloseExtraDrawer() {
      this.extraDrawer = false;
    },
    /**
     * 获取当前配置
     */
    getNowConfig() {
      this.$emit('getNowConfig');
    },
    /**
     * 重新配置
     */
    reSetConfig() {
      this.$emit('reSetConfig', 'reset');
    }
  }
};
</script>

<template>
  <div>
    <div class="title-item">
      <div class="title-tip">
        <span :style="`${applicationFromType === 'application' ? 'border:none' : ''}`">{{
          title
        }}</span>
        <span @click="onOpenDrawer">{{ tip }}</span>
        <!-- 待开发快捷配置的插槽 -->
        <slot name="generationDevelopment" />
      </div>
      <div v-if="extra" v-hasPermi="['wechat:corp:edit']" class="extra-tip theme-text-color" @click="onOpenExtraDrawer">{{ extra }}</div>
      <div v-if="extraclick" class="extra-tip theme-text-color" @click="reSetConfig">
        {{ extraclick }}
      </div>
    </div>
    <el-drawer
      class="drawer-div"
      :title="drawerTitle"
      :visible.sync="drawer"
      :before-close="handleClose"
    >
      <Contact v-if="type === 'contact'" :default-domain="defaultDomain" @closeDrawer="handleClose" />
      <ReceiveChange v-if="type === 'receive'" @closeDrawer="handleClose" />
      <Customer v-if="type === 'customer'" @closeDrawer="handleClose" />
      <CustomerChat v-if="type === 'customerChat'" @closeDrawer="handleClose" />
      <ChatTool v-if="type === 'chat'" :default-domain="defaultDomain" @closeDrawer="handleClose" />
      <ChatSide v-if="type === 'chatside'" :default-domain="defaultDomain" @closeDrawer="handleClose" />
    </el-drawer>
    <el-drawer
      class="extra-drawer-div"
      :title="extraTitle"
      :visible.sync="extraDrawer"
      :before-close="handleCloseExtraDrawer"
    >
      <QuickConfig
        v-if="type === 'contact'"
        :config-id="configId"
        :extra-drawer="extraDrawer"
        :form="form"
        :default-domain="defaultDomain"
        @closeDrawer="handleCloseExtraDrawer"
        @getNowConfig="getNowConfig"
      />
      <AutoConfig
        v-if="type === 'chatside'"
        :config-id="configId"
        :extra-drawer="extraDrawer"
        :form="form"
        :default-domain="defaultDomain"
        @closeDrawer="handleCloseExtraDrawer"
        @getNowConfig="getNowConfig"
      />
    </el-drawer>
  </div>
</template>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.title-item {
  @include border_style($width: 3px, $direction: left);
  font-size: 14px;
  height: 20px;
  display: flex;
  align-items: center;
  padding-left: 15px;
  margin-bottom: 15px;
  justify-content: space-between;
  .extra-tip {
    cursor: pointer;
    padding-right: 5px;
  }
  .title-tip {
    span:first-of-type {
      font-size: 16px;
      font-weight: 600;
      margin-right: 10px;
      border-right: 1px solid #d7d7d7;
      padding-right: 10px;
    }
    span:last-of-type {
      // color: $baseColor;
      @include text_btn_color($color-theme2-1);
      cursor: pointer;
    }
  }
  .mini-btn {
    height: 24px;
    line-height: 10px;
    padding: 7px 10px;
  }
  .mini-btn-transparent {
    background-color:rgba(0,0,0,0);
  }
}
.drawer-div, .extra-drawer-div {
  /deep/ .el-drawer__container {
    .el-drawer {
      width: 780px !important;
      .el-drawer__header {
        >span {
          font-size: 20px;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
  /deep/ .el-drawer__body {
    padding: 0 20px;
    height: calc(100% - 43px);
  }
}
</style>
