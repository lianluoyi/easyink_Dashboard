<!--
 * @Description: 展示使用员工和部门，部门前面带图标
 * @Author: xulinbin
 * @LastEditors: wJiaaa
-->

<template>
  <span v-if="name">
    <i v-if="!!showIcon" :class="`iconfont icon-folder mr${marginRight}`" :style="`font-size: ${iconSize}px; color: inherit;}`" />
    <span style="line-height:100%">{{ name }}</span>
  </span>

</template>

<script>
export default {
  name: 'TagUserShow',
  props: {
    showIcon: {
      type: [Boolean, String],
      default: false
    },
    name: {
      type: String,
      default: undefined
    },
    marginRight: {
      type: Number,
      // eslint-disable-next-line no-magic-numbers
      default: 5
    },
    iconSize: {
      type: Number,
      // eslint-disable-next-line no-magic-numbers
      default: 14
    },
    iconColor: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  }
};

</script>
