<!--
 * @Description: 日期时间字段设置组件
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
          <span class="label-name">日期类型 </span>
        </div>
        <el-radio-group v-model="filedForm.dataType">
          <el-radio :label="YEAR_MONTH_TYPE">年-月-日</el-radio>
          <el-radio :label="HOURS_MINUTE_TYPE">年-月-日 时:分</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { EventBus } from '@/event-bus.js';
// 选择的日期格式
/** 年月日 */
const YEAR_MONTH_TYPE = 1;
/** 年月日时分 */
const HOURS_MINUTE_TYPE = 2;
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
      HOURS_MINUTE_TYPE,
      YEAR_MONTH_TYPE,
      filedForm: {
        required: true,
        title: '日期时间',
        info: '请选择',
        // dataType为1 年月日 为2 年月日时分
        dataType: YEAR_MONTH_TYPE
      }
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
  .el-radio-group {
    .el-radio {
      display: block;
      margin: 10px 0;
    }
  }
}
</style>

