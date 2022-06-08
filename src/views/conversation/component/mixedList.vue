<!--
 * @Description: 图文消息布局
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div v-for="(list,index) in mixed" :key="index" class="msgtypemixed">
      <div v-if="list.type=='text'">
        <span>{{ list.content.content }}</span>
      </div>
      <div v-else class="msgtypeimg">
        <img class="thumb" :src="list.content.attachment" @click="showImg(list.content.attachment)">
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="40%">
      <img :src="imgSrc" style="width:100%;max-height:600px">
      <span slot="footer" class="dialog-footer" />
    </el-dialog>
  </div>

</template>

<script>

export default {
  props: {
    mixed: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      imgSrc: ''
    };
  },
  created() {},
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
.msgtypemixed {
    display: flex;
    flex-direction: column;
    .msgtypeimg {
      height: 70px;
      margin: 10px 0;
      width: calc(100% - 10px);
      /deep/ .thumb {
        width: 100px;
        height: 80px;
      }
    }
}
</style>
