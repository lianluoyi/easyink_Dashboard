<!--
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="appid-preview-div">
    <div class="title">{{ title }}</div>
    <div class="cover-div">
      <el-image :src="coverUrl" fit="cover" class="cover-img">
        <div slot="error" class="image-slot">
          <svg class="icon-mini-app" :width="25" :height="25">
            <use href="#icon-mini-app" />
          </svg>
        </div>
      </el-image>
    </div>
    <div class="desc">
      <i class="iconfont icon-mini-app" />
      <span>小程序</span>
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
.appid-preview-div {
    border: 1px solid $borderColor;
    width: 200px;
    border-radius: 3px;
    text-align: left;
    padding: 10px;
    .title, .desc {
        line-height: 16px;
    }
    .cover-div {
        margin-top: 10px;
        width: 178px;
        border: 1px solid $borderColor;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        /deep/ .el-image {
          height: 92px;
          display: flex;
          align-items: center;
          .image-slot {
            height: 25px;
          }
        }
    }
    .desc {
        margin-top: 5px;
        .icon-mini-app {
          margin-right: 5px;
        }
    }
}
</style>
