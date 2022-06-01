<script>
import * as api from '@/api/customer/tag';
import * as grouptagApi from '@/api/customer/grouptag';
import { changeButtonLoading } from '@/utils/common';
import RequestButton from '@/components/Button/RequestButton.vue';
export default {
  name: 'AddTag',
  components: { RequestButton },
  props: {
    // 添加标签显隐
    visible: {
      type: Boolean,
      default: false
    },
    // 表单参数
    form: {
      type: Object,
      default: () => ({
        groupName: '',
        weTags: []
      })
    },
    // 是否是在批量打标签时添加标签/不显示旧标签
    isAddTag: {
      type: Boolean,
      default: false
    },
    tagType: {
      type: String,
      default: 'customer'
    }
  },
  data() {
    const checkGroupName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('标签组名称不能为空'));
      }
      // 这里判断如果是编辑则不进行重复判断
      if (!this.form.groupId) {
        // 检测名称是否重复
        if (this.tagType === 'customer') {
          api['checkTagGroupName']({ tagGroupName: value }).then((response) => {
            if (response.data.repeat === 1) {
              callback(new Error('已存在相同标签分组，不可重复添加'));
            } else {
              callback();
            }
          });
        } else {
          const groupTagList = this.$store.state.listInfo.groupTagList;
          if (groupTagList.find((tag) => tag.groupName === value)) {
            callback(new Error('已存在相同标签分组，不可重复添加'));
          } else {
            callback();
          }
        }
      } else {
        // callback必须执行
        callback();
      }
    };
    return {
      // 添加标签输入框
      newInput: '',
      // 表单验证规则
      rules: Object.freeze({
        groupName: [
          { required: true, validator: checkGroupName, trigger: 'blur' }
        ],
        weTags: [{ required: true, message: '标签不能为空', trigger: 'blur' }]
      }),
      // 添加便签按钮显隐
      visibleAdd: false,
      oldTags: [],
      isSetOld: false
    };
  },
  computed: {
    Pvisible: {
      get() {
        if (this.visible) {
          this.$nextTick(() => {
            this.$refs['form'].clearValidate();
          });
        }
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    visible(val) {
      this.visibleAdd = false;
      this.newInput = '';
      if (val) {
        this.isSetOld = false;
      }
    }
  },
  mounted() {},
  methods: {
    closeTag(tag, index) {
      this.setOldTags();
      if (tag.id) {
        tag.status = 1;
        this.form.weTags.splice(index, 1, tag);
      } else {
        this.form.weTags.splice(index, 1);
      }
    },

    showInput() {
      this.setOldTags();
      this.visibleAdd = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    setOldTags() {
      !this.isSetOld && (this.oldTags = [...this.form.weTags]);
      this.isSetOld = true;
    },
    newInputConfirm() {
      const name = this.newInput;
      if (name) {
        Array.isArray(this.form.weTags) || (this.form.weTags = []);
        const isExist = this.form.weTags.some((tag) => {
          return tag.name === name;
        });
        if (isExist) {
          this.msgError('标签名已存在，不可重复添加');
          return;
        }
        const old = this.oldTags.find((tag) => tag.name === name);
        if (old) {
          this.form.weTags.push({ ...old, status: undefined });
        } else {
          this.form.weTags.push({ name });
        }
      }
      this.visibleAdd = false;
      this.newInput = '';
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'submit');
        if (this.visibleAdd) {
          this.msgError('标签名已存在，不可重复添加');
          changeButtonLoading(this.$store, 'submit');
          return;
        }
        if (this.tagType === 'customer') {
          this.newInput = '';
          const form = JSON.parse(JSON.stringify(this.form));
          if (!form.weTags.length) {
            changeButtonLoading(this.$store, 'submit');
            return;
          }
          api[form.groupId ? 'update' : 'add'](form).then(() => {
            changeButtonLoading(this.$store, 'submit');
            this.msgSuccess('操作成功');
            this.Pvisible = false;
            const addTags = form.weTags
              .filter((ele) => !ele.tagId)
              .map((ele) => ({ ...ele, groupName: form.groupName }));
            this.$emit('success', addTags);
          });
        } else {
          const { groupName, weTags } = this.form;
          const params = {
            name: groupName
          };
          if (!this.form.groupId) {
            params.tagList = weTags;
          } else {
            params.id = this.form.groupId;
            // 编辑标签组
            const addList = [];
            const delList = [];
            weTags.forEach((tag) => {
              // 新增
              if (!this.oldTags.find((oldTag) => oldTag.name === tag.name)) {
                addList.push(tag);
              }
            });
            this.oldTags.forEach((oldTag) => {
              // 新增
              if (!weTags.find((tag) => oldTag.name === tag.name)) {
                delList.push(oldTag.tagId || oldTag.id);
              }
            });
            params.addList = addList;
            params.delList = delList;
          }
          grouptagApi[this.form.groupId ? 'update' : 'add'](params).then(
            (res) => {
              changeButtonLoading(this.$store, 'submit');
              this.msgSuccess('操作成功');
              this.Pvisible = false;
              const addTags = weTags
                .filter((ele) => !ele.id)
                .map((ele) => ({ ...ele, groupName: groupName }));
              this.$emit('success', addTags);
            }
          );
        }
      });
    }
  }
};
</script>

<template>
  <el-dialog
    class="foot-button-reverse-dialog-wrapper tag-group-dialog"
    :title="(form.groupId && !isAddTag ? '编辑' : '添加') + '标签/组'"
    :visible.sync="Pvisible"
    width="500px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="标签组" prop="groupName">
        <el-input
          v-model.trim="form.groupName"
          maxlength="15"
          show-word-limit
          placeholder="请输入标签组名称，创建后不可修改"
          :disabled="!!form.groupId"
        />
      </el-form-item>
      <el-form-item label="标签" prop="weTags">
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
          type="primary"
          plain
          class="button-new-tag"
          size="mini"
          icon="el-icon-plus"
          @click="showInput"
        >添加标签</el-button>
        <template
          v-for="(item, index) in form.weTags.filter((ele) =>
            isAddTag ? !ele.tagId : true
          )"
        >
          <el-tag
            v-if="item.status !== 1"
            :key="index"
            type="primary"
            closable
            size="medium"
            @close="closeTag(item, index)"
          >
            {{ item.name }}
          </el-tag>
        </template>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <RequestButton
        type="primary"
        :request-method="submit"
        button-type="submit"
      >确 定</RequestButton>
      <el-button @click="Pvisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.input-new-tag {
  width: auto;
  margin-right: 10px;
  vertical-align: bottom;
}
.button-new-tag {
  margin-bottom: 3px;
  margin-right: 5px;
  height: 28px;
  font-size: 12px;
  color: #7f7f7f;
  padding: 7px 10px;
  border-color: #d9d9d9;
  background: #ffffff;
  &:hover {
    @include tag_hover_color($color-theme2-1);
    border-color: #c4e1dd;
    background: #fff;
  }
}
.el-tag {
  font-size: 12px;
  @include btn_reset_color($color-theme2-1);
  padding: 8px 10px;
  line-height: 12px;
  margin-bottom: 3px;
  margin-right: 5px !important;
  &:hover {
    @include tag_hover_color($color-theme2-1);
  }
}
</style>
