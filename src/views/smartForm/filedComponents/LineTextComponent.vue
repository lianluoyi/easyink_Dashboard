<!--
 * @Description: 单行/多行字段设置组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="form-setting">
    <el-form label-position="top" label-width="80px" :model="filedForm">
      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">必填</span>
          <el-switch
            v-model="filedForm.required"
          />
        </div>
      </el-form-item>

      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">标题</span>
        </div>
        <el-input
          v-model="filedForm.title"
          resize="none"
          show-word-limit
          :maxlength="100"
          type="textarea"
          :rows="6"
        />
      </el-form-item>

      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">提示语</span>
        </div>
        <el-input
          v-model="filedForm.info"
          resize="none"
          show-word-limit
          :maxlength="200"
          type="textarea"
          :rows="6"
        />
      </el-form-item>

      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">输入内容限制</span>
        </div>
        <el-select v-model="filedForm.valueLimitType" style="width:100%" placeholder="请选择">
          <el-option
            v-for="select in valueLimitOptions"
            :key="select.value"
            :label="select.label"
            :value="select.value"
          />
        </el-select>
        <template v-if="filedForm.valueLimitType === NUMS_TYPE || filedForm.valueLimitType === TEXT_LENGTH_TYPE">
          <div class="limit-value">
            <span>{{ filedForm.valueLimitType === NUMS_TYPE ? '最小':'最少' }}</span>
            <el-input
              v-model="filedForm.min"
              class="ml15"
              placeholder="请输入数值"
            />
          </div>
          <div class="limit-value">
            <span>{{ filedForm.valueLimitType === NUMS_TYPE ? '最大':'最多' }}</span>
            <el-input
              v-model="filedForm.max"
              class="ml15"
              placeholder="请输入数值"
            />
          </div>
        </template>

      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import { MANY_LINE_TEXT_COMPONENT, TEXT_LENGTH_TYPE } from '@/utils/constant/index';
import { EventBus } from '@/event-bus.js';
/** 数值 */
const NUMS_TYPE = 1;
/** 网址 */
const WEBSITE_TYPE = 3;
/** 邮箱类型*/
const EMAIL_TYPE = 4;
export default {
  components: { },
  props: {
    component: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      NUMS_TYPE,
      TEXT_LENGTH_TYPE,
      filedForm: {
        required: true,
        title: this.component.type === MANY_LINE_TEXT_COMPONENT ? '多行文本' : '单行文本',
        info: '请填写',
        valueLimitType: ''
      },
      valueLimitOptions: Object.freeze(
        [
          {
            value: '',
            label: '不限制'
          },
          {
            value: NUMS_TYPE,
            label: '数值'
          }, {
            value: TEXT_LENGTH_TYPE,
            label: '字数'
          }, {
            value: WEBSITE_TYPE,
            label: '网址'
          }, {
            value: EMAIL_TYPE,
            label: '电子邮箱'
          }
        ]
      )
    };
  },
  watch: {
    filedForm: {
      deep: true,
      handler: function(val) {
        EventBus.$emit('changeFiledSettingValue', { ...val, ...this.filedForm });
      }
    }
  },
  mounted() {
    // 在组件挂载的时候将值传回去给预览组件
    this.filedForm = { ...this.filedForm, ...this.component };
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
  .form-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .label-name {
      font-size: 14px;
      color: #606266;
      font-weight: 700;
    }
  }
  .form-item-options {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    i {
      font-size: 18px;
      cursor: pointer;
    }
  }
  .select-nums {
    display: flex;
    justify-content: space-between;
  }
  .limit-value {
    display: flex;
    margin-top: 10px;
    span {
      width: 35px;
    }
  }
}
</style>

