<!--
 * @Description: 评分字段设置组件
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
          <span class="label-name">辅助文字</span>
        </div>
        <div v-for="item in filedForm.auxiliaryTextOptions" :key="item.scoreType" class="auxiliary-text mb10">
          <span>{{ item.scoreType }}星</span>
          <el-input
            v-model="item.text"
            class="ml15"
            show-word-limit
            :maxlength="6"
          />
        </div>
      </el-form-item>

      <el-form-item>
        <div class="form-label">
          <div slot="label">
            <span class="label-name">客服好评率</span>
          </div>
          <el-switch v-model="filedForm.customerServiceRate" />
        </div>
        <span style="font-size:12px;">客户填写后，将用于计算客服的好评率</span>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import { EventBus } from '@/event-bus.js';
/** 非常差 */
const VERY_POOR_TYPE = 1;
/** 差 */
const POOR_TYPE = 2;
/** 一般 */
const ORDINARY_TYPE = 3;
/** 好*/
const GOOD_TYPE = 4;
/** 非常好 */
const PERFACT_TYPE = 5;
export default {
  props: {
    component: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      filedForm: {
        required: true,
        title: '评分',
        customerServiceRate: false,
        // 辅助文字
        auxiliaryTextOptions: [
          { 'text': '非常差', scoreType: VERY_POOR_TYPE },
          { 'text': '差', scoreType: POOR_TYPE },
          { 'text': '一般', scoreType: ORDINARY_TYPE },
          { 'text': '好', scoreType: GOOD_TYPE },
          { 'text': '非常好', scoreType: PERFACT_TYPE }
        ]
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
  .auxiliary-text {
    display: flex;
    span {
      width: 26px;
    }
  }
}
</style>

