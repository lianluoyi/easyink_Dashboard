<!--
 * @Description: 素材选择标签弹窗
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<script>
import { addMaterialTag, delMaterialTag } from '@/api/material';

export default {
  name: 'SelectTagModal',
  components: {},
  props: {
    /**
     * 弹窗显示状态
     */
    visible: {
      type: Boolean,
      default: false
    },
    /**
     * 头部提示语
     */
    alertTitle: {
      type: String,
      default: '请选择要为素材打上的标签'
    },
    /**
     * 弹窗标题
     */
    modalTitle: {
      type: String,
      default: '选择标签'
    },
    /**
     * 是否能够移除标签
     */
    canRemoveTag: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示添加标签按钮
     */
    showAddTag: {
      type: Boolean,
      default: false
    },
    tagList: {
      type: Array,
      default: () => []
    },
    /**
     * 点击确定时校验是否有选择标签
     */
    checkSelectNum: {
      type: Boolean,
      default: false
    },
    // 默认被选中的标签
    defaultTagList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tagName: '',
      Pselected: [],
      // 添加标签按钮显隐
      visibleAdd: false,
      // 添加标签输入框
      newInput: ''
    };
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    /**
     * 处理筛选后的标签列表
     */
    showTagList() {
      let list = [...this.tagList];
      list = list.filter((item) => item.tagName && item.tagName.includes(this.tagName));
      // 标签倒序显示
      list = list.reverse();
      return list;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.Pselected = this.defaultTagList;
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 点击添加标签
     */
    addTagFn() {
      this.visibleAdd = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    /**
     * 调用添加标签接口
     */
    async handleAddTag() {
      const addRes = await addMaterialTag(this.newInput);
      if (addRes) this.$store.dispatch('GetMaterialTag');
    },
    /**
     * 判断标签是否被选中
     */
    isChecked(unit) {
      // debugger
      return this.Pselected.some((el) => {
        return unit.id === el.id;
      });
    },
    /**
     * 选中一个标签
     */
    selectOneTag(tag) {
      const index = this.Pselected.findIndex((ele) => ele.id === tag.id);
      if (index === -1) {
        this.Pselected.push(tag);
      } else {
        this.Pselected.splice(index, 1);
      }
    },
    /**
     * 确认选择标签
     */
    submitSelectTags() {
      if (this.checkSelectNum && this.Pselected.length === 0) {
        this.msgWarn('请至少选择一个标签');
        return;
      }
      this.Pvisible = false;
      this.$emit('submitSelectTags', this.Pselected);
    },
    /**
     * 确认添加素材标签
     */
    newInputConfirm() {
      const name = this.newInput;
      if (name) {
        Array.isArray(this.tagList) || (this.tagList = []);
        const isExist = this.tagList.some((tag) => {
          return tag.name === name;
        });
        if (isExist) {
          this.msgError('标签名已存在，不可重复添加');
          return;
        }
        this.handleAddTag();
      }
      this.visibleAdd = false;
      this.newInput = '';
    },
    /**
     * 移除素材标签
     */
    async removeTag(tag) {
      this.confirmModal(
        {
          msg: '删除后，将不可再为素材添加该标签，是否继续？'
        },
        async() => {
          const delRes = await delMaterialTag(tag.id);
          if (delRes) this.$store.dispatch('GetMaterialTag');
        }
      );
    }
  }
};
</script>

<template>
  <div class="select-tag-modal">
    <el-dialog
      class="tag-dialog"
      :title="modalTitle"
      :visible.sync="Pvisible"
      width="680px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-alert :title="alertTitle" type="info" show-icon :closable="false" />
      <el-input
        v-model="tagName"
        placeholder="请输入标签"
        style="width: 400px"
        suffix-icon="el-icon-search"
        clearable
      />
      <div class="tag-manage">
        <div v-if="showAddTag">
          <el-input
            v-if="visibleAdd"
            ref="saveTagInput"
            v-model.trim="newInput"
            class="input-new-tag"
            size="mini"
            maxlength="15"
            show-word-limit
            @keyup.enter.native="newInputConfirm"
            @blur="newInputConfirm"
          />
          <el-button
            v-else
            v-hasPermi="['wechat:material:tagManage']"
            class="add-tag-btn"
            icon="el-icon-plus"
            @click="addTagFn"
          >添加标签</el-button>
        </div>
        <div class="tag-list">
          <template v-for="(unit, index) in showTagList">
            <el-tag
              :key="index"
              type="primary"
              :closable="canRemoveTag"
              size="medium"
              :class="isChecked(unit) ? 'selected' : ''"
              @close="removeTag(unit)"
              @click="selectOneTag(unit)"
            >
              {{ unit.tagName }}
            </el-tag>
          </template>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="Pvisible = false">取 消</el-button>
        <el-button v-preventReClick="1000" type="primary" @click="submitSelectTags">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.tag-dialog {
  .el-alert {
    border-color: #c4e1dd;
    color: #7f7f7f;
    background: $bgLightBaseColor;
    margin: -15px 0 15px;
  }
  .tag-manage {
    margin-top: 10px;
    display: flex;
    .input-new-tag {
      width: auto;
      margin-right: 10px;
      vertical-align: bottom;
      width: 162px;
    }
    .add-tag-btn {
      height: 28px;
      font-size: 12px;
      color: #7f7f7f;
      padding: 7px 10px;
      border-color: #d9d9d9;
      background: #ffffff;
      &:hover {
        @include text_btn_color($color-theme2-1);
        border-color: #c4e1dd;
      }
    }
    .tag-list {
      margin-left: 5px;
      max-height: 350px;
      overflow: auto;
      /deep/ .el-tag {
        margin-right: 5px;
        margin-bottom: 5px;
        font-size: 12px;
        color: #7f7f7f;
        border-color: #d9d9d9;
        padding: 0px 10px;
        background-color: #fff;
        cursor: pointer;
        .el-tag__close {
          background-color: #fff;
          color: #7f7f7f;
          font-size: 16px;
        }
        &:hover {
          @include text_btn_color($color-theme2-1);
          border-color: #c4e1dd;
        }
        &.selected {
          @include text_btn_color($color-theme2-1);
          background: $bgLightBaseColor;
          @include border_color();
          .el-tag__close {
            background-color: $bgLightBaseColor;
          }
        }
      }
    }
  }
}
</style>
