<!--
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog class="import-file-div" width="443px" v-bind="$attrs" append-to-body :title="'导入'+title" v-on="$listeners">
    <div v-show="step === FIRST_STEP" class="first-step">
      <el-alert
        v-if="alertTitle"
        :title="alertTitle"
        type="warning"
        :closable="false"
      />
      <div class="download-template">
        <div>1. 下载模板，将要导入的{{ title }}填入模板中</div>
        <el-link class="download-div theme-text-color" :href="href" :underline="false" target="_blank" :download="href" icon="el-icon-download">下载模板</el-link>
      </div>
      <div class="upload-template">
        2. 上传填写好的模板文件
        <el-upload
          class="upload-div"
          :http-request="customUploadFile"
          :action="action"
          :on-remove="resetData"
          :accept="accept"
          :file-list="fileList"
        >
          <el-button v-show="fileList.length === 0" class="upload-info" size="small" type="primary">
            <span>上传</span>
            <i class="iconfont icon-upload" style="color: #fff" />
          </el-button>
        </el-upload>
      </div>
    </div>
    <div v-show="step === SECOND_STEP" class="second-step">
      <div class="total">导入完成，导入<span class="success theme-text-color">成功{{ importInfo.successNum || 0 }}条</span>，导入<span class="fail">失败{{ importInfo.failNum || 0 }}条</span></div>
      <div v-if="importInfo && importInfo.failNum > 0" class="error-div">
        <div class="err-tip">下载导入失败报告，查看错误原因</div>
        <el-link class="download-div theme-text-color" :underline="false" icon="el-icon-download" @click="downloadErrFile(importInfo.url)">下载导入失败报告</el-link>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handelConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { FILE_EXCEL_TYPE } from '@/utils/constant';
import { download } from '@/utils/download';

const FIRST_STEP = 1;
const SECOND_STEP = 2;
export default {
  name: '',
  components: {},
  props: {
    alertTitle: {
      type: String,
      default: ''
    },
    uploadParams: {
      type: Object,
      default: () => {}
    },
    action: {
      type: String,
      default: ''
    },
    accept: {
      type: String,
      default: '*'
    },
    loading: {
      type: Boolean,
      default: false
    },
    importInfo: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: ''
    },
    href: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      importFile: {},
      FIRST_STEP,
      SECOND_STEP,
      step: FIRST_STEP,
      FILE_EXCEL_TYPE,
      fileList: [],
      formData: null
    };
  },
  created() {},
  mounted() {},
  methods: {
    close() {
      this.resetData();
      this.$emit('update:visible', false);
    },
    handelConfirm() {
      if (this.step === SECOND_STEP) {
        this.resetData();
        this.$emit('update:visible', false);
        return;
      }
      if (!this.formData) {
        this.msgWarn('请上传话术模板');
        return;
      }
      this.$emit('handleImportFile', this.formData);
      if (this.step !== SECOND_STEP) {
        this.step = this.step + 1;
        return;
      }
      this.resetData();
      this.$emit('update:visible', false);
    },
    // 清空数据
    resetData() {
      this.formData = null;
      this.step = FIRST_STEP;
      this.fileList = [];
    },
    dealFormat(file) {
      let isFormat = true;
      isFormat = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isFormat) this.msgError('上传文件只能是 xlsx 格式!');
      return isFormat;
    },
    handleBeforeUpload(file) {
      let isFormat = true;
      isFormat = this.dealFormat(file);
      return isFormat;
    },
    customUploadFile(params) {
      const { file } = params;
      const flag = this.handleBeforeUpload(file);
      if (!flag) return;
      const form = new FormData();
      form.append('file', file);
      for (const props in this.uploadParams) {
        form.append(props, this.uploadParams[props]);
      }
      this.formData = form;
      this.fileList = [{ name: file.name }];
    },
    /**
     * 下载失败文件
     */
    downloadErrFile(url) {
      download(url);
    }
  }
};
</script>
<style scoped lang='scss'>
.import-file-div {
    .download-div {
        margin: 10px 0;
        padding-left: 16px;
    }
    .first-step {
        .download-template {
            margin: 10px 0;
        }
        .upload-template {
            /deep/ .upload-div {
                margin-top: 10px;
                padding-left: 16px;
                button {
                  padding: 7px 15px;
                }
                .upload-info >span {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
            }
        }
    }
    .second-step {
        text-align: center;
        .total {
            margin: 10px;
            .fail {
                color: $red;
            }
        }
        .error-div {
            margin: 20px 0 10px;
            .err-tip {
                margin-bottom: 10px;
            }
        }
    }
}
</style>
