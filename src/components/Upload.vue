<script>
import { uploadFile2Cos } from '@/api/common';
import { MEDIA_TYPE_POSTER, MEDIA_TYPE_VIDEO } from '@/utils/constant';
import { dealUploadSize, dealFormat } from '@/utils/common';

const FILE_NAME_LENGTH = 100;

/**
 * 上传按钮(上传按钮样式根据图片/视频类型区分，且上传按钮是较大的矩形)
 */
export default {
  name: 'Upload',
  components: {},
  props: {
    fileUrl: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    // 0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file)
    type: {
      type: String,
      default: MEDIA_TYPE_POSTER
    },
    // 文件名字数限制
    limitFileName: {
      type: Number,
      default: FILE_NAME_LENGTH
    },
    uploadTip: {
      type: String,
      default: ''
    },
    // 上传后只显示文件名的样式
    onlyShowFileName: {
      type: Boolean,
      default: false
    },
    // 上传按钮的文字
    uploadTxt: {
      type: String,
      default: ''
    },
    uploadSuccess: {
      type: Function,
      default: () => {}
    },
    /**
     * 显示移除上传文件的图标
     */
    showRemoveFileIcon: {
      type: Boolean,
      default: false
    },
    uploadBtnType: {
      type: String,
      default: ''
    },
    /**
     * 总是显示上传按钮
     */
    alwaysShowBtn: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示文件列表
     */
    showFileList: {
      type: Boolean,
      default: false
    },
    customFileName: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      action: process.env.VUE_APP_BASE_API + '/common/uploadFile2Cos',
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_VIDEO
    };
  },
  computed: {
    accept() {
      return ['image/*', 'amr/*', 'video/*', '*'][this.type];
    }
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    /**
     * 上传前校验格式和大小
     */
    handleBeforeUpload(file) {
      this.loading = true;
      let isFormat = true;
      let isSize = true;
      isFormat = dealFormat(this.type, file, this);
      isSize = dealUploadSize(this.type, file, this);
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
      // this.$emit('update:fileUrl', res.data.materialUrl)
      // this.$emit('update:fileName', res.data.materialName)

      // if (this.type == 0) {
      //   res.url = res.data.url
      //   res.fileName = res.data.url
      // }
      this.$emit('update:fileUrl', res.data.url);
      const newFileName = this.dealImgName(file.name);
      this.$emit('update:fileName', newFileName);
      this.$emit('update:file', file);
      this.uploadSuccess(file, res.data);
      // this.fileUrl = URL.createObjectURL(file.raw)
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
      const newFileName = fileName.slice(0, this.limitFileName - ext.length) + ext;
      return newFileName;
    },
    customUploadFile(params) {
      const { file } = params;
      let newFile = file;
      // 图片名超过于上限
      let newFileName = this.customFileName ? (`${new Date().getTime()}/${file.name}`) : file.name;
      if (file.name.length > this.limitFileName && Number(this.type) === 0) {
        newFileName = this.dealImgName(file.name);
        newFile = new File([file], newFileName, { type: 'image/jpeg' });
      }
      // 封装数据
      const form = new FormData();
      form.append('file', newFile);
      form.append('mediaType', this.type);
      form.append('fileName', newFileName);
      uploadFile2Cos(form).then(res => {
        // 自行处理各种情况
        this.onSuccess(res, file);
      })
        .catch(() => {
          this.onError();
        });
    },
    /**
     * 移除文件
     */
    removeFile(e) {
      e.stopPropagation();
      this.$emit('update:fileUrl', '');
      this.$emit('update:file', {});
    },
    beforeUpload(file) {
      const flag = this.handleBeforeUpload(file);
      if (!flag) return false;
      return true;
    }
  }
};
</script>

<template>
  <div class="upload-div">

    <el-upload
      v-loading="loading"
      element-loading-text="正在上传..."
      class="uploader"
      :action="action"
      :accept="accept"
      :show-file-list="showFileList"
      :http-request="customUploadFile"
      v-bind="$attrs"
      :before-upload="beforeUpload"
      v-on="$listeners"
    >
      <div v-if="onlyShowFileName" class="upload-only-filename">
        <el-button :type="uploadBtnType" :style="{visibility: (fileUrl && !alwaysShowBtn) ? 'hidden': 'visible'}" size="small" class="upload-button">{{ uploadTxt }}</el-button>
        <div class="tip">
          <slot name="tip" />
        </div>
      </div>
      <template v-else>
        <slot>
          <template v-if="fileUrl">
            <div class="file-div">
              <i v-if="showRemoveFileIcon" class="el-icon-circle-close" @click="removeFile" />
              <img v-if="type === MEDIA_TYPE_POSTER" :src="fileUrl" class="upload-img">
              <div v-else-if="type === MEDIA_TYPE_VIDEO">
                <video
                  id="myVideo"
                  class="video-js vjs-default-skin vjs-big-play-centered"
                  width="100%"
                  controls
                  webkit-playsinline="true"
                  playsinline="true"
                  :autoplay="false"
                  preload="auto"
                  :src="fileUrl"
                />
              </div>
              <div v-else>{{ fileName }}</div>
            </div>
          </template>
          <div v-else class="upload-mark">
            <i class="el-icon-plus uploader-icon" />
            <div class="upload-tip">{{ uploadTip }}</div>
          </div>
        </slot>
      </template>
    </el-upload>
    <div v-if="!onlyShowFileName" class="tip">
      <slot name="tip" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/deep/.uploader {
  display: inline-block;
  line-height: 16px;
  .el-upload {
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    // overflow: hidden;
    &:hover {
      border-color: #409eff;
    }
    .upload-mark {
      display: flex;
      align-items: center;
      justify-content: center;
      .upload-tip {
        position: absolute;
        z-index: 999;
        color: $grayColor;
        margin-top: 60px;
      }
    }
  }
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
  border-radius: 6px;
  border: 1px dashed #d9d9d9;
}
.upload-img {
  width: 178px;
  height: 178px;
  display: block;
}
.tip {
  color: $grayColor;
  font-size: 12px;
  line-height: 16px;
}
.upload-only-filename {
  text-align: left;
  .tip {
    margin-top: 10px;
  }
}
.upload-div {
  .file-div {
    position: relative;
  }
  .el-icon-circle-close {
    position: absolute;
    font-size: 20px;
    position: absolute;
    right: -11px;
    top: -11px;
    background: #fff;
    border-radius: 50%;
    z-index: 999;
  }
}
</style>
