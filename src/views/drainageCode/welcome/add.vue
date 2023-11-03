<script>
import { addEmployWelMsg, getWelcomeDetaiById, editEmployWel } from '@/api/tlp';
import {
  EMPLOYEES_WELCOME,
  MAX_APPENDIX_NUM,
  MEDIA_TO_WELCOME_TYPE,
  WELCOME_APPENDIX_TYPE,
  SCREENING_GENDER_TYPE,
  GENDER_TYPE_OF_UNKNOWN,
  GENDER_OF_FEMALE,
  GENDER_OF_MALE, SOURCE, GENDER, AND, OR, ALL_GENGER, ALL_SOURCE
} from '@/utils/constant/index';
import ReturnPage from '@/components/ReturnPage.vue';
import SelectUser from '@/components/SelectUser/index.vue';
import AddAppendixBtn from '@/components/AddAppendixBtn.vue';
import SpecialWelStep from './components/SpecialWelStep.vue';
import { getRepeatItem, dealAppendixType, dealAppendixTypeToMaterial } from '@/utils/index';
import PhoneDialog from '@/components/PhoneDialog';
import uniqBy from 'lodash/uniqBy';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading, checkChange } from '@/utils/common';
import { getSourceLabel } from '@/utils/common';
const MAX_WELCOME_MSG_LENGTH = 1000;
const KEY_OPTIONS = [
  { value: SOURCE, label: '来源' },
  { value: GENDER, label: '性别' }
];
const IS_OPTIONS = [
  { value: false, label: '不是' },
  { value: true, label: '是' }
];
const CONDITION_OPTIONS = [
  { value: AND, label: '且' },
  { value: OR, label: '或' }
];
const GENDER_OPTIONS = [{
  label: '所有性别',
  value: ALL_GENGER
}, {
  label: SCREENING_GENDER_TYPE[GENDER_TYPE_OF_UNKNOWN],
  value: GENDER_TYPE_OF_UNKNOWN
}, {
  label: SCREENING_GENDER_TYPE[GENDER_OF_MALE],
  value: GENDER_OF_MALE
}, {
  label: SCREENING_GENDER_TYPE[GENDER_OF_FEMALE],
  value: GENDER_OF_FEMALE
}];
const SOURCE_OPTIONS = [{ label: '所有来源',
  value: ALL_SOURCE }, ...getSourceLabel({ key: 'value', value: 'label' })];
