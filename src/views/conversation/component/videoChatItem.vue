<!--
 * @Description: 视频消息布局
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div>
    <div class="video-item">
      <i class="el-icon-video-play" @click="play(url,'video')" />
    </div>
    <VideoModal v-show="dia" ref="videoModal" @closeModal="closeModal" />
  </div>

</template>

<script>
import 'video.js/dist/video-js.css';
import 'vue-video-player/src/custom-theme.css';
import VideoModal from './videoModal.vue';

export default {
  components: { VideoModal },
  props: {
    url: {
      type: String,
      default: () => {}
    }
  },
  data() {
    return {
      dia: false
    };
  },
  mounted() {},
  methods: {
    play(url) {
      this.dia = true;
      this.$refs.videoModal.play(url);
    },
    /**
     * 关闭弹窗
     */
    closeModal() {
      this.dia = false;
    }
  }
};

</script>
<style lang="scss" scoped>
.video-item {
  .el-icon-video-play {
    font-size: 40px;
    color: #199ed8;
    cursor: pointer;
  }
}
</style>
