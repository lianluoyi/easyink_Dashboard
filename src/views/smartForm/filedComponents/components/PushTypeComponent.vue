<template>
  <el-form
    v-if="pushUrl"
    label-position="top"
    label-width="80px"
    class="form-setting"
  >
    <el-form-item>
      <div slot="label" class="form-label">
        <span class="label-name">推送字段类型</span>
      </div>
      <el-select
        v-model="pushType"
        placeholder="请选择推送字段类型"
        style="width: 100%"
        @change="changePushType"
      >
        <el-option
          v-for="option in fieldTypeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script>
import { EventBus } from '@/event-bus.js';

// 推送字段类型枚举
const IS_SATISFIED = 1; // 是否满意
const DISSATISFACTION_REASON = 2; // 不满意原因
const SERVICE_SUGGESTION = 3; // 服务建议

const fieldTypeOptions = [
  {
    value: IS_SATISFIED,
    label: '是否满意'
  },
  {
    value: DISSATISFACTION_REASON,
    label: '不满意原因'
  },
  {
    value: SERVICE_SUGGESTION,
    label: '服务建议'
  }
];

export default {
  name: 'PushTypeComponent',
  props: {
    component: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      pushUrl: window.sessionStorage.getItem('pushUrl') || '',
      pushType: null,
      fieldTypeOptions
    };
  },
  watch: {
    component: {
      deep: true,
      handler: function(val) {
        this.pushType = val.pushType;
      }
    }
  },
  methods: {
    changePushType(val) {
      EventBus.$emit('changeFiledSettingValue', { pushType: val, id: this.component.id });
      this.$emit('updateComponentItem', { pushType: val });
    }
  }
};
</script>
