<!--
 * @Description: 标签统计
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="page-wrap">
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="TAG_LABEL_TYPE['customer']">客户标签</el-radio-button>
        <el-radio-button :label="TAG_LABEL_TYPE['group']">群标签</el-radio-button>
      </el-radio-group>
    </div>
    <div class="content-container">
      <TagView :tag-type="activeName" />
    </div>
  </div>
</template>
<script>
import { TAG_LABEL_TYPE } from '@/utils/constant';
import TagView from './tagView.vue';
export default {
  name: '',
  components: { TagView },
  props: {},
  data() {
    return {
      // 默认选择客户标签
      activeName: TAG_LABEL_TYPE['customer'],
      TAG_LABEL_TYPE
    };
  },
  provide() {
    return {
      /** 标签类型 传入函数形式可以实现响应式 */
      tagType: () => this.activeName
    };
  },
  methods: {}
};
</script>
<style scoped lang='scss'>
.page-wrap {
  display: flex;
  flex-direction: column;
  overflow: auto;
  /deep/ .content-container {
    flex: 1;
    min-width: 1000px;
    overflow: auto;
    .overview-page {
      height: 100%;
    }
    .activeness-page {
      height: 100%;
    }
  }
  .warning-alert{
    margin-bottom: 15px;
    font-size: 13px;
  }
}
</style>
