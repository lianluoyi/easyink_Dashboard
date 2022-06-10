<!--
 * @Description: 文件样式
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="file-info-div">
    <div class="cover-img">
      <svg v-if="item.mediaType === MEDIA_TYPE_FILE" class="icon" aria-hidden="true" width="60" height="60">
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
import { MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE, MEDIA_TYPE_MINIAPP } from '@/utils/constant';

export default {
  name: '',
  components: {},
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
      MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE, MEDIA_TYPE_MINIAPP
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
      if ([MEDIA_TYPE_POSTER, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE].includes(this.item.mediaType)) {
        return filterSize(item[this.descField]);
      } else {
        return item[this.descField];
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 获取封面地址
     */
    dealCoverUrl(item, type) {
      if ([MEDIA_TYPE_IMGLINK, MEDIA_TYPE_MINIAPP].includes(type)) {
        return item.coverUrl;
      } else {
        return item.url;
      }
    },
    /**
     * 获取摘要内容
     */
    dealContent(content, type) {
      if ([MEDIA_TYPE_POSTER, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE].includes(type)) {
        return filterSize(content);
      } else {
        return content;
      }
    }
  }

};
</script>
<style scoped lang='scss'>
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
    .file-info {
        .file-name {
            font-size: 13px;
            margin-bottom: 3px;
        }
        .file-size {
            color: #7F7F7F;
            font-size: 12px;
        }
    }
}
</style>
