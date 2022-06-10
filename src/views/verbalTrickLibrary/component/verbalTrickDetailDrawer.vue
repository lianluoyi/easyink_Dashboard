<!--
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-drawer
    v-bind="$attrs"
    :before-close="handleClose"
    :append-to-body="true"
    class="verbal-trick-detail-drawer"
    v-on="$listeners"
  >
    <div class="verbal-trick-detail">
      <div class="verbal-trick-detail-info">
        <div class="verbal-trick-title">{{ item.title }}</div>
        <div class="group-info">所属分组：{{ dealGroupName(item) }}</div>
        <div v-for="(detailItem, index) in item.weWordsDetailList" :key="index" class="detail-item">
          <VerbalTrickDetailPreview :item="detailItem" />
        </div>
      </div>
      <div v-if="roleKey" class="edit-btn">
        <el-button type="primary" @click="handleEdit(item)">编辑</el-button>
      </div>
    </div>
  </el-drawer>
</template>
<script>
import VerbalTrickDetailPreview from './verbalTrickDetailPreview.vue';
export default {
  name: '',
  components: { VerbalTrickDetailPreview },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    dealGroupName: {
      type: Function,
      default: () => {}
    },
    handleEdit: {
      type: Function,
      default: () => {}
    },
    // 话术操作权限
    roleKey: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    }
  }

};
</script>
<style scoped lang='scss'>
.verbal-trick-detail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  .verbal-trick-detail-info {
    padding: 0 20px 20px 20px;
    flex: 1;
    overflow: auto;
  }
  .verbal-trick-title {
    font-size: 18px;
    color: $black;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .group-info {
    color: #666666;
    margin-bottom: 20px;
  }
  .detail-item {
    margin-bottom: 15px;
  }
  .edit-btn {
    box-shadow: 0px -5px 10px 0px rgba(0, 0, 0, 0.11);
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 20px;
  }
}
</style>
