<!--
 * @Description: 规则/SOP具体内容
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <el-card class="content-card" :style="`width:${cardWidth}`">
      <p class="task-name">{{ ruleItem.content }}</p>
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
    <MoreDetailModal :visible.sync="moreVisible" :preview-list="previewList" />
  </div>
</template>
<script>
import MoreDetailModal from './MoreDetailModal.vue';
import FileInfo from '@/components/FileInfo.vue';
import { MEDIA_TYPE_TEXT, RULE_PERFORM_TYPE, SOP_TYPE } from '@/utils/constant';
const MAX_SHOW_RULE_LENGTH = 2;
export default {
  name: '',
  components: { MoreDetailModal, FileInfo },
  props: {
    ruleItem: {
      type: Object,
      default: () => {}
    },
    cardWidth: {
      type: String,
      default: '600px'
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
  methods: {
    onLoadMore(list) {
      this.previewList = list || [];
      this.moreVisible = true;
    }
  }
};
</script>
<style scoped lang='scss'>
.content-card {
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
</style>
