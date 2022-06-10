<script>
import { successCode } from '@/utils/httpCode';
const MAX_BYTE = 1024;
const LIMIT_BYTE = 20;
/**
 * 上传按钮(上传按钮样式是普通的按钮)
 * @displayName Upload(上传按钮)
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
    uploadTxt: {
      type: String,
      default: '点击上传'
    },
    accept: {
      type: String,
      default: 'text/plain'
    },
    action: {
      type: String,
      default: process.env.VUE_APP_BASE_API + '/common/uploadCert'
    }
    // beforeUpload: {
    //   type: Function,
    //   default: function() {
    //     return function() {}
    //   },
    // },
  },
  data() {
    return {
      loading: false,
      // (this.type == 0
      //   ? '/wecom/material/uploadimg'
      //   : '/common/uploadFile2Cos'),
      headers: window.CONFIG.headers,
      domain: process.env.VUE_APP_BASE_API
      // fileList: this.$fileUrl ? [{name: '', url: this.$fileUrl}] : []
    };
  },
  computed: {
  },
  watch: {
    fileUrl(val) {
      console.log('url', val);
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleBeforeUpload(file) {
      this.loading = true;
      const isFormat = true;
      const isSize = file.size / MAX_BYTE / MAX_BYTE < LIMIT_BYTE;

      if (!isSize) {
        this.msgError('上传文件大小不能超过 20MB!');
      }
      if (!isFormat || !isSize) {
        this.loading = false;
      }

      return isFormat && isSize;
    },
    onSuccess(res, file) {
      // if (res.code === 200) {
      this.loading = false;
      // this.$emit('update:fileUrl', res.data.materialUrl)
      // this.$emit('update:fileName', res.data.materialName)
      if (res.code !== successCode) {
        this.msgError('上传文件失败', res.msg);
        return;
      }
      let fileUrl = res.url;
      if (this.action.includes('uploadFile2Cos')) {
        fileUrl = res.data.url;
      }
      this.$emit('update:fileUrl', fileUrl);
      this.$emit('update:fileName', file.name);
      this.$emit('update:file', file);
      // this.fileList = [{name: file.name, url: res.url}]
      // this.fileUrl = URL.createObjectURL(file.raw)
      // }
    },
    onError(err, file, fileList) {
      if (err) {
        console.error('上传文件失败', err);
      }
      this.loading = false;
      this.msgError('上传文件失败');
    },
    handleRemove(file, fileList) {
      // this.fileList = []
      this.$emit('update:fileUrl', '');
      this.$emit('update:fileName', null);
    }
  }
};
</script>

<template>
  <div>
    <el-upload
      element-loading-text="正在上传..."
      class="txt-uploader"
      :accept="accept"
      :action="action"
      :headers="headers"
      :on-success="onSuccess"
      :on-remove="handleRemove"
      :on-error="onError"
      :before-upload="handleBeforeUpload"
      :file-list="fileUrl ? [{name: fileName, url: fileUrl}] : []"
    >
      <el-button :style="{visibility: fileUrl ? 'hidden': 'visible'}" size="small" type="primary" class="upload-button theme-text-color">{{ uploadTxt }}</el-button>
      <div class="tip">
        <slot name="tip" />
      </div>
    </el-upload>

  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
/deep/.txt-uploader {
  display: inline-block;
  .el-upload {
    border-radius: 3px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    text-align: left;
    button {
      border-radius: inherit;
    }
    &:hover {
      border-color: #409eff;
    }
  }
}

.tip {
  color: #aaa;
  font-size: 12px;
}
.upload-button {
  background: #fff;
  &:hover {
    @include bg_color($color-theme2-1);
    color: #fff;
  }
}
</style>
