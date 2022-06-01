<!--
 * @Description: 分组新增/编辑弹窗
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog v-bind="$attrs" class="group-modal-div" v-on="$listeners" @close="onClose">
    <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="78px">
      <el-form-item v-if="!!formData.parentId" label="所属分组" prop="parentId">
        <el-select v-model="formData.parentId" placeholder="请选择" clearable style="width: 100%">
          <el-option
            v-for="item in groupData"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分组名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入分组名称"
          clearable
          maxlength="12"
          show-word-limit
        />
      </el-form-item>
      <el-form-item v-if="!formData.parentId" label="下级分组">
        <template v-for="(item, index) in lowerGroupList">
          <div :key="index" class="lower-group-item">
            <el-input v-model="item.name" placeholder="请填写下级分组名称" maxlength="12" show-word-limit clearable />
            <MoveTool :index="index" :item="item" :list.sync="lowerGroupList" @getRemoveList="getRemoveList" />
          </div>
        </template>
        <div class="add-lower-group theme-text-color" @click="addLowerGroup">
          <i
            class="iconfont icon-add theme-text-color"
            title="添加下级分组"
          />
          添加下级分组
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <RequestButton type="primary" :request-method="handelConfirm" button-type="submit">确定</RequestButton>
    </div>
  </el-dialog>
</template>
<script>
import { addGroup, updateGroup } from '@/api/wordscategory';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import MoveTool from '@/components/MoveTool.vue';
import uniqBy from 'lodash/uniqBy';
export default {
  name: 'GroupModal',
  components: { MoveTool, RequestButton },
  inheritAttrs: false,
  props: {
    // 所有一级分组列表
    groupData: {
      type: Array,
      default: () => []
    },
    // 分组信息
    formData: {
      type: Object,
      default: () => ({
        parentId: undefined,
        name: undefined
      })
    },
    // 话术类型
    type: {
      type: Number,
      default: null
    },
    // 重新获取分组列表
    getList: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      rules: {
        parentId: [],
        name: [{
          required: true,
          message: '请填写分组名称',
          trigger: 'blur'
        }]
      },
      // 要删除的子文件夹
      removeList: []
    };
  },
  computed: {
    lowerGroupList: {
      get() {
        return this.formData.children || [];
      },
      set(val) {
        this.$emit('update:formData', { ...this.formData, children: val });
      }
    }
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onClose() {
      this.$refs['elForm'].resetFields();
    },
    close() {
      this.$emit('update:visible', false);
    },
    /**
     * 确定新增/修改分组信息
     */
    handelConfirm() {
      this.$refs['elForm'].validate(valid => {
        if (!valid) return changeButtonLoading(this.$store, 'submit');
        const idList = this.dealChildIdList();
        const uniqIdList = uniqBy(idList, 'name');
        if (uniqIdList.length !== idList.length) {
          this.msgWarn('下级分组重复');
          return changeButtonLoading(this.$store, 'submit');
        }
        if (this.formData.id) {
          const delChildList = [];
          this.removeList.map(item => {
            delChildList.push(item.id);
          });
          console.log('this.removeList', this.removeList);
          this.handleUpdateGroup(idList, delChildList);
        } else {
          this.handleAddGroup(idList);
        }
      });
    },
    // 添加下级分组
    addLowerGroup() {
      const newList = [...this.lowerGroupList];
      newList.push({ name: '' });
      this.lowerGroupList = newList;
    },

    dealChildIdList() {
      const idList = [];
      let childList = [...this.lowerGroupList];
      childList = childList.reverse();
      childList.map((item, index) => {
        idList.push({
          childId: item.id,
          name: item.name,
          sort: index + 1
        });
      });
      return idList;
    },
    /**
     * 修改分组信息
     */
    handleUpdateGroup(idList, delChildList) {
      updateGroup({
        // 下级文件夹ID列表
        childIdList: idList,
        delChildList: delChildList,
        id: this.formData.id,
        // 文件夹名称
        name: this.formData.name,
        parentId: this.formData.parentId === '0' ? undefined : this.formData.parentId,
        type: this.type
      }).then(res => {
        // 修改按钮状态
        changeButtonLoading(this.$store, 'submit');
        if (res) {
          this.getList();
          this.close();
        }
      });
    },
    /**
     * 添加新分组
     */
    handleAddGroup(idList) {
      addGroup({
        name: this.formData.name,
        parentId: this.formData.parentId,
        type: this.type,
        childIdList: idList
      }).then(res => {
        changeButtonLoading(this.$store, 'submit');
        if (res) {
          this.getList();
          this.msgSuccess('操作成功');
          this.close();
        }
      });
    },
    /**
     * 获取移除的附件列表
     */
    getRemoveList(list) {
      this.removeList = [...this.removeList, ...list];
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
