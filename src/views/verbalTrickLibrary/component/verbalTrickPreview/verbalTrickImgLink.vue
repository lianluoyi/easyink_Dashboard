<!--
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="link-preview">
    <div class="top-div">
      <span class="file-title intwoline" title="链接标题">
        {{ title }}
      </span>
    </div>
    <div class="bottom-div">
      <div class="desc inoneline">
        {{ content }}
      </div>
      <el-image :src="coverUrl" fit="cover" class="cover-img">
        <div slot="error" class="image-slot">
          <svg class="icon-img-link" :width="25" :height="25">
            <use href="#icon-img-link" />
          </svg>
        </div>
      </el-image>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    coverUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    };
  },
  created() {},
  mounted() {}

};
</script>
<style scoped lang='scss'>
.link-preview {
    border: 1px solid $borderColor;
    width: 200px;
    line-height: 20px;
    border-radius: 3px;
    text-align: left;
    padding: 10px;
    .top-div {
        .file-title{
          color: $black;
          word-break: break-all;
        }
    }
    .bottom-div {
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        .desc {
          color: #606266;
          flex: 1;
          overflow: hidden;
        }
        .cover-img {
        width: 45px;
        height: 45px;
        border: 1px solid $borderColor;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        }
    }
}
</style>
