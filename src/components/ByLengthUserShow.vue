<!--
 * @Description: 使用员工的展示组件,可通过maxlength的props控制展示个数
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->

<template>
  <div class="aic" style="flex-wrap: wrap;">
    <div v-for="(item,index) of userList.slice(0, maxLength)" :key="index">
      <span>{{ item[usename] }}</span>
      <span v-if="!(index === maxLength - 1) && !((index === userList.length - 1) && departmentList.length === 0 )">、</span>
    </div>
    <div v-for="(item,index) of userList.length > maxLength ? [] : departmentList.slice(0, maxLength - userList.length)" :key="index + userList.length" class="aic">
      <i class="iconfont icon-folder mr2" style="font-size: 14px;" />
      <span>{{ item.departmentName }}</span>
      <span v-if=" (index !== departmentList.length - 1) && (index !== maxLength - 1 - userList.length )">、</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ByLengthUserShow',
  props: {
    userList: {
      type: Array,
      default: () => []
    },
    departmentList: {
      type: Array,
      default: () => []
    },
    maxLength: {
      type: Number,
      // eslint-disable-next-line no-magic-numbers
      default: 5
    },
    usename: {
      type: String,
      default: 'userName'
    }
  },
  data() {
    return {};
  }
};

</script>
