<!--
 * @Description: 欢迎语详情的时段欢迎语样式
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="welcome-detail-special-div">
    <div class="welcome-msg-title">{{ `时段欢迎语${specialIndex + 1}` }}</div>
    <div class="welcome-time-div mb15">
      <el-tag
        v-for="(weekItem, weekIndex) in calcWeekList(specialItem.weekends)"
        :key="weekIndex"
        size="mini"
      >{{ `周${weekNum[weekItem - 1]}` }}</el-tag>
      <el-time-picker
        v-model="timeStamp"
        disabled
        is-range
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        placeholder="选择时间范围"
        style="width: 142px; margin-right: 10px;padding-left: 6px; padding-right: 0;"
        value-format="HH:mm"
        format="HH:mm"
      />
    </div>
    <div class="default-msg-info mb10">{{ specialItem.specialWelcomeMsg }}</div>
    <div v-for="(item, index) in specialItem.specialMaterialList" :key="index" class="detail-item mb10">
      <VerbalTrickDetailPreview :item="transferMaterialTypeItem(item)" />
    </div>
  </div>
</template>
<script>
import { weekNum } from '@/utils/constant';
import VerbalTrickDetailPreview from '@/views/verbalTrickLibrary/component/verbalTrickDetailPreview.vue';

export default {
  name: '',
  components: { VerbalTrickDetailPreview },
  props: {
    specialItem: {
      type: Object,
      default: () => {}
    },
    specialIndex: {
      type: Number,
      default: 0
    },
    transferMaterialTypeItem: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      weekNum,
      timeStamp: []
    };
  },
  created() {},
  mounted() {
    this.timeStamp = [this.specialItem.weekendBeginTime || '', this.specialItem.weekendEndTime || ''];
  },
  methods: {
    calcWeekList(weekendIds) {
      return weekendIds.split(',') || [];
    }
  }

};
</script>
<style scoped lang='scss'>
.welcome-detail-special-div {
    margin-top: 15px;
    .welcome-time-div {
        /deep/ .el-tag {
            background-color: #F4F4F5;
            color: #909399;
            height: 32px;
            line-height: 32px;
        }

    }
    .default-msg-info {
      word-wrap: break-word;
    }
}
</style>
