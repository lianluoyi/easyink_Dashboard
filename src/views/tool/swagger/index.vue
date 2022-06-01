<template>
  <div v-loading="loading" :style="'height:'+ height">
    <iframe :src="src" frameborder="no" style="width: 100%;height: 100%" scrolling="auto" />
  </div>
</template>
<script>
const HEIGHT_DIFF = 94.5;
export default {
  name: 'Swagger',
  data() {
    return {
      src: process.env.VUE_APP_BASE_API + '/swagger-ui.html',
      height: document.documentElement.clientHeight - HEIGHT_DIFF + 'px;',
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
      that.height = document.documentElement.clientHeight - HEIGHT_DIFF + 'px;';
    };
  }
};
</script>
