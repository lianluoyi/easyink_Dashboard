<!--
 * @Description: 语音消息布局
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="voice-item">
    <img v-if="voicePlayObj[item.msgId] && voicePlayObj[item.msgId].isPlaying" :src="dealVoiceImg(true)" @click="pauseVoice(item)">
    <img v-else :src="dealVoiceImg(false)" @click="playVocie(item)">
  </div>
</template>

<script>
import 'video.js/dist/video-js.css';
import 'vue-video-player/src/custom-theme.css';
import BenzAMRRecorder from 'benz-amr-recorder';

export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      voicePlayObj: {}
    };
  },
  mounted() {},
  methods: {
    dealVoiceImg(isPlaying) {
      if (isPlaying) {
        return require('@/assets/image/voice-left.gif');
      } else {
        return require('@/assets/image/voice-left.png');
      }
    },
    playVocie(msg) {
      this.urlToBlob(msg.voice.attachment, msg);
    },
    pauseVoice(msg) {
      const msgId = msg.msgId;
      const amr = this.voicePlayObj[msgId].amr;
      amr.pause();
      this.changeMsgVoiceStatus(msgId, false);
    },
    changeMsgVoiceStatus(msgId, status) {
      this.voicePlayObj[msgId].isPlaying = status;
      // 产生一个新的对象，让页面重新渲染。
      this.voicePlayObj = { ...this.voicePlayObj };
    },
    urlToBlob(file_url, msg) {
      const xhr = new XMLHttpRequest();
      const this_ = this;
      xhr.open('get', file_url, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        const blob = this.response;
        const file = new File([blob], '语音.amr', { type: 'audio/amr' });
        this_.playOrResumeAudio(file, msg);
      };
      xhr.send();
    },
    playOrResumeAudio(file, msg) {
      const this_ = this;
      const msgId = msg.msgId;

      // 第一次点击语音
      if (!this.voicePlayObj[msgId]) {
        const amr = new BenzAMRRecorder();
        try {
          amr.initWithBlob(file).then(function() {
            this_.voicePlayObj[msgId] = {};
            this_.voicePlayObj[msgId].amr = amr;
            amr.play();
            this_.changeMsgVoiceStatus(msgId, true);

            amr.onEnded(function() {
              this_.changeMsgVoiceStatus(msgId, false);
            });
          });
        } catch (err) {
          console.error('语音初始化失败', err);
        }
      } else {
        const amr = this_.voicePlayObj[msgId].amr;
        amr.playOrResume();
        this_.changeMsgVoiceStatus(msgId, true);
        amr.onEnded(function() {
          this_.changeMsgVoiceStatus(msgId, false);
        });
      }
    }
  }
};

</script>
<style lang="scss" scoped>

</style>
