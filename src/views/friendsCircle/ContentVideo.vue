<!--
 * @Description: 朋友圈内容的视频
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="preview-div">
      <template>
        <div class="cover-img">
          <video :src="data.url" />
          <svg class="icon-player" :width="25" :height="25">
            <use href="#icon-player" />
          </svg>
        </div>
        <div class="file-info">
          <div class="inoneline">{{ data.title }}</div>
          <div class="file-size">{{ getFileSize(data.size) }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { filterSize } from '@/utils/common';
export default {
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showContent: true
    };
  },
  mounted() {},
  methods: {
    /**
     * 获取文件大小
     */
    getFileSize(fileSize) {
      return this.data.size && this.showContent ? filterSize(fileSize) : '';
    }
  }
};
</script>

<style lang="scss" scoped>
.preview-div {
  width: 200px;
  height: 60px;
  padding: 10px;
  border: 1px solid $borderColor;
  border-radius: 3px;
  position: relative;
  display: flex;
  .cover-img {
    height: 40px;
    min-width: 40px;
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    video {
      object-fit: cover;
      height: 40px;
      width: 40px;
    }
    .icon-player {
      position: absolute;
    }
  }
  .file-info {
    line-height: 16px;
    margin-left: 6px;
    overflow: hidden;
    flex: 1;
    .file-size {
      font-size: 12px;
      color: #606266;
      margin-top: 5px;
    }
  }
}
</style>

