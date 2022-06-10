<!--
 * @Description: 规则列表
 * @Author: broccoli
 * @LastEditors: broccoli
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
          <el-card class="content-card">
            <p class="task-name">{{ ruleItem.name }}</p>
            <div v-for="(materialItem, materialIndex) in ruleItem.materialList.slice(0, MAX_SHOW_RULE_LENGTH)" :key="materialIndex">
              <div v-if="materialItem.mediaType.toString() === MEDIA_TYPE_TEXT" class="text-content">
                {{ materialItem.content }}
              </div>
              <FileInfo v-else :item="materialItem" />
            </div>
            <div class="load-more theme-text-color">共{{ (ruleItem.materialList && ruleItem.materialList.length) || 0 }}条
              <span v-if="ruleItem.materialList.length > MAX_SHOW_RULE_LENGTH" @click="() => onLoadMore(ruleItem.materialList)">查看更多</span>
            </div>
          </el-card>
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
    <MoreDetailModal :visible.sync="moreVisible" :preview-list="previewList" />
  </div>
</template>
<script>
import moment from 'moment';
import MoreDetailModal from '../components/MoreDetailModal.vue';
import FileInfo from '@/components/FileInfo.vue';
import { MEDIA_TYPE_TEXT, RULE_PERFORM_TYPE, SOP_TYPE } from '@/utils/constant';
import RemindPerform from './RemindPerform.vue';
const MAX_SHOW_RULE_LENGTH = 2;
export default {
  name: '',
  components: { MoreDetailModal, FileInfo, RemindPerform },
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
      // 预览列表
      previewList: [],
      moreVisible: false,
      MEDIA_TYPE_TEXT,
      RULE_PERFORM_TYPE,
      MAX_SHOW_RULE_LENGTH,
      SOP_TYPE
    };
  },
  created() {},
  mounted() {},
  methods: {
    onLoadMore(list) {
      this.previewList = list || [];
      this.moreVisible = true;
    },
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
