<!--
 * @Description: 新增字段
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog
    v-bind="$attrs"
    :title="`${formData.id ? '编辑' : '新增'}字段`"
    class="add-proper-modal"
    v-on="$listeners"
    @close="onClose"
  >
    <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="80px">
      <el-tabs v-model="activeName" tab-position="left">
        <el-tab-pane
          v-for="(item, index) in customerProperty"
          :key="index"
          class="property-tab-pane"
          :label="item"
          :name="(index + 2).toString()"
          :disabled="formData.id && formData.type !== index + 2"
        >
          <el-alert v-if="alertTip(index + 2)" class="tip-alert" :title="alertTip(index + 2)" :closable="false" />
          <el-form-item label="字段名称" prop="name">
            <el-input v-model.trim="formData.name" maxlength="12" show-word-limit style="width: 308px" />
          </el-form-item>
          <el-form-item label="是否必填">
            <el-switch v-model="formData.required" />
            <span class="form-item-tip">开启后，员工为客户编辑资料时该字段不能为空</span>
          </el-form-item>
          <el-form-item label="是否启用">
            <el-switch v-model="formData.status" />
            <span class="form-item-tip">开启后，员工可为客户编辑该字段信息，后台可读取</span>
          </el-form-item>
          <el-form-item
            v-if="showEditSelect"
            v-model="formData.optionList"
            label="编辑选项"
            prop="optionList"
            style="padding-bottom: 15px"
          >
            <div>
              <div class="edit-select-list">
                <div
                  v-for="(selectItem, selectIndex) in formData.optionList"
                  :key="selectIndex"
                  class="edit-select-item"
                >
                  <el-input
                    v-model.trim="selectItem.multipleValue"
                    maxlength="12"
                    show-word-limit
                    style="width: 308px"
                  />
                  <MoveTool :index="selectIndex" :item="selectItem" :list.sync="formData.optionList" />
                </div>
              </div>
              <el-button icon="el-icon-plus" @click="addSelect">添加选项</el-button>
            </div>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <div slot="footer">
      <el-button @click="onClose">取消</el-button>
      <RequestButton type="primary" :request-method="handelConfirm" button-type="handelConfirm">确 定</RequestButton>
      <!-- <el-button :loading="loading" type="primary" @click="handelConfirm">确定</el-button> -->
    </div>
  </el-dialog>
</template>
<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import { CUSTOMER_PROPERTY_MAP, CUSTOMER_PROPERTY_VALUE } from '@/utils/constant/index';
import MoveTool from '@/components/MoveTool.vue';
import { addExtendProperty, editBatchExtendProperty } from '@/api/extendProperty';

