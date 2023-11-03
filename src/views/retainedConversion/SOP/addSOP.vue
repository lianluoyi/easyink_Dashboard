<!--
 * @Description: 新增sop
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="add-sop-page wrap">
    <ReturnPage class="wrap-head" :query="{ sopType: this.$route.query.sopType }" :path="returnPath" />
    <div class="wrap-body">
      <el-alert
        v-if="dealDescription().desc"
        title="功能说明"
        type="info"
        :description="dealDescription().desc"
        show-icon
        :closable="false"
      />
      <el-alert
        v-if="showBirthdayTip"
        class="mt10"
        title="当前企业未启用客户的“出生日期”字段，无法使用该功能，请联系系统管理员前往【客户设置】启用“出生日期”"
        type="warning"
        show-icon
        :closable="false"
      />
      <div class="wrap-body-form">
        <el-form ref="form" :model="sopForm" label-width="100px" class="form" :rules="rules" style="width: 100%">
          <p class="config-title">基础设置</p>
          <el-form-item :label="`${sopType === SOP_TYPE['groupCalendar'] ? '日历' : 'SOP'}名称`" prop="name">
            <el-input
              v-model="sopForm.name"
              maxlength="32"
              show-word-limit
              :placeholder="`请填写${
                sopType === SOP_TYPE['groupCalendar'] ? '日历' : 'SOP'
              }使用场景，方便员工理解并执行`"
              clearable
              style="width: 432px"
            />
          </el-form-item>
          <el-form-item
            v-if="[SOP_TYPE['newCustomer'], SOP_TYPE['birthday']].includes(sopType)"
            label="使用员工"
            prop="useStaff"
          >
            <el-button
              class="mr10"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="dialogVisibleSelectUser = true"
            >{{ customerScopeInfo.useStaff.length ? '修改' : '添加' }}成员</el-button>
            <el-tag v-for="(item, index) in customerScopeInfo.useStaff" :key="index" closable class="user-tag iaic" @close="handleClose(customerScopeInfo.useStaff,index)">
              <TagUserShow :name="item.name" :show-icon="!item.userId" />
            </el-tag>
          </el-form-item>
          <el-form-item
            v-if="[SOP_TYPE['newCustomer'],SOP_TYPE['activity'], SOP_TYPE['birthday']].includes(sopType)"
            label="客户范围"
            :prop="sopType === SOP_TYPE['activity'] ? 'range' : ''"
          >
            <CustomerScope
              class="form-range-area"
              style="width: 713px"
              :customer-scope-info="customerScopeInfo"
              @updateCustomerScopeInfo="updateCustomerScopeInfo"
            />
          </el-form-item>
          <el-form-item
            v-if="[SOP_TYPE['timing'], SOP_TYPE['cycle']].includes(sopType)"
            label="使用群聊"
            prop="useGroup"
          >
            <el-radio-group v-model="sopForm.filterType">
              <el-radio :label="SPECIFIED_GROUP">指定群聊</el-radio>
              <el-radio :label="FILTER_GROUP">筛选群聊</el-radio>
            </el-radio-group>
            <div v-if="sopForm.filterType === SPECIFIED_GROUP" class="form-range-area">
              <el-button icon="el-icon-plus" @click="customerGroupVisible = true">添加群聊</el-button>
              <el-tag v-for="(unit, unique) in groupList" :key="unique" closable type="info" class="user-tag" @close="handleClose(groupList,unique)">{{
                unit.groupName
              }}</el-tag>
            </div>
            <div v-if="sopForm.filterType === FILTER_GROUP" class="form-range-area">
              <el-alert
                :style="'width: 408px;margin-top:0;'"
                title="同时满足以下条件的客户群执行SOP规则"
                type="warning"
                :closable="false"
              />
              <el-form-item label="群主" label-width="68px" style="padding: 10px 0 0">
                <el-button icon="el-icon-plus" @click="() => openUserModal('选择群主')">{{
                  groupOwner.length === 0 ? '添加成员' : '修改成员'
                }}</el-button>
                <el-tag v-for="(unit, unique) in groupOwner" :key="unique" closable type="info" class="user-tag" @close="handleClose(groupOwner,unique)">{{
                  unit.name
                }}</el-tag>
              </el-form-item>
              <el-form-item label="群标签" label-width="68px" style="padding: 8px 0">
                <el-button icon="el-icon-plus" @click="dialogVisibleSelectTag = true">添加标签</el-button>
                <el-tag
                  v-for="(unit, unique) in tagList"
                  :key="unique"
                  type="info"
                  closable
                  @close="deleteOneSelectTag('tag', unit)"
                >{{ unit.name }}</el-tag>
              </el-form-item>

              <el-form-item label="创建时间" label-width="68px" style="padding: 10px 0">
                <el-date-picker
                  v-model="sopForm.sopFilter.addTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 320px"
                  value-format="yyyy-MM-dd"
                />
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item v-if="sopType === SOP_TYPE['groupCalendar']" label="使用群聊" prop="useGroup">
            <el-button icon="el-icon-plus" class="mr10" @click="customerGroupVisible = true">添加群聊</el-button>
            <el-tag v-for="(unit, unique) in groupList" :key="unique" closable type="info" class="user-tag" @close="handleClose(groupList,unique)">{{
              unit.groupName
            }}</el-tag>
          </el-form-item>
          <el-form-item v-if="sopType === SOP_TYPE['cycle']" label="循环周期" prop="cycleTime">
            <el-date-picker
              v-model="sopForm.sopFilter.cycleTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 431px"
              :default-time="['00:00:00', '23:59:59']"
              :picker-options="pickerOptions"
            />
            <div style="color: #999">超出循环周期，则SOP规则不生效</div>
          </el-form-item>
          <p class="config-title mt20" style="margin-bottom: 16px">
            SOP规则<span>{{ dealDescription().tip }}</span>
          </p>
          <el-radio-group
            v-if="sopType === SOP_TYPE['groupCalendar']"
            v-model="ruleListType"
            class="rule-type mb15"
            size="medium"
          >
            <el-radio-button label="calendar">日历</el-radio-button>
            <el-radio-button label="timeline">时间轴</el-radio-button>
          </el-radio-group>
          <div v-if="ruleListType === 'timeline'" class="rule-list">
            <el-button type="primary" icon="el-icon-plus" @click="addRule">添加规则</el-button>
            <SOPRuleList
              :rule-list="sopForm.ruleList"
              :show-tool="true"
              :sop-type="sopType"
              @handleEdit="handleEdit"
              @handleDelRule="handleDelRule"
            />
          </div>
          <div v-if="ruleListType === 'calendar'" class="calendar-div">
            <SopCalendar
              :rule-list="sopForm.ruleList"
              @handleClickCalendar="handleClickCalendar"
              @handleEditCalendarItem="handleEditCalendarItem"
            />
          </div>
        </el-form>
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="submit" button-type="submit">保存</RequestButton>
    </div>
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      v-if="[SOP_TYPE['newCustomer'], SOP_TYPE['birthday']].includes(sopType)"
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      is-dep-linkage
      :is-only-leaf="false"
      :selected-user-list="customerScopeInfo.useStaff"
      @success="selectedUser"
    />

    <!-- 选择群主弹窗 -->
    <SelectUser
      v-if="[SOP_TYPE['timing'], SOP_TYPE['cycle']].includes(sopType)"
      :visible.sync="dialogVisibleSelectGroupOwner"
      :title="selectTitle"
      :is-only-leaf="true"
      :selected-user-list="groupOwner"
      @success="selectedUser"
    />
    <AddRuleDrawer
      ref="addRuleDrawer"
      :title="addRuleDrawerTitle"
      :visible.sync="addRuleDrawerVisible"
      :sop-form.sync="sopForm"
      @handleDelRule="handleDelRule"
    />
    <!-- 选择客户群聊 -->
    <CustomerGroupModal
      ref="customer"
      :visible.sync="customerGroupVisible"
      append-to-body
      :close-on-click-modal="false"
      :customer-group-id="sopForm.chatId"
      :cancel-click="cancelClick"
      :ok-click="handleSelectCustomerGroup"
      :customer-group-list.sync="customerGroupList"
      :select-single="false"
      @callback="getSelectCustomerGroup"
    />
    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      title="选择标签"
      type="search"
      info-msg="筛选出被打上选中标签的客户群，执行SOP"
      :selected="tagType === 'filter' ? filterTagList : tagList"
      tag-type="group"
      @success="submitSelectTag"
    />
  </div>
</template>
<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import ReturnPage from '@/components/ReturnPage.vue';
import SelectUser from '@/components/SelectUser/index.vue';
import AddRuleDrawer from '../components/AddRuleDrawer.vue';
import SOPRuleList from '../components/SOPRuleList.vue';
import {
  SOP_TYPE,
  CUSTOMER_PROPERTY_VALUE,
  ONE_DAY,
  ONE_HOUR,
  MS_TO_SECONDS,
  DEFAULT_ALERTINFO,
  RULE_PERFORM_TYPE,
  ONE_DAY_MSECOND,
  ADD_WAY
} from '@/utils/constant/index';
import CustomerGroupModal from '@/views/drainageCode/group/customer.vue';
import SelectTag from '@/components/SelectTag';
import { addSop, getSopDetail, updateSop } from '@/api/sop';
import { initGetCustomerProper, changeButtonLoading, groupByScopeType, checkChange, getSourceLabel } from '@/utils/common';
import moment from 'moment';
import { deepClone } from '@/utils/index';
import SopCalendar from './sopCalendar.vue';
import CustomerScope from '../components/CustomerScope.vue';
import TagUserShow from '@/components/TagUserShow';
// 指定群聊
const SPECIFIED_GROUP = 0;
// 筛选群聊
const FILTER_GROUP = 1;
export default {
  name: '',
  components: {
    ReturnPage,
    SelectUser,
    AddRuleDrawer,
    SOPRuleList,
    CustomerGroupModal,
    SelectTag,
    SopCalendar,
    RequestButton,
    CustomerScope,
    TagUserShow
  },
  props: {},
  provide() {
    return {
      sopInfo: this.sopInfo
    };
  },
  data() {
    const checkUseGroup = (rule, value, callback) => {
      // 指定群聊校验是否选择群聊
      switch (this.sopForm.filterType) {
        case SPECIFIED_GROUP: {
          if (this.groupList.length === 0) return callback(new Error('请设置使用群聊'));
          break;
        }
        case FILTER_GROUP: {
          if (!this.groupOwner?.length && !this.tagList.length && !this.sopForm.sopFilter?.addTime?.length) { return callback(new Error('请设置筛选群聊条件')); }
          break;
        }
      }
      return callback();
    };
    // 校验循环周期
    const checkCycleTime = (rule, value, callback) => {
      if (!this.sopForm.sopFilter?.cycleTime?.length) return callback(new Error('请选择循环周期'));
      return callback();
    };
    // 校验使用员工
    const checkUseEmployee = (rule, value, callback) => {
      if (!this.customerScopeInfo.useStaff.length) return callback(new Error('请设置员工'));
      return callback();
    };
    // 校验活动SOP的客户范围
    const checkRange = (rule, value, callback) => {
      const { gender, tagList, filterTagList, addTime, useStaff, customPropertyList } = this.customerScopeInfo;
      if (
        typeof gender !== 'number' &&
        !tagList.length &&
        !filterTagList.length &&
        !addTime.length &&
        !useStaff.length &&
        !customPropertyList.filter((prop) => prop.value || prop.optionValue).length
      ) {
        return callback(new Error('请设置客户范围'));
      }
      return callback();
    };
    return {
      rules: {
        name: [{ required: true, message: '请填写SOP名称', trigger: 'blur' }],
        useStaff: [{ type: 'array', required: true, validator: checkUseEmployee, trigger: 'change' }],
        range: [{ type: 'object', required: true, validator: checkRange, trigger: 'change' }],
        useGroup: [{ required: true, validator: checkUseGroup, trigger: 'blur' }],
        cycleTime: [{ required: true, validator: checkCycleTime, trigger: 'blur' }]
      },
      SPECIFIED_GROUP,
      FILTER_GROUP,
      sopForm: {
        name: '',
        ruleList: [],
        filterType: SPECIFIED_GROUP,
        genderType: '-1',
        sopFilter: {},
        sopCustomerFilter: {
          gender: null
        }
      },
      tagList: [],
      // 过滤标签
      filterTagList: [],
      // 选择员工弹窗
      dialogVisibleSelectUser: false,
      // 添加规则抽屉显示
      addRuleDrawerVisible: false,
      sopInfo: {
        sopType: null
      },
      SOP_TYPE,
      groupList: [],
      // 群主
      groupOwner: [],
      dialogVisibleSelectGroupOwner: false,
      customerGroupVisible: false,
      // 客户群
      customerGroupList: [],
      dialogVisibleSelectTag: false,
      // 当前选择的标签类型
      tagType: 'tag',
      // 客户自定义属性
      customPropertyList: [],
      addRuleDrawerTitle: '添加规则',
      // 要删除的规则
      removeList: [],
      selectTitle: '选择成员',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - ONE_DAY * ONE_HOUR * MS_TO_SECONDS;
        }
      },
      ruleListType: 'timeline',
      customerScopeInfo: {
        // 这里 定义避免获取的为空导致报错
        useStaff: []
      }
    };
  },
  computed: {
    sopType() {
      return this.sopInfo.sopType;
    },
    /**
     * 若没有启用客户属性的出生日期，则显示提示语
     */
    showBirthdayTip() {
      if (this.sopType !== SOP_TYPE['birthday']) return false;
      const customerProperList = this.$store.state.customerProperty.customerProperList;
      const birthdayProperty = customerProperList.find((item) => item.status && item.name === '出生日期');
      if (!birthdayProperty) {
        return true;
      }
      return false;
    },
    // 处理组件返回的路径
    returnPath() {
      let path;
      switch (this.sopType) {
        case SOP_TYPE['newCustomer']:
        case SOP_TYPE['activity']:
        case SOP_TYPE['birthday']:
          path = '/operationsCenter/retainedConversion/customerSOP';
          break;
        case SOP_TYPE['timing']:
        case SOP_TYPE['cycle']:
          path = '/operationsCenter/retainedConversion/groupSOP';
          break;
        case SOP_TYPE['groupCalendar']:
          path = '/operationsCenter/retainedConversion/groupCalendarSOP';
          break;
      }
      return path;
    }
  },
  created() {
    const routerQuery = this.$route.query;
    this.sopInfo.sopType = Number(routerQuery.sopType);
    // 客户sop、生日sop、活动sop需要用到客户自定义字段
    if ([SOP_TYPE['activity'], SOP_TYPE['birthday'], SOP_TYPE['newCustomer']].includes(this.sopInfo.sopType)) {
      initGetCustomerProper(this.$store);
    }
    // 群日历规则展示类型默认为日历形式
    if (this.sopInfo.sopType === SOP_TYPE['groupCalendar']) {
      this.ruleListType = 'calendar';
    }
    // 从路由中截取到了id，则为编辑sop界面
    if (routerQuery.id) this.getSopDetail(routerQuery.id);
  },
  beforeUpdate() {
    checkChange(this.$options.data().sopForm, this.sopForm);
  },
  mounted() {},
  methods: {
    submit() {
      this.$refs['form'].validate((valid) => {
        if (!this.sopForm.ruleList.length) {
          this.msgWarn('请设置SOP规则');
          changeButtonLoading(this.$store, 'submit');
          return;
        }
        if (valid) {
          const newSopForm = this.dealAddParams();
          if (this.sopForm.id) {
            if (this.removeList.length) newSopForm.delRuleList = this.removeList.map((item) => item.id);
            delete newSopForm.customerSopVOList;
            updateSop(newSopForm).then(() => {
              this.$store.commit('SET_ADD_FLAG', false);
              this.msgSuccess('修改成功');
              this.$router.go(-1);
            }).finally(() => {
              changeButtonLoading(this.$store, 'submit');
            });
          } else {
            addSop(newSopForm).then(() => {
              changeButtonLoading(this.$store, 'submit');
              this.$store.commit('SET_ADD_FLAG', true);
              this.msgSuccess('新增成功');
              window.history.go(-1);// 反馈可能部分浏览器无法跳转，先采用这种方式测试
              // this.$router.go(-1);
            }).finally(() => {
              changeButtonLoading(this.$store, 'submit');
            });
          }
        } else {
          changeButtonLoading(this.$store, 'submit');
        }
      });
    },
    /**
     * 处理新增传参
     */
    dealAddParams() {
      const sopForm = { ...this.sopForm };
      const newSopForm = {
        ...sopForm,
        sopType: this.sopInfo.sopType
      };
      switch (this.sopType) {
        case SOP_TYPE['timing']:
        case SOP_TYPE['cycle']: {
          const addTime = sopForm.sopFilter?.addTime;
          const cycleTime = this.sopForm.sopFilter?.cycleTime;
          newSopForm.chatIdList = this.groupList.map((item) => item.chatId);
          newSopForm.sopFilter = {
            createTime: addTime && addTime[0],
            endTime: addTime && addTime[1],
            owner: this.dealIds(this.groupOwner, 'userId'),
            tagId: this.dealIds(this.tagList, 'tagId'),
            cycleStart: cycleTime && this.parseTime(cycleTime[0]),
            cycleEnd: cycleTime && this.parseTime(cycleTime[1])
          };
          break;
        }
        case SOP_TYPE['activity']:
        case SOP_TYPE['newCustomer']:
        case SOP_TYPE['birthday']:
        {
          const { gender, tagList, filterTagList, addTime, useStaff, customPropertyList } = this.customerScopeInfo;
          const groupByList = groupByScopeType(useStaff);
          newSopForm.sopCustomerFilter = {
            tagId: this.dealIds(tagList, 'tagId'),
            filterTagId: this.dealIds(filterTagList, 'tagId'),
            startTime: addTime && addTime[0],
            endTime: addTime && addTime[1],
            users: this.dealIds(groupByList.useEmployeesList, 'userId'),
            departments: this.dealIds(groupByList.useDepartmentList, 'id'),
            gender,
            columnList: customPropertyList.map((item) => {
              if (item.id === ADD_WAY) {
                return {
                  type: ADD_WAY,
                  propertyValue: item.optionValue
                };
              }
              const value = item.type === CUSTOMER_PROPERTY_VALUE['dateField'] || item.name === '出生日期'
                ? (item.value || []).join(',')
                : item.optionValue;
              return {
                extendPropertyId: item.id,
                propertyValue: value,
                type: item.type
              };
            }).filter((item) => item.propertyValue)
          };
          break;
        }
        case SOP_TYPE['groupCalendar']: {
          newSopForm.chatIdList = this.groupList.map((item) => item.chatId);
          break;
        }
      }
      return newSopForm;
    },
    dealIds(list, field) {
      if (!list || list.length === 0) return null;
      const newList = list.map((item) => item[field]) || [];
      const keys = newList.join(',');
      return keys;
    },
    addRule() {
      this.$refs['addRuleDrawer'].resetForm();
      this.addRuleDrawerVisible = true;
      if (this.addRuleDrawerTitle === '编辑规则') {
        this.$refs['addRuleDrawer'].resetForm();
      }
      this.addRuleDrawerTitle = '添加规则';
    },
    /**
     * 编辑某个规则
     */
    handleEdit(item, ruleIndex) {
      this.addRuleDrawerVisible = true;
      this.$refs['addRuleDrawer'].formData = deepClone(item);
      this.$refs['addRuleDrawer'].ruleIndex = ruleIndex;
      this.$refs['addRuleDrawer'].hasExpired = false;
      this.addRuleDrawerTitle = '编辑规则';
    },
    /**
     * 更新规则列表
     * @param list 规则列表
     */
    changeRuleList(list) {
      this.sopForm = {
        ...this.sopForm,
        ruleList: list
      };
    },
    /**
     * 删除标签
     * @param tag 删除的对应标签
     */
    deleteOneSelectTag(type, tag) {
      const tags = type === 'filter' ? [...this.filterTagList] : [...this.tagList];
      const index = tags.findIndex((tag_) => tag_.tagId === tag.tagId);
      tags.splice(index, 1);
      this[type === 'filter' ? 'filterTagList' : 'tagList'] = tags;
    },
    // 选择添加人确认按钮
    selectedUser(users) {
      const groupOwnerStatus = [SOP_TYPE['timing'], SOP_TYPE['cycle']].includes(this.sopType);
      if (!groupOwnerStatus) {
        this.customerScopeInfo.useStaff = users;
      } else {
        this.groupOwner = users;
      }
    },

    // 客户群dialog选中数据
    handleSelectCustomerGroup() {
      this.$refs.customer.submit();
    },
    // 选择标签确认按钮
    submitSelectTag(data) {
      if (this.tagType === 'filter') {
        this.filterTagList = [...data];
      } else {
        this.tagList = [...data];
      }
      this.dialogVisibleSelectTag = false;
    },
    // 获取选中客户群
    getSelectCustomerGroup(customerGroup) {
      this.groupList = [...customerGroup];
      this.customerGroupVisible = false;
    },
    cancelClick() {
      this.customerGroupVisible = false;
    },
    dealDescription() {
      switch (this.sopType) {
        case SOP_TYPE['newCustomer']: {
          return {
            desc: '客户添加员工后，员工第一时间与客户建立联系，提高新客户的留存率。',
            tip: '满足规则，发送联络易应用消息提醒员工给新客户发送规则下内容'
          };
        }
        case SOP_TYPE['activity']: {
          return {
            desc: '突破客户每天只能收到一条群发消息的限制，由员工在指定时间手动发送指定内容给客户',
            tip: '到指定时间，发送联络易应用消息提醒员工给指定客户发送规则下内容'
          };
        }
        case SOP_TYPE['birthday']: {
          return {
            desc: '当客户生日时，提醒员工为客户发送生日祝福，让企业服务有温度。',
            tip: '客户生日时，发送联络易应用消息提醒员工给客户发送规则下内容'
          };
        }
        case SOP_TYPE['timing']: {
          return {
            desc: '细化客户群每个阶段的运营，由员工定期发送统一文案，提升客户群的转化效率',
            tip: '满足规则，发送联络易应用消息提醒员工给客户群发送规则下内容'
          };
        }
        case SOP_TYPE['cycle']: {
          return {
            desc: '标准化、流程化管理客户群，按天、周、月的周期定期循环提醒员工发送统一文案，提升客户群的运营效率',
            tip: '满足规则，发送联络易应用消息提醒员工给客户群发送规则下内容'
          };
        }
        case SOP_TYPE['groupCalendar']: {
          return {
            desc: '对客户群指定更细化的运营方案，由员工定时发送指定内容',
            tip: '选择发送日期，添加内容'
          };
        }
        default: {
          return {
            desc: '',
            tip: ''
          };
        }
      }
    },
    /**
     * 获取sop详情
     */
    getSopDetail(id) {
      getSopDetail({
        sopId: id
      }).then((res) => {
        const resData = res.data;
        let newSopForm = { ...resData };
        newSopForm = this.dealDetailGroup(newSopForm, resData);
        if ([SOP_TYPE['newCustomer'], SOP_TYPE['activity'], SOP_TYPE['birthday']].includes(this.sopType)) {
          newSopForm = this.dealDetailCustomer(newSopForm, resData);
        }
        newSopForm = this.dealAlertTime(newSopForm);
        this.sopForm = newSopForm;
      });
    },
    checkGetGroupList(resData) {
      return (
        [SOP_TYPE['cycle'], SOP_TYPE['groupCalendar']].includes(this.sopType) ||
        (this.sopType === SOP_TYPE['timing'] && resData.filterType === SPECIFIED_GROUP)
      );
    },
    dealDetailGroup(sopForm, resData) {
      const newSopForm = { ...sopForm };
      if (this.checkGetGroupList(resData)) {
        this.groupList = [...resData.groupSopList];
      }
      if (this.sopType === SOP_TYPE['cycle']) newSopForm.sopFilter.cycleTime = [resData.sopFilter.cycleStart, resData.sopFilter.cycleEnd];

      if (resData.filterType === FILTER_GROUP) {
        this.groupOwner = resData.sopFilter.ownerList ? [...resData.sopFilter.ownerList] : [];
        this.tagList = resData.sopFilter.tagList ? [...resData.sopFilter.tagList] : [];
        if (resData.sopFilter.createTime && resData.sopFilter.endTime) { newSopForm.sopFilter.addTime = [resData.sopFilter.createTime, resData.sopFilter.endTime]; }
      }
      return newSopForm;
    },
    /**
     * @description 处理客户SOP
     */
    dealDetailCustomer(sopForm, resData) {
      const newSopForm = { ...sopForm };
      const userInfoList = resData.sopCustomerFilter.userInfoList || [];
      const departmentInfoList = resData.sopCustomerFilter.departmentInfoList || [];
      const userAndDepartmentList = [...userInfoList, ...departmentInfoList];
      this.customerScopeInfo.useStaff = userAndDepartmentList.map((item) => {
        return { ...item, name: item.userName || item.departmentName, id: item.departmentId };
      });
      this.customerScopeInfo.gender = resData.sopCustomerFilter.gender;
      this.customerScopeInfo.tagList = resData.sopCustomerFilter.tagList ? [...resData.sopCustomerFilter.tagList] : [];
      this.customerScopeInfo.filterTagList = resData.sopCustomerFilter.filterTagList
        ? [...resData.sopCustomerFilter.filterTagList]
        : [];
      const newCustomPropertyList = [];
      const columnList = [...resData.sopCustomerFilter.columnList];
      const customPropertyObj = this.$store.state.customerProperty.customPropertyObj;
      columnList.forEach((item) => {
        if (item.type === ADD_WAY) {
          newCustomPropertyList.push(
            { id: ADD_WAY, name: '来源', optionValue: item.propertyValue, placeholder: '请选择来源', type: CUSTOMER_PROPERTY_VALUE['selectSingle'],
              optionList: getSourceLabel({ key: 'id', value: 'multipleValue' }) }
          );
        } else {
          // TODO  可以将该处optionValue与value合并成一个值 optionValue用于下拉框、多选框的回显值 value则是其他类型的回显值
          const customPropertyItem = customPropertyObj[item.extendPropertyId];
          // 需要对出生日期和日期类型的属性转换成数组形式
          newCustomPropertyList.push(
            {
              ...customPropertyItem,
              optionValue: item.propertyValue,
              value: (customPropertyItem.name === '出生日期' || customPropertyItem.type === CUSTOMER_PROPERTY_VALUE['dateField']) ? this.dealDate(item.propertyValue).split(',') : item.propertyValue,
              propertyValue: item.propertyValue
            }
          );
        }
      });
      this.customerScopeInfo.customPropertyList = newCustomPropertyList;
      const resStartTime = resData.sopCustomerFilter.startTime;
      const resEndTime = resData.sopCustomerFilter.endTime;
      if (resStartTime && resEndTime) {
        const startTime = this.parseTime(new Date(resStartTime), '{y}-{m}-{d}');
        const endTime = this.parseTime(new Date(resEndTime), '{y}-{m}-{d}');
        this.customerScopeInfo.addTime = [startTime, endTime];
      }
      return newSopForm;
    },
    /**
     * @description 兼容活动sop客户范围下的日期 转换成逗号分割形式
     */
    dealDate(value) {
      if (value.indexOf(',') === -1) {
        return value + ',' + value;
      } else {
        return value;
      }
    },
    /**
     * 将提醒时间转成组件需要的格式
     */
    dealAlertTime(params) {
      const newParams = { ...params };
      const ruleList = [...newParams.ruleList];
      const newRuleList = ruleList.map((item) => {
        const alertInfo = { ...DEFAULT_ALERTINFO };
        switch (item.alertType) {
          case RULE_PERFORM_TYPE['hourMinute']: {
            alertInfo.hourMinute = {
              hour: item.alertData1,
              minute: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['dayTime']: {
            alertInfo.dayTime = {
              day: item.alertData1,
              time: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['beforeDayTime']: {
            alertInfo.beforeDayTime = {
              day: item.alertData1,
              time: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['everydayTime']: {
            alertInfo.everydayTime = item.alertData2;
            break;
          }
          case RULE_PERFORM_TYPE['everyWeekTime']: {
            alertInfo.everyWeekTime = {
              week: item.alertData1,
              time: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['everyMonthTime']: {
            alertInfo.everyMonthTime = {
              month: item.alertData1,
              time: item.alertData2
            };
            break;
          }
          case RULE_PERFORM_TYPE['time']: {
            alertInfo.time = item.alertData2;
            break;
          }
        }
        return { ...item, alertInfo };
      });
      newParams.ruleList = newRuleList;
      return newParams;
    },
    /**
     * 移除规则
     */
    removeItem(item) {
      const list = [...this.removeList];
      list.push(item);
      this.removeList = list;
    },
    /**
     * @description 选择群主弹窗
     */
    openUserModal(title) {
      this.dialogVisibleSelectGroupOwner = true;
      this.selectTitle = title;
    },
    /**
     * 点击日历添加规则
     */
    handleClickCalendar(date) {
      if (date.getTime() < Date.now() - ONE_DAY_MSECOND) {
        this.msgWarn('不能为今天之前的日期添加SOP');
        return;
      }
      this.addRule();
      this.$refs['addRuleDrawer'].formData = {
        ...this.$refs['addRuleDrawer'].formData,
        alertInfo: {
          ...this.$refs['addRuleDrawer'].formData.alertInfo,
          time: moment(date).format('YYYY-MM-DD HH:mm')
        }
      };
    },
    /**
     * 编辑日历上的规则
     */
    handleEditCalendarItem(item) {
      const index = this.sopForm.ruleList.findIndex((ruleItem) => {
        return (
          `${ruleItem.alertData2}-${ruleItem.name}-${ruleItem.id}` === `${item.alertData2}-${item.name}-${item.id}`
        );
      });
      this.handleEdit(item, index);
      if (moment(item.alertData2).valueOf() < moment().valueOf()) this.$refs['addRuleDrawer'].hasExpired = true;
    },
    /**
     * 删除规则
     */
    handleDelRule(ruleIndex, ruleItem, callback = () => {}) {
      this.confirmModal(
        {
          msg: '该规则即将被删除，是否继续？'
        },
        async() => {
          const ruleList = [...this.sopForm.ruleList];
          ruleList.splice(ruleIndex, 1);
          this.changeRuleList(ruleList);
          this.removeItem(ruleItem);
          callback();
        }
      );
    },
    /**
     * @description 在客户范围中修改值的回调
     */
    updateCustomerScopeInfo(data) {
      this.customerScopeInfo = data;
    },
    handleClose(target, index) {
      target.splice(index, 1);
    }
  }
};
</script>
<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style scoped lang="scss">
.add-sop-page {
  background-color: #fff;
  .rule-type {
    padding-left: 18px;
  }
  .rule-list {
    padding-left: 18px;
    button {
      margin-bottom: 10px;
    }
  }
  .form-range-area {
    border: 1px solid #d9d9d9;
    padding: 10px;
    width: 430px;
    .el-button {
      margin-right: 10px;
      height: 28px;
      padding: 0 15px;
    }
    .el-form-item {
      align-items: center;
    }
    .add-other-property {
      border: 1px dashed rgba(217, 217, 217, 100);
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .customer-property-list {
      flex-wrap: wrap;
    }
    .range-item-tip {
      color: $grayColor;
    }
  }
}
</style>
