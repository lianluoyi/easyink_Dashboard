<!--
 * @Description: 边框颜色
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div v-if="allBorder" class="all-border-color-div" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
  <div v-else class="border-color-div" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>
<script>
export default {
  name: 'BorderColor',
  components: {},
  props: {
    allBorder: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  }
};
</script>
<style scoped lang='scss'>
@import '~@/styles/mixin.scss';
.border-color-div {
  @include border_color();
}
.all-border-color-div {
  @include border_color();
  border-width: 1px;
  border-style: solid;
}
</style>
