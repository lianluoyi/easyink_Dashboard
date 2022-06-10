<!--
 * @Description: 视频弹窗
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="shabowbox">
    <div class="close" @click="closeModal"><i class="el-icon-circle-close" /></div>
    <div class="shabowbox-video">
      <video-player
        id="videoPlayer"
        ref="videoPlayer"
        class="video-player vjs-custom-skin"
        :playsinline="true"
        :options="playerOptions"
      />
    </div>
  </div>
</template>

<script>
import 'video.js/dist/video-js.css';
import 'vue-video-player/src/custom-theme.css';
import { PLAYBACK_RATES, VIDEO_TYPE_MP4 } from '@/utils/constant';

export default {
  props: {},
  data() {
    return {
      playerOptions: {
        playbackRates: PLAYBACK_RATES, // 播放速度
        autoplay: false, // 如果true,浏览器准备好时开始回放。
        controls: true, // 控制条
        preload: 'auto', // 视频预加载
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 导致视频一结束就重新开始。
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        poster: '', // 你的封面地址（覆盖在视频上面的图片）
        width: document.documentElement.clientWidth,
        height: '475',
        notSupportedMessage: '此视频暂无法播放，请稍后再试' // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
      },
      dia: false
    };
  },
  mounted() {},
  methods: {
    play(url) {
      this.playerOptions = {
        ...this.playerOptions,
        sources: [{
          type: VIDEO_TYPE_MP4,
          src: url
        }]
      };
      this.dia = true;
      const player = this.$refs.videoPlayer.player;
      player.play();
    },
    closeModal() {
      this.$emit('closeModal');
    }
  }
};

</script>
<style lang="scss" scoped>
  .shabowbox {
    position: fixed;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    left: 0;
    top: 0;
    z-index: 2000;
  }

  .shabowbox-video {
    position: fixed;
    width: 800px;
    height: 475px;
    left: 50%;
    margin-left: -400px;
    top: 50%;
    margin-top: -235px;
    ;
    z-index: 2001;
    background: #fff;
  }
  .close {
    position: fixed;
    width: 50px;
    height: 50px;
    right: 10px;
    z-index: 2012;
    top: 10px;
    text-align: center;
    line-height: 50px;
    font-size: 20px;
    color: #FFF;
    cursor: pointer;
    font-size: 43px;
  }
  #videoPlayer /deep/ .vjs-tech {
    height: 450px;
  }
</style>
