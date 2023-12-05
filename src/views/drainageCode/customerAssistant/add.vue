<script>
import { add, update, getDetail } from '@/api/drainageCode/customerAssistant';
import PhoneDialog from '@/components/PhoneDialog';
import SelectUser from '@/components/SelectUser/index.vue';
import SelectTag from '@/components/SelectTag';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading, checkChange } from '@/utils/common';
import { pick } from 'lodash';
import {
  PAGE_LIMIT,
  MEDIA_TYPE,
  MESSAGE_MEDIA_TYPE,
  MEDIA_TYPE_POSTER,
  SKIP_VERIFY,
  MAX_APPENDIX_NUM,
  SCOPELIST_TYPE,
  NORMAL_WORD,
  ACTIVE_WORD
} from '@/utils/constant/index';
import { SELECT_TIME_TYPE, MAX_WELCOME_MSG_LENGTH, DEPARTMENT_ID_KEY, UN_CHOOSE_SKIPVERIFY, REMARK_TYPE } from '@/utils/constant/drainageCode';
import TagUserShow from '@/components/TagUserShow';
import ReferCode from '@/components/ReferCode';
import AddAppendixBtn from '@/components/AddAppendixBtn.vue';
import ActivityPopup from '@/components/ReferCode/ActivityPopup';

