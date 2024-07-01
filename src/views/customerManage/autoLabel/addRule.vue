<!--
 * @Description: 新增/修改自动标签规则页面
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="add-rule-page wrap">
    <ReturnPage class="wrap-head" path="/customerManage/customerCenter/autoLabel" :query="{ labelType: this.$route.query.labelType }" />
    <div class="wrap-body">
      <el-alert
        title="功能说明"
        type="info"
        :description="dealDescription().desc"
        show-icon
        :closable="false"
      />
      <div class="wrap-body-form">
        <el-form ref="form" :model="ruleForm" label-width="86px" class="form" :rules="rules" style="width: 100%">
          <p class="config-title mb10">基础设置</p>
          <el-form-item label="规则名称" prop="ruleName">
            <el-input
              v-model="ruleForm.ruleName"
              maxlength="32"
              show-word-limit
              placeholder="请填写规则的使用场景，方便查询和管理"
              clearable
              style="width: 432px;"
            />
          </el-form-item>
          <el-form-item v-if="labelType !== AUTOLABEL_TYPE['intoGroup']" label="使用员工" prop="useStaff">
            <div class="flexw">
              <el-button
                class="mr10"
                icon="el-icon-plus"
                size="mini"
                @click="dialogVisibleSelectUser = true"
              >{{ useStaff.length ? '修改' : '添加' }}成员</el-button>
              <el-tag
                v-for="(item, index) in useStaff"
                :key="index"
                size="medium"
                closable
                class="user-tag aic"
                @close="handleClose(index)"
              >
                <TagUserShow :name="item.name" :show-icon="item.id" />
              </el-tag>
            </div>
            <p class="tip">{{ labelType === AUTOLABEL_TYPE['keyWords'] ? '不选择即默认所有员工，使用员工需已开通会话存档功能' : '不选择即默认所有员工' }}</p>
          </el-form-item>
          <el-form-item v-if="labelType === AUTOLABEL_TYPE['newCustomer']" label="生效周期" prop="effectTime">
            <el-date-picker
              v-model="ruleForm.effectTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
              style="width:431px"
              :picker-options="pickerOptions"
            />
            <p class="tip">超出生效周期，则规则不生效</p>
          </el-form-item>
          <template v-if="labelType === AUTOLABEL_TYPE['keyWords']">
            <p class="config-title"><span class="required-field">*</span>关键词设置</p>
            <el-form-item label="模糊匹配">
              <div>
                <div class="we-emple-code-tags-tip">当客户发送的消息包含关键词，则触发规则</div>
                <div>
                  <el-input
                    v-if="fuzzyVisibleAdd"
                    ref="fuzzySaveInput"
                    v-model.trim="newInput"
                    class="input-new-tag"
                    size="mini"
                    maxlength="15"
                    show-word-limit
                    style="width: 200px;"
                    @keyup.enter.native="() => newInputConfirm('fuzzy')"
                    @blur="() => newInputConfirm('fuzzy')"
                  />
                  <el-button
                    v-else
                    class="button-new-tag mr10"
                    size="mini"
                    icon="el-icon-plus"
                    @click="() => showInput('fuzzy')"
                  >关键词</el-button>
                  <template v-for="(item, index) in fuzzyKeywords">
                    <el-tag
                      :key="index"
                      closable
                      size="medium"
                      class="user-tag"
                      @close="closeKeyword(item, index, 'fuzzy')"
                    >
                      {{ item }}
                    </el-tag>
                  </template>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="精准匹配" prop="accurateKeyword">
              <div>
                <div class="we-emple-code-tags-tip">当客户发送的消息与关键词完全相同，则触发规则</div>
                <div>
                  <el-input
                    v-if="accurateVisibleAdd"
                    ref="accurateSaveInput"
                    v-model.trim="newInput"
                    class="input-new-tag"
                    size="mini"
                    maxlength="15"
                    show-word-limit
                    style="width: 200px;"
                    @keyup.enter.native="() => newInputConfirm('accurate')"
                    @blur="() => newInputConfirm('accurate')"
                  />
                  <el-button
                    v-else
                    class="button-new-tag mr10"
                    size="mini"
                    icon="el-icon-plus"
                    @click="() => showInput('accurate')"
                  >关键词</el-button>
                  <template v-for="(item, index) in accurateKeywords">
                    <el-tag
                      :key="index"
                      closable
                      class="user-tag"
                      size="medium"
                      @close="closeKeyword(item, index, 'accurate')"
                    >
                      {{ item }}
                    </el-tag>
                  </template>
                </div>
              </div>
            </el-form-item>
            <template v-if="labelType === AUTOLABEL_TYPE['keyWords']">
              <p class="config-title">标签设置</p>
              <el-form-item label="客户标签" prop="customerTags">
                <div>
                  <el-button
                    class="mr10"
                    icon="el-icon-plus"
                    size="mini"
                    @click="openAddTag"
                  >添加标签</el-button>
                  <el-tag
                    v-for="(item, index) in customerTags"
                    :key="index"
                    size="medium"
                    closable
                    @close="closeTag(item, index)"
                  >{{ item.name }}</el-tag>
                </div>
              </el-form-item>
            </template>
          </template>
          <template v-if="labelType !== AUTOLABEL_TYPE['keyWords']">
            <p class="config-title mb20 mt5">场景设置<span>{{ labelType === AUTOLABEL_TYPE['intoGroup'] ? '客户进入某个指定群聊，打上指定客户标签': '客户在某个时段成为员工的客户，打上指定客户标签' }}</span></p>
            <div>
              <el-button
                class="ml20 mb10"
                icon="el-icon-plus"
                type="primary"
                @click="addScene"
              >添加场景</el-button>
            </div>
            <SceneList :scene-list.sync="sceneList" :show-tool="true" :label-type="labelType" :remove-scene-list.sync="removeSceneList" />
          </template>
        </el-form>
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="submit" button-type="submit">保存</RequestButton>
    </div>
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      v-if="labelType !== AUTOLABEL_TYPE['intoGroup']"
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      :is-only-leaf="false"
      :selected-user-list="useStaff"
      @success="selectedUser"
    />
    <!-- 选择标签弹窗 -->
    <SelectTag
      v-if="labelType === AUTOLABEL_TYPE['keyWords']"
      :visible.sync="dialogVisibleSelectTag"
      title="选择标签"
      :selected="customerTags"
      tag-type="customer"
      type="search"
      :is-show-add="true"
      @success="submitSelectTag"
    />
  </div>
