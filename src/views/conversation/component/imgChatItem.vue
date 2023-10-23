<!--
 * @Description: 图片消息布局
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="img-chat-item">
    <img class="thumb" :src="imgUrl" @click="showImg(imgUrl)">
    <el-dialog append-to-body :visible.sync="dialogVisible" width="30%">
      <img :src="imgSrc" style="width:100%;max-height:600px">
      <span slot="footer" class="dialog-footer" />
    </el-dialog>
  </div>

</template>

<script>

export default {
  props: {
    imgUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      imgSrc: ''
    };
  },
  mounted() {},
  methods: {
    showImg(imgUrl) {
      this.imgSrc = imgUrl;
      this.dialogVisible = true;
    }
  }
};

</script>
<style lang="scss" scoped>

</style>