export default {
  components: { ReturnPage, SelectUser, AddAppendixBtn, SpecialWelStep, PhoneDialog, RequestButton },
  props: {},
  data() {
    const checkDefaultMsg = (rule, value, callback) => {
      if (!this.form.defaultWelcomeMsg && !this.appendixList.length) {
        callback(new Error('请填写默认欢迎语'));
      } else {
        callback();
      }
    };
    return {
      MAX_APPENDIX_NUM,
      MEDIA_TO_WELCOME_TYPE,
      WELCOME_APPENDIX_TYPE,
      KEY_OPTIONS,
      IS_OPTIONS,
      GENDER_OPTIONS,
      SOURCE_OPTIONS,
      SOURCE, CONDITION_OPTIONS, AND, OR, ALL_SOURCE, ALL_GENGER,
      dialogVisible: false,
      dialogVisibleSelectMaterial: false,
      rules: {
        weEmpleCodeUseScops: [{ type: 'array', required: true, message: '请选择使用员工', trigger: 'change' }],
        defaultWelcomeMsg: [{ required: true, validator: checkDefaultMsg, trigger: 'change' }]
      },
      form: {
        defaultWelcomeMsg: '',
        weEmpleCodeUseScops: [],
        welcomeSwitch: false
      },
      weMsgTlpSpecialRules: [{ weekendList: [], time: [], specialWelcomeMsg: '', specialMaterialList: [] }],
      // 遮罩层
      loading: false,
      welcomeMsgTplType: EMPLOYEES_WELCOME,
      employType: EMPLOYEES_WELCOME,
      dialogVisibleSelectUser: false,
      limitSelectLength: MAX_APPENDIX_NUM,
      appendixList: [],
      subTitle: '已添加 0 个附件，还可选择 9 个', // 素材库选择弹窗子标题
      welMsgMaxlength: MAX_WELCOME_MSG_LENGTH,
      removeAppendixList: [],
      // 要删除的时段欢迎语列表
      removeSpecialRuleList: [],
      weMsgTlpFilterRules: [{
        filterType: SOURCE, // 选项
        filterCondition: true, // 判断
        filterValue: ALL_SOURCE // 结果
      }],
      // 当前的条件结果是或还是且
      multiFilterAssociation: OR
    };
  },
  computed: {},
  watch: {
    appendixList(val) {
      this.subTitle = `已添加 ${val.length} 个附件，还可选择 ${MAX_APPENDIX_NUM - val.length} 个`;
      this.limitSelectLength = MAX_APPENDIX_NUM - val.length;
    }
  },
  created() {
    this.form = Object.assign(this.form, this.$route.query);
    this.$route.meta.title = (this.form.id ? '编辑' : '新增') + '好友欢迎语';
    if (this.form.id) this.getDetail(this.form.id);
    this.welcomeMsgTplType = EMPLOYEES_WELCOME;
  },
  mounted() {},
  beforeUpdate() {
    checkChange({ ...this.$options.data().form, appendixList: this.$options.data().appendixList, welcomeMsgTplType: EMPLOYEES_WELCOME }, { appendixList: this.appendixList, ...this.form });
  },
  methods: {
    getData() {},
    goBack() {
      this.$router.push('welcome?welcomeMsgTplType=' + window.location.hash.match(/welcomeMsgTplType=(\d)/)[1]);
    },

    /**
     * 对时段欢迎语进行判空
     */
    checkEmptyWelContent(weMsgTlpSpecialRules) {
      const validFlag = weMsgTlpSpecialRules.some((item, index) => {
        let flag = false;
        if (!item.weekendBeginTime || !item.weekendEndTime || !item.weekendList.length) {
          this.msgWarn(`请设置时段欢迎语${index + 1}的生效时段`);
          flag = true;
        }
        if (!item.specialWelcomeMsg && !item.specialMaterialList.length) {
          this.msgWarn(`请设置时段欢迎语${index + 1}的欢迎语`);
          flag = true;
        }
        return flag;
      });
      return validFlag;
    },
    /**
     * 校验是否有重复的周
     */
    checkRepeatWeek(repeatList) {
      const repeatWeekList = [];
      repeatList.map((repeatItem) => {
        this.weMsgTlpSpecialRules.map((item, ruleIndex) => {
          if (item.weekendList.includes(repeatItem)) {
            const beginList = item.weekendBeginTime.split(':');
            const beginNum = parseInt(beginList[0] + beginList[1]);
            const endList = item.weekendEndTime.split(':');
            const endNum = parseInt(endList[0] + endList[1]);
            repeatWeekList.push([beginNum, endNum, ruleIndex + 1]);
          }
        });
      });
      // 进行去重
      const uniqRepeatWeekList = uniqBy(repeatWeekList, (item) => {
        return `${item[0]}${item[1]}${item[2]}`;
      });
      return this.checkCoincidence(uniqRepeatWeekList);
    },
    /**
     * 判断是否有重复的时间段
     */
    checkRepeatTime(allWeekList) {
      const repeatList = getRepeatItem(allWeekList);
      // 有重复的周
      if (repeatList.length) {
        // 判断是否有重复的时段
        const hasRepeatTime = this.checkRepeatWeek(repeatList);
        if (hasRepeatTime.flag && hasRepeatTime.first !== hasRepeatTime.second) {
          this.msgWarn(`时段欢迎语${hasRepeatTime.first}与时段欢迎语${hasRepeatTime.second}的生效时段存在重复`);
          return false;
        }
      }
      return true;
    },
    /**
     * 校验时段欢迎语内容
     */
    checkSpecialWel(weMsgTlpSpecialRules, allWeekList) {
      if (!weMsgTlpSpecialRules.length) {
        this.msgWarn('请设置时段欢迎语');
        return false;
      }
      // 时段欢迎语判空
      const validFlag = this.checkEmptyWelContent(weMsgTlpSpecialRules);
      if (validFlag) return false;
      return this.checkRepeatTime(allWeekList);
    },
    /**
     * 处理客户范围信息
     */
    dealWeMsgTlpFilterRules(list) {
      const newArr = [];
      list.forEach((item, index) => {
        if (item.filterType === GENDER) {
          item.filterValue = Number(item.filterValue);
        }
        if (index !== 0) {
          newArr.push({ isMultiFilterAssociation: true, filterValue: this.multiFilterAssociation ? AND : OR }, item);
        } else {
          newArr.push(item);
        }
      });
      return newArr;
    },
    /**
     * 点击保存
     */
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const form = { ...this.form };
          const defaultMaterialList = dealAppendixType(this.appendixList);
          let allWeekList = [];
          // 时间段位数
          const TIME_DIGITS = 3;
          let params = {
            useUserIds: form.weEmpleCodeUseScops.map((item) => item.userId),
            weMsgTlp: {
              defaultWelcomeMsg: form.defaultWelcomeMsg,
              defaultMaterialList,
              multiFilterAssociation: this.multiFilterAssociation
            }
          };
          params.weMsgTlpFilterRules = this.weMsgTlpFilterRules.filter((item) => !item.isMultiFilterAssociation);
          // 若开启特殊时段欢迎语，进行处理时段欢迎语的传参
          if (form.welcomeSwitch) {
            const weMsgTlpSpecialRules = this.weMsgTlpSpecialRules.map((item) => {
              allWeekList = allWeekList.concat(item.weekendList);
              return {
                ...item,
                specialMaterialList: dealAppendixType(item.specialMaterialList),
                weekendBeginTime:
                  item.weekendBeginTime?.split(':').length === TIME_DIGITS
                    ? item.weekendBeginTime
                    : item.weekendBeginTime + ':00',
                weekendEndTime:
                  item.weekendEndTime?.split(':').length === TIME_DIGITS
                    ? item.weekendEndTime
                    : item.weekendEndTime + ':00',
                removeSpecialRuleMaterialIds: item.removeAppendixList?.map((removeItem) => removeItem.id)
              };
            });
            params = { ...params, weMsgTlpSpecialRules };
            if (!this.checkSpecialWel(weMsgTlpSpecialRules, allWeekList)) { return changeButtonLoading(this.$store, 'submit'); }
          }
          let newParams = { ...params };
          if (form.id) {
            newParams = {
              ...newParams,
              ...newParams.weMsgTlp,
              id: form.id,
              removeMaterialIds: this.removeAppendixList?.map((item) => item.id),
              removeSpecialRuleIds: this.removeSpecialRuleList?.map((item) => item.id)
            };
          }
          (this.form.id ? editEmployWel : addEmployWelMsg)(newParams)
            .then(() => {
              this.$store.commit('SET_ADD_FLAG', !this.form.id);
              this.msgSuccess('操作成功');
              this.goBack();
            })
            .finally(() => {
              changeButtonLoading(this.$store, 'submit');
              this.loading = false;
            });
        } else {
          changeButtonLoading(this.$store, 'submit');
        }
      });
    },
    /**
     * 选择使用员工变化事件
     */
    selectedUser(users) {
      const params = { userIds: [], departmentIds: [] };
      this.form.weEmpleCodeUseScops = users.map((user) => {
        user.userId && params.userIds.push(user.userId);
        user.id && params.departmentIds.push(user.id);
        return {
          ...user,
          userId: user.id || user.userId,
          userName: user.name
        };
      });
    },
    /**
     * 欢迎语插入变量
     */
    handeAddTextClick(text, index) {
      // 特殊时段欢迎语
      if (index || index === 0) {
        const ruleList = [...this.weMsgTlpSpecialRules] || [];
        const specialWelcomeMsg = ruleList[index].specialWelcomeMsg;
        if (specialWelcomeMsg.length + text.length > this.welMsgMaxlength) {
          this.msgWarn('字数已达上限');
          return;
        }
        ruleList[index] = { ...ruleList[index], specialWelcomeMsg: specialWelcomeMsg + text };
        this.weMsgTlpSpecialRules = ruleList;
        return;
      }
      if (this.form.defaultWelcomeMsg.length + text.length > this.welMsgMaxlength) {
        this.msgWarn('字数已达上限');
        return;
      }
      this.form.defaultWelcomeMsg = this.form.defaultWelcomeMsg + text;
    },
    /**
     * 添加欢迎语
     */
    addWelRule() {
      const list = [...this.weMsgTlpSpecialRules];
      this.weMsgTlpSpecialRules = [
        ...list,
        { weekendList: [], time: [], specialWelcomeMsg: '', specialMaterialList: [] }
      ];
    },
    /**
     * 计算区间是否重合
     */
    checkCoincidence(list) {
      const newList = [...list];
      newList.sort((v1, v2) => v1[0] - v2[0]);
      for (let i = 1; i < newList.length; i++) {
        if (newList[i][0] < newList[i - 1][1]) {
          // 若重合则需返回对应的规则下标
          return { flag: true, first: newList[i - 1][2], second: newList[i][2] };
        }
      }
      return { flag: false };
    },
    /**
     * 获取欢迎语详情
     */
    getDetail(id) {
      getWelcomeDetaiById(id).then((res) => {
        const resData = { ...res.data };
        this.form = {
          ...this.form,
          weEmpleCodeUseScops: resData.useUsers?.map(item => { return { ...item, name: item.userName }; }),
          defaultWelcomeMsg: resData.defaultWelcomeMsg,
          welcomeSwitch: resData.weMsgTlpSpecialRules.length !== 0
        };
        const weMsgTlpSpecialRules = resData.weMsgTlpSpecialRules.map((item) => {
          const specialMaterialUnSortList = [...dealAppendixTypeToMaterial(item.specialMaterialList)];
          return {
            ...item,
            weekendList: item.weekends.split(',').map((item) => {
              return Number(item);
            }),
            specialMaterialList: specialMaterialUnSortList.sort(function(a, b) {
              return a.sortNo - b.sortNo;
            })
          };
        });
        this.weMsgTlpSpecialRules = weMsgTlpSpecialRules;
        this.multiFilterAssociation = resData.multiFilterAssociation;
        this.weMsgTlpFilterRules = this.dealWeMsgTlpFilterRules(resData.weMsgTlpFilterRules.length ? resData.weMsgTlpFilterRules
          : [{
            filterType: SOURCE, // 选项
            filterCondition: true, // 判断
            filterValue: ALL_SOURCE // 结果
          }]);
        const appendixList = dealAppendixTypeToMaterial(resData.defaultMaterialList);
        appendixList.sort(function(a, b) {
          return a.sortNo - b.sortNo;
        });
        this.appendixList = appendixList;
      });
    },
    /**
     * 删除时段欢迎语
     */
    removeSpecialRule(item) {
      const removeList = [...this.removeSpecialRuleList];
      removeList.push(item);
      this.removeSpecialRuleList = removeList;
    },
    handleClose(index) {
      this.form.weEmpleCodeUseScops.splice(index, 1);
    },
    addScopeItem() {
      this.weMsgTlpFilterRules.push({ isMultiFilterAssociation: true, filterValue: this.multiFilterAssociation }, {
        filterType: SOURCE,
        filterCondition: true,
        filterValue: ALL_SOURCE
      });
    },
    removeScopeItem(index) {
      // eslint-disable-next-line no-magic-numbers
      this.weMsgTlpFilterRules.splice(index - 1, 2);
    },
    changeCondition(val) {
      this.multiFilterAssociation = val;
      this.weMsgTlpFilterRules = this.weMsgTlpFilterRules.map((item) => {
        if (item.isMultiFilterAssociation) {
          item.filterValue = val;
        }
        return item;
      });
    }
  }
};
</script>

