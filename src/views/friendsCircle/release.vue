<!--
 * @Description: 发布朋友圈
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import SelectUser from '@/components/SelectUser/index.vue';
import SelectTag from '@/components/SelectTag';
import TagUserShow from '@/components/TagUserShow';
import {
  PAGE_LIMIT, MEDIA_TYPE, RADAR_TYPE, MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_VIDEO, DEFAULT_IMG, CUSTOM_LINK, DEFAULT_LINK, LINK_TITLE_MAXLENGTH, LINK_CONTENT_MAXLENGTH, MEDIA_TYPE_RADARLINK
} from '@/utils/constant/index';
import MaterialListDrawer from '@/components/MaterialListDrawer';
import VerbalTrickImgLink from './Link.vue';
import { getList } from '@/api/material';
import MaterialAddModal from '@/views/material/components/MaterialAddModal';
import UploadVideo from './UploadVideo.vue';
import Uploadimg from './Uploadimg.vue';
import FriendsUpload from './friendsUpload.vue';
import { getWordsUrlContent } from '@/api/wordsGroup';
import { createFriendsCircle, updateMoment, getMomentTaskBasicInfo } from '@/api/friends';
import { changeButtonLoading, groupByScopeType, checkChange } from '@/utils/common';
// import { getRadaList } from '@/api/radar';
import moment from 'moment';
// 朋友圈为图片时，素材库显示的title最大选取数量
const MAX_APPENDIX_NUM = 9;
// 朋友圈为视频或者链接时，素材库显示的title最大选取数量
const MAX_APPENDIX_VIDEO_NUM = 1;
const FILE_NAME_LENGTH = 100;
const FRIENDSCIRCLE = 'friendscircle';
// 来自素材库
const FROM_MATERIAL = 2;
export default {
  components: { SelectTag, SelectUser, MaterialListDrawer, VerbalTrickImgLink, FriendsUpload, MaterialAddModal, UploadVideo, Uploadimg, RequestButton, TagUserShow },
  props: {},
  data() {
    return {
      LINK_TITLE_MAXLENGTH,
      LINK_CONTENT_MAXLENGTH,
      DEFAULT_LINK,
      CUSTOM_LINK,
      FROM_MATERIAL,
      RADAR_TYPE,
      DEFAULT_IMG,
      FRIENDSCIRCLE,
      // 当前屏蔽朋友圈 但是需要传递radarQuery 否则会当作空对象 打开素材库的时候为null
      radarQuery: {
        type: '',
        searchTitle: '',
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      // 文件名字限制
      limitFileName: FILE_NAME_LENGTH,
      loading: false,
      // 设置视频选项时上传的组件接收的能够选择的值
      CHOSEVIDEO: '.mp4',
      // 朋友圈内容 图片、视频、链接 MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_VIDEO
      momentsContent: MEDIA_TYPE_POSTER,
      // 朋友圈链接类型为默认还是自定义
      isDefined: DEFAULT_LINK,
      subTitle: '已添加 0 个附件，还可选择 9 个', // 素材库选择弹窗子标题
      // 表单参数
      form: {
        // 发布类型（0：企业 1：个人）
        type: 0,
        // 可见范围（0：全部 1：部分）
        pushRange: 0,
        // 发布时间（0：立即发送 1：定时发送）
        taskType: 0,
        tags: [],
        sendTime: '',
        text: {
          content: '' // '消息文本内容，最多2000个字节',
        },
        attachments: [],
        users: []
      },
      // 链接信息
      link: {},
      rules: {},
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
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE,
      MEDIA_TYPE_RADARLINK,
      appendixType: MEDIA_TYPE_POSTER,
      showAppendixAddModal: false,
      materialForm: {}, // 素材表单
      total: 0,
      isLoadingMaterial: true,
      limitSelectLength: MAX_APPENDIX_NUM,
      isOperatingMaterial: false,
      materialType: MEDIA_TYPE_POSTER,
      selectTagType: 'tags',
      // 判断在详情页点击的是编辑还是复制
      from: 'copy',
      momentTaskId: '',
      chooseMaterial: false,
      userAndDepartmentList: []
    };
  },
  computed: {
    // 是否显示选择的客户标签
    isOnlyTag() {
      return this.form.tag[0] && this.form.type === 0;
    },
    categoryId() {
      return this.$store.state.materialInfo?.categoryInfo[this.appendixType]?.id;
    }
  },
  watch: {
    // 监听朋友圈内容的改变，改变在素材库添加素材时的类型
    momentsContent(val) {
      this.query.mediaType = val;
      this.materialType = val;
      this.appendixType = val;
      if (val === MEDIA_TYPE_IMGLINK) {
        this.query.mediaType = MEDIA_TYPE_POSTER;
        this.materialType = MEDIA_TYPE_POSTER;
        this.appendixType = MEDIA_TYPE_POSTER;
      }
    },
    isDefined(val) {
      if (val === FROM_MATERIAL) {
        this.form.attachments = [];
        this.link = {};
        this.materialType = MEDIA_TYPE_IMGLINK;
        this.chooseMaterial = true;
        this.dialogVisibleSelectMaterial = true;
      } else {
        this.chooseMaterial = false;
        this.materialType = MEDIA_TYPE_POSTER;
      }
    },
    chooseMaterial(val) {
      this.link = {};
      this.form.attachments = [];
    },
    form: {
      deep: true,
      handler: function() {
        this.subTitle = this.momentsContent === MEDIA_TYPE_POSTER ? `已添加 ${this.form.attachments.length} 个附件，还可选择 ${MAX_APPENDIX_NUM - this.form.attachments.length} 个`
          : `已添加 ${this.form.attachments.length} 个附件，还可选择 ${MAX_APPENDIX_VIDEO_NUM - this.form.attachments.length} 个`;
      }
    }
  },
  beforeUpdate() {
    // 未修改之前的值 原始值
    const oldVal = {
      ...this.$options.data().form,
      momentsContent: this.$options.data().momentsContent
    };
    // 修改之后的值
    const newVal = {
      ...this.form,
      momentsContent: this.momentsContent
    };
    checkChange(oldVal, newVal);
  },
  created() {},
  mounted() {
    // 在编辑和复制时，为data中数据初始化赋值
    if (Object.keys(this.$route.query).length !== 0) {
      this.loading = true;
      this.from = this.$route.query.from;
      // 处理朋友圈id
      this.momentTaskId = this.$route.query.momentTaskId;
      getMomentTaskBasicInfo({ momentTaskId: this.$route.query.momentTaskId }).then(({ data }) => {
        // 处理标签
        const { pushRange, content, type, taskType, sendTime, mediaType, useDepartmentList, useUserList } = data;
        const departmentList = useDepartmentList?.map((item) => {
          item.name = item.departmentName;
          item.id = item.departmentId;
          return item;
        });
        const userList = useUserList?.map((item) => {
          item.name = item.userName;
          return item;
        });
        this.userAndDepartmentList = [...departmentList || [], ...userList || []];
        if (data.tagList) {
          this.form.tags = data.tagList;
        }
        // 处理form中其他数据
        this.form.text.content = content;
        this.form = {
          ...this.form,
          pushRange: pushRange,
          type: type,
          taskType: taskType,
          sendTime: sendTime
        };
        // 处理附件
        this.momentsContent = String(mediaType);
        switch (mediaType) {
          case Number(MEDIA_TYPE_POSTER):
            this.form.attachments = data.weWordsDetailList;
            break;
          case Number(MEDIA_TYPE_VIDEO):
            this.form.attachments.push(data.weWordsDetailList[0]);
            break;
          case Number(MEDIA_TYPE_IMGLINK):
            // eslint-disable-next-line no-case-declarations
            const { coverUrl, title, url, isDefined } = data.weWordsDetailList[0];
            this.isDefined = isDefined;
            this.link = {
              coverUrl: coverUrl,
              title: title,
              addressUrl: url,
              url: coverUrl,
              from: 'edit'
            };
            this.form.attachments.push(data.weWordsDetailList[0]);
            break;
        }
        this.loading = false;
      });
    }
    this.getMaterialList({ mediaType: this.materialType });
  },
  methods: {
    // 点击链接清除的输入框之后触发的方法
    clear() {
      if (this.isDefined === DEFAULT_LINK) {
        this.link = {};
        this.form.attachments = [];
      } else {
        this.link.url = '';
      }
    },
    /**
    * 输入链接后获取链接的标题、封面信息
    */
    async sendWordsUrl() {
      if (this.link.addressUrl) {
        getWordsUrlContent({ url: this.link.addressUrl }).then(res => {
          // 定义一个数字作为截取字符串的长度
          const IMG_FORMAT_LENGTH = 4;
          // 图片类型
          const IMG_TYPE = res.data.image.substring((res.data.image.length - IMG_FORMAT_LENGTH), res.data.image.length);
          // 如果图片路径不为空判断是否时.png 或者.jpg
          const IMG_IS_URL = (res.data.image !== null && res.data.isUrl && (IMG_TYPE === '.png' || IMG_TYPE === '.jpg'));
          this.link = {
            ...this.link,
            coverUrl: IMG_IS_URL ? res.data.image : DEFAULT_IMG.link
          };
          this.$set(this.link, 'title', res.data?.title?.substring(0, LINK_TITLE_MAXLENGTH));
          this.form.attachments[0] = this.link;
          this.form.attachments[0].url = this.link.coverUrl;
          this.form.attachments[0].mediaType = Number(MEDIA_TYPE_IMGLINK);
        });
      }
    },
    // 朋友圈内容改变
    changeMomentsContent() {
      // 将要上传的图片的数组设置为空
      this.form.attachments = [];
      this.link = {};
    },
    // 接受图片上传之后的数组
    getType(params) {
      // 当传过来的是链接的时候
      this.form.attachments = params;
      if (this.momentsContent === MEDIA_TYPE_IMGLINK) {
        this.link.coverUrl = params[0].url;
        this.link.url = params[0].url;
      }
    },
    // 删除图片
    deleteFileList(params) {
      this.form.attachments = params;
      this.link.coverUrl = null;
      this.link.url = null;
    },
    // 打开素材
    openMaterial(params) {
      this.dialogVisibleSelectMaterial = params;
    },
    // 选择添加人确认按钮
    selectedUser(users) {
      this.userAndDepartmentList = users;
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
    submit() {
      this.loading = true;
      // 在自定义链接从本地上传封面的处理
      let form = JSON.parse(JSON.stringify(this.form));
      if (this.from === 'edit') {
        form.momentTaskId = this.momentTaskId;
      }
      delete form.from;
      Promise.resolve()
        .then(() => {
          if (form.pushRange === 1) {
            if (!this.userAndDepartmentList.length && Number(!!form.tags?.length) === 0) {
              this.msgInfo('请设置可见范围');
              changeButtonLoading(this.$store, 'submit');
              return Promise.reject();
            }
          }
          if (form.taskType === 1) {
            if (form.sendTime === '') {
              this.msgInfo('请设置发布时间');
              changeButtonLoading(this.$store, 'submit');
              return Promise.reject();
            } else {
              if (moment.now() > new Date(form.sendTime).getTime()) {
                this.msgInfo('发布时间不能小于当前时间');
                changeButtonLoading(this.$store, 'submit');
                return Promise.reject();
              }
            }
          }
          if (this.momentsContent === MEDIA_TYPE_IMGLINK) {
            if (Object.keys(this.link).length === 0 && this.form.text.content === '') {
              this.msgInfo('请设置朋友圈内容');
              changeButtonLoading(this.$store, 'submit');
              return Promise.reject();
            }
            if (Object.keys(this.link).length !== 0) {
              if (!this.link.addressUrl) {
                this.msgInfo('请填写链接访问地址');
                return Promise.reject();
              }
              if (!this.link.title) {
                this.msgInfo('请填写链接标题');
                return Promise.reject();
              }
              if (!this.link.coverUrl) {
                this.msgInfo('请上传封面');
                return Promise.reject();
              }
              changeButtonLoading(this.$store, 'submit');
            }
            this.link.mediaType = Number(MEDIA_TYPE_IMGLINK);
            // this.link.mediaType = this.isDefined === FROM_MATERIAL ? Number(MEDIA_TYPE_RADARLINK) : Number(MEDIA_TYPE_IMGLINK);
            form.attachments[0] = this.link;
            this.form.attachments[0] = this.link;
            // 在提交时将链接类型设置到附件里
            this.form.attachments[0].isDefined = this.isDefined;
          }
          form.attachments.forEach(function(item) {
            // 当为图片附件时删除无用的属性
            delete item.status;
            delete item.uid;
            delete item.percentage;
            delete item.raw;
            if (item.mediaType === Number(MEDIA_TYPE_POSTER)) {
              delete item.size;
              delete item.name;
            } if (item.mediaType === Number(MEDIA_TYPE_IMGLINK)) {
              item.url = item.addressUrl;
            }
          });
          form = this.dealUserDepAndTag(form);
          return form.momentTaskId ? updateMoment(form) : createFriendsCircle(form);
        }).then(() => {
          changeButtonLoading(this.$store, 'submit');
          this.msgSuccess('操作成功');
          this.loading = false;
          // 路由跳转前设置change为false,在requestbutton中不起作用是因为点击按钮之后又触发了组件的更新，导致change又变为true
          window.sessionStorage.setItem('change', false);
          this.$router.push('record');
        }).catch(() => {
          changeButtonLoading(this.$store, 'submit');
          this.loading = false;
        });
    },
    dealUserDepAndTag(form) {
      if (this.userAndDepartmentList && this.userAndDepartmentList.length > 0) {
        const allListObj = groupByScopeType(this.userAndDepartmentList);
        form.departments = allListObj.useDepartmentList.map(item => item.id);
        form.users = allListObj.useEmployeesList.map(item => item.userId);
      } else {
        form.departments = [];
        form.users = [];
      }
      form.tags = form.tags && form.tags.map((k) => k.tagId);
      return form;
    },
    // 获取素材列表
    getMaterialList(params) {
      this.isLoadingMaterial = true;
      // if (params.mediaType !== MEDIA_TYPE_RADARLINK) {
      getList({
        ...this.query,
        ...params
      }).then(res => {
        this.materialList = res.rows;
        this.total = Number(res.total);
        this.isLoadingMaterial = false;
      });
      // } else {
      // getRadaList(this.radarQuery).then(res => {
      //   const newArr = res.rows.map((item) => {
      //     return {
      //       // 链接标题
      //       title: item.weRadarUrl.title,
      //       // 链接摘要
      //       content: item.weRadarUrl.content,
      //       // 链接封面
      //       coverUrl: item.weRadarUrl.coverUrl,
      //       // 链接URL
      //       url: item.weRadarUrl.url,
      //       // 雷达标题
      //       radarTitle: item.radarTitle,
      //       radarId: item.radarId,
      //       tagList: item.radarTagList,
      //       mediaType: +MEDIA_TYPE_RADARLINK,
      //       categoryId: this.$store.state.materialInfo?.categoryInfo[+MEDIA_TYPE_RADARLINK]?.id || '',
      //       tagIdList: item.radarTagList
      //     };
      //   });
      //   this.materialList = newArr;
      //   this.total = Number(res.total);
      //   this.isLoadingMaterial = false;
      // });
      // }
    },
    // 选择素材
    handleAddApendixList(list) {
      // 上传的最大图片和视频的数量 图片为9 视频为1 链接封面为1 雷达为1
      let MAX = 9;
      if (this.momentsContent !== MEDIA_TYPE_POSTER) {
        MAX = 1;
      }
      if (list.length + this.form.attachments.length <= MAX) {
        // 将素材选择的照片视频处理后
        const newArr = list.map((item) => {
          const itemList = {};
          itemList.url = item.materialUrl;
          if (this.momentsContent === MEDIA_TYPE_VIDEO) {
            itemList.title = item.materialName;
            itemList.mediaType = item.mediaType;
            itemList.size = item.content;
          } else if (this.momentsContent === MEDIA_TYPE_IMGLINK) {
            this.link.mediaType = this.isDefined === FROM_MATERIAL ? Number(MEDIA_TYPE_RADARLINK) : Number(MEDIA_TYPE_IMGLINK);
            if (this.isDefined === FROM_MATERIAL) {
              this.link.coverUrl = item.coverUrl;
              this.link.url = item.url || item.materialUrl;
              this.link.title = item.materialName;
              this.link.addressUrl = item.url || item.materialUrl;
              if (item.mediaType === Number(MEDIA_TYPE_RADARLINK)) {
                this.link.extraId = item.extraId;
              }
              return;
            }
            this.link.coverUrl = item.materialUrl;
            this.link.url = item.materialUrl;
          } else {
            itemList.title = item.materialName;
            itemList.mediaType = item.mediaType;
          }
          return itemList;
        });
        this.form.attachments.push(...newArr);
      } else {
        if (this.momentsContent === MEDIA_TYPE_POSTER) {
          this.msgWarn(`上传海报不能超过${MAX}个！请重新选择`);
        } else {
          if (this.isDefined === FROM_MATERIAL) {
            this.msgWarn('只允许添加一个链接');
          } else {
            this.msgWarn(this.momentsContent === MEDIA_TYPE_IMGLINK ? '只允许添加一张封面图片' : '只允许添加一个视频');
          }
        }
      }
    },
    // 添加素材
    handleAddMaterial(data, type) {
      this.isOperatingMaterial = true;
      this.showAppendixAddModal = true;
      this.appendixType = type;
      this.materialForm = Object.assign(
        {},
        data || { categoryId: this.categoryId }
      );
      // 清除之前的校验信息
      this.$nextTick(() => {
        this.$refs['materialAddModal']?.$refs?.form?.clearValidate();
      });
    },
    // 标签
    showSelectTagDialog(type) {
      this.selectTagType = type;
      this.dialogVisibleSelectTag = true;
    },
    // 删除客户标签
    deleteOneSelectTag(type, tag) {
      const tags = [...this.form[type]];
      const index = tags.findIndex(tag_ => tag_.tagId === tag.tagId);
      tags.splice(index, 1);
      this.form[type] = tags;
    },
    handleClose(index) {
      this.userAndDepartmentList.splice(index, 1);
    }
  }
};
</script>

<template>
  <div v-loading="loading">
    <div class="content-wrap">
      <div class="group-info">
        <i class="el-icon-info" />
        <div>
          <div class="info-title">功能说明</div>
          <div class="info-desc">管理员统一创建内容，员工收到任务通知，确认操作后发布到朋友圈。</div>
        </div>
      </div>
      <div class="flex">
        <el-form
          ref="form"
          style="margin-right: 170px;"
          :model="form"
          :rules="rules"
          label-width="80px"
        >
          <div class="form-base-wrap">
            <div class="base-title">基础设置</div>
            <div class="base-content">
              <el-alert
                :style="'width: 550px;'"
                type="warning"
                :closable="false"
              >
                <div>1. 每个客户每天可收到员工发表的3条朋友圈，企业发表的4条朋友圈</div>
                <div>2. 员工需在企业微信APP上发表朋友圈，PC端暂不支持</div>
              </el-alert>
              <el-form-item label="发布类型" prop="type" label-width="68px" style="padding:0">
                <el-radio v-model="form.type" :label="0">企业</el-radio>
                <el-radio v-model="form.type" :label="1">个人</el-radio>
              </el-form-item>

              <el-form-item label="可见范围" prop="pushRange" label-width="68px" style="padding:0;">
                <el-radio-group v-model="form.pushRange">
                  <el-radio :label="0">全部客户</el-radio>
                  <el-radio :label="1">部分客户</el-radio>
                </el-radio-group>
                <div v-if="form.pushRange === 1" class="form-range-area">
                  <el-form-item v-if="form.pushRange === 1" label="客户标签" label-width="68px" style="padding:8px 0;">
                    <el-button icon="el-icon-plus" @click="showSelectTagDialog('tags')">添加标签</el-button>
                    <el-tag
                      v-for="(unit, unique) in form.tags"
                      :key="unique"
                      class="theme-text-color"
                      type="info"
                      closable
                      @close="deleteOneSelectTag('tags', unit)"
                    >{{ unit.name }}</el-tag>
                  </el-form-item>
                  <el-form-item v-if="form.pushRange === 1" label="所属员工" label-width="68px" style="padding:8px 0;">
                    <el-button icon="el-icon-plus" @click="dialogVisibleSelectUser = true">{{ userAndDepartmentList.length === 0 ? '添加成员' : '修改成员' }}</el-button>
                    <el-tag
                      v-for="(unit, unique) in userAndDepartmentList"
                      :key="unique"
                      closable
                      class="theme-text-color user-tag iaic"
                      @close="handleClose(unique)"
                    >
                      <TagUserShow :name="unit.name" :show-icon="!unit.userId" />
                    </el-tag>
                  </el-form-item>
                </div>
              </el-form-item>
              <el-form-item label="发送时间" prop="taskType" label-width="68px" style="padding:0;">
                <el-radio-group v-model="form.taskType">
                  <el-radio :label="0">立即发布</el-radio>
                  <el-radio :label="1">定时发布</el-radio>
                </el-radio-group>
                <el-form-item v-if="form.taskType === 1" prop="sendTime">
                  <el-date-picker
                    v-model="form.sendTime"
                    style="width: 225px"
                    value-format="yyyy-MM-dd HH:mm"
                    type="datetime"
                    placeholder="选择发送时间"
                  />
                </el-form-item>
              </el-form-item>
            </div>
          </div>
          <div class="form-base-wrap">
            <div class="base-title">朋友圈内容</div>
            <div class="base-content group-content-text">
              <el-form-item>
                <el-input
                  v-model="form.text.content"
                  type="textarea"
                  maxlength="1000"
                  show-word-limit
                  :autosize="{ minRows: 10, maxRows: 50 }"
                  placeholder="请输入"
                />
                <div class="appendix-box">
                  <el-radio-group v-model="momentsContent" @change="changeMomentsContent">
                    <el-radio :label="MEDIA_TYPE_POSTER">图片</el-radio>
                    <el-radio :label="MEDIA_TYPE_VIDEO">视频</el-radio>
                    <el-radio :label="MEDIA_TYPE_IMGLINK">链接</el-radio>
                  </el-radio-group>
                  <div v-if="momentsContent === MEDIA_TYPE_POSTER">
                    <div>
                      <FriendsUpload
                        class="friendsupload"
                        :upload-list.sync="form.attachments"
                        @getType="getType"
                        @openMaterial="openMaterial"
                        @deleteFileList="deleteFileList"
                      />
                    </div>
                    <div class="momentsContent-tip">只能上传jpg/png文件，且大小不超过10M，尺寸不超过1440×1080</div>
                  </div>
                  <div v-if="momentsContent === MEDIA_TYPE_VIDEO">
                    <UploadVideo
                      :upload-list.sync="form.attachments"
                      @openMaterial="openMaterial"
                      @getType="getType"
                      @deleteFileList="deleteFileList"
                    />
                    <div class="momentsContent-tip">只能上传mp4文件，时长不超过30s，大小不宜超过10M，建议尺寸1280×720</div>
                  </div>
                  <div v-if="momentsContent === MEDIA_TYPE_IMGLINK">
                    <div class="item-div">
                      <el-radio-group v-model="isDefined">
                        <el-radio :label="DEFAULT_LINK">使用链接默认信息</el-radio>
                        <el-radio :label="CUSTOM_LINK">自定义链接信息</el-radio>
                        <!-- <el-radio :label="FROM_MATERIAL">从素材库选取</el-radio> -->
                      </el-radio-group>
                      <div v-if="isDefined === CUSTOM_LINK">
                        <el-form-item label-width="0" prop="url">
                          <el-input
                            v-model="link.addressUrl"
                            placeholder="必填，请填写链接访问地址"
                            :autosize="{minRows: 2, maxRows: 2}"
                            :style="{width: '340px'}"
                            clearable
                            @clear="clear"
                          />
                        </el-form-item>
                        <el-form-item label-width="0" prop="title">
                          <el-input
                            v-model="link.title"
                            type="textarea"
                            placeholder="必填，请填写链接的标题"
                            :maxlength="LINK_TITLE_MAXLENGTH"
                            show-word-limit
                            :autosize="{minRows: 2, maxRows: 2}"
                            :style="{width: '340px'}"
                            clearable
                          />
                        </el-form-item>
                        <Uploadimg
                          :upload-list.sync="form.attachments"
                          @openMaterial="openMaterial"
                          @getType="getType"
                          @deleteFileList="deleteFileList"
                        />
                        <div class="momentsContent-tip">只能上传jpg/png文件，且大小不超过10M，尺寸不超过1440×1080</div>
                        <VerbalTrickImgLink :title="link.title" :cover-url="link.coverUrl" />
                      </div>
                      <div v-if="isDefined === DEFAULT_LINK">
                        <el-form-item label-width="0" prop="url">
                          <el-input
                            v-model="link.addressUrl"
                            placeholder="必填，请填写链接访问地址"
                            :autosize="{minRows: 4, maxRows: 4}"
                            :style="{width: '340px'}"
                            clearable
                            @change="sendWordsUrl"
                            @clear="clear"
                          />
                        </el-form-item>
                        <VerbalTrickImgLink :title="link.title" :cover-url="link.coverUrl" />
                      </div>
                      <!-- <div v-if="isDefined === FROM_MATERIAL">
                        <VerbalTrickImgLink :title="link.title" :cover-url="link.coverUrl" />
                      </div> -->
                    </div>
                  </div>
                </div>
              </el-form-item>
            </div>
          </div>
          <div v-if="form.type === 0" class="form-base-wrap">
            <div class="base-title">操作步骤</div>
            <div class="base-content stat-content">
              企业发表朋友圈操作步骤如下：
              <div class="step">
                <div>1. 管理员创建朋友圈后，员工的企业微信APP收到「客户朋友圈」的消息通知，如图一</div>
                <div class="step-txt">2. 员工点击「客户朋友圈」，进入朋友圈，点击右上角的徽标，如图二</div>
                <div class="step-txt">3. 进入待发表页面，点击“发表”按钮，如图三，实现朋友圈一键发布</div>
              </div>
              <div class="step-img">
                <el-image
                  class="part-img"
                  :src="require('@/assets/image/friends-step3-1.png')"
                  :preview-src-list="[
                    require('@/assets/image/friends-step3-1.png'),
                  ]"
                />
                <i class="el-icon-d-arrow-right" />
                <el-image
                  class="part-img"
                  :src="require('@/assets/image/friends-step3-2.png')"
                  :preview-src-list="[
                    require('@/assets/image/friends-step3-2.png'),
                  ]"
                />
                <i class="el-icon-d-arrow-right" />
                <el-image
                  class="part-img"
                  :src="require('@/assets/image/friends-step3-3.png')"
                  :preview-src-list="[
                    require('@/assets/image/friends-step3-3.png'),
                  ]"
                />
              </div>
            </div>
          </div>
          <div v-else class="form-base-wrap">
            <div class="base-title">操作步骤</div>
            <div class="base-content stat-content">
              个人发表朋友圈操作步骤如下：
              <div class="step">
                <div>1. 管理员创建朋友圈后，员工的企业微信APP收到「联络易助手」的消息通知，如图一</div>
                <div class="step-txt">2. 员工进入「联络易助手」，点击“前往发布”进入详情页，如图二</div>
                <div class="step-txt">3. 如图三，点击“前往发送”按钮，跳转到发表朋友圈页面，根据提示设置可见客户，点击“发表”按钮实现朋友圈发布</div>
              </div>
              <div class="step-img">
                <el-image
                  class="part-img"
                  :src="require('@/assets/image/friendsSelf-step3-1.png')"
                  :preview-src-list="[
                    require('@/assets/image/friendsSelf-step3-1.png'),
                  ]"
                />
                <i class="el-icon-d-arrow-right" />
                <el-image
                  class="part-img"
                  :src="require('@/assets/image/friendsSelf-step3-2.png')"
                  :preview-src-list="[
                    require('@/assets/image/friendsSelf-step3-2.png'),
                  ]"
                />
                <i class="el-icon-d-arrow-right" />
                <el-image
                  class="part-img"
                  :src="require('@/assets/image/friendsSelf-step3-3.jpg')"
                  :preview-src-list="[
                    require('@/assets/image/friendsSelf-step3-3.jpg'),
                  ]"
                />
              </div>
            </div>
          </div>
        </el-form>
      </div>
      <div class="group-btn-wrapper">
        <RequestButton v-hasPermi="['wecom:moments:publish']" type="primary" :request-method="submit" button-type="submit">通知员工发布</RequestButton>
      </div>

      <!-- 选择所属员工弹窗 -->
      <SelectUser
        :visible.sync="dialogVisibleSelectUser"
        title="选择员工"
        :is-only-leaf="false"
        :selected-user-list="userAndDepartmentList"
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

      <!-- 选取素材库 -->
      <MaterialListDrawer
        ref="materialDrawer"
        drawer-title="选择素材"
        :moment="true"
        :moment-type="momentsContent"
        :choose-material="chooseMaterial"
        :visible.sync="dialogVisibleSelectMaterial"
        :list="materialList"
        :get-list="getMaterialList"
        :poster-tool-list="['preview']"
        :imglink-tool-list="['preview']"
        :video-tool-list="['preview']"
        :query.sync="query"
        :radar-query.sync="radarQuery"
        :sub-title="subTitle"
        :type="'select'"
        :total="total"
        :is-loading="isLoadingMaterial"
        :limit-select-length="limitSelectLength"
        :material-type.sync="materialType"
        :show-expire-time="false"
        @submit="handleAddApendixList"
      >
        <template slot="right-btn">
          <div class="right-btn-div">
            <el-button
              v-hasPermi="['wechat:material:add']"
              type="primary"
              @click="handleAddMaterial(null, ~~materialType)"
            >添加{{ MEDIA_TYPE[materialType] }}</el-button>
          </div>
        </template>
      </MaterialListDrawer>
      <!-- 上传海报 -->
      <MaterialAddModal
        ref="saveToMaterial"
        :form.sync="materialForm"
        :type="String(appendixType)"
        :show-material-save="isOperatingMaterial ? false : !materialForm.isAdded"
        :show-material-setting="isOperatingMaterial ? true : materialForm.saveToMaterial"
        :modal-title="'添加'+ MEDIA_TYPE[appendixType]"
        :visible.sync="showAppendixAddModal"
        :get-list="getMaterialList"
        :is-operating-material="isOperatingMaterial"
        @submit="handleAddApendix(appendix)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
