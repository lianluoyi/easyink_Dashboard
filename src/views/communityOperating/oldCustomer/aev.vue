<script>
import { add, getExpectedReceptionData } from '@/api/communityOperating/oldCustomer';
import PhoneDialog from '@/components/PhoneDialog';
import SelectUser from '@/components/SelectUser/index.vue';
import SelectTag from '@/components/SelectTag';
import SelectQrCode from '@/components/SelectQrCode';
import { GENDER_TYPE } from '@/utils/constant/index';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading, checkChange } from '@/utils/common';
const SEND_PART_CUSTOMER_TYPE = 1;
export default {
  components: { PhoneDialog, SelectTag, SelectUser, SelectQrCode, RequestButton },
  data() {
    return {
      taskId: '',
      dialogVisibleSelectUser: false,
      dialogVisibleSelectTag: false,
      dialogVisibleSelectQrCode: false,
      loading: false,
      // 表单参数
      form: {
        taskName: '', // 任务名称
        welcomeMsg: '', // 加群引导语
        sendType: 0, // 发送方式
        groupCodeId: '', // 群活码ID
        tagList: [], // 标签
        scopeList: [], // 员工
        sendScope: 0, // 发送范围
        sendGender: 0, // 发送性别
        cusBeginTime: '', // 目标客户添加起始时间
        cusEndTime: '' // 目标客户添加结束时间
      },
      tags: [],
      users: [],
      codes: [],
      groupQrCode: {}, // 选择的群活码链接
      dateRange: [],
      sendTypeOptions: [{ label: '企业群发', value: 0 }],
      sendGenderOptions: [
        { label: '全部', value: 0 },
        ...Object.keys(GENDER_TYPE).map((type) => ({ label: GENDER_TYPE[type], value: type }))
      ],
      sendScopeOptions: [
        { label: '全部客户', value: 0 },
        { label: '指定客户', value: 1 }
      ],
      SEND_PART_CUSTOMER_TYPE,
      customerCount: 0,
      rules: Object.freeze({
        taskName: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        welcomeMsg: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        groupCodeId: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        tagListValidate: [{ required: true, message: '该项为必填项', trigger: 'change' }],
        scopeListValidate: [{ required: true, message: '该项为必填项', trigger: 'change' }]
      })
    };
  },
  watch: {
    // 日期选择器数据同步至查询参数
    dateRange(dateRange) {
      // eslint-disable-next-line no-magic-numbers
      if (!dateRange || dateRange.length !== 2) {
        this.form.cusBeginTime = '';
        this.form.cusEndTime = '';
      } else {
        [this.form.cusBeginTime, this.form.cusEndTime] = dateRange;
      }
    },
    users(users) {
      this.form.scopeList = users;
      this.$refs.form.validateField('scopeList');
    },
    tags(tags) {
      this.form.tagList = tags.map((tag) => {
        return tag && tag.tagId;
      });
      this.$refs.form.validateField('tagList');
    }
  },
  beforeUpdate() {
    checkChange(this.$options.data().form, this.form);
  },
  methods: {
    getExpectedReceptionData() {
      const payload = {
        ...this.form,
        scopeList: this.form.scopeList.map((item) => item.userId)
      };
      getExpectedReceptionData(payload).then((res) => {
        this.customerCount = res.data.expectedCustomerCount;
      });
    },

    // 选择人员事件
    submitSelectUser(users) {
      this.users = users;
    },
    // 选择tag事件
    submitSelectTag(tags) {
      this.dialogVisibleSelectTag = false;
      this.tags = tags;
    },
    // 选择二维码确认按钮
    submitSelectQrCode(data) {
      this.groupQrCode = data;
      this.form.groupCodeId = data.id;
      this.$refs.form.validateField('groupCodeId');
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          const payload = {
            ...this.form,
            scopeList: this.form.scopeList.map((item) => item.userId)
          };
          add(payload)
            .then(() => {
              changeButtonLoading(this.$store, 'submit');
              this.msgSuccess('添加成功');
              this.loading = false;
              this.$router.back();
            })
            .catch(() => {
              changeButtonLoading(this.$store, 'submit');
              this.loading = false;
            });
        } else {
          changeButtonLoading(this.$store, 'submit');
        }
      });
    }
  }
};
</script>

