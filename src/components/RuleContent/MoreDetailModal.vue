<!--
 * @Description: 查看规则更多附件
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-dialog v-bind="$attrs" width="500px" class="more-detail-modal" v-on="$listeners" @close="onClose">
    <PhoneDialog
      :message="text"
      :is-other="!!materialSelected"
      :msg-list="previewList"
      material-field="title"
      digest-field="content"
      material-url-field="url"
    >
      <el-image
        class="phone-dialog-image"
        :src="materialSelected"
        fit="fit"
      />
    </PhoneDialog>
  </el-dialog>
</template>
<script>
import PhoneDialog from '@/components/PhoneDialog';

export default {
  name: '',
  components: { PhoneDialog },
  props: {
    previewList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      materialSelected: '',
      text: ''
    };
  },
  created() {},
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    }
  }

};
</script>
<style scoped lang='scss'>
.more-detail-modal {
    /deep/ .el-dialog__body {
        .preview{
            margin: 0 auto;
        }
    }
}
</style>