// 删除从素材库选取之后右上角的绿色成功箭头
/deep/.el-upload-list__item.is-success .el-upload-list__item-status-label {
  display: none;
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
    margin-bottom: 10px;
  }
  .base-content {
    padding-left: 15px;
    .el-form-item {
      width: 498px;
      display: flex;
      padding: 5px 0;
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
        margin-left: unset!important;;
      }
      /deep/ textarea {
        min-height: 96px!important;
        height: 96px!important;
      }
    }
  }
  .el-alert {
    margin-top: 15px;
    /deep/ .el-alert__title{
      font-size: 12px;
    }
  }
  .el-tag {
    margin-right: 10px;
    height: 28px;
    line-height: 28px;
    border-radius: 4px;
    background-color: #f0f8f7;
    font-size: 12px;
    border: 1px solid #e1f0ee;
    /deep/ .el-tag__close {
      @include text_btn_color($color-theme2-1);
    }
    /deep/ .el-icon-close:hover {
      @include bg_primary_color($color-theme2-1);
      color: #fff;
    }
  }
}
.group-content-text {
  .el-form-item {
    width: 772px!important;
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
  /deep/ .el-form-item__label {
    flex-shrink: 0;
  }
}
.step {
  margin-top: 10px;
  padding: 10px;
  color:#999999;
  font-size: 12px;
  border: 1px solid #DCE0E7;
  background-color: #EFEFEF;
  .step-txt {
    margin-top: 8px;
  }
}
.step-img{
  margin-top: 10px;
  display: flex;
  align-items: center;
  .el-icon-d-arrow-right {
  font-size: 30px;
  display: flex;
  align-items: center;
  color: black;
  margin: 0 20px 0 20px;
}
.part-img {
  width: 250px;
  height: 533px;
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
    max-width: 800px;
  }
}
.appendix-box {
  /deep/ .el-upload-dragger {
    width: 70px;
    height: 70px;
  }
  /deep/ .el-upload--picture-card {
    width: 70px;
    height: 70px;
    line-height: 70px;
  }
  border-radius: 0 0 4px 4px;
  border: 1px solid #dcdfe6;
  border-top: 0;
  padding: 10px 10px 5px;
  width: 100%;
  .momentsContent-tip {
    font-size: 10px;
    color: #AAAAAA;
  }
  .item-div {
      border: 1px solid $borderColor;
      padding: 10px;
      width: 580px;
      margin-top: 10px;
      /deep/ .el-form-item__error {
        position: relative;
      }
      /deep/ .upload-drag-div {
        width: 340px;
      }
      /deep/ .el-input, .el-textarea, .upload-drag-div {
        margin-top: 5px;
      }
      /deep/ .el-input {
        input {
          padding: 0 10px;
        }
      }
      /deep/ .preview-div, .link-preview, /deep/ .appid-preview-div {
          margin-top: 8px;
      }
    }
}
</style>

