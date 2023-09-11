<!--
 * @Description: 分组新增/编辑弹窗
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <el-dialog v-bind="$attrs" class="group-modal-div" v-on="$listeners" @close="onClose">
    <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="78px">
      <el-form-item label="分组名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入分组名称"
          clearable
          maxlength="12"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <RequestButton type="primary" :request-method="handelConfirm" button-type="submit">确定</RequestButton>
    </div>
  </el-dialog>
</template>
<script>
import { addGroupTreeLeaf, editGroupTree } from '@/api/form';
import { INTELLIGENT_FORM_TYPE } from '@/utils/constant/index';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
export default {
  name: 'GroupModal',
  components: { RequestButton },
  inheritAttrs: false,
  props: {
    // 分组信息
    formData: {
      type: Object,
      default: () => ({
        parentId: undefined,
        name: undefined,
        id: undefined,
        // 是否是编辑
        isEdit: false
      })
    },
    // 智能表单类型
    type: {
      type: Number,
      default: null
    },
    // 重新获取分组列表
    getList: {
      type: Function,
      default: () => {}
    },
    // 部门id
    departmentId: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      rules: {
        name: [{
          required: true,
          message: '请填写分组名称',
          trigger: 'blur'
        }]
      }
    };
  },
  computed: {},
  methods: {
    // 关闭
    onClose() {
      this.$refs['elForm'].resetFields();
    },
    // 取消
    close() {
      this.$emit('update:visible', false);
    },
    /**
     * 确定新增/修改分组信息
     */
    handelConfirm() {
      this.$refs['elForm'].validate(valid => {
        if (!valid) return changeButtonLoading(this.$store, 'submit');
        this.formData.isEdit ? this.handleUpdateGroup() : this.handleAddGroup();
      });
    },
    /**
     * 修改分组信息
     */
    handleUpdateGroup() {
      editGroupTree({
        id: this.formData?.id,
        name: this.formData?.name
      }).then(res => {
        this.handleOkCallback(res);
      });
    },
    /**
     * 调用添加新分组接口
     */
    handleAddGroup() {
      const params = {
        parentId: this.formData?.parentId,
        name: this.formData?.name,
        sourceType: this.type,
        departmentId: this.type === INTELLIGENT_FORM_TYPE['department'] ? this.departmentId : undefined
      };
      addGroupTreeLeaf(params).then(res => {
        this.handleOkCallback(res);
      });
    },
    /**
     * @description: 编辑/添加操作成功的回调
     * @param {*} res
     * @return {*}
     */
    handleOkCallback(res) {
      // 修改按钮状态
      changeButtonLoading(this.$store, 'submit');
      if (res) {
        this.type === INTELLIGENT_FORM_TYPE['department'] ? this.getList({ departmentId: this.departmentId }) : this.getList();
        this.msgSuccess('操作成功');
        this.close();
      }
    }
  }
};

</script>
<style scoped lang="scss">
.group-modal-div {
  .add-lower-group {
    display: flex;
    align-items: center;
    cursor: pointer;
    .icon-add {
      margin-right: 5px;
    }
  }
  .lower-group-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
}
</style>
