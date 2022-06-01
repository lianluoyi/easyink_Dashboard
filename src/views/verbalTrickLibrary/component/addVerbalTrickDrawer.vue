<template>
  <el-drawer
    :title="`${formData.id ? '编辑' : '新增'}话术`"
    v-bind="$attrs"
    :before-close="handleClose"
    :append-to-body="true"
    class="verbal-trick-drawer"
    v-on="$listeners"
  >
    <div class="drawer-div">
      <el-form ref="verbalForm" :model="formData" :rules="rules" size="medium" label-width="80px">
        <el-form-item label="所属分组" prop="categoryId">
          <el-cascader
            ref="cascader"
            v-model="formData.categoryId"
            :options="groupTreeData"
            :props="defaultProps"
            placeholder="请选择话术所属分组"
            clearable
            filterable
            :style="{width: '360px'}"
            popper-class="my-cascader"
            @change="casCaderChange"
          />
        </el-form-item>
        <el-form-item label="话术标题" prop="title">
          <el-input
            v-model="formData.title"
            type="textarea"
            placeholder="请填写问题或话术场景，方便检索"
            :maxlength="64"
            show-word-limit
            :autosize="{minRows: 4, maxRows: 4}"
            :style="{width: '360px'}"
            clearable
          />
        </el-form-item>
        <el-form-item label="话术内容" prop="weWordsDetailList">
          <template v-for="(item, contentIndex) in formData.weWordsDetailList">
            <!-- <div :key="index" class="content-item" /> -->
            <VerbalTrickItem
              ref="verbalTrickItemRef"
              :key="contentIndex"
              :content-index="contentIndex"
              :item.sync="item"
              :media-type="item.mediaType.toString()"
              :form-data="formData"
              :content-list.sync="formData.weWordsDetailList"
              text-placeholder="请填写文字话术"
              @getRemoveList="getRemoveList"
            />
          </template>
        </el-form-item>
        <div class="operate-btn-div">
          <AddVerbalTrickButton
            :form-data.sync="formData"
            :show-arrow="true"
            btn-type="primary"
            material-field="weWordsDetailList"
          />
        </div>
      </el-form>
      <div class="confirm-div">
        <div v-show="[VERBAL_TRICK_TYPE['department'], VERBAL_TRICK_TYPE['enterprise']].includes(type)">
          <el-switch
            v-model="formData.isPush"
          />
          <span class="switch-tip">更新后，发送应用提醒通知使用员工</span>
        </div>
        <div class="confirm-btn-div">
          <RequestButton type="primary" :request-method="submitForm" button-type="submit">确定</RequestButton>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import VerbalTrickItem from './verbalTrickItem.vue';
import {
  MEDIA_TYPE_POSTER, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE, MEDIA_TYPE_TEXT, MEDIA_TYPE_IMGLINK,
  MEDIA_TYPE_MINIAPP, VERBAL_TRICK_TYPE, DEFAULT_LINK, IMG_LINK_DIGEST
} from '@/utils/constant';
import { addWords, updateWords } from '@/api/wordsGroup';
import AddVerbalTrickButton from '@/components/AddVerbalTrickButton.vue';
import { checkContent, changeButtonLoading } from '@/utils/common';

