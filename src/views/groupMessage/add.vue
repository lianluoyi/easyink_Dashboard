<script>
import { add, update, getSendSize } from '@/api/groupMessage';
import PhoneDialog from '@/components/PhoneDialog';
import SelectUser from '@/components/SelectUser/index.vue';
import SelectTag from '@/components/SelectTag';
import {
  GROUP_MESSAGE_PUSH_TYPE,
  GROUP_MESSAGE_PUSH_TYPE_CUSTOMER,
  GROUP_MESSAGE_MSG_TYPE_TEXT,
  PAGE_LIMIT,
  MEDIA_TYPE,
  MESSAGE_MEDIA_TYPE,
  MEDIA_TYPE_POSTER,
  MEDIA_TYPE_IMGLINK,
  MEDIA_TYPE_RADARLINK,
  MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_MINIAPP,
  GROUP_MESSAGE_PUSH_RANGE,
  GROUP_MESSAGE_PUSH_TIME,
  GROUP_MESSAGE_PUSH_TYPE_GROUP,
  GROUP_MESSAGE_GENDER_TYPE,
  GROUP_MESSAGE_PUSH_RANGE_SOME,
  GROUP_MESSAGE_PUSH_RANGE_ALL,
  GENDER_TYPE_OF_ALL,
  GROUP_MESSAGE_PUSH_TIME_NOW,
  GROUP_MESSAGE_GENDER_TYPE_ARRAY,
  GROUP_MESSAGE_PUSH_TIME_SET,
  MAX_APPENDIX_NUM,
  MEDIA_TYPE_SMARTFORM
} from '@/utils/constant/index';
import { getFileName, changeButtonLoading, checkChange } from '@/utils/common';
import NoConfigInfo from '@/components/NoConfigInfo';
import AddAppendixBtn from '@/components/AddAppendixBtn.vue';
import RequestButton from '@/components/Button/RequestButton.vue';
import TagUserShow from '@/components/TagUserShow';
import { cloneDeep } from 'lodash';
import moment from 'moment';
export default {
  components: { PhoneDialog, SelectTag, SelectUser, NoConfigInfo, AddAppendixBtn, RequestButton, TagUserShow },
  props: {},
  data() {
    return {
      MAX_APPENDIX_NUM,
      loading: false,
      // 表单参数
      form: {
        pushType: GROUP_MESSAGE_PUSH_TYPE_CUSTOMER,
        pushRange: GROUP_MESSAGE_PUSH_RANGE_ALL,
        pushTime: GROUP_MESSAGE_PUSH_TIME_NOW,
        tag: [],
        filterTags: [],
        department: [],
        staffId: [],
        settingTime: '',
        messageType: '0',
        textMessage: {
          content: '' // '消息文本内容，最多2000个字节',
        },
        gender: GENDER_TYPE_OF_ALL,
        addTime: [],
        taskName: ''
      },
      userParty: [],
      groupOwner: [],
      rules: {},
      statusOptions: Object.freeze([
        ...Object.keys(GROUP_MESSAGE_PUSH_TYPE).map((type) => ({ label: GROUP_MESSAGE_PUSH_TYPE[type], value: type }))
      ]),
      rangeOptions: Object.freeze([
        ...Object.keys(GROUP_MESSAGE_PUSH_RANGE).map((type) => ({ label: GROUP_MESSAGE_PUSH_RANGE[type], value: type }))
      ]),
      timeOptions: Object.freeze([
        ...Object.keys(GROUP_MESSAGE_PUSH_TIME).map((type) => ({ label: GROUP_MESSAGE_PUSH_TIME[type], value: type }))
      ]),
      genderOptions: Object.freeze([
        ...GROUP_MESSAGE_GENDER_TYPE_ARRAY.map((type) => ({ label: GROUP_MESSAGE_GENDER_TYPE[type], value: type }))
      ]),
      activeName: GROUP_MESSAGE_MSG_TYPE_TEXT,
      dialogVisibleSelectCustomer: false,
      dialogVisibleSelectUser: false,
      dialogVisibleSelectTag: false,
      dialogVisibleSelectMaterial: false,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        categoryId: '',
        search: '',
        mediaType: MEDIA_TYPE_POSTER,
        isExpire: false
      },
      materialList: [],
      appendixList: [],
      subTitle: '已添加 0 个附件，还可选择 9 个', // 素材库选择弹窗子标题
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_MINIAPP,
      MEDIA_TYPE_RADARLINK,
      MEDIA_TYPE,
      MESSAGE_MEDIA_TYPE,
      limitSelectLength: MAX_APPENDIX_NUM,
      materialType: MEDIA_TYPE_POSTER,
      selectTagType: 'tag',
      sendSize: undefined,
      GROUP_MESSAGE_PUSH_TYPE_CUSTOMER,
      GROUP_MESSAGE_PUSH_TYPE_GROUP,
      GROUP_MESSAGE_PUSH_RANGE_SOME,
      GROUP_MESSAGE_PUSH_TIME_SET,
      MEDIA_TYPE_SMARTFORM,
      filterUsers: [],
      filterGroupUsers: [],
      selectUserType: undefined
    };
  },
  computed: {
    // 是否显示选择的客户标签
    isOnlyTag() {
      return this.form.tag[0] && this.form.pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER;
    },
    // 是否显示选择范围后的文字说明
    isSelectedText() {
      return this.userParty[0] || this.isOnlyTag;
    },
    // 选择范围后的文字说明
    selectedText() {
      return `将发送消息给${this.userParty[0] ? this.userParty[0].name + '等部门或成员的' : ''}${
        this.userParty[0] && this.isOnlyTag ? '，且' : ''
      }${this.isOnlyTag ? '满足' + this.form.tag[0].name + '等标签的' : ''}${
        this.form.pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER ? '客户' : '客户群'
      }`;
    },
    categoryId() {
      const appendixType = this.$refs['AddAppendixBtn'].appendixType;
      return this.$store.state.materialInfo?.categoryInfo[appendixType]?.id;
    },
    selectUserList() {
      return cloneDeep(this[this.selectUserType]);
    }
  },
  watch: {
    appendixList(val) {
      this.subTitle = `已添加 ${val.length} 个附件，还可选择 ${MAX_APPENDIX_NUM - val.length} 个`;
      this.limitSelectLength = MAX_APPENDIX_NUM - val.length;
    },
    materialType(val) {
      this.query.mediaType = val;
    }
  },
  beforeUpdate() {
    checkChange({ ...this.$options.data().form, appendixList: this.$options.data().appendixList }, { ...this.form, appendixList: this.appendixList });
  },
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>
          <h5>一、什么是群发助手？</h5>
          <p>
            成员可把通知、祝福、活动等消息批量发送给不同的客户，并进行后续的服务；管理员或负责人也可创建企业服务消息，由成员发送并进行后续的服务。
          </p>
          <h5>二、谁可以使用群发助手？</h5>
          <p>
            具有客户联系使用权限的成员，都可以使用群发助手给自己的客户发送消息；超级管理员和业务负责人还可向管理范围内成员的客户创建企业服务消息。
          </p>
          <h5>三、群发是否有频率限制？</h5>
          <p>
            每天最多接收来自同一企业的管理员或业务负责人的1条群发消息。
          </p>
          <h5>四、群发助手其他注意事项</h5>
          <p>
            1、群发消息不得出现违反法律法规或侵犯他人合法权益的内容，企业应对其制作、发送和传播的群发消息内容承担全部法律责任。
          </p>
          <p>
            2、不得以任何方式滥用群发助手实施恶意骚扰用户、开展过度营销等行为。
          </p>
          <p>
            3、如企业微信帐号存在异常，则可能导致群发消息发送失败或异常等情况。
          </p>
        </div>
      `
    );
  },
  mounted() {
    this.initForm();
  },
  methods: {
    initForm() {
      if (this.$route.query) {
        const query = this.$route.query;
        if (query.messageId) {
          this.form.messageId = query.messageId;
        }
        if (query.attachments && query.attachments.length >= 1) {
          this.appendixList = this.resolveAttactments(query.attachments);
        }
        let newArr = [];
        if (query.userList?.length) {
          newArr = query.userList;
        }
        if (query.departmentList?.length) {
          newArr = [...newArr, ...query.departmentList.map((item) => {
            return {
              id: item.departmentId,
              name: item.departmentName
            };
          })];
        }
        let newfliterUserArr = [];
        if (query.filterUserList?.length) {
          newfliterUserArr = query.filterUserList;
        }
        if (query.filterDepartmentList?.length) {
          newfliterUserArr = [...newfliterUserArr, ...query.filterDepartmentList.map((item) => {
            return {
              id: item.departmentId,
              name: item.departmentName
            };
          })];
        }
        this[query.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? 'filterGroupUsers' : 'filterUsers'] = newfliterUserArr;
        this[query.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? 'groupOwner' : 'userParty'] = newArr;
        if (query.customerEndTime && query.customerStartTime) {
          this.form.addTime = [moment(query.customerStartTime).format('YYYY-MM-DD'), moment(query.customerEndTime).format('YYYY-MM-DD')];
        }
        Object.keys(this.form).forEach((key) => {
          if (query.content) {
            this.form.textMessage.content = query.content;
          }
          if (key === 'pushTime') {
            this.form[key] = query.settingTime ? GROUP_MESSAGE_PUSH_TIME_SET : GROUP_MESSAGE_PUSH_TIME_NOW;
          }
          if (query[key]) {
            if (key === 'gender') {
              this.form[key] = Number(query[key]);
            } else if (key === 'tag' || key === 'filterTags') {
              this.initTagList(key);
            } else {
              this.form[key] = query[key];
            }
          }
        });
      }
    },
    initTagList(tagType) {
      const query = this.$route.query;
      const { tagList } = this.$store.state.listInfo;
      if (tagList.length > 0) {
        this.form[tagType] = query[tagType].split(',').map((tagId) => {
          const user = tagList.find((tag) => tag.tagId === tagId);
          return {
            name: user && user.name,
            tagId
          };
        });
      } else {
        setTimeout(() => {
          this.initTagList(tagType);
          // eslint-disable-next-line no-magic-numbers
        }, 100);
      }
    },
    // 选择添加人确认按钮
    selectedUser(users) {
      this[this.selectUserType] = users;
    },
    // 选择标签确认按钮
    submitSelectTag(data) {
      this.form[this.selectTagType] = data;
      this.dialogVisibleSelectTag = false;
    },
    // 新建素材按钮
    goRoute() {
      window.open('#/operationsCenter/material/materialManage');
    },
    resolveAttactments(attachments) {
      const appendixList = [];
      JSON.parse(attachments).forEach((attatchment) => {
        const appendix = {};
        appendix.isAdded = true;
        appendix.mediaType = attatchment.msgtype;
        switch (String(attatchment.msgtype)) {
          case MEDIA_TYPE_POSTER:
            attatchment.imageMessage = JSON.parse(attatchment.imageMessage);
            appendix.materialUrl = attatchment.imageMessage.pic_url;
            appendix.materialName = getFileName(attatchment.imageMessage.pic_url);
            break;
          case MEDIA_TYPE_IMGLINK:
            attatchment.linkMessage = JSON.parse(attatchment.linkMessage);
            appendix.digest = attatchment.linkMessage.desc;
            appendix.coverUrl = attatchment.linkMessage.picurl;
            appendix.materialName = attatchment.linkMessage.title;
            appendix.materialUrl = attatchment.linkMessage.url;
            break;
          case MEDIA_TYPE_VIDEO:
            attatchment.videoDTO = JSON.parse(attatchment.videoDTO);
            appendix.materialName = attatchment.videoDTO.title;
            appendix.materialUrl = attatchment.videoDTO.videoUrl;
            appendix.content = attatchment.videoDTO.size;
            appendix.coverUrl = attatchment.videoDTO.coverUrl;
            break;
          case MEDIA_TYPE_FILE:
            attatchment.fileDTO = JSON.parse(attatchment.fileDTO);
            appendix.materialUrl = attatchment.fileDTO.fileUrl;
            appendix.materialName = getFileName(attatchment.fileDTO.fileUrl);
            break;
          case MEDIA_TYPE_MINIAPP:
            attatchment.miniprogramMessage = JSON.parse(attatchment.miniprogramMessage);
            appendix.appid = attatchment.miniprogramMessage.appid;
            appendix.accountOriginalId = attatchment.miniprogramMessage.accountOriginalId;
            appendix.materialUrl = attatchment.miniprogramMessage.page;
            appendix.coverUrl = attatchment.miniprogramMessage.picUrl;
            appendix.materialName = attatchment.miniprogramMessage.title;
            break;
          case MEDIA_TYPE_RADARLINK:
            // extraId在新增的时候和编辑的时候不一致，后端会返回radarId/formId 统一使用extraId 在传给后端的时候再换成radarId/formId
            appendix.extraId = attatchment.radarMessage.extraId || attatchment.radarMessage.radarId;
            appendix.radarTitle = attatchment.radarMessage?.radar?.radarTitle;
            appendix.title = attatchment.radarMessage.radar?.weRadarUrl?.title;
            appendix.content = attatchment.radarMessage.radar?.weRadarUrl?.content;
            appendix.coverUrl = attatchment.radarMessage.radar?.weRadarUrl?.coverUrl;
            break;
          case MEDIA_TYPE_SMARTFORM:
            appendix.extraId = attatchment.formMessage.extraId || attatchment.formMessage.formId;
            appendix.form = attatchment.formMessage.form;
            break;
        }
        appendixList.push({ ...appendix, id: attatchment.id });
      });
      return appendixList;
    },
    resolveAppendixList(appendixList) {
      const attachments = [];
      appendixList.forEach((appendix) => {
        const attach = {};
        attach.msgtype = appendix.mediaType;
        switch (String(appendix.mediaType)) {
          case MEDIA_TYPE_POSTER:
            attach.imageMessage = {
              pic_url: appendix.materialUrl,
              title: appendix.materialName
            };
            break;
          case MEDIA_TYPE_IMGLINK:
            attach.linkMessage = {
              desc: appendix.digest,
              picurl: appendix.coverUrl,
              title: appendix.materialName,
              url: appendix.materialUrl
            };
            break;
          case MEDIA_TYPE_VIDEO:
            attach.videoDTO = {
              title: appendix.materialName,
              videoUrl: appendix.materialUrl,
              size: appendix.content,
              coverUrl: appendix.coverUrl
            };
            break;
          case MEDIA_TYPE_FILE:
            attach.fileDTO = {
              fileUrl: appendix.materialUrl,
              title: appendix.materialName
            };
            break;
          case MEDIA_TYPE_MINIAPP:
            attach.miniprogramMessage = {
              appid: appendix.appid,
              accountOriginalId: appendix.accountOriginalId,
              page: appendix.materialUrl,
              picUrl: appendix.coverUrl,
              title: appendix.materialName
            };
            break;
          case MEDIA_TYPE_RADARLINK:
            attach.radarMessage = {
              radarId: appendix.extraId,
              linkTitle: appendix.radarTitle
            };
            break;
          case MEDIA_TYPE_SMARTFORM:
            attach.formMessage = {
              formId: appendix.extraId,
              // 新增时无form 编辑时有form
              linkTitle: appendix.formName || appendix.form.formName
            };
        }
        attachments.push(attach);
      });
      return attachments;
    },
    submit() {
      this.loading = true;
      const form = JSON.parse(JSON.stringify(this.form));
      Promise.resolve()
        .then(() => {
          form.attachments = this.resolveAppendixList(this.appendixList);
          const attachmentType = form.attachments.map((attach) => attach.msgtype).join(',');
          if (form.textMessage.content) {
            form.messageType = '4';
            if (attachmentType) {
              form.messageType += ',' + attachmentType;
            }
          } else {
            if (attachmentType) {
              form.messageType = attachmentType;
            } else {
              this.msgInfo('请填写群发内容');
              changeButtonLoading(this.$store, 'submit');
              return Promise.reject();
            }
          }
          if (
            form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP &&
            form.pushRange === GROUP_MESSAGE_PUSH_RANGE_SOME &&
            this.groupOwner.length === 0
          ) {
            changeButtonLoading(this.$store, 'submit');
            this.msgInfo('请设置发送范围');
            return Promise.reject();
          }
          if (form.pushTime === GROUP_MESSAGE_PUSH_TIME_NOW) {
            form.settingTime = '';
            delete form.pushTime;
          } else if (!form.settingTime) {
            changeButtonLoading(this.$store, 'submit');
            this.msgInfo('请设置发送时间');
            return Promise.reject();
          }
          if (form.addTime && form.addTime.length > 1) {
            form.customerStartTime = form.addTime[0];
            form.customerEndTime = form.addTime[1];
            delete form.addTime;
          }
          // debugger
          form.tag = form.tag.map((d) => d.tagId) + '';
          form.filterTags = form.filterTags.map((d) => d.tagId) + '';
          const filterDepartments = [];
          const filterUsers = [];
          this[form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? 'filterGroupUsers' : 'filterUsers'].forEach((d) => {
            d.userId && filterUsers.push(d.userId);
            d.id && filterDepartments.push(d.id);
          });
          form.filterDepartments = filterDepartments.join(',');
          form.filterUsers = filterUsers.join(',');
          form.staffId = [];
          let departmentList = [];
          let staffIdList = [];
          this[this.form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? 'groupOwner' : 'userParty'].map((d) => {
            d.userId && staffIdList.push(d.userId);
            d.id && departmentList.push(d.id);
          });
          departmentList += '';
          staffIdList += '';
          form.department = departmentList;
          form.staffId = staffIdList;
          return form.messageId ? update(form) : add(form);
        })
        .then(({ data }) => {
          changeButtonLoading(this.$store, 'submit');
          this.msgSuccess('操作成功');
          this.loading = false;
          // 路由跳转前设置change为false,在requestbutton中不起作用是因为点击按钮之后又触发了组件的更新，导致change又变为true
          window.sessionStorage.setItem('change', false);
          this.$router.push('record');
        })
        .catch(() => {
          changeButtonLoading(this.$store, 'submit');
          this.loading = false;
        });
    },
    showSelectTagDialog(type) {
      this.selectTagType = type;
      this.dialogVisibleSelectTag = true;
    },
    deleteOneSelectTag(type, tag) {
      const tags = [...this.form[type]];
      const index = tags.findIndex((tag_) => tag_.tagId === tag.tagId);
      tags.splice(index, 1);
      this.form[type] = tags;
    },
    previewSendSize() {
      const params = {
        ...this.form,
        staffId: [],
        department: [],
        filterUsers: [],
        filterDepartments: []
      };
      const form = { ...this.form };
      if (form.addTime && form.addTime.length > 1) {
        params.customerStartTime = form.addTime[0];
        params.customerEndTime = form.addTime[1];
      }
      params.tag = form.tag.map((d) => d.tagId) + '';
      params.filterTags = form.filterTags.map((d) => d.tagId) + '';
      this[form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? 'filterGroupUsers' : 'filterUsers'].forEach((d) => {
        d.userId && params.filterUsers.push(d.userId);
        d.id && params.filterDepartments.push(d.id);
      });
      this[form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? 'groupOwner' : 'userParty'].map((d) => {
        d.userId && params.staffId.push(d.userId);
        d.id && params.department.push(d.id);
      });
      params.department += '';
      params.staffId += '';
      params.filterUsers += '';
      params.filterDepartments += '';
      getSendSize(params).then((res) => {
        this.sendSize = res.data;
      });
    },
    selectUser(type) {
      this.selectUserType = type;
      this.dialogVisibleSelectUser = true;
    }
  }
};
</script>

<template>
  <div v-loading="loading">
    <NoConfigInfo
      :alert-style="'margin-bottom: 15px;'"
      :config-keys="['contactSecret', 'customSecret']"
      page-title="进行企业群发"
    />
    <div class="content-wrap">
      <div class="group-info">
        <i class="el-icon-info" />
        <div>
          <div class="info-title">功能说明</div>
          <div class="info-desc">管理员创建企业群发消息后，员工收到任务通知，确认操作后才发送给相关客户或客户群。</div>
        </div>
      </div>
      <div class="flex">
        <el-form ref="form" style="margin-right: 170px" :model="form" :rules="rules" label-width="80px">
          <div class="form-base-wrap">
            <div class="base-title">基础设置</div>
            <div class="base-content">
              <el-alert
                :style="'width: 550px;'"
                title="每个客户/客户群每天只能收到1条群发消息，超过上限将无法再收到群发消息"
                type="warning"
                :closable="false"
              />
              <el-form-item label="任务名称" prop="taskName" label-width="68px">
                <el-input v-model="form.taskName" maxlength="32" show-word-limit placeholder="填写任务名称，方便管理" />
              </el-form-item>
              <el-form-item label="群发类型" prop="pushType" label-width="68px" style="padding: 0">
                <el-radio-group v-model="form.pushType">
                  <el-radio v-for="dict in statusOptions" :key="dict.value" :label="dict.value">{{
                    dict.label
                  }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="发送范围" prop="pushRange" label-width="68px" style="padding: 0">
                <el-radio-group v-model="form.pushRange">
                  <el-radio v-for="dict in rangeOptions" :key="dict.value" :label="dict.value">{{
                    dict.label + (form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? '群' : '')
                  }}</el-radio>
                </el-radio-group>
                <div v-show="form.pushRange === GROUP_MESSAGE_PUSH_RANGE_SOME" class="form-range-area">
                  <el-alert
                    :style="'width: 408px;margin-top:0;'"
                    title="给同时满足以下条件的对象群发"
                    type="warning"
                    :closable="false"
                  />
                  <el-form-item
                    v-show="form.pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER"
                    label="性别"
                    prop="gender"
                    label-width="68px"
                    style="padding: 0"
                  >
                    <el-radio-group v-model="form.gender">
                      <el-radio v-for="dict in genderOptions" :key="dict.value" :label="dict.value">{{
                        dict.label
                      }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item
                    v-show="form.pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER"
                    label="客户标签"
                    label-width="68px"
                    style="padding: 8px 0"
                  >
                    <el-button icon="el-icon-plus" @click="showSelectTagDialog('tag')">添加标签</el-button>
                    <el-tag
                      v-for="(unit, unique) in form.tag"
                      :key="unique"
                      type="info"
                      closable
                      @close="deleteOneSelectTag('tag', unit)"
                    >{{ unit.name }}</el-tag>
                  </el-form-item>
                  <el-form-item
                    v-show="form.pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER"
                    label="添加时间"
                    label-width="68px"
                    style="padding: 10px 0"
                  >
                    <el-date-picker
                      v-model="form.addTime"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      style="width: 320px"
                      value-format="yyyy-MM-dd"
                    />
                  </el-form-item>
                  <el-form-item
                    :label="form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? '群主' : '所属员工'"
                    :label-width="form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? '48px' : '68px'"
                    style="padding: 10px 0 0"
                  >
                    <el-button icon="el-icon-plus" @click="selectUser(form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? 'groupOwner' : 'userParty')">{{
                      (form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? groupOwner : userParty).length === 0 ? '添加成员' : '修改成员'
                    }}</el-button>
                    <el-tag v-for="(unit, unique) in form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? groupOwner : userParty" :key="unique" class="user-tag">
                      <TagUserShow :name="unit.name" :show-icon="!unit.userId" />
                    </el-tag>
                  </el-form-item>
                  <el-divider />
                  <el-alert
                    :style="'width: 408px;margin-top:0;'"
                    title="在满足上述条件的对象中，过滤符合以下任一条件的对象"
                    type="warning"
                    :closable="false"
                  />
                  <el-form-item
                    :label="form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? '过滤群主' : '过滤员工'"
                    label-width="68px"
                    style="padding: 8px 0"
                  >
                    <el-button icon="el-icon-plus" @click="selectUser(form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? 'filterGroupUsers' : 'filterUsers')">{{
                      (form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? filterGroupUsers : filterUsers).length === 0 ? '添加成员' : '修改成员'
                    }}</el-button>
                    <el-tag v-for="(unit, unique) in form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? filterGroupUsers : filterUsers" :key="unique" class="user-tag">
                      <TagUserShow :name="unit.name" :show-icon="!unit.userId" />
                    </el-tag>
                  </el-form-item>
                  <el-form-item
                    v-show="form.pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER"
                    label="过滤标签"
                    label-width="68px"
                    style="padding: 8px 0"
                  >
                    <el-button icon="el-icon-plus" @click="showSelectTagDialog('filterTags')">添加标签</el-button>
                    <el-tag
                      v-for="(unit, unique) in form.filterTags"
                      :key="unique"
                      type="info"
                      closable
                      @close="deleteOneSelectTag('filterTags', unit)"
                    >{{ unit.name }}</el-tag>
                  </el-form-item>
                  <div v-if="form.pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER" class="filter-tips">若客户包含任一过滤标签，则不会收到本次群发消息</div>
                </div>
              </el-form-item>
              <el-form-item label="发送时间" prop="pushTime" label-width="68px" style="padding: 0">
                <el-radio-group v-model="form.pushTime">
                  <el-radio v-for="dict in timeOptions" :key="dict.value" :label="dict.value">{{
                    dict.label
                  }}</el-radio>
                </el-radio-group>
                <el-form-item v-if="form.pushTime === GROUP_MESSAGE_PUSH_TIME_SET" prop="settingTime">
                  <el-date-picker
                    v-model="form.settingTime"
                    style="width: 225px"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    type="datetime"
                    placeholder="选择发送时间"
                  />
                </el-form-item>
              </el-form-item>
            </div>
          </div>
          <div class="form-base-wrap">
            <div class="base-title">群发内容</div>
            <div class="base-content group-content-text">
              <el-form-item label="发送内容" label-width="80px">
                <el-input
                  v-model="form.textMessage.content"
                  type="textarea"
                  maxlength="2000"
                  show-word-limit
                  :autosize="{ minRows: 10, maxRows: 50 }"
                  placeholder="请输入"
                />
                <AddAppendixBtn
                  :sub-title="subTitle"
                  :limit-select-length="limitSelectLength"
                  :appendix-list.sync="appendixList"
                />
              </el-form-item>
            </div>
          </div>
          <div class="form-base-wrap">
            <div class="base-title">发送统计</div>
            <div class="base-content stat-content" style="color: #999">
              预计收到群发的客户{{ form.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? '群' : '数' }}：
              <el-button v-if="sendSize === undefined" type="text" @click="previewSendSize">统计</el-button>
              <span v-if="sendSize !== undefined" class="theme-text-color">{{ sendSize }}</span>
              <el-button v-if="sendSize !== undefined" type="text" icon="el-icon-refresh" @click="previewSendSize" />
            </div>
          </div>
        </el-form>
        <!-- 预览 -->
        <PhoneDialog :message="form.textMessage.content" :msg-list="appendixList" />
      </div>
      <div class="group-btn-wrapper">
        <RequestButton type="primary" :request-method="submit" button-type="submit">通知员工执行群发</RequestButton>
      </div>

      <!-- 选择添加人弹窗 -->
      <SelectUser
        :visible.sync="dialogVisibleSelectUser"
        :title="selectUserType === 'groupOwner' ? '选择群主' : '选择员工'"
        :is-only-leaf="false"
        :selected-user-list="selectUserList"
        @success="selectedUser"
      />

      <!-- 选择标签弹窗 -->
      <SelectTag
        :visible.sync="dialogVisibleSelectTag"
        title="选择标签"
        type="search"
        info-msg="筛选出被打上选中标签的客户，进行群发"
        :selected="form[selectTagType]"
        @success="submitSelectTag"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
/deep/ .el-divider--horizontal {
  margin-top: 12px;
  margin-bottom: 10px;
}
.group-info {
  background: #f4f4f5;
  display: flex;
  align-items: center;
  color: #909399;
  height: 58px;
  width: 100%;
  padding-left: 16px;
  margin-bottom: 20px;
  i {
    font-size: 28px;
    transform: rotate(-15deg);
    margin-right: 8px;
  }
  .info-title {
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: 700;
  }
  .info-desc {
    font-size: 12px;
  }
}
.form-base-wrap {
  margin-bottom: 20px;
  .base-title {
    color: #101010;
    padding-left: 15px;
    font-size: 14px;
    line-height: 20px;
    border-left: 3px solid $baseColor;
    @include border_style($width: 3px, $direction: left);
  }
  .base-content {
    padding-left: 15px;
    .el-form-item {
      width: 498px;
      display: flex;
      padding: 10px 0;
      .el-form-item {
        width: 408px;
      }
      &:hover {
        background: none;
      }
      /deep/ .el-form-item__content {
        flex: 1;
        padding-top: 2px;
        margin-top: -3px;
        margin-left: unset !important;
      }
      /deep/ textarea {
        min-height: 96px !important;
        height: 96px !important;
        width: 430px;
      }
    }
  }
  .el-alert {
    margin-top: 15px;
    /deep/ .el-alert__title {
      font-size: 12px;
    }
  }
  .el-tag {
    margin-right: 10px;
    height: 28px;
    line-height: 28px;
    border-radius: 4px;
    background-color: #f0f8f7;
    @include text_btn_color($color-theme2-1);
    font-size: 12px;
    border: 1px solid #e1f0ee;
    /deep/ .el-tag__close {
      @include text_btn_color($color-theme2-1);
      background-color: transparent;
    }
  }
}
.group-content-text {
  .el-form-item {
    width: 508px !important;
  }
  /deep/ .el-form-item__label::before {
    content: '*';
    color: #f00;
    padding-right: 3px;
  }
}
.form-range-area {
  border: 1px solid #d9d9d9;
  padding: 10px;
  .el-button {
    margin-right: 10px;
    height: 28px;
    padding: 0 15px;
  }
  .el-form-item {
    align-items: center;
  }
}
.stat-content {
  margin-top: 5px;
  span {
    font-size: 14px;
  }
  /deep/ .el-icon-refresh {
    color: #666;
    font-size: 16px;
    margin-top: -3px;
  }
}
.group-btn-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 48px;
  line-height: 20px;
  text-align: center;
  border-top: 1px solid rgba(238, 238, 238, 100);
  padding-top: 8px;
}
.small-tip {
  font-size: 12px;
  color: #999;
  margin-left: 12px;
}
.content-wrap {
  position: relative;
  height: 100%;
  background: #ffffff;
  border-radius: 10px;
  padding: 20px 20px 48px;
  display: flex;
  flex-direction: column;
  .flex {
    flex: 1;
    overflow-y: auto;
  }
  /deep/ .el-form-item__content {
    max-width: 500px;
  }
  .send-range {
    display: flex;
    align-items: center;
    /deep/ .el-form-item__content {
      margin-left: 0 !important;
    }
  }
  /deep/ form textarea {
    border-radius: 4px 4px 0 0;
    max-width: 500px;
  }
}
.content-left {
  position: relative;
  .create {
    position: absolute;
    right: 10px;
    top: 14px;
    z-index: 1;
  }

  .el-tabs {
    height: 90%;
    border-radius: 8px;
    padding: 10px;
  }
}
.input-wrap {
  width: 240px;
  display: inline-flex;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  align-items: center;
  padding: 0 15px;
  overflow: hidden;
  height: 32px;
  .placeholder {
    color: #bbb;
    font-size: 14px;
  }
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
.filter-tips {
  color: #999;
  font-size: 12px;
  height: 14px;
  line-height: 14px;
  margin-left: 68px;
}
</style>
