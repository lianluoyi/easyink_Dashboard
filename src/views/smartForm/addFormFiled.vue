<!--
 * @Description: 新增智能表单字段
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div style="height: 100%;min-width: 1100px;">
    <ReturnPage path="/operationsCenter/material/intelligentForm" :show-next-step="showEditFormFiled" :custom-back-method="!showEditFormFiled" @nextStep="nextStep" @customBackMethod="previouStep" />
    <div v-show="showEditFormFiled" class="smart-form">
      <!-- 左侧 -->
      <div class="smart-form-left">
        <FromComponentSelect />
      </div>
      <!-- 中间预览 -->
      <div class="smart-form-preview">
        <FormPreview :active-name="activeName" :show-edit-form-filed="showEditFormFiled" :preview-form-filed="previewFormFiled" />
      </div>
      <!-- 右侧选项 -->
      <div class="smart-form-right">
        <div class="form-right-top">
          <div style="cursor: not-allowed" :class="'mt10' + (activeName === 'fieldSetting' ? ' active' : '')">字段设置</div>
          <div style="cursor: pointer" :class="'mt10' + (activeName === 'formSetting' ? ' active' : '')" @click="changeTab">表单设置</div>
        </div>
        <FromSetting v-show="activeName==='formSetting'" ref="formSetting" :show-edit-form-filed="showEditFormFiled" :edit-form-set-value="editFormSetValue" />
        <FiledSetting v-show="activeName==='fieldSetting'" />
      </div>
    </div>
    <AddSmartForm v-if="!showEditFormFiled" :form-init-value="formInitValue" />
  </div>
</template>

<script>
import { editFormDetail } from '@/api/form';
import AddSmartForm from './add.vue';
import { EventBus } from '@/event-bus.js';
import FiledSetting from './components/FiledSetting.vue';
import FormPreview from './components/FormPreview.vue';
import FromComponentSelect from './components/FromComponentSelect.vue';
import FromSetting from './components/FormSetting.vue';
import ReturnPage from '@/components/ReturnPage.vue';
import { FORM_DEFAULT_HEAD_IMAGE_URL } from '@/utils/constant';
export default {
  components: { ReturnPage, FromComponentSelect, FromSetting, FormPreview, FiledSetting, AddSmartForm },
  data() {
    return {
      activeName: 'formSetting',
      // 是否是编辑表单字段页面
      showEditFormFiled: true,
      // 新增表单时候的初始值
      formInitValue: undefined,
      formId: undefined,
      // 编辑表单的时候获取的表单预览字段的值
      previewFormFiled: [],
      // 编辑表单的时候获取的表单设置的值
      editFormSetValue: {}
    };
  },
  mounted() {
    // 在这里监听一个是因为在选择了一个控件后需要将tab切换到字段设置
    EventBus.$on('chooseComponents', arg => {
      this.activeName = 'fieldSetting';
    });
    EventBus.$on('clickComponents', arg => {
      console.log('字段设置接收到当前在预览页点击的组件', arg);
      this.activeName = 'fieldSetting';
    });
    EventBus.$on('formSetting', () => {
      console.log('字段设置接收到当前在预览页点击的表单头图、表单名称、表单说明');
      this.activeName = 'formSetting';
    });
    // 初始化获取从表单列表页选择的 所属分组 和 分组所属类别 和分组所属部门id
    this.formInitValue = { ...this.formInitValue, ...this.$route.query };
  },
  created() {
    const routerQuery = this.$route.query;
    this.formId = routerQuery.id;
    if (!this.formId) {
      // 表单默认值 在这里传是为了防止编辑表单的时候表单默认头图闪烁
      this.editFormSetValue = {
        headImageUrl: FORM_DEFAULT_HEAD_IMAGE_URL,
        headImageOpenFlag: true,
        formName: '表单名称',
        descriptionFlag: true,
        description: '表单说明',
        showSortFlag: true,
        submitText: '提 交',
        submitColor: '#6BB4AB'
      };
    }
    routerQuery.id && this.getFormDetail();
  },
  beforeDestroy() {
    // 组件卸载时移除事件的监听
    EventBus.$off('chooseComponents');
    EventBus.$off('clickComponents');
    EventBus.$off('formSetting');
  },
  methods: {
    getFormDetail() {
      editFormDetail({ id: this.formId }).then((res) => {
        this.previewFormFiled = JSON.parse(res.data.formVO.formFieldListJson);
        this.formInitValue = {
          ...this.formInitValue,
          ...res.data.formSettingVO,
          groupId: res.data.formVO.groupId,
          id: res.data.formVO.id
        };
        const { headImageUrl, headImageOpenFlag, description, formName, submitText, submitColor, showSortFlag, descriptionFlag } = res.data.formVO;
        this.editFormSetValue = {
          headImageUrl,
          headImageOpenFlag,
          description, formName, submitText, submitColor, showSortFlag, descriptionFlag
        };
      });
    },
    changeTab() {
      this.activeName = 'formSetting';
    },
    // 下一步
    nextStep() {
      const flag = this.$refs['formSetting'].checkFormRules();
      if (flag) {
        this.showEditFormFiled = false;
      }
    },
    // 上一步
    previouStep() {
      this.showEditFormFiled = true;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.smart-form {
  display: flex;
  min-width: 1000px;
  overflow-x: auto;
  overflow-y: hidden;
  .smart-form-left {
    height: calc(100vh - 184px);
    padding: 15px;
    border-right: 1px solid #ccc;
    background-color: #fff;
  }
  .smart-form-right {
    overflow-y: auto;
    height: calc(100vh - 184px);
    border-left: 1px solid #ccc;
    background-color: #fff;
    width: 300px;
    .form-right-top {
      display: flex;
      height: 40px;
      border-bottom: 1px solid #eee;
      justify-content: space-between;
      padding: 0 50px;
      .active {
        color:$green;
        border-bottom: 2px solid $green;
      }
    }
  }
  .smart-form-preview {
    height: calc(100vh - 204px);
    overflow: auto;
    flex: 1;
    padding: 20px 0;
    display: flex;
    justify-content: center;
  }
}
</style>
