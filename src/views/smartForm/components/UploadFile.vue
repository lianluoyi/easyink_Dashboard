<!--
 * @Description: 表单上传组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
// TODO 代码优化
<template>
  <div v-if="showType === DRAG_ONE_TYPE || showType === UPLOAD_ONE_TYPE" class="el-upload-list--picture-card upload-list">
    <div v-if="fileUrl" class="preview-div">
      <el-image
        v-if="showType === DRAG_ONE_TYPE"
        style="width:100%;height:121px"
        :src="fileUrl"
        fit="cover"
      />
      <el-image
        v-if="showType === UPLOAD_ONE_TYPE"
        style="width: 80px; height: 80px;border-radius: 5px;"
        :src="fileUrl"
        fit="fill"
      />
      <span class="el-upload-list__item-actions">
        <span class="el-upload-list__item-delete" @click="removeFile">
          <i class="el-icon-delete" />
        </span>
      </span>
    </div>
    <el-upload
      v-else
      v-loading="loading"
      style="line-height: 12px;"
      v-bind="$attrs"
      :action="action"
      :before-upload="handleBeforeUpload"
      :http-request="customUploadFile"
    >
      <div v-if="showType === DRAG_ONE_TYPE">
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          <div class="text">
            {{ text }}<em>点击上传</em>
          </div>
          <div v-if="tip" class="tip">{{ tip }}</div>
        </div>
      </div>
      <div v-else class="upload-icon">
        <i slot="default" class="el-icon-plus" />
        <span>上传图片</span>
      </div>
    </el-upload>
  </div>
  <div v-else class="carousel-upload">
    <div v-for="(item, index) in fileList" :key="index" class="el-upload-list--picture-card upload-list mr5 mb5 ">
      <div class="preview-div">
        <el-image
          style="width: 80px; height: 80px;border-radius: 5px;"
          :src="item.url"
          fit="fill"
        />
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-delete" @click="handleDealImgRemove(index)">
            <i class="el-icon-delete" />
          </span>
        </span>
      </div>
    </div>
    <el-upload
      v-show="fileList.length !== limit"
      v-bind="$attrs"
      :action="action"
      list-type="picture-card"
      :file-list="fileList"
      :http-request="customUploadFile"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :show-file-list="false"
    >
      <div class="upload-icon">
        <i slot="default" class="el-icon-plus" />
        <span>上传图片</span>
      </div>
    </el-upload>
    <span class="tip">
      {{ tip }}
    </span>
  </div>
</template>
<script>
import { uploadFile2Cos } from '@/api/common';
import { dealFormat, dealUploadSize, getFileIcon } from '@/utils/common';
import { IMAGE_COMPONENT, CAROUSEL_COMPONENT, MEDIA_TYPE_POSTER, UPLOAD_ONE_TYPE, MAX_APPENDIX_NUM, DRAG_ONE_TYPE } from '@/utils/constant';
const UPLOAD_BYTE = 2;
export default {
  name: '',
  components: {},
  props: {
    text: {
      type: String,
      default: '将文件拖到此处，或'
    },
    // 当前上传展示类型
    showType: {
      type: Number,
      default: DRAG_ONE_TYPE
    },
    tip: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      default: ''
    },
    fileUrl: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: MAX_APPENDIX_NUM
    },
    fileUrlList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      IMAGE_COMPONENT,
      CAROUSEL_COMPONENT,
      DRAG_ONE_TYPE,
      UPLOAD_ONE_TYPE,
      fileList: []
    };
  },
  computed: {
    /**
     * 获取文件类型图标class
     */
    getFileIconClass() {
      return getFileIcon(this.fileUrl);
    }
  },
  watch: {
    fileUrlList: {
      deep: true,
      handler: function(val) {
        this.fileList = val;
      }
    }
  },
  created() {},
  mounted() {
  },
  methods: {
    /**
     * @description 处理轮播图 图片的移除
     */
    handleDealImgRemove(index) {
      this.fileList.splice(index, 1);
      this.$emit('update:fileUrlList', this.fileList);
    },
    customUploadFile(params) {
      const { file } = params;
      const flag = this.handleBeforeUpload(file);
      if (!flag) return;
      const newFile = file;
      // 封装数据
      const form = new FormData();
      form.append('file', newFile);
      form.append('mediaType', MEDIA_TYPE_POSTER);
      form.append('fileName', file.name);
      uploadFile2Cos(form).then(res => {
        // 自行处理各种情况
        this.onSuccess(res);
      }).catch(() => {
        this.loading = false;
        this.msgError('上传文件失败');
      });
    },
    handleBeforeUpload(file) {
      this.loading = true;
      let isFormat = true;
      let isSize = true;
      isFormat = dealFormat(MEDIA_TYPE_POSTER, file, this);
      isSize = dealUploadSize(MEDIA_TYPE_POSTER, file, this, UPLOAD_BYTE);
      if (!isFormat || !isSize) {
        this.loading = false;
      }
      return isFormat && isSize;
    },
    onSuccess(res) {
      if (this.showType === DRAG_ONE_TYPE || this.showType === UPLOAD_ONE_TYPE) {
        this.$emit('update:fileUrl', res.data.url);
      } else {
        this.fileList.push(res.data);
        this.$emit('update:fileUrlList', this.fileList);
      }
      this.loading = false;
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
.tip {
    color: #aaa;
    font-size: 12px;
}
.upload-drag-div {
  /deep/ .el-upload {
      width: 100%;
      .el-upload-dragger {
          width: 100%;
          height: 120px;
          .el-icon-upload {
            margin: 0 16px;
            margin-top: 5px;
          }
      }
  }
  .text, .tip {
      line-height: 26px;
  }
  /deep/ .el-upload-list {
    display: none;
  }
}
.preview-div {
  position: relative;
  display: flex;
  .el-upload-list__item-actions {
    border-radius: 5px;
  }
  .el-icon-close {
    position: absolute;
    right: 8px;
    top: 8px;
    cursor: pointer;
    z-index: 999;
    display: none;
  }
}
.preview-div:hover {
  .el-icon-close  {
    display: flex;
  }
}
.carousel-upload {
  display: flex;
  flex-wrap: wrap;
}
.upload-icon {
  display: flex;
  font-size: 12px;
  height: 80px;
  justify-content: center;
  line-height: 23px;
  flex-direction: column;
}
/deep/.el-upload--picture-card {
  width: 80px !important;
  height: 80px!important;
  line-height: 80px;
}
</style>
