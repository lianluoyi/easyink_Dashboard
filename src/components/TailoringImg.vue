<!--
 * @Description: 图片裁剪工具
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog v-bind="$attrs" width="800px" append-to-body :close-on-click-modal="false" @opened="modalOpened" @close="onClose">
    <el-row>
      <el-col :xs="24" :md="12" :style="{height: '350px'}">
        <vue-cropper
          v-if="visible"
          ref="cropper"
          :img="options.img"
          :info="true"
          :auto-crop="options.autoCrop"
          :auto-crop-width="options.autoCropWidth"
          :auto-crop-height="options.autoCropHeight"
          :fixed-box="options.fixedBox"
          @realTime="realTime"
        />
      </el-col>
      <el-col :xs="24" :md="12" :style="{height: '350px'}">
        <div class="avatar-upload-preview">
          <img :src="previews.url" :style="previews.img">
        </div>
      </el-col>
    </el-row>
    <br>
    <el-row>
      <el-col :lg="2" :md="2">
        <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
          <el-button size="small">
            上传
            <i class="el-icon-upload el-icon--right" />
          </el-button>
        </el-upload>
      </el-col>
      <el-col :lg="{span: 1, offset: 2}" :md="2">
        <el-button icon="el-icon-plus" size="small" @click="changeScale(1)" />
      </el-col>
      <el-col :lg="{span: 1, offset: 1}" :md="2">
        <el-button icon="el-icon-minus" size="small" @click="changeScale(-1)" />
      </el-col>
      <el-col :lg="{span: 1, offset: 1}" :md="2">
        <el-button icon="el-icon-refresh-left" size="small" @click="rotateLeft()" />
      </el-col>
      <el-col :lg="{span: 1, offset: 1}" :md="2">
        <el-button icon="el-icon-refresh-right" size="small" @click="rotateRight()" />
      </el-col>
      <el-col :lg="{span: 2, offset: 6}" :md="2">
        <el-button type="primary" size="small" @click="uploadImg()">提 交</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import { VueCropper } from 'vue-cropper';
import { MEDIA_TYPE_POSTER } from '@/utils/constant/index';

const AUTO_CROP_SIZE = 200;

export default {
  name: 'TailoringImg',
  components: { VueCropper },
  props: {
    uploadFieldName: {
      type: String,
      default: 'file'
    },
    uploadImgUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 是否显示cropper
      visible: false,
      options: {
        img: this.uploadImgUrl, // 裁剪图片的地址
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: AUTO_CROP_SIZE, // 默认生成截图框宽度
        autoCropHeight: AUTO_CROP_SIZE, // 默认生成截图框高度
        fixedBox: true // 固定截图框大小 不允许改变
      },
      previews: {},
      MEDIA_TYPE_POSTER,
      file: {}
    };
  },
  created() {},
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:visible', false);
      this.options.img = '';
    },
    // 打开弹出层结束时的回调
    modalOpened() {
      this.visible = true;
    },
    // 实时预览
    realTime(data) {
      this.previews = data;
    },
    // 覆盖默认的上传行为
    requestUpload(params) {
      const { file } = params;
      this.file = file;
    },
    // 上传预处理
    beforeUpload(file) {
      if (file.type.indexOf('image/') === -1) {
        this.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。');
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.options.img = reader.result;
          this.previews.fileName = file.name;
        };
      }
    },
    // 图片缩放
    changeScale(num) {
      num = num || 1;
      this.$refs.cropper.changeScale(num);
    },
    // 向左旋转
    rotateLeft() {
      this.$refs.cropper.rotateLeft();
    },
    // 向右旋转
    rotateRight() {
      this.$refs.cropper.rotateRight();
    },
    // 上传图片
    async uploadImg() {
      const formData = new FormData();
      await this.$refs.cropper.getCropBlob(data => {
        const newFile = new File([data], this.file.name, { type: 'image/jpeg' });
        formData.append(this.uploadFieldName, newFile);
        formData.append('fileName', this.file.name);
        this.$emit('handleUpload', formData);
      });
    }
  }

};
</script>
<style scoped lang='scss'>
</style>
