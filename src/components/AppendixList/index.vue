<script>
import VideoModal from '@/views/conversation/component/videoModal.vue';
import { MESSAGE_MEDIA_TYPE, MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE, MEDIA_TYPE_MINIAPP, MEDIA_TYPE_RADARLINK, MEDIA_TYPE_SMARTFORM } from '@/utils/constant/index';
import { downloadFile } from '@/utils/common';
const PROTOCAL_REGEX = /https?:\/\//;
export default {
  name: 'AppendixList',
  components: { VideoModal },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      MESSAGE_MEDIA_TYPE,
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_MINIAPP,
      visible: false
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    getTitleField(type) {
      switch (String(type)) {
        case MEDIA_TYPE_POSTER: return 'picName';
        case MEDIA_TYPE_IMGLINK:
        case MEDIA_TYPE_RADARLINK:
        case MEDIA_TYPE_SMARTFORM: {
          return 'linkTitle';
        }
        case MEDIA_TYPE_VIDEO: return 'videoName';
        case MEDIA_TYPE_MINIAPP: return 'miniprogramTitle';
        case MEDIA_TYPE_FILE: return 'fileName';
      }
    },
    /**
     * 预览素材大图
     */
    onPreview(msg) {
      this.visible = true;
      this.$refs.videoModal.play(msg.videoUrl);
    },
    closeModal() {
      this.visible = false;
    },
    handleClickAppendix(appendix) {
      switch (String(appendix.messageType)) {
        case MEDIA_TYPE_IMGLINK: window.open(this.dealLinkUrl(appendix.linkUrl)); break;
        case MEDIA_TYPE_VIDEO: this.onPreview(appendix); break;
        case MEDIA_TYPE_FILE:
          downloadFile(appendix.fileUrl, appendix.fileName);
          break;
        default: return;
      }
    },
    dealLinkUrl(url) {
      if (PROTOCAL_REGEX.test(url)) {
        return url;
      } else {
        return 'http://' + url;
      }
    }
  }
};
</script>

<template>
  <div>
    <VideoModal v-show="visible" ref="videoModal" @closeModal="closeModal" />
    <div
      v-for="appendix in list"
      :key="appendix.seedMessageId"
      :class="['appendix-item', appendix.messageType === MEDIA_TYPE_MINIAPP ? 'msg-mini-app' : '']"
      @click="handleClickAppendix(appendix)"
    >
      <span>
        <span class="appendix-type">[{{ MESSAGE_MEDIA_TYPE[appendix.messageType] }}]</span>
        <span class="appendix-title">{{ appendix[getTitleField(appendix.messageType)] }}</span>
      </span>
      <el-image
        v-if="appendix.messageType === MEDIA_TYPE_POSTER"
        class="appendix-image"
        :src="appendix.picUrl"
        :preview-src-list="[appendix.picUrl]"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .appendix-item {
    width: fit-content;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333;
    position: relative;
    &:not(:last-child) {
      margin-bottom: 15px;
    }
    &:not(.msg-mini-app) {
      cursor: pointer;
      color: #009DD9;
    }
    .appendix-title {
      padding-left: 5px;
    }
  }
  .appendix-image {
    width: 100%;
    height: 16px;
    position: absolute;
    opacity: 0;
  }
</style>
