<!--
 * @Description: 实时数据比较单位显示
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-col
    :span="8"
    :class="{
      greenicon: Number(erchatsTable[field]) >= 1,
      redicon: Number(erchatsTable[field]) < 0,
    }"
  >较{{ time }}
    <span v-if="erchatsTable[field] === DATA_STATISTICS_DEFAULT_SHOW">{{
      DATA_STATISTICS_DEFAULT_SHOW
    }}</span>
    <span v-else>{{
      `${erchatsTable[field] ?
        (erchatsTable[field] > 0 ? '+' + erchatsTable[field] : erchatsTable[field])
        : 0}${unit}`
    }}</span>
  </el-col>
</template>
<script>
import { DATA_STATISTICS_DEFAULT_SHOW } from '@/utils/constant/index';

export default {
  name: 'DiffItem',
  components: {},
  props: {
    erchatsTable: {
      type: Object,
      default: () => {}
    },
    field: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: '昨天'
    },
    // 单位
    unit: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      DATA_STATISTICS_DEFAULT_SHOW
    };
  }
};
</script>
