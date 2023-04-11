<!--
 * @Description: 文件样式
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div v-if="item.mediaType.toString() === MEDIA_TYPE_RADARLINK">
    <RadarLink
      :radar-title="radarTitle"
      class-name="material-preview"
      :link-title="item.title"
      :cover-url="item.coverUrl"
      :content="item.content"
    />
  </div>
  <div v-else-if="item.mediaType.toString() === MEDIA_TYPE_SMARTFORM" class="file-info-div">
    <svg-icon icon-class="form-preview" class-name="form-preview" />
    <div class="form-info">
      <div class="form-name">{{ item.formName || item.form.formName }}</div>
      <div class="form-desc">{{ item.description || item.form.description }}</div>
    </div>
  </div>
  <div v-else class="file-info-div">
    <div class="cover-img">
      <svg
        v-if="item.mediaType === MEDIA_TYPE_FILE"
        class="icon"
        aria-hidden="true"
        width="60"
        height="60"
      >
        <use :xlink:href="'#icon-' + getFileIconClass" />
      </svg>
      <div v-else-if="item.mediaType === MEDIA_TYPE_VIDEO" class="video-img">
        <video :src="item.url" />
        <svg class="icon-player" :width="25" :height="25">
          <use href="#icon-player" />
        </svg>
      </div>
      <el-image v-else :src="dealCoverUrl(item, item.mediaType)" fit="cover">
        <div slot="error" class="image-slot">
          <svg class="icon-unknown" :width="60" :height="60">
            <use href="#icon-unknown" />
          </svg>
        </div>
      </el-image>
    </div>
    <div class="file-info">
      <div class="file-name">{{ item.title }}</div>
      <div class="file-size">{{ descText }}</div>
    </div>
  </div>
</template>
<script>
import { getFileIcon, filterSize } from '@/utils/common';
import {
  MEDIA_TYPE_POSTER,
  MEDIA_TYPE_IMGLINK,
  MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_RADARLINK,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_MINIAPP,
  MEDIA_TYPE_SMARTFORM
} from '@/utils/constant';
import RadarLink from '@/views/radarLibrary/components/radarLink.vue';
export default {
  name: '',
  components: { RadarLink },
  props: {
    type: {
      type: String,
      default: ''
    },
    item: {
      type: Object,
      default: () => {}
    },
    /**
     * 摘要显示的字段
     */
    descField: {
      type: String,
      default: 'content'
    }
  },
  data() {
    return {
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_MINIAPP,
      MEDIA_TYPE_RADARLINK,
      MEDIA_TYPE_SMARTFORM
    };
  },
  computed: {
    /**
     * 获取文件类型图标class
     */
    getFileIconClass() {
      return getFileIcon(this.item.url);
    },
    descText() {
      const item = { ...this.item };
      if (
        [MEDIA_TYPE_POSTER, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE].includes(
          this.item.mediaType
        )
      ) {
        return filterSize(item[this.descField]);
      } else {
        return item[this.descField];
      }
    },
    radarTitle() {
      const item = { ...this.item };
      return item.radar?.radarTitle || item.radarTitle;
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 获取封面地址
     */
    dealCoverUrl(item, type) {
      if (
        [
          MEDIA_TYPE_IMGLINK,
          MEDIA_TYPE_MINIAPP,
          Number(MEDIA_TYPE_RADARLINK)
        ].includes(type)
      ) {
        return item.coverUrl;
      } else {
        return item.url;
      }
    },
    /**
     * 获取摘要内容
     */
    dealContent(content, type) {
      if (
        [
          MEDIA_TYPE_POSTER,
          MEDIA_TYPE_VIDEO,
          MEDIA_TYPE_FILE,
          Number(MEDIA_TYPE_RADARLINK)
        ].includes(type)
      ) {
        return filterSize(content);
      } else {
        return content;
      }
    }
  }
};
</script>
<style scoped lang="scss">
.file-info-div {
  display: flex;
  .cover-img {
    margin-right: 5px;
    /deep/ .el-image {
      height: 60px;
      width: 60px;
      svg {
        width: 100%;
        height: 100%;
      }
    }
    .video-img {
      width: 60px;
      height: 60px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid $borderColor;
      video {
        width: inherit;
        height: inherit;
        object-fit: 'cover';
      }
      .icon-player {
        position: absolute;
        opacity: 0.4;
      }
    }
  }
  .form-preview {
    width: 60px;
    height: 60px;
    border-radius: 3px;
    margin-right: 5px;
  }
  .file-info {
    .file-name {
      font-size: 14px;
      margin-bottom: 3px;
    }
    .file-size {
      color: #7f7f7f;
      font-size: 12px;
    }
  }
  .form-info {
    width: calc(100% - 60px);
    text-align: left;
    margin-right: 5px;
    .form-name {
      font-size: 14px;
      margin-bottom: 3px;
    }
    .form-desc {
      font-size: 12px;
    }
  }
}
</style>
