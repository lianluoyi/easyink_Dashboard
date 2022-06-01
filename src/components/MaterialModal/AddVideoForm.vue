<!--
 * @Description: 添加视频素材表单
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import { MEDIA_TYPE_VIDEO, MEDIA_TYPE_POSTER } from '@/utils/constant';
const MAX_BYTE = 1024;
const MAX_VIDEO_BYTE = 10;
const MAX_MAX_VIDEO_BYTE = 50;

/**
 * 添加视频素材表单
 */
export default {
  name: 'AddVideoForm',
  components: {},
  props: {
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
      MEDIA_TYPE_VIDEO,
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
  },
  methods: {
    handleSuccess(file) {
      const isSize = file.size / MAX_BYTE / MAX_BYTE;
      if (isSize > MAX_VIDEO_BYTE && isSize < MAX_MAX_VIDEO_BYTE) {
        this.$alert('视频大小已超过10M，将以链接形式发出', '操作须知', {
          confirmButtonText: '确定'
        });
      }
    }
  }
};
</script>

<template>
  <div class="video-material">
    <el-form-item label="视频" prop="materialUrl">
      <upload
        :file-url.sync="form.materialUrl"
        :file-name.sync="form.materialName"
        :file.sync="uploadFile"
        :type="MEDIA_TYPE_VIDEO"
        :limit-file-name="limitFileName"
        upload-tip="上传视频"
        :show-remove-file-icon="true"
        :upload-success="handleSuccess"
      >
        <div slot="tip">
          支持MP4格式，建议视频小于10M
        </div>
      </upload>
      <upload
        :file-url.sync="form.coverUrl"
        :type="MEDIA_TYPE_POSTER"
        style="margin-left: 20px"
        upload-tip="非必选，自定义封面"
        :show-remove-file-icon="true"
      >
        <div slot="tip">
          支持PNG、JPG格式，图片大小不超过2M，建议尺寸200:200
        </div>
      </upload>
    </el-form-item>
  </div>
</template>

<style lang="scss" scoped>
.video-material {
    display: flex;
    /deep/ .el-form-item__content {
      display: flex;
    }
    /deep/ .tip {
      margin-top: 10px;
    }
    /deep/ #myVideo {
      width: 178px;
    }
  }
</style>

