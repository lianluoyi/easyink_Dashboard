<!--
 * @Description: 实时数据比较数值显示
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-col :span="8">{{
    `${erchatsTable[field] ? erchatsTable[field] : 0}${unit}`
  }}
  </el-col>
</template>
<script>
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
  }
};
</script>
