<!--
* @Description: 雷达链接预览
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div :class="className">
    <div class="bottom-div">
      <div class="preview-left">
        <div v-if="radarTitle" class="inoneline radar-title">
          {{ radarTitle }}
        </div>
        <div class="inoneline link-title">
          {{ linkTitle }}
        </div>
        <div :class="`content ${ radarTitle ? 'inoneline' : 'intwoline'}`">
          {{ content }}
        </div>
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
  name: 'RadarLink',
  components: {},
  props: {
    linkTitle: {
      type: String,
      default: ''
    },
    radarTitle: {
      type: String,
      default: null
    },
    content: {
      type: String,
      default: ''
    },
    coverUrl: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: 'link-preview'
    }
  },
  data() {
    return {};
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
<style scoped lang="scss">
.link-preview {
  height: 47px;
  width: 220px;
  line-height: 16px;
  .bottom-div {
    display: flex;
    margin-top: 5px;
    .preview-left {
      height: 60px;
      width: 138px;
      color: #606266;
      font-size: 14px;
      .content {
        color:#999999;
        font-size: 12px;
      }
    }
    .cover-img {
      margin-left: 10px;
      width: 45px;
      height: 45px;
    }
  }
}
.material-preview {
  height: 60px;
  line-height: 15px;
  .bottom-div {
    display: flex;
    flex: 1;
    margin-top: 5px;
    .preview-left {
      height: 60px;
      width: 260px;
      color: #606266;
      font-size: 14px;
      .radar-title {
        margin-bottom: 10px;
      }
      .link-title {
        font-size: 13px;
        margin-bottom: 5px;
      }
      .content {
        color:#999999;
        font-size: 12px;
      }
    }
    .cover-img {
      margin-left: 10px;
      width: 60px;
      height: 60px;
    }
  }
}
</style>