export default {
  components: { VerbalTrickItem, AddVerbalTrickButton, RequestButton },
  props: {
    type: {
      type: Number,
      default: VERBAL_TRICK_TYPE['enterprise']
    },
    groupTreeData: {
      type: Array,
      default: () => []
    },
    addVerbalTrickDrawerVisible: {
      type: Boolean,
      default: false
    },
    selectedGroup: {
      type: String,
      default: ''
    }
  },
  data() {
    const checkCategory = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择话术所属分组'));
      }
      callback();
    };
    return {
      formData: {
        categoryId: undefined,
        title: undefined,
        // 话术内容列表
        weWordsDetailList: [{
          mediaType: MEDIA_TYPE_TEXT,
          content: ''
        }],
        isPush: [VERBAL_TRICK_TYPE['department'], VERBAL_TRICK_TYPE['enterprise']].includes(this.type)
      },
      rules: {
        categoryId: [{
          required: true,
          trigger: 'blur',
          validator: checkCategory
        }],
        weWordsDetailList: [{
          required: true,
          trigger: 'blur',
          validator: checkContent
        }]
      },
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_TEXT,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_MINIAPP,
      VERBAL_TRICK_TYPE,
      removeList: [],
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true,
        emitPath: false,
        expandTrigger: 'hover'
      }
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.$watch('addVerbalTrickDrawerVisible', () => {
      this.formData.categoryId = (this.selectedGroup && this.selectedGroup !== '0') ? this.selectedGroup : (this.groupTreeData[0]?.id || undefined);
    });
  },
  methods: {
    // 选择新增话术或编辑话术的所属分组之后将下拉界面收起的函数
    casCaderChange() {
      this.$refs.cascader.toggleDropDownVisible();
    },
    submitForm() {
      const weWordsDetailList = [...this.formData.weWordsDetailList];
      this.$refs['verbalForm'].validate(async valid => {
        if (!valid) return changeButtonLoading(this.$store, 'submit');
        this.$refs.verbalTrickItemRef;
        const formData = { ...this.formData };
        if (this.formData.id) {
          const removeIds = [];
          this.removeList.map(item => {
            removeIds.push(item.id);
          });
          this.updateWords({
            ...formData,
            wordsDetailIds: removeIds
          });
        } else {
          let newList = [...weWordsDetailList];
          newList = newList.map(newItem => {
            return {
              ...newItem,
              // 链接话术增加摘要默认值
              content: newItem.mediaType === MEDIA_TYPE_IMGLINK ? (newItem.content || IMG_LINK_DIGEST) : newItem.content
            };
          });
          newList = newList.filter(item => item.url || (!item.url && item.mediaType === MEDIA_TYPE_TEXT));
          if (newList.length === 0) return;
          this.addWords({
            categoryId: formData.categoryId,
            title: formData.title,
            weWordsDetailList: newList,
            isPush: formData.isPush
          });
        }
      });
    },
    resetForm() {
      this.$refs['verbalForm'].resetFields();
      this.handleClose();
    },
    handleClose() {
      this.$emit('update:visible', false);
    },
    handleAddVerbalTrick(command) {
      const newList = [...this.formData.weWordsDetailList];
      switch (command) {
        case MEDIA_TYPE_TEXT: {
          newList.push({
            mediaType: command,
            content: ''
          });
          break;
        }
        case MEDIA_TYPE_POSTER:
        case MEDIA_TYPE_VIDEO:
        case MEDIA_TYPE_FILE: {
          newList.push({
            mediaType: command,
            url: '',
            title: ''
          });
          break;
        }
        case MEDIA_TYPE_IMGLINK:
        case MEDIA_TYPE_MINIAPP: {
          newList.push({
            mediaType: command,
            url: '',
            title: '',
            content: '',
            coverUrl: '',
            isDefined: DEFAULT_LINK
          });
          break;
        }
      }
      this.formData.weWordsDetailList = [...newList];
    },
    /**
     * 新增话术
     */
    async addWords(params) {
      const addRes = await addWords(params);
      changeButtonLoading(this.$store, 'submit');
      if (addRes) {
        this.closeDrawerAndGet();
      }
    },
    /**
     * 关闭并重新获取话术列表
     */
    closeDrawerAndGet() {
      this.handleClose();
      this.msgSuccess('操作成功');
      this.$emit('getList');
    },
    /**
     * 更新话术
     */
    async updateWords(params) {
      const updateRes = await updateWords(params);
      changeButtonLoading(this.$store, 'submit');
      if (updateRes) this.closeDrawerAndGet();
    },
    /**
     * 获取移除的附件列表
     */
    getRemoveList(list) {
      this.removeList = list;
    }
  }
};

</script>
<style lang="scss" scoped>
.verbal-trick-drawer {
  /deep/ .el-drawer__container {
    .el-drawer {
        width: 780px !important;
        .el-drawer__header {
            >span {
                font-size: 20px;
                color: #333;
                font-weight: 500;
            }
        }
    }
  }
  .drawer-div {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .operate-btn-div {
    padding-left: 90px;
    margin-top: 10px;
  }
  .confirm-div {
    display: flex;
    align-items: center;
    padding: 20px 30px;
    position: relative;
    height: 60px;
    .switch-tip {
      margin-left: 10px;
    }
    .confirm-btn-div {
      position: absolute;
      right: 30px;

    }
  }
}
</style>
