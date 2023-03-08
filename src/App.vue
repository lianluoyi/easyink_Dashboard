<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.getPublicKey();
  },
  methods: {
    // 获取RSA私钥
    getPublicKey() {
      this.$store.dispatch('GetPublicKey');
    }
  }
};
</script>