export default {
  components: {
    PhoneDialog, SelectTag, ActivityPopup, AddAppendixBtn, SelectUser, RequestButton, TagUserShow, ReferCode
  },
  data() {
    return {
      NORMAL_WORD,
      ACTIVE_WORD,
      MAX_APPENDIX_NUM,
      dialogVisibleSelectUser: false,
      dialogVisibleSelectTag: false,
      dialogVisibleSelectMaterial: false,
      // 遮罩层
      loading: false,
      // 表单参数
      form: {
        isAutoPass: 0,
        weEmpleCodeTags: [],
        weEmpleCodeUseScops: [],
        scenario: '',
        isAutoSetRemark: 0,
        remarkType: REMARK_TYPE['previous'],
        remarkName: '',
        welcomeMsg: '',
        skipVerify: SKIP_VERIFY['allDay'],
        tagFlag: 0,
        // 表单的欢迎语类型
        welcomeMsgType: NORMAL_WORD
      },
      time: ['00:00', '23:59'],
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        categoryId: '',
        search: '',
        mediaType: MEDIA_TYPE_POSTER,
        isExpire: false
      },
      materialSelected: '',
      welMsgMaxlength: MAX_WELCOME_MSG_LENGTH,
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE,
      MESSAGE_MEDIA_TYPE,
      appendixList: [],
      subTitle: `已添加 0 个附件，还可选择 ${MAX_APPENDIX_NUM} 个`, // 素材库选择弹窗子标题
      limitSelectLength: MAX_APPENDIX_NUM,
      rules: Object.freeze({
        scenario: [{ required: true, message: '请输入链接名称', trigger: 'blur' }],
        weEmpleCodeUseScops: [{ type: 'array', required: true, message: '请选择使用员工', trigger: 'change' }],
        remarkName: [
          {
            validator: (rule, value, callback) => {
              if (this.form.isAutoSetRemark && !value.length) {
                callback(new Error('请输入备注'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        exchangeActivities: [{ required: true, message: '该项为必填项' }
        ]
      }),
      SKIP_VERIFY,
      SCOPELIST_TYPE,
      DEPARTMENT_ID_KEY,
      // 活动列表
      activeList: [],
      // 控制兑换活动弹窗
      dialogVisibleActivityPopup: false,
      codeMaterialList: {
        // 可使用兑换码的附件
        codeSuccessMaterialList: [],
        // 没有可使用兑换码的附件
        codeFailMaterialList: [],
        // 过期兑换码的附件
        codeRepeatMaterialList: []
      },
      codeMsg: {
        // 可使用兑换码的附件的欢迎语
        codeSuccessMsg: '',
        // 没有可使用兑换码的附件的欢迎语
        codeFailMsg: '',
        // 过期兑换码的附件的欢迎语
        codeRepeatMsg: ''
      },
      REMARK_TYPE
    };
  },
  watch: {
    appendixList(val) {
      this.subTitle = `已添加 ${val.length} 个附件，还可选择 ${MAX_APPENDIX_NUM - val.length} 个`;
      this.limitSelectLength = MAX_APPENDIX_NUM - val.length;
    }
  },
  created() {
    const id = this.$route.query.id;
    id && this.getDetail(id);
  },
  beforeUpdate() {
    const oldVal = {
      ...this.$options.data().form,
      ...pick(this.$options.data(), ['activeList', 'codeMaterialList', 'codeMsg', 'appendixList'])
    };
    // 修改之后的值
    const newVal = {
      ...this.form,
      ...pick(this, ['activeList', 'codeMaterialList', 'codeMsg', 'appendixList'])
    };
    checkChange(oldVal, newVal);
  },
  methods: {
    /** 获取详情 */
    getDetail(id) {
      this.loading = true;
      getDetail(id).then(({ data }) => {
        data.weEmpleCodeUseScops = data.weEmpleCodeUseScops?.map((user) => {
          return {
            ...user,
            userId: user.businessIdType === SCOPELIST_TYPE.USER ? user.businessId : undefined,
            name: user.businessName
          };
        });
        this.form = data;
        this.appendixList = data.materialList || [];
        this.time[0] = data.effectTimeOpen ? data.effectTimeOpen : '00:00';
        this.time[1] = data.effectTimeClose ? data.effectTimeClose : '00:00';
        this.materialSelected = data.weMaterial == null ? '' : data.weMaterial.materialUrl;
        this.loading = false;
        // 活动欢迎语
        if (data.welcomeMsgType) {
          this.activeList = data.codeActivity ? [data.codeActivity] : [];
          const { codeSuccessMaterialList, codeRepeatMaterialList, codeFailMaterialList, codeFailMsg, codeRepeatMsg, codeSuccessMsg } = data;
          this.codeMaterialList.codeSuccessMaterialList = codeSuccessMaterialList;
          this.codeMaterialList.codeFailMaterialList = codeFailMaterialList;
          this.codeMaterialList.codeRepeatMaterialList = codeRepeatMaterialList;
          this.codeMsg.codeSuccessMsg = codeSuccessMsg;
          this.codeMsg.codeFailMsg = codeFailMsg;
          this.codeMsg.codeRepeatMsg = codeRepeatMsg;
        }
      });
    },
    // 选择人员变化事件
    selectedUser(users) {
      const params = { userIds: [], departmentIds: [] };
      this.form.weEmpleCodeUseScops = users?.map((user) => {
        user.userId && params.userIds.push(user.userId);
        !user.userId && params.departmentIds.push(user[DEPARTMENT_ID_KEY]);
        return {
          ...user,
          businessId: user.userId || user[DEPARTMENT_ID_KEY],
          id: undefined,
          businessName: user.name,
          businessIdType: user.userId ? this.SCOPELIST_TYPE['USER'] : this.SCOPELIST_TYPE['DEPARTMENT']
        };
      });
      params.userIds += '';
      params.departmentIds += '';
    },
    submitSelectTag(data) {
      this.dialogVisibleSelectTag = false;
      this.form.weEmpleCodeTags = data?.map((tag) => ({
        tagId: tag.tagId,
        tagName: tag.name || tag.tagName
      }));
    },
    dealAttachemnts(appendixList) {
      const attachments = [];
      appendixList.forEach((appendix) => {
        const attach = {};
        attach.welcomeMsgType = appendix.mediaType;
        attachments.push(appendix);
      });
      return attachments;
    },
    handeAddTextClick(text) {
      if (this.form.welcomeMsg.length + text.length <= this.welMsgMaxlength) {
        this.form.welcomeMsg = this.form.welcomeMsg + text;
      }
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (!this.form.weEmpleCodeUseScops.length) {
            this.msgError('请至少选择一名使用员工');
            changeButtonLoading(this.$store, 'save');
            return;
          }
          if (this.form.tagFlag && !this.form.weEmpleCodeTags.length) {
            this.msgError('请至少选择一个客户标签');
            changeButtonLoading(this.$store, 'save');
            return;
          }
          this.form.materialList = this.dealAttachemnts(this.appendixList);
          if (this.form.isAutoPass && this.form.skipVerify === SELECT_TIME_TYPE) {
            this.form.effectTimeOpen = this.time[0];
            this.form.effectTimeClose = this.time[1];
          }
          if (!this.form.isAutoPass) {
            this.form.skipVerify = UN_CHOOSE_SKIPVERIFY;
          }
          // 活动欢迎语
          if (this.form.welcomeMsgType) {
            this.form.codeActivity = this.activeList[0];
            const { codeFailMaterialList, codeSuccessMaterialList, codeRepeatMaterialList } = this.codeMaterialList;
            const { codeFailMsg, codeSuccessMsg, codeRepeatMsg } = this.codeMsg;
            this.form = {
              ...this.form,
              codeSuccessMaterialList,
              codeRepeatMaterialList,
              codeFailMaterialList,
              codeFailMsg,
              codeRepeatMsg,
              codeSuccessMsg
            };
            if (!this.activeList.length) {
              this.msgError('请选择兑换活动');
              changeButtonLoading(this.$store, 'save');
              return;
            }
            if (!(codeSuccessMsg || codeFailMsg || codeRepeatMsg)) {
              this.msgError('请至少填写一项发送内容');
              changeButtonLoading(this.$store, 'save');
              return;
            }
          }
          this.loading = true;
          (this.form.id ? update : add)(this.form)
            .then(() => {
              this.$store.commit('SET_ADD_FLAG', !this.form.id);
              this.msgSuccess('操作成功');
              this.$router.back();
            })
            .finally(() => {
              changeButtonLoading(this.$store, 'save');
              this.loading = false;
            });
        } else {
          changeButtonLoading(this.$store, 'save');
          return false;
        }
      });
    },
    /**
     * 选择活动
     */
    selectedActivity(value) {
      this.activeList = value;
    },
    /**
     * 删除活动
     */
    delTag() {
      this.activeList = [];
    },
    /**
     * 切换欢迎语类型
     */
    welcomeMsgTypeChange() {
      this.form.welcomeMsg = '';
      this.appendixList = [];
      Object.keys(this.codeMsg).forEach(key => { this.codeMsg[key] = ''; });
      Object.keys(this.codeMaterialList).forEach(key => { this.codeMaterialList[key] = []; });
    },
    deleteTag(tag) {
      const index = this.form.weEmpleCodeTags.findIndex(tag_ => tag_.tagId === tag.tagId);
      this.form.weEmpleCodeTags.splice(index, 1);
    }
  }
};
</script>
<template>
  <div v-loading="loading" class="wrap">
    <ReturnPage path="/operationsCenter/drainageCode/customerAssistant" />
    <div class="wrap-body">
      <el-alert
        title="功能说明"
        type="info"
        description="客户点击生成的获客链接，将被随机分配一个员工，添加员工后，会自动被打上预设的客户标签等，同时收到预设的欢迎语，完成引流。"
        show-icon
        :closable="false"
      />
      <div class="wrap-body-form">
        <el-form ref="form" :model="form" label-width="100px" class="form" :rules="rules">
          <p class="config-title">基础设置</p>
          <el-form-item label="链接名称" prop="scenario">
            <el-input
              v-model="form.scenario"
              maxlength="16"
              show-word-limit
              placeholder="请填写链接名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="场景描述">
            <el-input
              v-model="form.description"
              maxlength="64"
              type="textarea"
              resize="none"
              :rows="3"
              show-word-limit
              placeholder="仅内部可见，请填写链接使用场景，方便管理和应用"
              clearable
            />
          </el-form-item>
          <el-form-item label="使用员工" prop="weEmpleCodeUseScops">
            <!-- closable -->
            <div class="flexw">
              <el-button
                class="mr10 mb5"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="dialogVisibleSelectUser = true"
              >{{ form.weEmpleCodeUseScops.length ? '修改' : '添加' }}成员</el-button>
              <el-tag v-for="(item, index) in form.weEmpleCodeUseScops" :key="index" class="user-tag aic mb5" size="medium">
                <TagUserShow :name="item.businessName" :show-icon="item.businessIdType === SCOPELIST_TYPE.DEPARTMENT" />
              </el-tag>
            </div>
          </el-form-item>
          <el-form-item label="客户标签">
            <el-switch v-model="form.tagFlag" :active-value="1" :inactive-value="0" />
            <span class="we-emple-code-tags-tip">开启后，自动为通过该链接添加的客户打上标签</span>
          </el-form-item>
          <el-form-item v-show="form.tagFlag" label="" prop="weEmpleCodeTags">
            <el-button
              class="mr10"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="dialogVisibleSelectTag = true"
            >添加标签</el-button>
            <el-tag v-for="(item, index) in form.weEmpleCodeTags" :key="index" closable size="medium" @close="deleteTag(item)">{{ item.tagName }}</el-tag>
          </el-form-item>
          <el-form-item label="客户备注">
            <el-switch v-model="form.isAutoSetRemark" :active-value="1" :inactive-value="0" />
            <span class="we-emple-code-tags-tip">开启后，为通过该链接添加的客户修改备注，方便查看来源</span>
            <div v-show="form.isAutoSetRemark" class="remark">
              <el-alert
                title="客户备注最多可设置20个字符，客户昵称较长时可能导致设置失败"
                type="warning"
                :closable="false"
              />
              <el-form-item label="备注位置" label-width="68px">
                <el-radio-group v-model="form.remarkType">
                  <el-radio :label="REMARK_TYPE['previous']">在昵称前</el-radio>
                  <el-radio :label="REMARK_TYPE['after']">在昵称后</el-radio>
                </el-radio-group>
                <el-form-item prop="remarkName">
                  <el-input v-model="form.remarkName" placeholder="请输入备注" :maxlength="20" show-word-limit>
                    <template v-if="form.remarkType === REMARK_TYPE['after']" slot="prepend">客户昵称-</template>
                    <template v-if="form.remarkType === REMARK_TYPE['previous']" slot="append">-客户昵称</template>
                  </el-input>
                </el-form-item>
              </el-form-item>
            </div>
          </el-form-item>
          <p class="config-title" style="margin-bottom: 16px">
            欢迎语<span>设置个性化欢迎语，客户通过链接添加员工后将自动接收到该欢迎语</span>
          </p>
          <el-alert
            title="若使用人员已在企业微信后台或其他第三方应用设置了欢迎语，则此处欢迎语不生效"
            type="warning"
            :closable="false"
          />
          <el-form-item label="类型" prop="welcomeMsgType">
            <el-radio-group v-model="form.welcomeMsgType" @change="welcomeMsgTypeChange">
              <el-radio :label="NORMAL_WORD">普通欢迎语</el-radio>
              <el-radio :label="ACTIVE_WORD">活动欢迎语</el-radio>
            </el-radio-group>
          </el-form-item>
          <div v-if="form.welcomeMsgType === NORMAL_WORD">
            <el-form-item label="发送内容">
              <el-input
                v-model="form.welcomeMsg"
                type="textarea"
                :maxlength="welMsgMaxlength"
                show-word-limit
                :autosize="{ minRows: 10, maxRows: 50 }"
                placeholder="请输入欢迎语"
                class="welcome-textarea"
              />
              <div class="quick-actions">
                <span @click="handeAddTextClick('#客户昵称#')">#客户昵称#</span>
                <span @click="handeAddTextClick('#员工姓名#')">#员工姓名#</span>
              </div>
              <AddAppendixBtn
                :sub-title="subTitle"
                :limit-select-length="limitSelectLength"
                :max-appendix-num="MAX_APPENDIX_NUM"
                :appendix-list.sync="appendixList"
              />
            </el-form-item>
          </div>
          <div v-else>
            <el-form-item label="兑换活动" prop="exchangeActivities">
              <div>
                <el-button
                  class="mr10"
                  icon="el-icon-plus"
                  plain
                  size="mini"
                  @click="dialogVisibleActivityPopup = true"
                >{{ activeList.length ? '修改' : '选择' }}活动</el-button>
                <el-tag
                  v-for="(item, index) in activeList"
                  :key="index"
                  size="medium"
                  closable
                  @close="delTag"
                >{{ item.activityName }}</el-tag>
              </div>
            </el-form-item>
            <el-form-item label="发送内容" prop="sendValue">
              <ReferCode
                type="staffAdd"
                :code-msg.sync="codeMsg"
                :code-material-list.sync="codeMaterialList"
              />
            </el-form-item>
          </div>
          <p class="config-title" style="margin-bottom: 16px">添加客户设置</p>
          <el-alert
            title="若员工在客户端设置 -> 隐私中开启了“加我为联系人”不需要验证，则该功能将失效"
            type="warning"
            :closable="false"
          />
          <el-form-item label="自动通过" prop="skipVerify">
            <div>
              <el-switch v-model="form.isAutoPass" :active-value="1" :inactive-value="0" />
              <span class="we-emple-code-tags-tip">开启后，客户通过链接添加员工时无需确认，自动同意添加请求</span>
            </div>
            <div v-show="form.isAutoPass" class="add-time">
              <el-alert
                title="在生效时段外，客户通过链接添加，需要使用人员手动同意添加请求"
                type="warning"
                :closable="false"
              />
              <el-form-item label="生效时间段" label-width="82px">
                <el-radio-group v-model="form.skipVerify">
                  <el-radio :label="SKIP_VERIFY['allDay']">全天</el-radio>
                  <el-radio :label="SKIP_VERIFY['timeAdd']">选择时间段</el-radio>
                </el-radio-group>
                <el-time-picker
                  v-if="form.skipVerify === SKIP_VERIFY['timeAdd']"
                  v-model="time"
                  is-range
                  value-format="HH:mm"
                  format="HH:mm"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                />
              </el-form-item>
            </div>
          </el-form-item>
        </el-form>
        <div class="preview-wrap">
          <PhoneDialog
            v-if="!!form.welcomeMsg || !!materialSelected || appendixList.length"
            :message="form.welcomeMsg"
            :is-other="!!materialSelected"
            :msg-list="appendixList"
          >
            <el-image class="phone-dialog-image" :src="materialSelected" fit="fit" />
          </PhoneDialog>
        </div>
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="submit" button-type="save">保存</RequestButton>
    </div>
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      :is-only-leaf="false"
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      alert-type=""
      alert-text="每个获客链接最多可关联500个员工，若所选部门超出500人，只有前500个员工参与分配"
      alert-class="theme-el-alert"
      :selected-user-list="form.weEmpleCodeUseScops || []"
      :department-id-key="DEPARTMENT_ID_KEY"
      @success="selectedUser"
    />
    <!-- 选择兑换活动弹窗 -->
    <ActivityPopup
      :visible.sync="dialogVisibleActivityPopup"
      :selected-active-list="activeList"
      @success="selectedActivity"
    />
    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      :selected="form.weEmpleCodeTags"
      type="search"
      info-msg="通过活码添加员工的客户，将被自动打上选中的标签"
      :is-mandatory="0"
      :is-show-add="true"
      @success="submitSelectTag"
    />
  </div>
</template>
<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style lang="scss" scoped>
.wrap {
  .el-form {
    margin-right: 10%;
  }
  background: #fff;
}
.preview-wrap {
  line-height: 26px;
}
.tip {
  color: #999;
}

.remark {
  border: 1px solid rgba(217, 217, 217, 100);
  padding: 10px;
  margin-bottom: 10px;
  /deep/.el-input-group__prepend {
    color: rgba(193, 194, 197, 100);
  }
  /deep/.el-input {
    width: 320px;
  }
  /deep/.el-input-group__append {
    color: #c1c2c5;
  }
}
.add-time {
  border: 1px solid rgba(217, 217, 217, 100);
  padding: 10px;
  /deep/.el-date-editor {
    width: 330px;
  }
}
.wrap-body-form .form {
  width: 572px;
  /deep/ .el-textarea {
    .el-input__count {
      background: none;
      bottom: -2px;
    }
  }

}
.quick-actions {
  border-radius: 0 0 4px 4px;
  border: 1px solid #dcdfe6;
  border-top: 0;
  padding: 5px 10px;
  width: 100%;
  span {
    margin-right: 5px;
    color: rgba(96, 98, 102, 100);
    font-size: 14px;
    text-align: left;
    font-family: Arial-regular;
  }
}
.welcome-textarea {
  /deep/textarea {
    height: 93px !important;
    min-height: 93px !important;
  }
}
</style>
