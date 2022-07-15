<!--
 * @Description: 列表内的员工展示组件
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->

<template>
  <div class="aic" style="flex-wrap: wrap;">
    <div v-for="(userItem,userIndex) of useUserName ? splitBySign(useUserName,',') : []" :key="userIndex">
      <span>{{ userItem }}</span>
      <span v-if="userIndex !== splitBySign(useUserName,',').length - 1 || splitBySign(departmentName,',').length !== 0">、</span>
    </div>
    <div v-for="(depItem,depIndex) of departmentName ? splitBySign(departmentName,',') : []" :key="depIndex + splitBySign(useUserName,',').length" class="aic">
      <i class="iconfont icon-folder mr2" style="font-size: 14px;" />
      <span>{{ depItem }}</span>
      <span v-if="depIndex !== (splitBySign(departmentName,',').length - 1)">、</span>
    </div>
  </div>
</template>

<script>
import { splitBySign } from '@/utils/common';
export default {
  name: 'ListUserShow',
  props: {
    useUserName: {
      type: String,
      default: undefined
    },
    departmentName: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {};
  },
  methods: {
    // 通过符号分割字符串
    splitBySign
  }
};

</script>