</template>
<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading, checkChange, groupByScopeType } from '@/utils/common';
import ReturnPage from '@/components/ReturnPage.vue';
import { AUTOLABEL_TYPE } from '@/utils/constant/index';
import SceneList from './components/sceneList.vue';
import SelectUser from '@/components/SelectUser';
import SelectTag from '@/components/SelectTag';
import { addNewCustomerRule, addIntoGroupRule, addKeywordRule, getKeywordRuleInfo, getIntoGroupRuleInfo, getNewCustomerRuleInfo, updateKeywordRule, updateIntoGroupRule, updateNewCustomerRule } from '@/api/customer/auto';
import { ONE_DAY, ONE_HOUR, MS_TO_SECONDS, NEWCUSOMTER_SCENE_TYPE } from '@/utils/constant/index';
import differenceBy from 'lodash/differenceBy';
import TagUserShow from '@/components/TagUserShow';
export default {
  name: '',
  components: { ReturnPage, SceneList, SelectUser, SelectTag, RequestButton, TagUserShow },
  props: {},
  data() {
    const checkCustomerTags = (rule, value, callback) => {
      if (!this.customerTags.length) return callback(new Error('请设置客户标签'));
      return callback();
    };
    const checkKeyword = (rule, value, callback) => {
      if (!this.fuzzyKeywords.length && !this.accurateKeywords.length) return callback(new Error('请设置关键词'));
      return callback();
    };
    return {
      AUTOLABEL_TYPE,
      ruleForm: {
        // 规则名称
        ruleName: '',
        effectTime: null
      },
      // 使用员工
      useStaff: [],
      // 客户标签
      customerTags: [],
      // 添加模糊匹配关键词按钮显隐
      fuzzyVisibleAdd: false,
      // 添加精准匹配关键词按钮显隐
      accurateVisibleAdd: false,
      // 关键词输入值
      newInput: '',
      // 模糊匹配关键词列表
      fuzzyKeywords: [],
      // 精准匹配关键词列表
      accurateKeywords: [],
      // 移除的模糊匹配关键词列表
      removeFuzzyKeywords: [],
      // 移除的精准匹配关键词列表
      removeAccurateKeywords: [],
      // 关键词类型 移除的标签列表
      removeTagList: [],
      // 移除的场景列表
      removeSceneList: [],
      // 标签类型
      labelType: AUTOLABEL_TYPE['keyWords'],
      rules: {
        ruleName: [
          { required: true, message: '请设置规则名称', trigger: 'blur' }
        ],
        customerTags: [
          { type: 'array', required: true, validator: checkCustomerTags, trigger: 'change' }
        ],
        accurateKeyword: [
          { type: 'array', validator: checkKeyword, trigger: 'change' }
        ]
      },
      // 场景列表
      sceneList: [],
      // 选择使用员工弹窗显示状态
      dialogVisibleSelectUser: false,
      // 选择标签弹窗显示状态
      dialogVisibleSelectTag: false,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - ONE_DAY * ONE_HOUR * MS_TO_SECONDS;
        }
      }
    };
  },
  created() {
    const routerQuery = this.$route.query;
    this.labelType = Number(routerQuery.labelType);
    // 从路由中截取到了id，则为编辑sop界面
    if (routerQuery.id) {
      this.getRuleDetail(routerQuery.id);
    } else {
      // 添加规则时默认有一个场景
      this.sceneList = this.labelType === AUTOLABEL_TYPE['intoGroup'] ? [{ chatRoomList: [], tagList: [] }] : [{ sceneType: NEWCUSOMTER_SCENE_TYPE['day'], loopPoint: NEWCUSOMTER_SCENE_TYPE['day'] }];
    }
  },
  mounted() {},
  beforeUpdate() {
    const { useStaff, fuzzyKeywords, accurateKeywords, ruleForm, sceneList } = this.$options.data();
    sceneList.push({ chatRoomList: [], tagList: [] });
    const oldVal = {
      useStaff,
      fuzzyKeywords,
      accurateKeywords,
      sceneList: this.labelType === AUTOLABEL_TYPE['intoGroup'] ? [{ chatRoomList: [], tagList: [] }] : [{ sceneType: NEWCUSOMTER_SCENE_TYPE['day'], loopPoint: NEWCUSOMTER_SCENE_TYPE['day'] }],
      ...ruleForm
    };
    const newVal = {
      useStaff: this.useStaff,
      fuzzyKeywords: this.fuzzyKeywords,
      accurateKeywords: this.accurateKeywords,
      sceneList: this.sceneList,
      ...this.ruleForm
    };
    checkChange(oldVal, newVal);
  },
  methods: {
    /**
     * 根据不同标签类型显示不同的提示语
     */
    dealDescription() {
      switch (this.labelType) {
        case AUTOLABEL_TYPE['keyWords']: {
          return {
            desc: '当客户发送给员工的聊天内容包含设定的关键词，系统为其自动打上客户标签，方便企业对客户进行更精准的运营',
            tip: ''
          };
        }
        case AUTOLABEL_TYPE['intoGroup']: {
          return {
            desc: '当客户进入指定的群聊，系统为其自动打上客户标签，方便企业对客户进行更精准的运营',
            tip: '客户进入某个指定群聊，打上指定客户标签'
          };
        }
        case AUTOLABEL_TYPE['newCustomer']: {
          return {
            desc: '当客户在某个时段成为员工的客户，系统为其自动打上客户标签，方便企业对客户进行更精准的运营',
            tip: '客户在某个时段成为员工的客户，打上指定客户标签'
          };
        }
      }
      return '';
    },
    /**
     * 确认添加关键词
     */
    newInputConfirm(type) {
      this[ `${type}VisibleAdd`] = false;
      const newInput = this.newInput;
      if (!newInput) return;
      const list = [...this[`${type}Keywords`]];
      const index = list.findIndex(item => item === newInput);
      if (index > -1) {
        this.msgWarn('同一匹配方式下关键词不能重复');
        this.newInput = '';
        return;
      }
      this[`${type}Keywords`].push(newInput);
      this.newInput = '';
    },
    /**
     * 点击添加关键词
     * @param type 关键词类型
     */
    showInput(type) {
      // 关键词设置数量上限值
      const MAX_KEYWORD = 10;
      const fuzzyLength = this.fuzzyKeywords.length || 0;
      const accurateLength = this.accurateKeywords.length || 0;
      if ((fuzzyLength + accurateLength) >= MAX_KEYWORD) {
        this.msgWarn(`最多可设置${MAX_KEYWORD}个关键词`);
        this.newInput = '';
        return;
      }

      this[`${type}VisibleAdd`] = true;
      this.$nextTick(_ => {
        this.$refs[`${type}SaveInput`].$refs.input.focus();
      });
    },
    /**
     * 移除关键词
     */
    closeKeyword(tag, index, type) {
      switch (type) {
        case 'fuzzy': {
          this.fuzzyKeywords.splice(index, 1);
          this.removeFuzzyKeywords.push(tag);
          break;
        }
        case 'accurate': {
          this.accurateKeywords.splice(index, 1);
          this.removeAccurateKeywords.push(tag);
          break;
        }
      }
    },
    /**
     * 添加场景
     */
    addScene() {
      const sceneList = [...this.sceneList];
      const MAX_SCENE_LIMIT = 10;
      if (sceneList.length >= MAX_SCENE_LIMIT) {
        this.msgWarn(`最多可设置${MAX_SCENE_LIMIT}个场景`);
        return;
      }
      if (this.labelType === AUTOLABEL_TYPE['intoGroup']) {
        sceneList.push({ chatRoomList: [], tagList: [] });
      } else {
        sceneList.push({ sceneType: NEWCUSOMTER_SCENE_TYPE['day'], loopPoint: NEWCUSOMTER_SCENE_TYPE['day'] });
      }
      this.sceneList = sceneList;
    },
    /**
     * 编辑规则
     * @param params 编辑规则不同类型的统一传值
     */
    async updateRule(params) {
      const newParams = { ...params };
      const tagIdList = this.customerTags?.map(item => item.tagId);
      const removeTagList = this.removeTagList;
      const allListObj = groupByScopeType(this.useStaff);
      switch (this.labelType) {
        case AUTOLABEL_TYPE['keyWords']: {
          await updateKeywordRule({
            ...newParams,
            // 精准匹配关键词列表
            exactMatchKeywordList: this.accurateKeywords,
            // 模糊匹配关键词列表
            fuzzyMatchKeywordList: this.fuzzyKeywords,
            // 移除的精准匹配关键词列表
            removeExactMatchKeywordList: this.removeAccurateKeywords,
            // 移除的模糊匹配关键词列表
            reomveFuzzyMatchKeywordList: this.removeFuzzyKeywords,
            // 移除的客户标签列表
            removeTagIdList: removeTagList?.map(item => item.tagId),
            // 客户标签列表
            tagIdList: tagIdList,
            // 使用员工列表
            userIdList: allListObj.useEmployeesList?.map(item => item.userId),
            // 使用部门列表
            departmentIdList: allListObj.useDepartmentList?.map(item => item.id)
          });
          break;
        }
        case AUTOLABEL_TYPE['intoGroup']: {
          await updateIntoGroupRule({
            ...newParams,
            // 移除的场景id列表
            removeSceneIdList: this.removeSceneList?.map(item => item.id),
            // 入群标签规则场景列表
            groupSceneList: [...this.sceneList]?.map(item => {
              return {
                ...item,
                // 对应场景移除的群聊列表
                removeGroupIdList: item.removeGroupList?.map(item => item.chatId),
                // 对应场景移除的客户标签列表
                removeTagIdList: item.removeTagList?.map(item => item.tagId),
                // 对应场景客户标签列表
                tagIdList: item.tagList?.map(item => item.tagId),
                // 对应场景群聊列表
                groupIdList: item.chatRoomList?.map(item => item.chatId)
              };
            })
          });
          break;
        }
        case AUTOLABEL_TYPE['newCustomer']: {
          const ruleForm = this.ruleForm;
          // 生效周期设置
          if (ruleForm && ruleForm.effectTime) {
            newParams.effectBeginTime = ruleForm.effectTime[0] && this.parseTime(ruleForm.effectTime[0]);
            newParams.effectEndTime = ruleForm.effectTime[1] && this.parseTime(ruleForm.effectTime[1]);
          }
          await updateNewCustomerRule({
            ...newParams,
            removeSceneIdList: this.removeSceneList?.map(item => item.id),
            customerSceneList: [...this.sceneList]?.map(item => {
              return {
                ...item,
                removeTagIdList: item.removeTagList?.map(item => item.tagId),
                tagIdList: item.tagList?.map(item => item.tagId)
              };
            }),
            userIdList: allListObj.useEmployeesList?.map(item => item.userId),
            departmentIdList: allListObj.useDepartmentList?.map(item => item.id)
          });
          break;
        }
      }
      this.msgSuccess('操作成功');
      changeButtonLoading(this.$store, 'submit');
      this.$router.go(-1);
      return newParams;
    },
    /**
     * 校验必填项
     */
    verifyNewCustomerSceneList() {
      if (this.labelType !== AUTOLABEL_TYPE['keyWords'] && !this.sceneList.length) {
        this.msgWarn('请设置场景');
        return true;
      }
      const MAX_KEYWORD_TOTAL = 10;
      if (this.labelType === AUTOLABEL_TYPE['keyWords'] && (this.accurateKeywords.length + this.fuzzyKeywords.length) > MAX_KEYWORD_TOTAL) {
        this.msgWarn(`最多可设置${MAX_KEYWORD_TOTAL}个关键词`);
        return true;
      }
      // 校验场景列表必填项是否为空
      return this.sceneList.some((item, index) => {
        const { sceneType, loopBeginTime, loopEndTime, tagList, loopPoint, chatRoomList } = item;
        const timeVerify = !sceneType || !loopBeginTime || !loopEndTime || (sceneType !== NEWCUSOMTER_SCENE_TYPE['day'] && !loopPoint);
        if ([AUTOLABEL_TYPE['newCustomer'], AUTOLABEL_TYPE['intoGroup']].includes(this.labelType) && (!tagList || !tagList.length)) {
          this.msgWarn(`请设置场景${index + 1}的客户标签`);
          return true;
        }
        if (this.labelType === AUTOLABEL_TYPE['newCustomer'] && timeVerify) {
          this.msgWarn(`请设置场景${index + 1}的生效时间`);
          return true;
        }
        if (this.labelType === AUTOLABEL_TYPE['intoGroup'] && (!chatRoomList || !chatRoomList.length)) {
          this.msgWarn(`请设置场景${index + 1}的群聊`);
          return true;
        }
        return false;
      });
    },
    /**
     * 添加自动标签规则
     */
    async addAutoRule(params) {
      let newParams = params;
      const tagList = this.customerTags?.map(item => item.tagId);
      const allListObj = groupByScopeType(this.useStaff);
      switch (this.labelType) {
        case AUTOLABEL_TYPE['keyWords']: {
          newParams = {
            ...newParams,
            exactMatchKeywordList: this.accurateKeywords,
            fuzzyMatchKeywordList: this.fuzzyKeywords,
            tagIdList: tagList,
            userIdList: allListObj.useEmployeesList?.map(item => item.userId),
            departmentIdList: allListObj.useDepartmentList?.map(item => item.id)
          };
          await addKeywordRule(newParams);
          break;
        }
        case AUTOLABEL_TYPE['intoGroup']: {
          newParams = {
            ...newParams,
            groupSceneList: this.sceneList?.map(item => {
              return {
                tagIdList: item.tagList?.map(tagItem => tagItem.tagId),
                groupIdList: item.chatRoomList?.map(groupItem => groupItem.chatId)
              };
            })
          };
          await addIntoGroupRule(newParams);
          break;
        }
        case AUTOLABEL_TYPE['newCustomer']: {
          const ruleForm = { ...this.ruleForm };
          if (ruleForm && ruleForm.effectTime) {
            newParams.effectBeginTime = ruleForm.effectTime[0] && this.parseTime(ruleForm.effectTime[0]);
            newParams.effectEndTime = ruleForm.effectTime[1] && this.parseTime(ruleForm.effectTime[1]);
          }
          newParams = {
            ...newParams,
            customerSceneList: this.sceneList?.map(item => {
              return {
                ...item,
                tagIdList: item.tagList?.map(tagItem => tagItem.tagId)
              };
            }),
            userIdList: allListObj.useEmployeesList?.map(item => item.userId),
            departmentIdList: allListObj.useDepartmentList?.map(item => item.id)
          };
          await addNewCustomerRule(newParams);
          break;
        }
      }
      this.msgSuccess('操作成功');
      changeButtonLoading(this.$store, 'submit');
      this.$router.go(-1);
    },
    /**
     * 确认保存
     */
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const ruleForm = this.ruleForm;
          // 校验必填项
          const verify = this.verifyNewCustomerSceneList();
          if (verify) return changeButtonLoading(this.$store, 'submit');
          this.$store.commit('SET_ADD_FLAG', !ruleForm.id);
          if (ruleForm.id) {
            this.updateRule({ id: ruleForm.id, ruleName: ruleForm.ruleName });
          } else {
            this.addAutoRule({ ruleName: ruleForm.ruleName });
          }
        } else {
          changeButtonLoading(this.$store, 'submit');
        }
      });
    },
    // 选择添加人确认按钮
    selectedUser(users) {
      this.useStaff = users;
    },
    /**
     * 打开客户标签弹窗
     */
    openAddTag() {
      this.dialogVisibleSelectTag = true;
    },
    /**
     * 选择标签确认按钮
     */
    submitSelectTag(data) {
      // 过滤出弹窗中取消选中的标签
      let removeList = differenceBy(this.customerTags, data, 'tagId');
      this.customerTags = [...data];
      this.dialogVisibleSelectTag = false;
      removeList = this.removeTagList.concat(removeList);
      this.removeTagList = removeList;
    },
    /**
     * 移除客户标签
     */
    closeTag(item, index) {
      this.customerTags.splice(index, 1);
      this.removeTagList.push(item);
    },
    /**
     * 将详情中的员工和部门处理字段名并分别设置到变量中
     */
    getInfoAndDealUserList(userList, departmentList) {
      this.useStaff = [...userList, ...departmentList]?.map(item => { return { ...item, name: item.userName || item.departmentName, id: item.departmentId }; });
    },
    /**
     * 编辑模式下，获取对应规则的详情
     */
    async getRuleDetail(id) {
      const ruleForm = {
        id
      };
      const params = { ruleId: id };
      switch (this.labelType) {
        case AUTOLABEL_TYPE['keyWords']: {
          const keywordDetailRes = await getKeywordRuleInfo(params);
          const { ruleName, fuzzyMatchKeywordList, exactMatchKeywordList, userList, departmentList, tagList } = keywordDetailRes.data;
          ruleForm.ruleName = ruleName;
          this.fuzzyKeywords = [...fuzzyMatchKeywordList];
          this.accurateKeywords = [...exactMatchKeywordList];
          this.customerTags = tagList?.map(item => { return { ...item, name: item.tagName }; });
          this.getInfoAndDealUserList(userList, departmentList);
          break;
        }
        case AUTOLABEL_TYPE['intoGroup']: {
          const groupDetailRes = await getIntoGroupRuleInfo(params);
          const { ruleName, groupSceneList } = groupDetailRes.data;
          ruleForm.ruleName = ruleName;
          const newGroupSceneList = groupSceneList && [...groupSceneList];
          this.sceneList = newGroupSceneList?.map(item => {
            return {
              ...item,
              chatRoomList: item.groupList
            };
          });
          break;
        }
        case AUTOLABEL_TYPE['newCustomer']: {
          const customerDetailRes = await getNewCustomerRuleInfo(params);
          const { ruleName, userList, departmentList, customerSceneList, effectBeginTime, effectEndTime } = customerDetailRes.data;
          ruleForm.ruleName = ruleName;
          this.sceneList = [...customerSceneList];
          this.getInfoAndDealUserList(userList, departmentList);
          ruleForm.effectTime = [effectBeginTime || '', effectEndTime || ''];
          break;
        }
      }
      this.ruleForm = ruleForm;
    },
    handleClose(index) {
      this.useStaff.splice(index, 1);
    }
  }

};
</script>
<style lang="scss" src="@/styles/communicate.scss" scoped>
</style>
<style scoped lang='scss'>
.add-rule-page {
  background-color: #fff;
  .tip {
    font-size: 12px;
    text-align: left;
    color: $grayColor;
  }
  .we-emple-code-tags-tip {
    padding-left: 0;
  }
  .required-field {
    color: $red;
    border-left: none;
    margin-left: 0px;
    margin-right: 4px;
    padding-left: 0px;
  }
}
</style>