<template>
  <div class="flex add-welcome-page">
    <ReturnPage path="/operationsCenter/drainageCode/welcome" :query="{ welcomeMsgTplType: this.$route.query.welcomeMsgTplType }" />
    <div class="wrap-body">
      <el-alert
        title="功能说明"
        type="info"
        description="管理员为企业成员设置欢迎语，客户添加成员后自动回复欢迎语，让其第一时间感受服务体验。"
        show-icon
        :closable="false"
      />
      <div class="add-container">
        <div class="wrap-body-form">
          <el-form ref="form" :model="form" label-width="100px" class="form" :rules="rules">
            <p class="config-title">基础设置</p>
            <el-alert class="alert-tip" type="warning" :closable="false">
              <div>1. 若客户通过员工活码或新客进群活码添加，则该欢迎语不生效</div>
              <div>2. 若在企业微信后台设置了欢迎语，则该欢迎语不生效</div>
              <div>3. 若成员被设置了多个欢迎语，则使用最新创建的欢迎语</div>
            </el-alert>
            <el-form-item label="使用员工" prop="weEmpleCodeUseScops">
              <el-button
                class="mr10"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="dialogVisibleSelectUser = true"
              >{{ form.weEmpleCodeUseScops.length ? '修改' : '添加' }}成员</el-button>
              <el-tag v-for="(item, index) in form.weEmpleCodeUseScops" :key="index" class="user-tag" size="medium" closable="" @close="handleClose(index)">{{
                item && item.userName
              }}</el-tag>
            </el-form-item>
            <el-form-item label="客户范围" style="width: 560px">
              <div class="customer-scope">
                <div class="title">满足条件</div>
                <div v-for="(item,index) in weMsgTlpFilterRules" :key="index" class="scope-item">
                  <template v-if="item.isMultiFilterAssociation">
                    <el-select v-model="item.filterValue" :disabled="index !== 1" class="mr10" style="width:56px" @change="changeCondition">
                      <el-option
                        v-for="key in CONDITION_OPTIONS"
                        :key="key.value"
                        :label="key.label"
                        :value="key.value"
                      />
                    </el-select>
                  </template>
                  <template v-else>
                    <el-select v-model="item.filterType" class="mr10" style="width:88px" @change="(val) => item.filterValue = val === SOURCE ? ALL_SOURCE : ALL_GENGER">
                      <el-option
                        v-for="key in KEY_OPTIONS"
                        :key="key.value"
                        :label="key.label"
                        :value="key.value"
                      />
                    </el-select>
                    <el-select v-model="item.filterCondition" class="mr10" style="width:70px">
                      <el-option
                        v-for="key in IS_OPTIONS"
                        :key="key.value"
                        :label="key.label"
                        :value="key.value"
                      />
                    </el-select>
                    <el-select v-model="item.filterValue" class="mr10" placeholder="未选择则默认所有" style="width:158px">
                      <el-option
                        v-for="key in item.filterType === SOURCE ? SOURCE_OPTIONS : GENDER_OPTIONS"
                        :key="key.value"
                        :label="key.label"
                        :value="key.value"
                      />
                    </el-select>
                    <i v-if="index" class="el-icon-remove-outline delete" @click="removeScopeItem(index)" />
                  </template>
                </div>
                <div class="add-scope-item" @click="addScopeItem">
                  <i class="el-icon-plus" />
                </div>
              </div>
            </el-form-item>
            <el-form-item label="默认欢迎语" style="width: 570px">
              <el-input
                v-model="form.defaultWelcomeMsg"
                type="textarea"
                :maxlength="welMsgMaxlength"
                show-word-limit
                :autosize="{ minRows: 4, maxRows: 10 }"
                placeholder="请输入欢迎语"
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
                :remove-appendix-list.sync="removeAppendixList"
                :hide-video-cover="true"
              />
            </el-form-item>
            <p class="config-title mt10">特殊时段欢迎语<span>可在特定时段回复不同的欢迎语，让欢迎语更灵活</span></p>
            <el-alert
              class="alert-tip"
              type="warning"
              title="在设置的特殊时段外的时间，将回复默认欢迎语"
              :closable="false"
            />
            <el-form-item label="时段欢迎语">
              <el-switch v-model="form.welcomeSwitch" />
              <span class="switch-tip">开启后，在指定时段回复个性欢迎语</span>
            </el-form-item>
            <div v-if="form.welcomeSwitch" class="step-div ml5">
              <el-steps direction="vertical">
                <el-step v-for="(ruleItem, index) in weMsgTlpSpecialRules" :key="index">
                  <template slot="description">
                    <SpecialWelStep
                      :rule-item.sync="ruleItem"
                      :hande-add-text-click="handeAddTextClick"
                      :sub-title="subTitle"
                      :wel-msg-maxlength="welMsgMaxlength"
                      :we-msg-tlp-special-rules.sync="weMsgTlpSpecialRules"
                      :index="index"
                      :check-repeat-time="checkRepeatTime"
                      @removeSpecialRule="removeSpecialRule"
                    />
                  </template>
                </el-step>
              </el-steps>
              <div>
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  style="margin-left: 100px"
                  @click="addWelRule"
                >添加欢迎语</el-button>
              </div>
            </div>
          </el-form>
        </div>
        <div class="preview-wrap">
          <PhoneDialog :message="form.defaultWelcomeMsg" :msg-list="appendixList" :un-show-video-cover="true" />
        </div>
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="submit" button-type="submit">保存</RequestButton>
    </div>
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      :key="form.codeType"
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      :is-only-leaf="form.codeType !== 2"
      :is-sigle-select="form.codeType == 1"
      :selected-user-list="form.weEmpleCodeUseScops || []"
      @success="selectedUser"
    />
  </div>
