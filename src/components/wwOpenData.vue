<!--
 * @Description: 获取企微账号数据的组件
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <ww-open-data v-if="showWWOpenData" :type="type" :openid="openid" />
    <span v-else>{{ userName }}</span>
  </div>
</template>
<script>
import { getAgentTicket } from '@/api/common';
export default {
  name: '',
  components: {},
  props: {
    // 类型：分为部门和人员姓名
    type: {
      type: String,
      default: undefined
    },
    // id:人员或部门的ID
    openid: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      showWWOpenData: true
    };
  },
  computed: {
    userName(val) {
      return this.$store.state.user.name;
    },
    corpId() {
      return this.$store.state.enterPriseWechatConfig.corpId;
    },
    agentId() {
      return this.$store.state.enterPriseWechatConfig.agentId;
    }
  },
  watch: {
    agentId(val) {
      if (val) {
        this.showData();
      }
    }
  },
  mounted() {
    if (this.agentId) {
      this.showData();
    }
    const textContent = document.querySelector('ww-open-data')?.textContent;
    if (!textContent && !this.userName.includes('_')) this.showWWOpenData = false;
  },
  methods: {
    async showData() {
      try {
        const { data } = await getAgentTicket(
          window.location.href.split('#')[0],
          this.agentId
        );
        const { timestamp, nonceStr, signature } = data;
        // eslint-disable-next-line no-undef
        wx.agentConfig({
          corpid: this.corpId, // 必填，企业微信的corpid，必须与当前登录的企业一致
          agentid: this.agentId, // 必填，企业微信的应用id （e.g. 1000247）
          timestamp, // 必填，生成签名的时间戳
          nonceStr, // 必填，生成签名的随机串
          signature, // 必填，签名，见附录-JS-SDK使用权限签名算法
          jsApiList: [], // 必填
          success: () => {
            // 绑定ww-open-data组件，这样才能显示出姓名或部门名
            const dom = document.querySelector('ww-open-data');
            // eslint-disable-next-line no-undef
            if (dom) WWOpenData.bind(dom);
          },
          fail: (res) => {
            console.log('注入应用失败: ', res);
          }
        });
      } catch (error) {
        console.error('注入应用失败', error);
      }
    }
  }
};
</script>
