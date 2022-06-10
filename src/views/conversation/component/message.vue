<!--
 * @Description: 单聊的单个消息布局
 * @Author: 佚名
 * @LastEditors: 佚名
-->
<template>
  <div class="msg-content">
    <slot />
    <span v-if="isRevoke" class="msg-type-revoke">( 已撤回 )</span>
  </div>
</template>

<script>
export default {
  props: {
    isRevoke: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
  .msg-type-revoke {
    font-size: 14px;
    color: #FA7216;
    margin: 0 0.5em;

    white-space: nowrap;
    display: flex;
    align-items: flex-end;
  }

  .msg-content {
    display: flex;
    flex-direction: row;
  }
  .sender .msg-content {
    flex-direction: row-reverse;
  }

  /* 与文件类型消息的底部对齐 */
  .msgtypefile .msg-type-revoke{
    margin: 10px 0;
  }
</style>
