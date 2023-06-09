<template>
  <el-dialog
    class="import-file-div"
    width="500px"
    v-bind="$attrs"
    append-to-body
    title="导入批量打标签任务"
    :close-on-click-modal="step === SECOND_STEP"
    v-on="$listeners"
    @close="close"
  >
    <div v-show="step === FIRST_STEP" class="first-step">
      <div class="download-template">
        <div>1. 下载模板，将要打标签的客户信息填入模板中</div>
        <el-link
          class="download-div theme-text-color"
          :href="href"
          :underline="false"
          target="_blank"
          :download="href"
        >
          <svg-icon icon-class="download-icon" class-name="theme-text-color" />
          下载模板
        </el-link>
      </div>
      <div class="upload-template">
        2. 上传填写好的模板文件
        <el-form ref="form" :model="uploadForm" :rules="rules" label-width="80px">
          <el-form-item label="任务名称" prop="taskName">
            <el-input v-model="uploadForm.taskName" style="width:240px" placeholder="请填写任务名称，方便管理" maxlength="32" show-word-limit />
          </el-form-item>
          <el-form-item label="客户标签" prop="tag">
            <el-button
              class="mr10"
              icon="el-icon-plus"
              size="mini"
              @click="selectTagVisible = true"
            >添加标签</el-button>
            <el-tag
              v-for="(unit, unique) in selectedTags"
              :key="unique"
              type="info"
              closable
              class="mt5"
              size="medium"
              @close="deleteTag(unit)"
            >{{ unit.name }}</el-tag>
          </el-form-item>
          <el-form-item label="模板文件" prop="file">
            <el-upload
              class="upload-div"
              :http-request="customUploadFile"
              :on-remove="removeFile"
              action=""
              :file-list="fileList"
              :before-upload="handleBeforeUpload"
            >
              <el-button
                v-show="fileList.length === 0"
                class="upload-info"
                size="mini"
                type="primary"
              >
                <span>上传</span>
                <i class="iconfont icon-upload" style="color: #fff" />
              </el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-show="step === SECOND_STEP" class="second-step">
      <div class="total">
        导入完成，导入<span
          class="success theme-text-color"
        >成功{{ importInfo.successNum || 0 }}条</span>，导入<span class="fail">失败{{ importInfo.failNum || 0 }}条</span>
      </div>
      <div v-if="importInfo && importInfo.failNum > 0" class="error-div">
        <div class="err-tip">下载导入失败报告，查看错误原因</div>
        <el-link
          class="download-div theme-text-color"
          :underline="false"
          icon="el-icon-download"
          @click="downloadErrFile(importInfo.url)"
        >下载导入失败报告</el-link>
      </div>
    </div>
    <div v-show="step === FIRST_STEP" slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handelConfirm"
      >确定</el-button>
    </div>
    <SelectTag
      type="query"
      title="选择标签"
      :is-show-add="true"
      :visible.sync="selectTagVisible"
      :selected="selectedTags"
      @success="submitSelectTag"
    />
  </el-dialog>
</template>
<script>
import { FILE_EXCEL_TYPE } from '@/utils/constant';
import { download } from '@/utils/download';
import { importBatchTagTask } from '@/api/batchTagTask';
import SelectTag from '@/components/SelectTag';
const FIRST_STEP = 1;
const SECOND_STEP = 2;
export default {
  name: '',
  components: { SelectTag },
  props: {
    href: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      FIRST_STEP,
      SECOND_STEP,
      step: FIRST_STEP,
      FILE_EXCEL_TYPE,
      fileList: [],
      uploadFile: null,
      importInfo: {},
      uploadForm: {},
      selectedTags: [],
      loading: false,
      rules: Object.freeze({
        taskName: [
          { required: true, message: '请填写任务名称', trigger: 'blur' }
        ],
        tag: [{ required: true, validator: (rule, value, callback) => {
          if (!this.selectedTags.length) {
            return callback(new Error('请选择标签'));
          }
          return callback();
        }, trigger: 'blur' }],
        file: [{ required: true, validator: (rule, value, callback) => {
          if (!this.fileList.length) {
            return callback(new Error('请上传文件'));
          }
          return callback();
        }, trigger: 'blur' }]
      }),
      selectTagVisible: false
    };
  },
  created() {},
  mounted() {},
  methods: {
    close() {
      if (this.step === SECOND_STEP) {
        this.$emit('onSearch');
      }
      this.resetData();
      this.$emit('update:visible', false);
    },
    /**
     * @description 根据prop移除校验结果
     * @param prop
     */
    clearValidate(prop) {
      this.$refs['form'].clearValidate(prop);
    },
    handelConfirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const form = new FormData();
          form.append('file', this.uploadFile);
          form.append('taskName', this.uploadForm.taskName);
          form.append('tagIds', this.uploadForm.tagIds);
          this.loading = true;
          importBatchTagTask(form).then((res) => {
            this.importInfo = res.data;
            this.step = SECOND_STEP;
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },
    // 清空数据
    resetData() {
      this.uploadForm = {};
      this.step = FIRST_STEP;
      this.selectedTags = [];
      this.removeFile();
      this.$refs['form'].resetFields();
    },
    removeFile() {
      this.fileList = [];
      this.uploadFile = null;
    },
    handleBeforeUpload(file) {
      const isFormat =
        file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isFormat) this.msgError('上传文件只能是 xlsx 格式!');
      return isFormat;
    },
    customUploadFile(params) {
      const { file } = params;
      this.uploadFile = file;
      this.clearValidate('file');
      this.fileList = [{ name: file.name }];
    },
    // 选择的标签
    submitSelectTag(selected) {
      this.uploadForm.tagIds = selected.map((tag) => tag.tagId);
      this.selectedTags = [...selected];
      this.selectTagVisible = false;
      this.clearValidate('tag');
    },
    // 删除标签
    deleteTag(tag) {
      const index = this.selectedTags.findIndex(
        (tag_) => tag_.tagId === tag.tagId
      );
      this.selectedTags.splice(index, 1);
      this.uploadForm.tagIds = this.selectedTags.map((item) => item.tagId);
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
<style scoped lang="scss">
@import '~@/styles/mixin.scss';
.import-file-div {
  /deep/ .el-dialog {
    max-height: 600px !important;
    overflow: auto;
    .el-dialog__body {
      padding-top: 10px;
    }
  }
  .download-div {
    margin: 10px 0;
    padding-left: 16px;
  }
  .first-step {
    .download-template {
      margin: 10px 0;
    }
    .upload-template {
      /deep/ .el-form-item:hover {
        background: none;
      }
      .el-form {
        margin-top: 10px;
      }
      /deep/ .el-upload {
        display: block;
        width: fit-content;
        text-align: start;
      }
      /deep/ .el-input__inner {
        padding-right: 48px;
      }
      /deep/ .upload-div {
        button {
          padding: 7px 15px;
        }
        .el-upload-list__item-name {
          margin-top: -5px;
        }
        .upload-info > span {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      .task-name {
        width: 100px;
        margin-right: 15px;
        &::before {
          content: '*';
          color: red;
          margin-right: 3px;
        }
      }
    }
  }
  .second-step {
    text-align: center;
    margin-top: 14px;
      font-size: 16px;
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
