<!--
 * @Description: 添加文件素材表单
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import { getFileIcon, filterSize } from '@/utils/common';
import Upload from '@/components/Upload.vue';
import { MEDIA_TYPE_FILE } from '@/utils/constant';

/**
 * 添加文件素材表单
 */
export default {
  name: 'AddFileForm',
  components: { Upload },
  props: {
    /**
     * 表单数据
     */
    form: {
      type: Object,
      default: () => {}
    },
    /**
     * 文件移除方法
     */
    removeFile: {
      type: Function,
      default: () => {}
    },
    /**
     * 文件名限制长度
     */
    limitFileName: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      uploadFile: {},
      MEDIA_TYPE_FILE
    };
  },
  computed: {
    /**
     * 获取文件类型图标class
     */
    getFileIconClass() {
      return getFileIcon(this.form.materialUrl);
    }
  },
  watch: {
    uploadFile(val) {
      const newForm = { ...this.form };
      newForm.content = val.size;
      this.$emit('changeForm', newForm);
    }
  },
  methods: {
    /**
     * 获取文件大小
     */
    getFileSize(fileSize) {
      return filterSize(fileSize);
    }
  }
};
</script>

<template>
  <el-form-item label="文件" prop="materialUrl">
    <div v-if="form.materialUrl" class="preview-file">
      <div class="left">
        <div class="title intwoline">{{ form.materialName }}</div>
        <div class="desc">{{ getFileSize(form.content) }}</div>
      </div>
      <div class="right">
        <svg class="icon" aria-hidden="true" width="50" height="50">
          <use :xlink:href="'#icon-' + getFileIconClass" />
        </svg>
      </div>
      <i class="el-icon-circle-close" @click="removeFile" />
    </div>
    <upload
      v-else
      class="upload-div"
      :file-url.sync="form.materialUrl"
      :file-name.sync="form.materialName"
      upload-txt="上传文件"
      :file.sync="uploadFile"
      :only-show-file-name="true"
      :type="MEDIA_TYPE_FILE"
      :limit-file-name="limitFileName"
    >
      <div slot="tip">
        支持doc、pdf、ppt等格式，文件大小不超过20M
      </div>
    </upload>
  </el-form-item>
</template>

<style lang="scss" scoped>
.preview-file {
    position: relative;
    display: flex;
    width: 200px;
    height: 70px;
    border: 1px solid $borderColor;
    padding: 10px;
    .desc {
      color: $grayColor;
      margin-top: 2px;
      font-size: 12px;
    }
    .left {
      line-height: 16px;
      flex: 1;
    }
    .right {
      width: 45px;
      .iconfont {
        font-size: 40px;
        line-height: initial;
      }
    }
    .el-icon-circle-close {
      font-size: 20px;
      position: absolute;
      right: -11px;
      top: -11px;
      background: #fff;
      border-radius: 50%;
    }
  }
</style>

