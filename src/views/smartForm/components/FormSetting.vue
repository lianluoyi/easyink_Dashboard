<!--
 * @Description: 表单设置组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="form-setting">
    <el-form label-position="top" label-width="80px" :model="form">
      <el-form-item props="headImage">
        <div class="form-label">
          <div slot="label">
            <span class="label-name">头图</span>
          </div>
          <el-switch v-model="form.headImageOpenFlag" @change="changeHeadImageOpenFlag" />
        </div>
        <UploadFile
          v-if="form.headImageOpenFlag"
          text="将图片拖到此处，或"
          tip="支持jpg、png，不超过2M，建议尺寸375*150"
          :file-url.sync="form.headImageUrl"
          class="upload-drag-div"
          drag
          :multiple="false"
          :show-type="DRAG_ONE_TYPE"
          accept=".jpg,.png,.gif"
        />
      </el-form-item>

      <el-form-item prop="formName">
        <div slot="label" class="form-label">
          <span class="required">表单名称</span>
        </div>
        <el-input
          v-model="form.formName"
          resize="none"
          show-word-limit
          :maxlength="20"
          type="textarea"
          :rows="3"
        />
      </el-form-item>

      <el-form-item prop="formDescription">
        <div class="form-label">
          <div slot="label">
            <span class="label-name">表单说明</span>
          </div>
          <el-switch v-model="form.descriptionFlag" />
        </div>
        <el-input
          v-if="form.descriptionFlag"
          v-model="form.description"
          resize="none"
          show-word-limit
          :maxlength="200"
          type="textarea"
          :rows="6"
        />
      </el-form-item>

      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">显示排序</span>
          <el-switch
            v-model="form.showSortFlag"
          />
        </div>
      </el-form-item>

      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">提交按钮</span>
        </div>
        <el-input
          v-model="form.submitText"
          show-word-limit
          :maxlength="6"
        />
        <el-color-picker v-model="form.submitColor" class="mt15" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { EventBus } from '@/event-bus.js';
import UploadFile from './UploadFile.vue';
import { DRAG_ONE_TYPE, FORM_DEFAULT_HEAD_IMAGE_URL } from '@/utils/constant';
import { checkChange } from '@/utils/common';
export default {
  components: { UploadFile },
  props: {
    // 是否显示表单字段编辑组件
    showEditFormFiled: {
      type: Boolean,
      default: false
    },
    // 编辑时获取的表单字段
    editFormSetValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      DRAG_ONE_TYPE,
      form: {
      }
    };
  },
  watch: {
    form: {
      deep: true,
      handler: function(val) {
        EventBus.$emit('formSettingValue', val);
      }
    },
    showEditFormFiled(val) {
      // 当监听到点击下一步到表单设置的时候将表单设置字段传递过去
      if (!val) {
        if (!this.form.headImageOpenFlag) {
          this.form.headImageUrl = '';
        }
        EventBus.$emit('formSet', this.form);
      }
    },
    editFormSetValue: {
      deep: true,
      handler: function(val) {
        this.form = {
          ...this.form,
          ...val
        };
      }
    }
  },
  beforeUpdate() {
    checkChange(this.$options.data().form, this.form);
  },
  mounted() {
    // 初始化时将表单内容赋值
    this.form = this.editFormSetValue;
  },
  methods: {
    /**
     * @description 校验表单设置字段
     * @param 是否通过校验
     */
    checkFormRules() {
      const { formName, headImageUrl, headImageOpenFlag, descriptionFlag, description } = this.form;
      let flag = true;
      if (!formName) {
        this.msgWarn('请填写表单名称');
        flag = false;
      }
      if (headImageOpenFlag && !headImageUrl) {
        this.msgWarn('请上传表单头图');
        flag = false;
      }
      if (descriptionFlag && !description) {
        this.msgWarn('请填写表单说明');
        flag = false;
      }
      return flag;
    },
    changeHeadImageOpenFlag(e) {
      if (e && !this.form.headImageUrl) {
        this.form.headImageUrl = FORM_DEFAULT_HEAD_IMAGE_URL;
      }
    }
  }
};
</script>

<style  lang="scss" scoped>
.form-setting {
  /deep/ .el-form-item__label {
    width: 100%;
  }
  /deep/ .el-input__count {
      height: 20px;
      line-height: 20px;
  }
  /deep/ .el-form-item  {
    border-bottom: 1px solid #eee;
    .el-form-item__label {
      padding: 0;
    }
  }
  /deep/ .el-form-item:hover  {
    background: none;
  }
  /deep/ .el-color-picker__trigger {
    width: 50px;
    height: 50px;
  }
  .form-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .label-name {
      font-size: 14px;
      color: #606266;
      font-weight: 700;
    }
    .required {
      @extend .label-name
    }
    .required::after {
     content:'  *';
     color:red;
    }
  }
}
</style>
