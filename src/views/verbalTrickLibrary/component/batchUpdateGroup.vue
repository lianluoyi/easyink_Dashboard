<!--
 * @Description: 批量修改分组
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog v-bind="$attrs" class="batch-update-group" :close-on-click-modal="false" v-on="$listeners" @close="onClose">
    <el-form ref="batchGroup" class="batch-update-group-form" :model="formData" :rules="rules" size="medium" label-width="80px">
      <el-form-item label="所属分组" prop="categoryId">
        <el-cascader
          ref="cascader"
          v-model="formData.categoryId"
          :options="groupTreeData"
          :props="defaultProps"
          clearable
          placeholder="请选择所选话术的所属分组"
          filterable
          @change="handleChangeCategoryId"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="onClose">取消</el-button>
      <RequestButton type="primary" :request-method="handelConfirm" button-type="save">确定</RequestButton>
    </div>
  </el-dialog>
</template>
<script>
import { updateCategory } from '@/api/wordsGroup';
import { changeButtonLoading } from '@/utils/common';
import RequestButton from '@/components/Button/RequestButton.vue';
export default {
  name: '',
  components: { RequestButton },
  props: {
    groupTreeData: {
      type: Array,
      default: () => []
    },
    // 已勾选的话术列表
    multiSelect: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true,
        emitPath: false
      },
      rules: {
        categoryId: [{
          required: true,
          message: '请选择话术所属分组',
          trigger: 'blur'
        }]
      },
      formData: {}
    };
  },
  created() {},
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    },
    /**
     * 确认批量修改分组
     */
    handelConfirm() {
      this.$refs['batchGroup'].validate(async valid => {
        if (!valid) return changeButtonLoading(this.$store, 'save');
        let ids = [];
        ids = this.multiSelect.map(item => item.id);
        const updateRes = await updateCategory({
          categoryId: this.formData.categoryId,
          ids: ids
        });
        if (updateRes) {
          changeButtonLoading(this.$store, 'save');
          this.$emit('getList');
          this.$emit('update:visible', false);
        }
      });
    },
    handleChangeCategoryId() {
      this.$refs.cascader.dropDownVisible = false;
    }
  }

};
</script>
<style scoped lang='scss'>
.batch-update-group {
    .batch-update-group-form {
        height: 100px;
    }
    /deep/ .el-cascader {
        width: 100%;
    }
}
</style>
