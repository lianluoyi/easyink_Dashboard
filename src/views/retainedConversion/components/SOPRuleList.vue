<!--
 * @Description: 规则列表
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="sop-rule-list timeline-list">
    <el-timeline class="timeline-div">
      <el-timeline-item v-for="(ruleItem, ruleIndex) in ruleList" :key="ruleIndex" placement="top">
        <template #dot>
          <div class="step-dot">{{ ruleIndex + 1 }}</div>
        </template>
        <div class="custom-timestamp">
          <RemindPerform :rule-item="ruleItem" :sop-type="sopType" :show-extra-text="true" />
        </div>
        <div class="rule-content">
          <RuleContent :rule-item="ruleItem" />
          <div v-if="showTool" class="tool-div">
            <i
              v-show="canEdit(ruleItem)"
              class="iconfont icon-tool-edit"
              title="编辑"
              @click="handleEdit(ruleItem, ruleIndex)"
            />
            <i
              class="iconfont icon-remove"
              title="删除"
              @click="handleDelete(ruleIndex, ruleItem)"
            />
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>
<script>
import moment from 'moment';
import RuleContent from '@/components/RuleContent/index.vue';
import { MEDIA_TYPE_TEXT, RULE_PERFORM_TYPE, SOP_TYPE } from '@/utils/constant/index';
import RemindPerform from './RemindPerform.vue';
const MAX_SHOW_RULE_LENGTH = 2;
export default {
  name: '',
  components: { RemindPerform, RuleContent },
  props: {
    ruleList: {
      type: Array,
      default: () => []
    },
    showTool: {
      type: Boolean,
      default: false
    },
    sopType: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      MEDIA_TYPE_TEXT,
      RULE_PERFORM_TYPE,
      MAX_SHOW_RULE_LENGTH,
      SOP_TYPE
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleEdit(item, index) {
      this.$emit('handleEdit', item, index);
    },
    handleDelete(index, item) {
      this.$emit('handleDelRule', index, item);
    },
    canEdit(item) {
      return !(this.sopType === SOP_TYPE['activity'] && item.id && moment(item.alertData2).isBefore(moment.now()));
    }
  }
};
</script>
<style lang="scss" src="@/styles/timelineList.scss" scoped>
</style>
<style scoped lang='scss'>
.sop-rule-list {
    .timeline-div {
      .rule-content {
        .content-card {
          width: 600px;
          .task-name {
            margin-bottom: 10px;
          }
          .text-content {
            border: 1px solid #eee;
            line-height: 20px;
            padding: 10px;
            margin-bottom: 5px;
          }
          .file-info-div {
            margin-bottom: 5px;
          }
          .load-more {
            span {
                cursor: pointer;
            }
          }
        }
      }
    }
}
</style>
