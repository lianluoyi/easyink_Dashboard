<!--
 * @Description: 实时数据比较数值显示
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-col :span="8">{{
    `${erchatsTable[field] ? erchatsTable[field] : 0}${erchatsTable[field] === DATA_STATISTICS_DEFAULT_SHOW ? '' : unit}`
  }}
  </el-col>
</template>
<script>
import { DATA_STATISTICS_DEFAULT_SHOW } from '@/utils/constant/index';

export default {
  name: 'CntItem',
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
