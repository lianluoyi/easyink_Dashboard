<!--
 * @Description: 添加海报素材表单
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import { MEDIA_TYPE_POSTER } from '@/utils/constant/index';

/**
 * 添加海报素材表单
 */
export default {
  name: 'AddPosterForm',
  components: {},
  props: {
    /**
     * 表单数据
     */
    form: {
      type: Object,
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
      MEDIA_TYPE_POSTER,
      uploadFile: {}
    };
  },
  watch: {
    uploadFile(val) {
      const newForm = { ...this.form };
      newForm.content = val.size;
      this.$emit('changeForm', newForm);
    }
  }
};
</script>

<template>
  <div class="poster-material">
    <el-form-item label="海报" prop="materialUrl">
      <upload
        :file-url.sync="form.materialUrl"
        :file-name.sync="form.materialName"
        :type="MEDIA_TYPE_POSTER"
        :limit-file-name="limitFileName"
        upload-tip="上传海报"
        upload-class="poster-upload"
        :file.sync="uploadFile"
        :show-remove-file-icon="true"
      >
        <div slot="tip">
          支持PNG、JPG格式，图片大小不超过2M，建议尺寸150:256
        </div>
      </upload>
    </el-form-item>
  </div>
</template>

<style lang="scss" scoped>
.poster-material {
    /deep/ .upload-div {
      display: flex;
      align-items: flex-end;
      .tip {
        margin-left: 10px;
        margin-bottom: 10px;
      }
      .uploader-icon {
        height: 256px;
        line-height: 256px;
        width: 150px;
      }
      .upload-img {
        max-width: 150px;
        max-height: 256px;
      }
    }
  }
</style>

