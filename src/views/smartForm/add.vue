<!--
 * @Description: 新增智能表单
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="add-smart-form wrap">
    <div class="wrap-body">
      <div class="wrap-body-form drawer-div">
        <el-form
          ref="form"
          :model="formSetting"
          label-width="80px"
          class="form"
          :rules="rules"
        >
          <p class="config-title" style="margin-bottom: 10px">基础设置</p>
          <el-form-item label="所属分组" prop="belongGroup">
            <el-cascader
              v-model="belongGroup"
              :options="belongGroupOptions"
              :props="{ expandTrigger: 'hover', label: 'name', value: 'id',checkStrictly: true }"
              placeholder="请选择表单所属分组"
              style="width:360px"
            />
          </el-form-item>
          <el-form-item label="截止时间" required prop="deadLineType" label-width="78px">
            <el-radio-group v-model="formSetting.deadLineType">
              <el-radio :label="FORVER_EFFECT">永久有效</el-radio>
              <el-radio :label="CUSTOMER_DATE">自定义日期</el-radio>
            </el-radio-group>
            <el-form-item
              v-if="formSetting.deadLineType === CUSTOMER_DATE"
              style="padding-left:0px"
            >
              <el-date-picker
                v-model="formSetting.customDate"
                style="width: 225px"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="选择日期"
              />
            </el-form-item>
          </el-form-item>
          <el-form-item v-if="isThirdApplication" label="公众号" label-width="78px">
            <el-select v-model="formSetting.weChatPublicPlatform" placeholder="请选择公众号" style="width:360px">
              <el-option
                v-for="item in officialAccountOption"
                :key="item.officialAccountAppId"
                :label="item.nickName"
                :value="item.officialAccountAppId"
              />
            </el-select>
            <div class="weChatPublicPlatform-info">
              为保证精准匹配客户，需绑定企业已认证公众号进行授权
            </div>
          </el-form-item>

          <p class="config-title" style="margin: 10px 0">提交设置</p>
          <el-form-item label="提交次数" prop="submitCntType" label-width="78px" required>
            <el-radio-group v-model="formSetting.submitCntType">
              <el-radio :label="NOT_LIMIT">不限制次数</el-radio>
              <el-radio :label="ONE_TIME">每个客户限提交1次</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="提交结果">
            <el-radio-group v-model="formSetting.submitActionType">
              <el-radio :label="NOT_JUMP">不跳转</el-radio>
              <el-radio :label="JUMP_RESULT_PAGE">跳转结果页</el-radio>
              <el-radio :label="JUMP_LINK">跳转链接</el-radio>
            </el-radio-group>
            <div v-if="formSetting.submitActionType === JUMP_RESULT_PAGE" class="item-div mt10">
              <el-form-item label-width="0" prop="url">
                <div class="jump-result-page-item mb10">
                  <span class="item-label">图标</span>
                  <UploadFile
                    :file-url.sync="formSetting.actionInfoParam.iconUrl"
                    :multiple="false"
                    :show-type="UPLOAD_ONE_TYPE"
                    :show-file-list="false"
                    :limit="UPLOAD_NUMS_LIMIT"
                    list-type="picture-card"
                    :drag="false"
                    accept=".jpg,.png,.gif"
                  />
                  <span class="item-image-info">
                    注：只能上传jpg/png格式图片，且不超过2M
                  </span>
                </div>
                <div class="jump-result-page-item">
                  <span class="item-label">文案</span>
                  <el-input
                    v-model="formSetting.actionInfoParam.document"
                    resize="none"
                    show-word-limit
                    :maxlength="20"
                    type="textarea"
                    :rows="3"
                  />
                </div>
              </el-form-item>
            </div>
            <div v-if="formSetting.submitActionType === JUMP_LINK" class="item-div mt10">
              <el-form-item label-width="58px">
                <div slot="label">
                  <span class="label-name-required">地址</span>
                </div>
                <el-input
                  v-model="formSetting.actionInfoParam.url"
                  placeholder="请输入链接访问地址"
                  clearable
                />
              </el-form-item>
            </div>
          </el-form-item>

          <p class="config-title" style="margin: 10px 0">高级设置</p>
          <el-form-item label="行为通知" prop="actionNoteFlag">
            <div class="advanced-setting-item">
              <el-switch
                v-model="formSetting.actionNoteFlag"
                :active-value="true"
                :inactive-value="false"
              />
              <span class="we-emple-code-tags-tip">开启后，当客户提交表单，将发送应用提醒通知所属员工</span>
            </div>
          </el-form-item>
          <el-form-item label="轨迹记录" prop="tractRecordFlag">
            <div class="advanced-setting-item">
              <el-switch
                v-model="formSetting.tractRecordFlag"
                :active-value="true"
                :inactive-value="false"
              />
              <span class="we-emple-code-tags-tip">开启后，当客户访问或提交表单，会记录在其客户资料的活动轨迹下</span>
            </div>
          </el-form-item>
          <el-form-item label="客户标签" prop="customerLabelFlag">
            <div class="advanced-setting-item">
              <el-switch
                v-model="formSetting.customerLabelFlag"
                :active-value="true"
                :inactive-value="false"
              />
              <span class="we-emple-code-tags-tip">开启后，当客户访问或提交表单，为其打上指定客户标签</span>
            </div>
          </el-form-item>
          <el-form-item v-show="formSetting.customerLabelFlag" label="" prop="customerTags">
            <div class="item-div">
              <div>
                点击表单
                <el-button
                  class="mr10 ml10"
                  icon="el-icon-plus"
                  size="mini"
                  @click="selectTag('clickLabelIdList')"
                >添加标签</el-button>
                <el-tag
                  v-for="(item, index) in formSetting.labelSetting.clickLabelIdList"
                  :key="index"
                  size="medium"
                  closable
                  @close="closeTag(item, index,'clickLabelIdList')"
                >{{ item.tagName || item.name }}</el-tag>
              </div>
              <div class="mt5">
                提交表单
                <el-button
                  class="mr10 ml10"
                  icon="el-icon-plus"
                  size="mini"
                  @click="selectTag('submitLabelIdList')"
                >添加标签</el-button>
                <el-tag
                  v-for="(item, index) in formSetting.labelSetting.submitLabelIdList"
                  :key="index"
                  size="medium"
                  closable
                  @close="closeTag(item, index,'submitLabelIdList')"
                >{{ item.tagName || item.name }}</el-tag>
              </div>
            </div>
          </el-form-item>
        </el-form>
        <PhoneDialog
          :form-setting="formSetting"
          :form="form"
          is-form-preview
        />
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="submitForm" button-type="submitForm">保存</RequestButton>
    </div>
    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      type="search"
      :selected="formSetting.labelSetting[addTagType]"
      :info-msg="`客户${ addTagType === 'clickLabelIdList' ? '点击' : '提交' }表单后，将自动打上选中的标签`"
      :is-show-add="true"
      @success="submitSelectTag"
    />
  </div>
