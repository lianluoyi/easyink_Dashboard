<template>
  <div v-loading="loading" :style="'height:'+ height">
    <iframe :src="src" frameborder="no" style="width: 100%;height: 100%" scrolling="auto" />
  </div>
</template>
<script>
const DIFF_HEIGHT = 94.5;
export default {
  name: 'Druid',
  data() {
    return {
      src: process.env.VUE_APP_BASE_API + '/druid/index.html',
      height: document.documentElement.clientHeight - DIFF_HEIGHT + 'px;',
      loading: true
    };
  },
  mounted: function() {
    setTimeout(() => {
      this.loading = false;
    // eslint-disable-next-line no-magic-numbers
    }, 230);
    const that = this;
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - DIFF_HEIGHT + 'px;';
    };
  }
};
</script>
