<!--
 * @Description: 上传拖拽组件
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div v-if="fileObj.url" class="preview-div">
    <i v-if="!disabledEdit" class="el-icon-close" @click="removeFile" />
    <template v-if="mediaType === MEDIA_TYPE_POSTER">
      <div class="cover-img">
        <el-image
          :src="fileObj.url"
          :width="60"
          :height="60"
        />
      </div>
      <div class="file-info">
        <div class="inoneline">{{ fileObj.title }}</div>
        <div class="file-size">{{ getFileSize(fileObj.content) }}</div>
      </div>
    </template>
    <template v-if="mediaType===MEDIA_TYPE_FILE">
      <div class="cover-img">
        <svg class="icon" aria-hidden="true" width="50" height="50">
          <use :xlink:href="'#icon-' + getFileIconClass" />
        </svg>
      </div>
      <div class="file-info">
        <div class="inoneline">{{ fileObj.title }}</div>
        <div class="file-size">{{ getFileSize(fileObj.content) }}</div>
      </div>
    </template>
    <template v-if="mediaType===MEDIA_TYPE_VIDEO">
      <div class="cover-img">
        <video :src="fileObj.url" />
        <svg class="icon-player" :width="25" :height="25">
          <use href="#icon-player" />
        </svg>
      </div>
      <div class="file-info">
        <div class="inoneline">{{ fileObj.title }}</div>
        <div class="file-size">{{ getFileSize(fileObj.content) }}</div>
      </div>
    </template>
  </div>
  <el-upload
    v-else
    v-loading="loading"
    class="upload-drag-div"
    drag
    :action="action"
    :http-request="customUploadFile"
    v-bind="$attrs"
  >

    <i class="el-icon-upload" />
    <div class="el-upload__text">
      <div class="text">
        {{ text }}<em>点击上传</em>
      </div>
      <div v-if="tip" class="tip">{{ tip }}</div>
    </div>
  </el-upload>
</template>
<script>
import { uploadFile2Cos } from '@/api/common';
import { dealImgName, dealFormat, dealUploadSize, filterSize, getFileIcon } from '@/utils/common';
import {
  MEDIA_TYPE_POSTER, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE
} from '@/utils/constant';
const FILE_NAME_LENGTH = 100;
const VIDEO_BYTE = 10;

export default {
  name: '',
  components: {},
  props: {
    text: {
      type: String,
      default: '将文件拖到此处，或'
    },
    tip: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    // 文件名字数限制
    limitFileName: {
      type: Number,
      default: FILE_NAME_LENGTH
    },
    mediaType: {
      type: String,
      default: MEDIA_TYPE_POSTER
    },
    // 文件地址
    fileObj: {
      type: Object,
      default: () => {}
    },
    showContent: {
      type: Boolean,
      default: true
    },
    /**
     * 禁止编辑
     */
    disabledEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE
    };
  },
  computed: {
    /**
     * 获取文件类型图标class
     */
    getFileIconClass() {
      return getFileIcon(this.fileObj.url);
    }
  },
  created() {},
  mounted() {},
  methods: {
    customUploadFile(params) {
      const { file } = params;
      const flag = this.handleBeforeUpload(file);
      if (!flag) return;
      let newFile = file;
      // 图片名超过于上限
      if (file.name.length > this.limitFileName) {
        const newFileName = dealImgName(file.name, this.limitFileName);
        newFile = new File([file], newFileName, { type: 'image/jpeg' });
      }
      // 封装数据
      const form = new FormData();
      form.append('file', newFile);
      form.append('mediaType', this.mediaType);
      uploadFile2Cos(form).then(res => {
        // 自行处理各种情况
        this.onSuccess(res, newFile);
      }).catch(() => {
        this.loading = false;
        this.msgError('上传文件失败');
      });
    },
    handleBeforeUpload(file) {
      this.loading = true;
      let isFormat = true;
      let isSize = true;
      isFormat = dealFormat(this.mediaType, file, this);
      isSize = dealUploadSize(this.mediaType, file, this, VIDEO_BYTE);
      if (!isFormat || !isSize) {
        this.loading = false;
      }
      // if (beforeUpload) {
      //   return beforeUpload(file)
      // }
      return isFormat && isSize;
    },
    onSuccess(res, file) {
      this.loading = false;
      this.$emit('update:fileUrl', res.data.url);
      if (!this.fileName) {
        const newFileName = dealImgName(file.name);
        this.$emit('update:fileName', newFileName);
      }
      this.$emit('update:fileSize', file.size);
      this.$emit('update:file', file);
      // this.fileUrl = URL.createObjectURL(file.raw)
    },
    /**
     * 获取文件大小
     */
    getFileSize(fileSize) {
      return this.fileObj.content && this.showContent ? filterSize(fileSize) : '';
    },
    removeFile() {
      this.$emit('update:fileUrl', null);
      this.$emit('update:fileName', null);
      this.$emit('update:fileSize', null);
      this.$emit('update:file', {});
    }
  }

};
</script>
<style scoped lang='scss'>
.upload-drag-div {
    /deep/ .el-upload {
        width: 100%;
        .el-upload-dragger {
            width: 100%;
        }
    }
    .text, .tip {
        line-height: 26px;
    }
    .tip {
        color: #aaa;
        font-size: 12px;
    }
    /deep/ .el-upload-list {
      display: none;
    }
}
.preview-div {
  padding: 10px;
  border: 1px solid $borderColor;
  border-radius: 3px;
  position: relative;
  display: flex;
  .cover-img {
    height: 60px;
    min-width: 60px;
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    video {
      object-fit: cover;
      height: 100%;
      width: 100%;
    }
    .icon-player {
      position: absolute;
    }
    /deep/ .el-image {
      height: 60px;
      width: 60px;
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
  .el-icon-close {
    position: absolute;
    right: 8px;
    top: 8px;
    cursor: pointer;
  }
}
</style>
