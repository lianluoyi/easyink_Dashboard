<!--
 * @Description: 雷达基础配置引导页
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="config-radar enterprise-wechat-demo">
    <div>
      <el-steps class="step-div" :active="active" align-center>
        <el-step title="绑定微信开放平台" />
        <el-step title="企业微信后台绑定" />
        <el-step title="微信公众号配置" />
      </el-steps>
    </div>
    <div v-if="active === 0" class="content-div">
      <div class="part">
        <div class="content-title orange">绑定之前需确认自己是否有公众号，若没有，则需要进入微信公众平台进行注册。</div>
        <div class="content-title">
          （1）登录<el-link type="primary" href="https://open.weixin.qq.com" target="_blank">微信开放平台</el-link>，进入【管理中心】-【公众帐号】，进行绑定公众号。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/radar-config/config-step-1.jpeg')"
          :preview-src-list="[require('@/assets/example/demo/radar-config/config-step-1.jpeg')]"
        />
      </div>
      <div class="part">
        <div class="content-title">
          （2）绑定成功后可在微信公众平台查看是否绑定成功。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/radar-config/config-step-2.jpeg')"
          :preview-src-list="[require('@/assets/example/demo/radar-config/config-step-2.jpeg')]"
        />
      </div>
    </div>
    <div v-if="active === 1" class="content-div">
      <div class="part">
        <div class="content-title">
          （1）企业管理员扫码登录 企业微信后台，进入 <el-link type="primary" href="https://work.weixin.qq.com/wework_admin/frame#customer/analysis" target="_blank">【客户与上下游】 -【客户联系】</el-link>，绑定微信开发者ID。
        </div>
        <div class="content-title orange">
          微信公众号、开放平台、企业微信都需要是同一主体。
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/radar-config/config-step-3.jpeg')"
          :preview-src-list="[require('@/assets/example/demo/radar-config/config-step-3.jpeg')]"
        />
      </div>
    </div>
    <div v-if="active === LAST_STEP_NUMBER" class="content-div">
      <div class="content-title orange">
        以下是您前面步骤中绑定的微信公众号对应配置，网页授权域名为“middleProcessing服务的域名地址”
      </div>
      <el-form ref="form" :model="form" label-width="165px" :rules="rules">
        <el-form-item label="开发者ID(AppID)" prop="officialAccountAppId">
          <el-input v-model="form.officialAccountAppId" />
        </el-form-item>
        <el-form-item label="开发者密码(AppSecret)" prop="officialAccountAppSecret">
          <el-input v-model="form.officialAccountAppSecret" />
        </el-form-item>
        <el-form-item label="网页授权域名" prop="officialAccountDomain">
          <el-input v-model="form.officialAccountDomain" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </el-form-item>
      </el-form>
      <div class="part">
        <div class="content-title">
          配置获取入口如下：
        </div>
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/radar-config/config-step-4.jpeg')"
          :preview-src-list="[require('@/assets/example/demo/radar-config/config-step-4.jpeg')]"
        />
        <el-image
          class="part-img"
          :src="require('@/assets/example/demo/radar-config/config-step-5.jpeg')"
          :preview-src-list="[require('@/assets/example/demo/radar-config/config-step-5.jpeg')]"
        />
      </div>

    </div>
    <div class="btn-div">
      <el-button v-if="active != 0" style="margin-top: 12px;" @click="previousStep">上一步</el-button>
      <el-button type="primary" style="margin-top: 12px;" @click="next">{{ STEP_TEXT[active] }}</el-button>
    </div>

  </div>
</template>
<script>
import { getConfig, updateConfig } from '@/api/wechatopen';
const LAST_STEP_NUMBER = 2;

export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      active: 0,
      STEP_TEXT: {
        0: '下一步',
        1: '下一步',
        [LAST_STEP_NUMBER]: '完成配置'
      },
      LAST_STEP_NUMBER,
      appId: '',
      form: {},
      rules: {
        officialAccountAppId: [
          { required: true, message: '请输入appId', trigger: 'blur' }
        ],
        officialAccountAppSecret: [
          { required: true, message: '请输入appSecret', trigger: 'blur' }
        ],
        officialAccountDomain: [
          { required: true, message: '请输入网页授权域名', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.init();
  },
  mounted() {},
  methods: {
    next() {
      if (this.active !== LAST_STEP_NUMBER) {
        this.active = this.active + 1;
      } else {
        const form = this.form;
        if (form?.officialAccountAppId || form?.officialAccountAppSecret || form?.officialAccountDomain) this.$emit('closeTip');
        this.$emit('closeDrawer');
      }
    },
    previousStep() {
      if (this.active-- < 0) this.active = LAST_STEP_NUMBER;
    },
    submitForm(formName) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const { officialAccountAppId, officialAccountAppSecret, officialAccountDomain } = this.form;
          this.handleUpdateConfig({
            officialAccountAppId,
            officialAccountAppSecret,
            officialAccountDomain
          });
        }
      });
    },
    /**
     * 修改公众号配置
     */
    async handleUpdateConfig(params) {
      const res = await updateConfig(params);
      if (res) {
        this.handleGetConfig();
        this.msgSuccess('修改成功');
      }
    },
    async handleGetConfig() {
      const res = await getConfig({});
      this.form = { ...res.data };
      return res.data;
    },
    async init() {
      const res = await this.handleGetConfig();
      if (res) this.active = LAST_STEP_NUMBER;
      console.log('init', res);
    }
  }

};
</script>
<style lang="scss" src="../../enterpriseWechat/configDemo/styles/common.scss" scoped>
</style>
<style lang="scss" scoped>
.config-radar {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.content-input {
    .field-key {
        color: red;
    }
}
.orange {
    color: $orange;
}
</style>
