<!--
 * @Description: 批量修改表单所属分组
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <el-dialog
    v-bind="$attrs"
    class="batch-update-group"
    :close-on-click-modal="false"
    width="443px"
    title="批量修改所属分组"
    v-on="$listeners"
    @close="onClose"
  >
    <el-form ref="batchGroup" class="batch-update-group-form" :model="formData" :rules="rules" size="medium" label-width="80px">
      <el-form-item label="所属分组" prop="groupId">
        <el-cascader
          ref="cascader"
          v-model="formData.groupId"
          :options="groupTreeData"
          :props="defaultProps"
          clearable
          placeholder="请设置所选表单的所属分组"
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
import { batchChangeGroup } from '@/api/form';
import { changeButtonLoading } from '@/utils/common';
import RequestButton from '@/components/Button/RequestButton.vue';
export default {
  name: '',
  components: { RequestButton },
  props: {
    // 全部分组
    groupTreeData: {
      type: Array,
      default: () => []
    },
    // 已勾选的表单列表
    multiSelect: {
      type: Array,
      default: () => []
    },
    // 重新获取新的表单数据
    getList: {
      type: Function,
      default: () => {}
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
        groupId: [{
          required: true,
          message: '请设置所选表单的所属分组',
          trigger: 'blur'
        }]
      },
      formData: {
        groupId: undefined
      }
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
        const updateRes = await batchChangeGroup({
          formIdList: ids,
          groupId: this.formData.groupId
        });
        if (updateRes) {
          changeButtonLoading(this.$store, 'save');
          this.getList();
          this.$emit('update:visible', false);
          this.formData.groupId = undefined;
        }
      });
    },
    handleChangeCategoryId(value) {
      // 选择后自动关闭级联选择下拉框
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