</template>
<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style lang="scss" scoped>
/deep/ .el-form-item:hover  {
  background: none;
}
.add-welcome-page {
  background-color: #fff;
  .wrap-body {
    .add-container {
      display: flex;
      padding-top: 20px;
    }
    .alert-tip {
      margin-left: 18px;
      margin-top: 15px;
      width: 542px;
      /deep/ .el-alert__description {
        line-height: 20px;
      }
    }
    .switch-tip {
      color: $grayColor;
      margin-left: 9px;
    }
    .step-div {
      width: 710px;
      /deep/ .el-steps {
        .el-step__main {
          .el-step__title {
            display: none;
          }
          .el-step__description {
            padding-right: 0;
            color: #606266;
          }
        }
      }
    }
    .customer-scope {
      width: 450px;
      border: 1px solid #dcdfe6;
      padding: 10px;
      padding-bottom: 0;
      display: flex;
      flex-wrap: wrap;
      .title {
        flex-shrink: 0;
        margin-right: 10px;
      }
      .scope-item {
        display: flex;
        flex-wrap: wrap;
        .el-select {
          margin-bottom: 10px;
          /deep/ .el-input__inner{
            padding-left: 10px
          }
        }
        .delete {
          color: #888;
          font-size: 16px;
          cursor: pointer;
          line-height: 32px;
        }
      }
      .add-scope-item {
          margin-bottom: 10px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px dashed #D9D9D9;
          color: #606266;
          font-size: 12px;
          cursor: pointer;
        }
    }
  }
  .wrap-body-form {
    width: 532px;
    margin-right: 156px;
    padding-top: 0;
  }
  /deep/ .quick-actions {
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
}
</style>
