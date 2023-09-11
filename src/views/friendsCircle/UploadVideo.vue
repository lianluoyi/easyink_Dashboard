<!--
 * @Description: 视频上传
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import { uploadFile2Cos } from '@/api/common';
import { MEDIA_TYPE_VIDEO } from '@/utils/constant/index';
import { dealUploadSize, dealFormat, filterSize } from '@/utils/common';
const FILE_NAME_LENGTH = 32;
const VIDEOTIME = 30;
// 上传视频的大小
const VIDEO_BYTE = 50;
export default {
  name: 'UploadVideo',
  components: { },
  props: {
    uploadList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 是否显示上传的选项 本地、素材库
      showIcon: false,
      VIDEOTIME,
      loading: false,
      action: process.env.VUE_APP_BASE_API + '/common/uploadFile2Cos',
      MEDIA_TYPE_VIDEO,
      // 是否显示视频
      showMedia: true,
      // 上传成功后将url title size存在mediaLink中用来显示
      mediaLink: {},
      // 定义一个数组用来传给父组件
      fileList: [],
      FILE_NAME_LENGTH
    };
  },
  computed: {},
  watch: {
    uploadList(newval) {
      if (newval.length !== 0) {
        // 将上传按钮隐藏
        this.showMedia = false;
        this.mediaLink = newval[0];
      } else {
        this.showMedia = true;
      }
    }
  },
  created() {
    if (this.uploadList.length !== 0) {
      this.showMedia = false;
      this.mediaLink.url = this.uploadList[0].url;
      this.mediaLink.title = this.uploadList[0].title;
      this.mediaLink.size = this.uploadList[0].size;
    }
  },
  mounted() {},
  methods: {
    /**
     * 获取视频大小
     */
    getFileSize(size) {
      return filterSize(size);
    },
    enter() {
      this.showIcon = true;
    },
    leave() {
      this.showIcon = false;
    },
    /**
     * 上传前校验视频格式和大小 格式为mp4 大小不超过50M，时长不超过30s
     * 允许上传50M以下视频，如果大于10M，则以链接形式发出
     */
    handleBeforeUpload(file) {
      this.loading = true;
      let isFormat = true;
      let isSize = true;
      isFormat = dealFormat(MEDIA_TYPE_VIDEO, file, this);
      isSize = dealUploadSize(MEDIA_TYPE_VIDEO, file, this, VIDEO_BYTE);
      if (!isFormat || !isSize) {
        this.loading = false;
      }
      return isFormat && isSize;
    },
    onSuccess(res, file) {
      this.loading = false;
      this.showMedia = false;
      this.mediaLink.mediaType = Number(MEDIA_TYPE_VIDEO);
      this.mediaLink.title = res.data.fileName;
      this.mediaLink.url = res.data.url;
      this.mediaLink.size = file.size;
      this.fileList.push(this.mediaLink);
      // 传给父组件
      this.$emit('getType', this.fileList);
    },
    onError() {
      this.loading = false;
      this.msgError('上传文件失败');
    },
    /**
     * @description: 截取掉文件名超出限制的部分
     * @param {*} oldFileName 原有文件名
     * @return {*} 截取后文件名
     */
    dealImgName(oldFileName) {
      const index = oldFileName.lastIndexOf('.');
      const ext = oldFileName.substring(index);
      const fileName = oldFileName.substring(0, index);
      const newFileName = fileName.slice(0, this.FILE_NAME_LENGTH - ext.length) + ext;
      return newFileName;
    },
    // 自定义上传
    customUploadFile(params) {
      const { file } = params;
      let newFile = file;
      // 名字长度超过于上限
      let newFileName = file.name;
      if (file.name.length > this.FILE_NAME_LENGTH) {
        newFileName = this.dealImgName(file.name);
        newFile = new File([file], newFileName, { type: 'video/mp4' });
      }
      // 封装数据
      const form = new FormData();
      form.append('file', newFile);
      form.append('mediaType', MEDIA_TYPE_VIDEO);
      form.append('fileName', newFileName);
      uploadFile2Cos(form).then(res => {
        // 自行处理各种情况
        this.onSuccess(res, file);
      })
        .catch(() => {
          this.onError();
        });
    },
    beforeUpload(file) {
      const flag = this.handleBeforeUpload(file);
      if (!flag) return false;
      return true;
    },
    // 打开素材库
    openMaterial() {
      this.$emit('openMaterial', true);
    },
    // 删除视频
    removeFile() {
      this.showMedia = true;
      this.fileList = [];
      this.$emit('deleteFileList', this.fileList);
    }
  }
};
</script>

<template>
  <div>
    <el-upload
      v-if="showMedia"
      v-loading="loading"
      :action="action"
      :drag="true"
      :show-file-list="false"
      :http-request="customUploadFile"
      accept=".mp4"
      :before-upload="beforeUpload"
    >
      <div
        @mouseenter="enter"
        @mouseleave="leave"
      >
        <div v-show="!showIcon" class="upload-icon">
          <i slot="default" class="el-icon-plus" />
          <span>上传视频</span>
        </div>
        <div v-show="showIcon" class="upload-icon">
          <el-button class="hover-button">本地上传</el-button>
          <el-button class="hover-button" @click.stop="openMaterial">素材库</el-button>
        </div>
      </div>
    </el-upload>
    <div v-else style="width:360px">
      <div class="preview-div">
        <i class="el-icon-close" @click="removeFile" />
        <template>
          <div class="cover-img">
            <video :src="mediaLink.url" />
            <svg class="icon-player" :width="30" :height="30">
              <use href="#icon-player" />
            </svg>
          </div>
          <div class="file-info">
            <div class="inoneline">{{ mediaLink.title }}</div>
            <div class="file-size">{{ getFileSize(mediaLink.size) }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 隐藏上传按钮
/deep/.uoloadSty .el-upload--picture-card{
  width:70px !important;
  height:70px!important;
  line-height:70px;
}
/deep/.disUoloadSty .el-upload--picture-card{
  display:none;   /* 上传按钮隐藏 */
}
/deep/ .el-upload-list--picture-card .el-upload-list__item {
  width: 70px;
  height: 70px;
}
/deep/ .el-button + .el-button {
  margin-left: 0;
}
.upload-icon {
  display: flex;
  font-size: 12px;
  height: 70px;
  justify-content: center;
  line-height: 23px;
  flex-direction: column;
  /deep/ .el-icon-plus {
    font-size: 28px;
    color: #8c939d;
  }
}
.hover-button {
  width:68px;
  height:28px;
}
/deep/ .el-button--small {
  padding:9px 9px;
}
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
      height: 60px;
      width: 60px;
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
