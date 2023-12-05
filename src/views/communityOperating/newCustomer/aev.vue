<script>
import { getDetail, add, update } from '@/api/communityOperating/newCustomer';
import { getQrcode } from '@/api/drainageCode/staff';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading, checkChange } from '@/utils/common';
import PhoneDialog from '@/components/PhoneDialog';
import SelectUser from '@/components/SelectUser/index.vue';
import SelectTag from '@/components/SelectTag';
import SelectQrCode from '@/components/SelectQrCode';
import { SCOPELIST_TYPE, NORMAL_WORD, ACTIVE_WORD } from '@/utils/constant/index';
import { SELECT_TIME_TYPE, MAX_WELCOME_MSG_LENGTH, DEPARTMENT_ID_KEY, UN_CHOOSE_SKIPVERIFY, REMARK_TYPE } from '@/utils/constant/drainageCode';
import TagUserShow from '@/components/TagUserShow';
import ReferCode from '@/components/ReferCode';
import ActivityPopup from '@/components/ReferCode/ActivityPopup';
const businessIdTypeOfUser = 2;
const CODE_TYPE_MANY = 2;
export default {
  components: { PhoneDialog, SelectTag, SelectUser, SelectQrCode, ActivityPopup, RequestButton, TagUserShow, ReferCode },
  data() {
    return {
      NORMAL_WORD,
      ACTIVE_WORD,
      newGroupId: '',
      dialogVisibleSelectUser: false, // 选择员工会话
      dialogVisibleSelectTag: false, // 选择客户标签会话
      dialogVisibleSelectQrCode: false, // 选择群活码会话
      loading: false,
      form: {
        codeType: CODE_TYPE_MANY,
        scenario: '', // 活码名称
        weEmpleCodeUseScops: [], // 员工
        welcomeMsg: '', // 加群引导语
        groupCodeId: undefined, // 群活码ID
        tagList: [], // 客户标签
        remarkType: REMARK_TYPE['previous'],
        skipVerify: 1, // 无需确认自动加好友
        // 表单的欢迎语类型
        welcomeMsgType: NORMAL_WORD
      },
      welMsgMaxlength: MAX_WELCOME_MSG_LENGTH,
      time: ['00:00', '23:59'],
      tags: [],
      users: [],
      codes: [],
      groupQrCode: {},
      qrCode: '',
      rules: Object.freeze({
        scenario: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        weEmpleCodeUseScops: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        tagList: [{ required: true, message: '该项为必填项', trigger: 'change' }],
        groupCodeId: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        welcomeMsg: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        remarkName: [
          {
            validator: (rule, value, callback) => {
              if (this.form.isAutoSetRemark && (!value || !value.length)) {
                callback(new Error('请输入备注'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        exchangeActivities: [
          {
            type: 'object',
            required: true,
            validator: (rule, value, callback) => {
              if (!this.activeList.length) {
                this.msgError('请选择兑换活动');
                callback(new Error('该项为必填项'));
              } else {
                callback();
              }
            }
          }
        ]
      }),
      // 使用员工类型
      SCOPELIST_TYPE,
      DEPARTMENT_ID_KEY,
      REMARK_TYPE,
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
      }
    };
  },
  watch: {
    tags(tags) {
      this.form.weEmpleCodeTags = [...tags];
    },
    users(users) {
      this.form.weEmpleCodeUseScops = users.map((user) => {
        return {
          ...user,
          id: undefined,
          businessId: user.businessId,
          businessIdType: user.businessIdType,
          businessName: user.businessName
        };
      });
      // 需要延迟 否则会先弹出提示
      setTimeout(() => this.$refs.form.validateField('weEmpleCodeUseScops'), 0);
      // this.$refs.form.validateField('weEmpleCodeUseScops');
    }
  },
  created() {
    this.newGroupId = this.$route.query.id;
    this.newGroupId && this.getDetail(this.newGroupId);
    this.$route.meta.title = (this.newGroupId ? '编辑' : '新建') + '新客进群';
  },
  beforeUpdate() {
    const oldVal = {
      ...this.$options.data().form,
      isAutoPass: 0,
      activeList: this.$options.data().activeList,
      codeMaterialList: this.$options.data().codeMaterialList,
      codeMsg: this.$options.data().codeMsg,
      isAutoSetRemark: 0,
      tagFlag: 0
    };
    // 修改之后的值
    const newVal = {
      ...this.form,
      activeList: this.activeList,
      codeMaterialList: this.codeMaterialList,
      codeMsg: this.codeMsg
    };
    checkChange(oldVal, newVal);
  },
  methods: {
    /** 获取详情 */
    getDetail(id) {
      this.loading = true;
      getDetail(id).then(({ data }) => {
        this.form = data;
        const { scenario, skipVerify, welcomeMsg } = data;
        this.form.weEmpleCodeUseScops = data?.weEmpleCodeUseScops?.map(item => {
          return {
            ...item,
            name: item.businessName, userId: item.businessIdType === SCOPELIST_TYPE['USER'] ? item.businessId : undefined
          };
        });
        this.form = {
          ...this.form,
          scenario: scenario || '',
          skipVerify: skipVerify || 0,
          welcomeMsg: welcomeMsg || ''
        };
        this.time = [data.effectTimeOpen || '00:00', data.effectTimeClose || '00:00'];
        if (data.weGroupCode && data.weGroupCode.id) {
          this.codes = [data.weGroupCode];
          this.groupQrCode = data.weGroupCode;
          this.form.groupCodeId = data.weGroupCode.id;
        } else {
          this.codes = [];
          this.groupQrCode = {};
          this.form.groupCodeId = '';
        }
        this.tags = data.weEmpleCodeTags || [];
        this.users = data.weEmpleCodeUseScops || [];
        this.groupQrCode = data.weGroupCode || {};
        // this.$refs.form.validateField('weEmpleCodeUseScops')
        this.loading = false;
        this.qrCode = data.qrCode;
        // 活动欢迎语;
        if (data.welcomeMsgType) {
          this.activeList = [data.codeActivity] || [];
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
    submitSelectUser(users) {
      const params = { userIds: [], departmentIds: [] };
      this.users = users.map((user) => {
        user.userId && params.userIds.push(user.userId);
        !user.userId && params.departmentIds.push(user[DEPARTMENT_ID_KEY]);
        return {
          ...user,
          businessId: user[DEPARTMENT_ID_KEY] || user.userId,
          businessName: user.name,
          businessIdType: user.userId ? businessIdTypeOfUser : 1,
          mobile: user.mobile,
          empleCodeId: user.empleCodeId
        };
      });
      params.userIds += '';
      params.departmentIds += '';
      if (!this.newGroupId) {
        getQrcode(params).then(({ data }) => {
          this.$set(this.form, 'qrCode', data.qr_code);
        });
      }
    },
    // 客户标签选择
    submitSelectTag(tags) {
      this.dialogVisibleSelectTag = false;
      this.tags = tags.map((tag) => {
        return {
          tagId: tag.tagId,
          tagName: tag.name || tag.tagName
        };
      });
    },
    deleteTag(tag) {
      const index = this.tags.findIndex(tag_ => tag_.tagId === tag.tagId);
      this.tags.splice(index, 1);
    },
    // 选择二维码确认按钮
    submitSelectQrCode(data) {
      this.groupQrCode = data;
      this.form.groupCodeId = data.id;
      this.$refs.form.validateField('groupCodeId');
    },
    handeAddTextClick(text) {
      if (this.form.welcomeMsg.length + text.length <= this.welMsgMaxlength) {
        this.form.welcomeMsg = this.form.welcomeMsg + text;
      }
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.isAutoPass && this.form.skipVerify === SELECT_TIME_TYPE) {
            this.form.effectTimeOpen = this.time[0];
            this.form.effectTimeClose = this.time[1];
          }
          if (!this.form.isAutoPass) {
            this.form.skipVerify = UN_CHOOSE_SKIPVERIFY;
          }
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
            if (!(codeSuccessMsg || codeFailMsg || codeRepeatMsg)) {
              this.msgError('请至少填写一项发送内容');
              changeButtonLoading(this.$store, 'save');
              return;
            }
          }
          this.loading = true;
          if (this.newGroupId) {
            update(this.newGroupId, this.form)
              .then(() => {
                this.$store.commit('SET_ADD_FLAG', false);
                this.msgSuccess(this.qrCode !== this.form.qrCode ? '活码已更新，请重新下载' : '更新成功');
                this.$router.back();
              })
              .finally(() => {
                changeButtonLoading(this.$store, 'save');
                this.loading = false;
              });
          } else {
            add(this.form)
              .then(() => {
                this.$store.commit('SET_ADD_FLAG', true);
                this.msgSuccess('添加成功');
                this.$router.back();
              })
              .finally(() => {
                changeButtonLoading(this.$store, 'save');
                this.loading = false;
              });
          }
        } else {
          changeButtonLoading(this.$store, 'save');
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
      Object.keys(this.codeMsg).forEach(key => { this.codeMsg[key] = ''; });
      Object.keys(this.codeMaterialList).forEach(key => { this.codeMaterialList[key] = []; });
    },
    handleClose(index) {
      this.users.splice(index, 1);
    }
  }
};
</script>

<template>
  <div v-loading="loading" class="wrap">
    <ReturnPage path="/operationsCenter/drainageCode/newCustomer" />
    <div class="wrap-body">
      <el-alert
        title="功能说明"
        type="info"
        description="客户扫描生成的新客进群活码，将被随机分配一个员工，添加员工后，会自动被打上预设的客户标签等，同时收到入群引导语和群活码，客户扫码进群完成引流。"
        show-icon
        :closable="false"
      />
      <div class="wrap-body-form">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <p class="config-title">基础设置</p>
          <el-form-item label="活码名称" prop="scenario">
            <el-input
              v-model="form.scenario"
              maxlength="32"
              show-word-limit
              placeholder="请填写活码使用场景，方便区分"
              clearable
            />
          </el-form-item>
          <el-form-item label="使用员工" prop="weEmpleCodeUseScops">
            <div class="flexw">
              <el-button
                class="mr10 mb5"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="dialogVisibleSelectUser = true"
              >{{ users.length ? '修改' : '添加' }}成员</el-button>
              <el-tag v-for="(user, index) in users" :key="index" closable class="user-tag aic mb5" size="medium" @close="handleClose(index)">
                <TagUserShow :name="user.businessName" :show-icon="user.businessIdType === SCOPELIST_TYPE.DEPARTMENT" />
              </el-tag>
            </div>
          </el-form-item>
          <el-form-item label="客户标签">
            <el-switch v-model="form.tagFlag" :active-value="1" :inactive-value="0" />
            <span class="we-emple-code-tags-tip">开启后，根据使用场景做标记，自动为扫码添加的客户打上标签</span>
          </el-form-item>
          <el-form-item v-show="form.tagFlag" label="" prop="tags">
            <!-- closable -->
            <el-button
              class="mr10"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="dialogVisibleSelectTag = true"
            >添加标签</el-button>
            <el-tag v-for="(item, index) in tags" :key="index" closable size="medium" @close="deleteTag(item)">{{ item.tagName }}</el-tag>
          </el-form-item>
          <el-form-item label="客户备注">
            <el-switch v-model="form.isAutoSetRemark" :active-value="1" :inactive-value="0" />
            <span class="we-emple-code-tags-tip">开启后，为扫码添加的客户修改备注，方便查看来源</span>
            <div v-show="form.isAutoSetRemark" class="remark">
              <el-alert
                title="客户备注最多可设置20个字符，客户原昵称较长时可能导致设置失败"
                type="warning"
                :closable="false"
              />
              <el-form-item label="备注位置" label-width="68px">
                <el-radio-group v-model="form.remarkType">
                  <el-radio :label="REMARK_TYPE['previous']">在昵称前</el-radio>
                  <el-radio :label="REMARK_TYPE['after']">在昵称后</el-radio>
                </el-radio-group>
                <br>
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
            欢迎语<span>引导客户进群，扫码添加的客户将自动接收到加群引导语和群活码</span>
          </p>
          <el-alert type="warning" :closable="false">
            <template>
              <div>
                1. 若使用人员已在企业微信后台或其他第三方应用设置了欢迎语，则此处欢迎语不生效<br>
                2. 设置新客进群前，请先在【客户群活码】设置群活码信息
              </div>
            </template>
          </el-alert>
          <el-form-item label="类型" prop="welcomeMsgType">
            <el-radio-group v-model="form.welcomeMsgType" @change="welcomeMsgTypeChange">
              <el-radio :label="NORMAL_WORD">普通引导语</el-radio>
              <el-radio :label="ACTIVE_WORD">活动引导语</el-radio>
            </el-radio-group>
          </el-form-item>
          <div v-if="form.welcomeMsgType === NORMAL_WORD">
            <el-form-item label="加群引导语" prop="welcomeMsg">
              <el-input
                v-model="form.welcomeMsg"
                type="textarea"
                :maxlength="welMsgMaxlength"
                show-word-limit
                :autosize="{ minRows: 5, maxRows: 20 }"
                placeholder="客户添加员工后，将收到加群引导语"
                clearable
              />
              <div class="quick-actions">
                <span @click="handeAddTextClick('#客户昵称#')">#客户昵称#</span>
                <span @click="handeAddTextClick('#员工姓名#')">#员工姓名#</span>
              </div>
            </el-form-item>
          </div>
          <div v-else>
            <el-form-item label="兑换活动" prop="exchangeActivities">
              <div>
                <el-button
                  class="mr10"
                  icon="el-icon-plus"
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
            <el-form-item label="加群引导语" prop="sendValue">
              <ReferCode
                type="customerAdd"
                :code-msg.sync="codeMsg"
                :code-material-list.sync="codeMaterialList"
              />
            </el-form-item>
          </div>

          <el-form-item label="群活码设置" prop="groupCodeId">
            <div>
              <div>
                <el-button
                  type="primary"
                  plain
                  icon="el-icon-plus"
                  size="mini"
                  @click="dialogVisibleSelectQrCode = true"
                >{{ groupQrCode && groupQrCode.codeUrl ? '修改' : '选择' }}群活码</el-button>
              </div>
              <div v-if="groupQrCode && groupQrCode.codeUrl" class="qrcode-preview">
                <div>
                  <el-image :src="groupQrCode.codeUrl" class="code-image mr10" />
                </div>
                <div>
                  <p class="qrcode-title">{{ groupQrCode.activityName }}</p>
                  <p class="qrcode-desc">{{ groupQrCode.activityDesc }}</p>
                </div>
              </div>
            </div>
          </el-form-item>
          <p class="config-title" style="margin-bottom: 16px">添加客户设置</p>
          <el-alert
            title="若员工在客户端设置 -> 隐私中开启了“加我为联系人”不需要验证，则该功能将失效"
            type="warning"
            :closable="false"
          />
          <el-form-item label="自动通过" prop="skipVerify">
            <div>
              <el-switch v-model="form.isAutoPass" :active-value="1" :inactive-value="0" />
              <span class="we-emple-code-tags-tip">开启后，客户扫码添加使用人员时无需确认，自动同意添加请求</span>
            </div>
            <div v-show="form.isAutoPass" class="add-time">
              <el-alert
                title="在生效时段外，客户扫码添加，需要使用人员手动同意添加请求"
                type="warning"
                :closable="false"
              />
              <el-form-item label="生效时间段" label-width="82px">
                <el-radio-group v-model="form.skipVerify">
                  <el-radio :label="1">全天</el-radio>
                  <el-radio :label="2">选择时间段</el-radio>
                </el-radio-group>
                <br>
                <el-time-picker
                  v-if="form.skipVerify === 2"
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
          <!-- 预览 -->
          <el-image
            style="width: 180px; height: 180px"
            :src="form.qrCode || require('@/assets/image/user-code-example.jpg')"
            fit="fit"
          />
          <div class="tip mb20">活码预览</div>
          <PhoneDialog v-if="form.welcomeMsgType === NORMAL_WORD" :message="form.welcomeMsg" :is-other="groupQrCode && groupQrCode.codeUrl ? true : false">
            <el-image class="phone-dialog-image" :src="groupQrCode.codeUrl" fit="fit" />
          </PhoneDialog>
        </div>
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="submit" button-type="save">保存</RequestButton>
    </div>
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      :key="form.codeType"
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      :is-only-leaf="form.codeType !== 2"
      :is-sigle-select="form.codeType == 1"
      :selected-user-list="form.weEmpleCodeUseScops || []"
      :department-id-key="DEPARTMENT_ID_KEY"
      @success="submitSelectUser"
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
      :selected="tags"
      :is-show-add="true"
      type="search"
      info-msg="通过新客进群任务的活码添加员工的客户，将被自动打上选中的标签"
      @success="submitSelectTag"
    />

    <!-- 选择二维码弹窗 -->
    <SelectQrCode :visible.sync="dialogVisibleSelectQrCode" :selected="codes" @success="submitSelectQrCode" />
  </div>
</template>

<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style lang="scss" scoped>
.wrap {
  display: flex;
  background: #fff;
  .el-form {
    margin-right: 10%;
  }
}
.preview-wrap {
  line-height: 26px;
}
.tip {
  color: #999;
}
.welcome-input {
  display: table;
  width: 80%;
  margin: 0 auto 20px;
}
.code-image {
  width: 80px;
  height: 80px;
}
.phone-dialog-image {
  border-radius: 6px;
  width: 100px;
}

// .icon-restore{
//   vertical-align: middle;
//   margin-right: 10px;
// }
// .wrap-body-form{
//   display: flex;
//   padding-top: 15px;
// }
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
}
.add-btn {
  padding: 7px 12px;
}
.appendix-box {
  border-radius: 0 0 4px 4px;
  border: 1px solid #dcdfe6;
  border-top: 0;
  padding: 10px;
  width: 100%;
  .appendix-item {
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 15px;
    font-size: 14px;
    line-height: 16px;
    color: #666;
    i {
      color: #888;
      font-size: 16px;
      cursor: pointer;
      &:first-child {
        margin-right: 5px;
      }
    }
    .appendix-title {
      flex: 1;
      padding-left: 5px;
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
.qrcode-preview {
  width: 430px;
  height: 100px;
  border: 1px solid rgba(217, 217, 217, 100);
  display: flex;
  padding: 10px;
  margin-top: 10px;
}
.qrcode-title {
  color: rgba(51, 51, 51, 100);
  font-size: 14px;
  text-align: left;
  font-family: Arial-regular;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 16px;
  margin-bottom: 7px;
}
.qrcode-desc {
  color: rgba(96, 98, 102, 100);
  font-size: 12px;
  text-align: left;
  font-family: Arial-regular;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  line-height: 14px;
}
</style>