<template>
  <div v-loading="loading" class="wrap">
    <ReturnPage path="/operationsCenter/drainageCode/tag" />
    <div class="wrap-body">
      <el-alert
        title="功能说明"
        type="info"
        description="企业下发任务，通知员工给特定客户发送加群引导语和群活码，客户扫码进群完成引流。"
        show-icon
        :closable="false"
      />
      <div class="wrap-body-form">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <p class="config-title" style="margin-bottom: 15px">基础设置</p>
          <el-alert type="warning" :closable="false">
            1. 每个客户/客户群每天只能收到1条群发消息<br>
            2. 若某客户有添加多个员工，只有一个员工对其有发送邀请任务<br>
            3. 若某客户已经在群活码下的某个客户群中，则员工没有对其的发送邀请任务
          </el-alert>
          <el-form-item label="任务名称" prop="taskName">
            <el-input
              v-model="form.taskName"
              maxlength="32"
              show-word-limit
              placeholder="请填写任务名称，方便了解任务内容"
              clearable
            />
          </el-form-item>
          <el-form-item label="发送方式" prop="sendType">
            <el-radio-group v-model="form.sendType">
              <el-radio v-for="(sendType, index) in sendTypeOptions" :key="index" :label="sendType.value">{{
                sendType.label
              }}</el-radio>
              <div class="tip">
                注：客户每天只能接收来自一名成员的一条群发消息，每月最多接收来自同一企业的四条群发消息。
              </div>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="发送范围" prop="sendScope">
            <div>
              <el-radio-group v-model="form.sendScope">
                <el-radio v-for="(target, index) in sendScopeOptions" :key="index" :label="target.value">{{
                  target.label
                }}</el-radio>
              </el-radio-group>
            </div>
            <div v-show="form.sendScope === SEND_PART_CUSTOMER_TYPE" class="send-scope">
              <el-alert title="给同时满足以下条件的客户发送进群邀请" type="warning" :closable="false" />
              <el-form-item label="性别" prop="sendGender" label-width="77px">
                <el-radio-group v-model="form.sendGender">
                  <el-radio :label="0">全部</el-radio>
                  <el-radio :label="1">男</el-radio>
                  <el-radio :label="2">女</el-radio>
                  <el-radio :label="3">未知</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="客户标签" prop="tagList" label-width="77px">
                <el-button
                  :class="tags.length > 0 ? 'mr10' : ''"
                  plain
                  icon="el-icon-plus"
                  size="mini"
                  :disabled="form.sendScope == 0"
                  @click="dialogVisibleSelectTag = true"
                >添加标签</el-button>
                <el-tag v-for="(tag, index) in tags" :key="index" size="medium">{{ tag.name }}</el-tag>
              </el-form-item>
              <el-form-item label="添加时间" label-width="77px">
                <el-date-picker
                  v-model="dateRange"
                  value-format="yyyy-MM-dd"
                  type="daterange"
                  :picker-options="pickerOptions"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right"
                  :disabled="form.sendScope == 0"
                />
              </el-form-item>
              <el-form-item label="所属员工" prop="scopeList" label-width="77px">
                <el-button
                  class="mr10"
                  plain
                  icon="el-icon-plus"
                  size="mini"
                  @click="dialogVisibleSelectUser = true"
                >{{ users.length ? '修改' : '添加' }}成员</el-button>
                <el-tag v-for="(user, index) in users" :key="index" class="user-tag" size="medium">{{
                  user.name
                }}</el-tag>
              </el-form-item>
            </div>
          </el-form-item>
          <p class="config-title" style="margin-bottom: 16px">
            发送内容<span>统一设置引导进群文案，由员工送达到客户</span>
          </p>
          <el-alert title="在创建任务前，请先在【客户群活码】设置群活码信息" type="warning" :closable="false" />
          <el-form-item label="加群引导语" prop="welcomeMsg">
            <el-input
              v-model="form.welcomeMsg"
              type="textarea"
              maxlength="2000"
              show-word-limit
              :autosize="{ minRows: 5, maxRows: 20 }"
              placeholder="请填写加群引导语"
              clearable
            />
          </el-form-item>
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
          <p class="config-title" style="margin-bottom: 15px">发送统计</p>
          <p class="customer-count-text">
            预计收到邀请的客户数：
            <span>{{ customerCount }}</span>
            <i class="el-icon-refresh" @click="getExpectedReceptionData" />
          </p>
        </el-form>
        <div class="preview-wrap">
          <!-- 预览 -->
          <PhoneDialog :message="form.welcomeMsg" :is-other="groupQrCode && groupQrCode.codeUrl ? true : false">
            <el-image class="phone-dialog-image" :src="groupQrCode.codeUrl" />
          </PhoneDialog>
        </div>
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="submit" button-type="submit">通知员工发送邀请</RequestButton>
    </div>
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      :selected-user-list="form.scopeList || []"
      @success="submitSelectUser"
    />

    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      :selected="tags"
      type="search"
      info-msg="筛选出被打上选中标签的客户，邀请其扫码进群"
      @success="submitSelectTag"
    />

    <!-- 选择群活码弹窗 -->
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
.phone-dialog-image {
  border-radius: 6px;
  width: 100px;
}
.code-image {
  width: 80px;
  height: 80px;
}
.wrap-head {
  /deep/.el-button--text {
    color: #666;
    font-size: 14px;
    line-height: 28px;
  }
  width: 100%;
  height: 48px;
  border-bottom: 1px solid rgba(238, 238, 238, 100);
  padding-left: 15px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 900;
  background-color: #fff;
}
.wrap-body {
  padding: 15px;
  position: absolute;
  top: 48px;
  left: 0px;
  bottom: 48px;
  right: 0;
  overflow: auto;
  /deep/.el-alert--info.is-light {
    background-color: rgba(244, 244, 245, 100);
    color: rgba(144, 147, 153, 100);
    .el-alert__description {
      color: rgba(144, 147, 153, 100);
    }
  }
}
.icon-restore {
  vertical-align: middle;
  margin-right: 10px;
}
.wrap-body-form {
  display: flex;
  padding-top: 15px;
}
.remark {
  border: 1px solid rgba(217, 217, 217, 100);
  padding: 10px;
  margin-bottom: 10px;
  /deep/.el-alert {
    padding: 2px 5px;
  }
  /deep/.el-input-group__prepend {
    color: rgba(193, 194, 197, 100);
  }
  /deep/.el-input {
    width: 320px;
  }
}
.add-time {
  border: 1px solid rgba(217, 217, 217, 100);
  padding: 10px;
  /deep/.el-alert {
    padding: 2px 5px;
  }
  /deep/.el-date-editor {
    width: 330px;
  }
}
.config-title {
  font-size: 14px;
  text-align: left;
  font-family: Roboto;
  border-left: 3px solid rgba(107, 180, 171, 100);
  padding-left: 15px;

  span {
    color: rgba(153, 153, 153, 100);
    font-size: 14px;
    text-align: left;
    font-family: Arial-regular;
    border-left: 2px solid rgba(153, 153, 153, 100);
    margin-left: 5px;
    padding-left: 5px;
    line-height: 19px;
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
.send-scope {
  border: 1px solid #dcdfe6;
  padding: 10px;
}
.customer-count-text {
  color: rgba(153, 153, 153, 100);
  font-size: 14px;
  text-align: left;
  font-family: Arial-regular;
  padding-left: 15px;
  span {
    padding-left: 10px;
    color: rgba(107, 180, 171, 100);
    font-size: 14px;
    text-align: left;
    font-family: Arial-regular;
    padding-right: 5px;
  }
  i {
    font-size: 18px;
    color: rgba(102, 102, 102, 100);
  }
}
</style>
