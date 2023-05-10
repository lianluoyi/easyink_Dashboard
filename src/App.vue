<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { SERVER_TYPE_INTERNAL } from '@/utils/constant';
export default {
  name: 'App',
  computed: {
    serverType() {
      return this.$store.state.serverInfo.serverType;
    }
  },
  watch: {
    serverType(val) {
      // 多租户模式不调用登录秘钥
      if (val === SERVER_TYPE_INTERNAL) {
        this.getPublicKey();
      }
    }
  },
  methods: {
    // 获取RSA私钥
    getPublicKey() {
      this.$store.dispatch('GetPublicKey');
    }
  }
};
</script>
