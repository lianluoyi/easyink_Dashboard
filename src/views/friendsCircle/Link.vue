<!--
* @Description: 链接预览
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="link-preview">
    <div class="bottom-div">
      <div class="desc intwoline">
        {{ title }}
      </div>
      <template v-if="coverUrl">
        <el-image :src="coverUrl" fit="cover" class="cover-img">
          <div slot="error" class="image-slot">
            <svg class="icon-img-link" :width="25" :height="25">
              <use href="#icon-img-link" />
            </svg>
          </div>
        </el-image>
      </template>
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
  watch: {
    coverUrl(newval) {
      this.coverUrl = newval;
    }
  },
  created() {},
  mounted() {}
};
</script>
<style scoped lang='scss'>
.link-preview {
    height: 60px;
    border: 1px solid $borderColor;
    width: 200px;
    line-height: 20px;
    border-radius: 3px;
    text-align: left;
    padding: 10px;
    .bottom-div {
        display: flex;
        justify-content: space-between;
        .desc {
          height: 40px;
          color: #606266;
          flex: 1;
          overflow: hidden;
        }
        .intwoline{
          -webkit-line-clamp: 2;
        }
        .cover-img {
        width: 40px;
        height: 40px;
        border: 1px solid $borderColor;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        }
    }
}
</style>
