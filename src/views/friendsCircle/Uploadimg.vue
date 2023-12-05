<!--
 * @Description: 链接的上传图片
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import { uploadFile2Cos } from '@/api/common';
import { MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MAX_LONG_SIDE, MAX_SHORT_SIDE } from '@/utils/constant/index';
import { dealUploadSize, dealFormat, judgeDetermineResolution } from '@/utils/common';
const IMAGELENGTH = 1;
// 上传图片的大小
const IMG_BYTE = 10;
// 上传图片名字的限制
const FILE_NAME_LENGTH = 32;
/**
 * 上传按钮(上传按钮样式根据图片/视频类型区分，且上传按钮是较大的矩形)
 */
export default {
  name: 'Upload',
  components: { },
  props: {
    uploadList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      MAX_LONG_SIDE,
      MAX_SHORT_SIDE,
      showIcon: false,
      showBtnDealImg: true,
      noneBtnImg: false,
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: [],
      loading: false,
      action: process.env.VUE_APP_BASE_API + '/common/uploadFile2Cos',
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      // 上传的最大照片数量
      limitNum: IMAGELENGTH,
      mediaLink: {},
      ImgList: [],
      timelimit: true,
      FILE_NAME_LENGTH
    };
  },
  computed: {},
  watch: {
    uploadList(newval) {
      this.fileList = this.uploadList;
    }
  },
  beforeUpdate() {
    if (this.fileList.length !== 0) {
      this.noneBtnImg = true;
    }
  },
  created() {
    if (this.uploadList[0] !== undefined) {
      this.fileList = this.uploadList;
      this.noneBtnImg = true;
      if (this.uploadList[0].coverUrl) {
        this.fileList[0].url = this.uploadList[0].coverUrl;
      }
    }
  },
  methods: {
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
    enter() {
      this.showIcon = true;
    },
    leave() {
      this.showIcon = false;
    },
    // 预览图片
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    /**
     * 上传前校验格式和大小
     */
    handleBeforeUpload(file) {
      this.loading = true;
      let isFormat = true;
      let isSize = true;
      isFormat = dealFormat(MEDIA_TYPE_POSTER, file, this);
      isSize = dealUploadSize(MEDIA_TYPE_POSTER, file, this, IMG_BYTE);
      if (!isFormat || !isSize) {
        this.loading = false;
      }
      return isFormat && isSize;
    },
    onSuccess(res, file) {
      this.loading = false;
      this.fileList[0].url = res.data.url;
      this.fileList[0].mediaType = Number(MEDIA_TYPE_IMGLINK);
      // 传给父组件
      this.$emit('getType', this.fileList);
    },
    onError() {
      this.loading = false;
      this.msgError('上传文件失败');
    },
    customUploadFile(params) {
      const { file } = params;
      let newFile = file;
      // 名字长度超过于上限
      let newFileName = file.name;
      if (file.name.length > this.FILE_NAME_LENGTH) {
        newFileName = this.dealImgName(file.name);
        newFile = new File([file], newFileName, { type: 'image/jpg' });
      }
      // 封装数据
      const form = new FormData();
      form.append('file', newFile);
      form.append('mediaType', MEDIA_TYPE_POSTER);
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
      return new Promise((resolve, reject) => {
        const flag = this.handleBeforeUpload(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          // 让页面中的img标签的src指向读取的路径
          const img = new Image();
          img.src = reader.result;
          img.onload = () => {
            if (!judgeDetermineResolution(img.width, img.height)) {
              reject(false);
              this.msgWarn(`图片尺寸超过限制，长边≤${MAX_LONG_SIDE}px，短边≤${MAX_SHORT_SIDE}px,请重新上传`);
            } else {
              if (!flag) {
                reject(false);
              } else {
                resolve();
              }
            }
          };
        };
      });
    },
    handleEditChange(file, fileList) {
      this.noneBtnImg = fileList.length >= this.limitNum;
      this.fileList = [...fileList];
    },
    handleDealImgRemove(file, fileList) {
      this.noneBtnImg = fileList.length >= this.limitNum;
      this.fileList = [];
      this.$emit('deleteFileList', this.fileList);
    },
    // 打开素材库
    openMaterial() {
      this.$emit('openMaterial', true);
    }
  }
};
</script>

<template>
  <div>
    <el-upload
      :class="{uoloadSty:showBtnDealImg,disUoloadSty:noneBtnImg}"
      :action="action"
      list-type="picture-card"
      :file-list="fileList"
      :drag="true"
      :http-request="customUploadFile"
      :on-remove="handleDealImgRemove"
      :on-preview="handlePictureCardPreview"
      accept=".jpg,.png"
      :before-upload="beforeUpload"
      :on-change="handleEditChange"
      :limit="limitNum"
    >
      <div
        @mouseenter="enter"
        @mouseleave="leave"
      >
        <div v-show="!showIcon" class="upload-icon">
          <i slot="default" class="el-icon-plus" />
          <span>上传封面</span>
        </div>
        <div v-show="showIcon" class="upload-icon">
          <el-button class="hover-button">本地上传</el-button>
          <el-button class="hover-button" @click.stop="openMaterial">素材库</el-button>
        </div>
      </div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>

</template>

<style lang="scss" scoped>
// 隐藏上传按钮
/deep/.uoloadSty .el-upload--picture-card{
  width:70px !important;
  height:70px!important;
  line-height:70px;
}
/deep/ .el-upload--picture-card {
  border: 0px !important;
}
/deep/.disUoloadSty .el-upload--picture-card{
  display:none;   /* 上传按钮隐藏 */
}
/deep/.el-upload-list__item {
  transition: none !important;
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
