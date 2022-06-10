<!--
 * @Description: 标签列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>

/**
 * 标签列表
 */
export default {
  name: 'Taglist',
  components: {},
  props: {
    /**
     * 标签列表
     */
    tagList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {

    };
  }
};
</script>

<template>
  <div class="tag-list">
    <template v-for="tagItem in tagList.slice(0, 2)">
      <BorderColor v-if="tagItem.tagName" :key="tagItem.labelId" all-border :title="tagItem.tagName" class="tag-item inoneline theme-text-color">{{ tagItem.tagName }}</BorderColor>
    </template>
    <el-popover
      placement="top-start"
      trigger="hover"
    >
      <div class="all-tag">
        <template v-for="tagItem in tagList">
          <BorderColor v-if="tagItem.tagName" :key="tagItem.labelId" all-border :title="tagItem.tagName" class="tag-item-all inoneline theme-text-color">{{ tagItem.tagName }}</BorderColor>
        </template>
      </div>
      <BorderColor v-show="tagList.length > 2" slot="reference" all-border class="tag-item theme-text-color">...</BorderColor>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.tag-list {
    display: flex;
    width: 100%;
    margin-top: 5px;
    z-index: 999;
    position: relative;
}
.tag-item, .tag-item-all {
    font-size: 12px;
    background: #F0F8F7;
    margin-right: 3px;
    line-height: 18px;
    padding: 0 3px;
    border-radius: 3px;
    max-width: 80px;
}
.all-tag {
  display: flex;
  flex-wrap: wrap;
}
.tag-item-all {
  max-width: initial;
}
</style>