export default {
  name: 'AddPropertyModal',
  components: { MoveTool, RequestButton },
  props: {},
  data() {
    const filterProperty = (list) => {
      return list.slice(1, list.length);
    };
    const checkEditSelect = (rule, value, callback) => {
      if (!value) return callback(new Error('请填写选项'));
      const filterList = value.filter((item) => !!item.multipleValue);
      if (filterList.length === 0) {
        return callback(new Error('请填写选项'));
      } else {
        callback();
      }
    };
    return {
      formData: {
        name: null,
        required: 0,
        status: 0,
        optionList: [{ multipleValue: '' }]
      },
      rules: Object.freeze({
        name: [{ required: true, message: '请填写字段名称', trigger: 'blur' }],
        optionList: [{ required: true, trigger: 'blur', validator: checkEditSelect }]
      }),
      CUSTOMER_PROPERTY_MAP,
      CUSTOMER_PROPERTY_VALUE,
      customerProperty: filterProperty(Object.values(CUSTOMER_PROPERTY_MAP)),
      activeName: CUSTOMER_PROPERTY_VALUE['singleText'].toString(),
      loading: false
    };
  },
  computed: {
    showEditSelect() {
      return [
        CUSTOMER_PROPERTY_VALUE['singleRadio'],
        CUSTOMER_PROPERTY_VALUE['mulRadio'],
        CUSTOMER_PROPERTY_VALUE['selectSingle']
      ].includes(Number(this.activeName));
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 关闭弹窗
     */
    onClose() {
      this.$refs['elForm'].resetFields();
      this.$emit('update:visible', false);
    },
    /**
     * 确认添加/修改
     */
    handelConfirm() {
      this.$refs['elForm'].validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'handelConfirm');
        this.loading = true;
        this.formData.id ? this.onEdit() : this.onAdd();
      });
    },
    /**
     * 添加选项
     */
    addSelect() {
      const list = [...this.formData.optionList];
      list.push({ multipleValue: '' });
      this.formData.optionList = list;
    },
    /**
     * 字段提示语
     */
    alertTip(type) {
      switch (type) {
        case CUSTOMER_PROPERTY_VALUE['singleText']:
          return '适用于邮箱等简短文字信息的输入，内容长度不超过32字。';
        case CUSTOMER_PROPERTY_VALUE['mulText']:
          return '适用于客户详情等较多文字信息的输入，内容长度不超过200字。';
        case CUSTOMER_PROPERTY_VALUE['singleRadio']:
          return '适用于三选一的场景，当选项超过3个时，推荐使用下拉框。';
        case CUSTOMER_PROPERTY_VALUE['mulRadio']:
          return '适用于有多个选项的场景。';
        case CUSTOMER_PROPERTY_VALUE['selectSingle']:
          return '适用于有较多选项的单选场景。';
        case CUSTOMER_PROPERTY_VALUE['dateField']:
          return '适用于记录关键时间点，格式为YYYY-MM-DD HH:MM，例2021-11-11 00:00。';
        case CUSTOMER_PROPERTY_VALUE['img']:
          return '适用于保存客户的图片信息等，最多可上传9张，图片大小不能超过2M。';
        case CUSTOMER_PROPERTY_VALUE['file']:
          return '适用于保存发票等文件信息，最多可上传9个，文件大小不能超过20M。';
        default:
          return '';
      }
    },
    /**
     * 修改字段属性
     */
    async onEdit() {
      const formData = this.formData;
      const optionList = [...formData.optionList];
      const newOptionList = [];
      optionList.map((item) => {
        newOptionList.push({
          extendPropertyId: formData.id,
          multipleValue: item.multipleValue,
          id: item.id
        });
      });
      try {
        const editRes = await editBatchExtendProperty({
          properties: [
            {
              id: formData.id,
              name: formData.name,
              optionList: newOptionList,
              required: formData.required,
              status: formData.status,
              type: formData.type
            }
          ]
        });
        this.loading = false;
        changeButtonLoading(this.$store, 'handelConfirm');
        if (editRes) {
          this.onClose();
          this.$emit('getList');
          this.msgSuccess('修改成功');
        }
      } catch (e) {
        changeButtonLoading(this.$store, 'handelConfirm');
        this.loading = false;
      }
    },
    /**
     * 添加字段
     */
    async onAdd() {
      const formData = this.formData;
      try {
        const addRes = await addExtendProperty({
          name: formData.name,
          optionList: formData.optionList,
          required: formData.required,
          status: formData.status,
          propertySort: formData.propertySort,
          type: this.activeName
        });
        this.loading = false;
        changeButtonLoading(this.$store, 'handelConfirm');
        if (addRes) {
          this.onClose();
          this.$emit('getList');
          this.msgSuccess('添加成功');
        }
      } catch (e) {
        changeButtonLoading(this.$store, 'handelConfirm');
        this.loading = false;
      }
    }
  }
};
</script>
<style scoped lang="scss">
.add-proper-modal {
  .tip-alert {
    background-color: $bgLightBaseColor;
    color: rgba(127, 127, 127, 100);
  }
  .el-form-item {
    /deep/ .el-form-item__content {
      display: flex;
      align-items: center;
    }
    .form-item-tip {
      color: $grayColor;
      margin-left: 10px;
    }
    .edit-select-list {
      display: flex;
      width: 100%;
      flex-direction: column;
      .edit-select-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      .el-button {
        width: min-content;
      }
    }
  }
  .property-tab-pane {
    max-height: 320px;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
