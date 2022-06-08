<!--
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div v-if="item.mediaType.toString() === MEDIA_TYPE_TEXT" class="content-item-div">{{ item.content }}</div>
  <div v-else class="content-item-div">
    <div class="cover-img">
      <svg v-if="item.mediaType.toString() === MEDIA_TYPE_FILE" class="icon" aria-hidden="true" width="60" height="60">
        <use :xlink:href="'#icon-' + getFileIconClass" />
      </svg>
      <video v-else-if="item.mediaType.toString() === MEDIA_TYPE_VIDEO" :src="item.url" />
      <el-image v-else :src="dealCoverUrl(item, item.mediaType)">
        <div v-if="item.mediaType.toString() === MEDIA_TYPE_IMGLINK" slot="error" class="image-slot">
          <svg class="icon-img-link" :width="25" :height="25">
            <use href="#icon-img-link" />
          </svg>
        </div>
      </el-image>
    </div>
    <div class="file-info">
      <div class="inoneline">{{ item.title }}</div>
      <div class="desc">{{ dealContent(item.content, item.mediaType) }}</div>
    </div>
  </div>
</template>
<script>
import { MEDIA_TYPE_TEXT, MEDIA_TYPE_POSTER, MEDIA_TYPE_VIDEO, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_MINIAPP, MEDIA_TYPE_FILE } from '@/utils/constant';
import { filterSize, getFileIcon } from '@/utils/common';

export default {
  name: '',
  components: {},
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      MEDIA_TYPE_TEXT,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_IMGLINK
    };
  },
  computed: {
    /**
     * 获取文件类型图标class
     */
    getFileIconClass() {
      return getFileIcon(this.item.url);
    }
  },
  created() {},
  mounted() {},
  methods: {
    dealContent(content, type) {
      if ([MEDIA_TYPE_POSTER, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE].includes(type.toString())) {
        return filterSize(content);
      } else {
        return content;
      }
    },
    dealCoverUrl(item, type) {
      if ([MEDIA_TYPE_IMGLINK, MEDIA_TYPE_MINIAPP].includes(type.toString())) {
        return item.coverUrl;
      } else {
        return item.url;
      }
    }
  }

};
</script>
<style scoped lang='scss'>
.content-item-div {
    margin-bottom: 5px;
    display: flex;
    .cover-img {
      /deep/ .el-image, video {
          width: 60px;
          height: 60px;
          object-fit: cover;
      }
      /deep/ .el-image {
        .image-slot {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid $borderColor;
        }
      }
    }
    .desc {
      color: #7F7F7F;
      font-size: 12px;
      margin-top: 4px;
    }
    .file-info {
      margin-left: 5px;
      flex: 1;
      overflow: hidden;
    }
}
</style>
