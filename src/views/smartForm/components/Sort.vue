<!--
 * @Description: 排序组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="drag">
    <div v-if="index" class="drag-item" @click="$emit('changeSort','moveTop')">
      <i class="el-icon-top" />
    </div>
    <div v-if="!lastIndex" class="drag-item" @click="$emit('changeSort','moveBottom')">
      <i class="el-icon-bottom" />
    </div>
    <div class="drag-item" @click="$emit('changeSort','delete')">
      <i class="el-icon-remove-outline" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: 1
    },
    // 是否是最后一个
    lastIndex: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.drag {
  i {
    font-size: 18px;
  }
  div {
    width: 30px;
    height: 30px;
    border: 1px solid rgba(238, 238, 238, 1);
    background-color: #fff;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
  }
  .ban {
    cursor: not-allowed;
  }
}
</style>
