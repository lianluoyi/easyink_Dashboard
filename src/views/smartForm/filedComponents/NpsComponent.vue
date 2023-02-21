<!--
 * @Description: NPS字段设置组件
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
        <div class="auxiliary-text">
          <span>左侧</span>
          <el-input
            v-model="filedForm.leftAuxiliaryText"
            class="ml15"
            show-word-limit
            :maxlength="6"
          />
        </div>
        <div class="auxiliary-text">
          <span>右侧</span>
          <el-input
            v-model="filedForm.righAuxiliarytText"
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
        title: '你向好友推荐本产品的可能性有多大?',
        customerServiceRate: false,
        leftAuxiliaryText: '不可能',
        righAuxiliarytText: '极有可能'
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
    margin-bottom: 10px;
    span {
      width: 35px;
    }
  }
}
</style>

