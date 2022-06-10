<script>
const LAST_STEP_NUMBER = 1;

export default {
  components: {},
  props: {},
  data() {
    return {
      active: 0,
      STEP_TEXT: {
        0: '下一步',
        1: '完成配置'
      }
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    next() {
      if (this.active !== 1) {
        this.active = this.active + 1;
      } else {
        this.$emit('closeDrawer');
      }
    },
    previousStep() {
      if (this.active-- < 0) this.active = LAST_STEP_NUMBER;
    }
  }
};
</script>

<template>
  <div class="contact-demo enterprise-wechat-demo">
    <div>
      <el-steps class="step-div" :active="active" align-center>
        <el-step title="接收客户变更消息" />
        <el-step title="接收企业变更消息" />
      </el-steps>
    </div>
    <div v-if="active === 0" class="content-div">
      <div class="part">
        <div class="content-title">（1）进入企业微信后台
          <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps" target="_blank">【应用管理】</el-link>，点击easyWeCom应用，找到“接收消息”，点击“设置API接收”。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/receive-step1-1.jpg')"
          :preview-src-list="[require('@/assets/example/demo/receive-step1-1.jpg')]"
        />
      </div>
      <div class="part">
        <div class="content-title">
          （2）将【接收变更】的回调地址、Token和EncodingAESKey复制下来，填写到对应的输入框，点击保存按钮，完成配置。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/receive-step1-2.jpg')"
          :preview-src-list="[require('@/assets/example/demo/receive-step1-2.jpg')]"
        />
      </div>
    </div>
    <div v-if="active === 1" class="content-div">
      <div class="part">
        <div class="content-title">（1）进入
          <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#apps/contactsApi" target="_blank">【管理工具】-【通讯录同步】</el-link>
          页面。
        </div>
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
          （3）在客户端确认操作后，企微后台弹窗将自动切换为可编辑状态，将左侧表单中“接收消息”的回调地址、Token、EncodingAESKey复制并填写到弹窗中，保存即可。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/receive-step2-3.jpg')"
          :preview-src-list="[require('@/assets/example/demo/receive-step2-3.jpg')]"
        />
      </div>
    </div>
    <div class="btn-div">
      <el-button v-if="active != 0" style="margin-top: 12px;" @click="previousStep">上一步</el-button>
      <el-button type="primary" style="margin-top: 12px;" @click="next">{{ STEP_TEXT[active] }}</el-button>
    </div>

  </div>
</template>
<style lang="scss" src="./styles/common.scss" scoped>
</style>