</template>

<script>
import UploadFile from './components/UploadFile.vue';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import SelectTag from '@/components/SelectTag';
import PhoneDialog from '@/components/PhoneDialog';
import differenceBy from 'lodash/differenceBy';
import { getConfig } from '@/api/wechatopen';
import {
  SERVER_TYPE_THIRD,
  FORVER_EFFECT,
  CUSTOMER_DATE,
  NOT_LIMIT,
  ONE_TIME,
  NOT_JUMP,
  JUMP_RESULT_PAGE,
  JUMP_LINK,
  UPLOAD_ONE_TYPE
} from '@/utils/constant';
import { EventBus } from '@/event-bus.js';
import { getGroupTree, addForm, editForm } from '@/api/form';
const UPLOAD_NUMS_LIMIT = 1;
export default {
  components: { SelectTag, RequestButton, UploadFile, PhoneDialog },
  props: {
    formInitValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      SERVER_TYPE_THIRD,
      CUSTOMER_DATE,
      FORVER_EFFECT,
      NOT_LIMIT,
      ONE_TIME,
      NOT_JUMP,
      JUMP_RESULT_PAGE,
      JUMP_LINK,
      UPLOAD_NUMS_LIMIT,
      UPLOAD_ONE_TYPE,
      // 公众号列表
      officialAccountOption: [],
      // 所属分组
      belongGroup: [],
      belongGroupOptions: [],
      sourceType: undefined,
      formSetting: {
        // 截止时间类型
        deadLineType: FORVER_EFFECT,
        // 提交次数类型
        submitCntType: ONE_TIME,
        // 提交结果行为
        submitActionType: JUMP_RESULT_PAGE,
        actionInfoParam: {
          document: '提交成功',
          iconUrl: 'https://wecomsaas-1253559996.cos.ap-guangzhou.myqcloud.com/2023/01/16/form.png'
        },
        labelSetting: {
          clickLabelIdList: [],
          submitLabelIdList: []
        }
      },
      // 传给表单预览小手机的对象
      form: {},
      formId: undefined,
      // 当前添加标签的类型
      addTagType: 'clickLabelIdList',
      // 移除的标签列表
      removeTagList: {
        clickLabelIdList: [],
        submitLabelIdList: []
      },
      dialogVisibleSelectTag: false,
      // 表单验证规则
      rules: Object.freeze({
        belongGroup: [
          { required: true, message: '', validator: (rule, value, callback) => {
            if (!this.belongGroup.length) {
              callback(new Error('请填写选择所属分组'));
              return;
            }
            callback();
          }, trigger: 'blur' }
        ]
      })
    };
  },
  computed: {
    // 是否是三方
    isThirdApplication() {
      return this.$store.state.serverInfo && this.$store.state.serverInfo.serverType === SERVER_TYPE_THIRD;
    }
  },
  created() {
    this.getFormGoup();
    this.formInitValue.id && this.initFrom();
    this.isThirdApplication && this.getWechatOpenConfig();
  },
  mounted() {
    EventBus.$on('formFieldListJson', arg => {
      this.form.formFieldListJson = arg;
    });
    EventBus.$on('formSet', formSetArg => {
      this.form = {
        ...this.form,
        ...formSetArg
      };
    });
  },
  beforeDestroy() {
    EventBus.$off('formFieldListJson');
    EventBus.$off('formSet');
  },
  methods: {
    /**
     * @description 获取公众号配置
     */
    getWechatOpenConfig() {
      getConfig().then((res) => {
        this.officialAccountOption = res.data;
        if (res.data.length) {
          this.formSetting.weChatPublicPlatform = res.data[0].officialAccountAppId;
        }
      });
    },
    initFrom() {
      this.formId = this.formInitValue.id;
      // 根据groupId判断当前是否有父分组
      this.belongGroup = this.getBelongGroup(this.belongGroupOptions, this.formInitValue.groupId);
      // 跳转结果页面
      // TODO修改
      if (this.formSetting.submitActionType === JUMP_RESULT_PAGE) {
        const { iconUrl, document, url } = JSON.parse(this.formInitValue.actionInfoParamJson);
        this.formSetting = {
          ...this.formSetting,
          actionInfoParam: {
            document,
            iconUrl,
            url
          },
          labelSetting: {
            ...JSON.parse(this.formInitValue.labelSettingJson)
          }
        };
      }
      this.formSetting = {
        ...this.formSetting,
        ...this.formInitValue
      };
    },
    /**
     * @description 获取所属分组
     */
    getBelongGroup(array, groupId) {
      const arr = [groupId + ''];
      array.forEach((item) => {
        if (item.children) {
          item.children.forEach((arg) => {
            if (+arg.id === groupId) {
              arr.unshift('' + arg.parentId);
            }
          });
        }
      });
      return arr;
    },

    selectTag(item) {
      this.dialogVisibleSelectTag = true;
      this.addTagType = item;
    },

    /**
     * @description 获取表单分组树
     */
    getFormGoup() {
      this.sourceType = this.formInitValue.sourceType;
      getGroupTree({ sourceType: this.sourceType, departmentId: this.formInitValue.departmentId }).then((res) => {
        this.belongGroupOptions = res.data;
        this.belongGroup = this.formInitValue.selectedGroup || [];
        // 如果是编辑的话走下面这个判断
        this.formInitValue.id && (this.belongGroup = this.getBelongGroup(this.belongGroupOptions, this.formInitValue.groupId));
      });
    },
    /**
     * 选择客户标签
     */
    submitSelectTag(data) {
      // 过滤出弹窗中取消选中的标签
      let removeList = differenceBy(this.formSetting.labelSetting[this.addTagType], data, 'tagId');
      this.formSetting.labelSetting[this.addTagType] = [...data];
      this.dialogVisibleSelectTag = false;
      removeList = this.removeTagList[this.addTagType].concat(removeList);
      this.removeTagList[this.addTagType] = removeList;
    },
    /**
     * 移除客户标签
     * @param tagBelongType 当前移除的类型
     */
    closeTag(item, index, tagBelongType) {
      this.formSetting.labelSetting[tagBelongType].splice(index, 1);
      this.removeTagList[tagBelongType].push(item);
    },
    /**
     * @description 处理提交结果
     */
    dealSubmitResult(item) {
      let flag = true;
      const { submitActionType, actionInfoParam } = this.formSetting;
      if (submitActionType === JUMP_RESULT_PAGE) {
        const { document } = actionInfoParam;
        if (!document) {
          this.msgWarn('请填写文案');
          flag = false;
        }
        item.formSetting.actionInfoParam = {
          iconUrl: actionInfoParam.iconUrl,
          document: actionInfoParam.document
        };
      }
      if (submitActionType === JUMP_LINK) {
        if (!actionInfoParam.url) {
          this.msgWarn('请填写跳转链接');
          flag = false;
        }
        item.formSetting.actionInfoParam = {
          url: actionInfoParam.url
        };
      }
      if (submitActionType === NOT_JUMP) {
        item.formSetting.actionInfoParam = {};
      }
      return flag;
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'submitForm');
        // 处理截止时间
        if (!this.formSetting.customDate && this.formSetting.deadLineType === CUSTOMER_DATE) {
          changeButtonLoading(this.$store, 'submitForm');
          return this.msgWarn('请选择截止时间');
        }
        if (!this.formSetting.customerLabelFlag) {
          this.formSetting.labelSetting.clickLabelIdList = [];
          this.formSetting.labelSetting.submitLabelIdList = [];
        }
        const payload = {
          id: this.formId,
          form: {
            ...this.form,
            // eslint-disable-next-line no-magic-numbers
            groupId: this.belongGroup.length === 2 ? +this.belongGroup[1] : +this.belongGroup[0]
          },
          formSetting: {
            ...this.formSetting,
            labelSetting: {
              clickLabelIdList: this.formSetting.labelSetting.clickLabelIdList.map((item) => item.tagId),
              submitLabelIdList: this.formSetting.labelSetting.submitLabelIdList.map((item) => item.tagId)
            }
          }
        };
        // 处理提交结果
        const flag = this.dealSubmitResult(payload);
        if (flag) {
          (this.formId ? editForm : addForm)(payload).then(() => {
            this.$router.push('intelligentForm');
            this.msgSuccess('操作成功');
            changeButtonLoading(this.$store, 'submitForm');
          });
        } else {
          changeButtonLoading(this.$store, 'submitForm');
        }
      });
    }
  }
};
</script>

<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style lang="scss" scoped>
  .add-smart-form {
    background-color: #fff;
    height: calc(100vh - 184px);
    /deep/ .el-form-item:hover {
      background: none;
    }
  }
  .drawer-div {
    .form {
      padding: 0px 15px;
      margin-left: 5px;
    }
  }
  .item-div {
    border: 1px solid $borderColor;
    padding: 10px;
    width: 430px;
    .el-form-item {
      padding: 0;
    }
  }
  .weChatPublicPlatform-info {
    color: #999;
    font-size: 14px;
    text-align: left;
    font-family: Arial-regular;
  }
  .advanced-setting-item {
    display: flex;
    align-items: center;
    width: 600px;
  }
  .jump-result-page-item {
    display: flex;
    .item-label {
      width: 40px;
    }
    .el-input {
      flex: 1;
    }
    .item-image-info {
      font-size: 12px;
      color: #999;
      position: relative;
      top: 54px;
      left: 10px;
    }
  }
  .label-name-required {
    font-size: 14px;
    color: #606266;
  }
  .label-name-required::before {
    content:'*  ';
    color:red;
  }
</style>
