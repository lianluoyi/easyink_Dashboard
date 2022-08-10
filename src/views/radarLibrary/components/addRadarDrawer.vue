<!--
 * @Description: 新增雷达侧边栏
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <el-drawer
      :visible.sync="Pvisible"
      :title="`${ radarId ? '编辑' : '新增'}雷达`"
      class="radar-add-drawer"
      :wrapper-closable="false"
    >
      <div class="wrap-body-form drawer-div">
        <el-form
          ref="form"
          :model="form"
          label-width="80px"
          class="form"
          :rules="rules"
        >
          <p class="config-title" style="margin-bottom: 10px">基本设置</p>
          <el-form-item label="雷达标题" prop="radarTitle">
            <el-input
              v-model="form.radarTitle"
              maxlength="32"
              show-word-limit
              placeholder="请填写雷达使用场景，方便标记使用"
              clearable
            />
          </el-form-item>
          <!-- TODO 需要将 素材库链接  话术库链接 雷达库链接抽离出来成单个组件 -->
          <el-form-item label="雷达链接" prop="radarLink">
            <div class="content-item">
              <div class="item-div">
                <el-radio-group v-model="radarLink.isDefined">
                  <el-radio :label="DEFAULT_LINK">使用链接默认信息</el-radio>
                  <el-radio :label="CUSTOM_LINK">自定义链接信息</el-radio>
                </el-radio-group>
                <div v-if="radarLink.isDefined !== DEFAULT_LINK">
                  <el-form-item label-width="0" prop="url">
                    <el-input
                      v-model="radarLink.url"
                      placeholder="必填，请填写链接访问地址"
                      :autosize="{ minRows: 4, maxRows: 4 }"
                      :style="{ width: '340px' }"
                      clearable
                    />
                  </el-form-item>
                  <el-form-item label-width="0" prop="title">
                    <el-input
                      v-model="radarLink.title"
                      type="textarea"
                      placeholder="必填，请填写链接的标题"
                      :maxlength="LINK_TITLE_MAXLENGTH"
                      show-word-limit
                      :autosize="{ minRows: 4, maxRows: 4 }"
                      :style="{ width: '340px' }"
                      clearable
                    />
                  </el-form-item>
                  <el-input
                    v-model="radarLink.content"
                    type="textarea"
                    :placeholder="`选填，请填写链接的摘要，默认是“${IMG_LINK_DIGEST}”`"
                    :maxlength="LINK_CONTENT_MAXLENGTH"
                    show-word-limit
                    :autosize="{ minRows: 4, maxRows: 4 }"
                    :style="{ width: '340px' }"
                    clearable
                  />
                  <UploadDrag
                    text="将封面拖到此处，或"
                    tip="只能上传jpg/png文件，且不超过2M"
                    :media-type="MEDIA_TYPE_POSTER"
                    :file-obj="{ ...radarLink, url: radarLink.coverUrl }"
                    :file-url.sync="radarLink.coverUrl"
                    accept="image/*"
                    :multiple="false"
                    :show-content="false"
                    :limit-file-name="LIMIT_FILENAME"
                  />
                  <VerbalTrickImgLink
                    :title="radarLink.title"
                    :content="radarLink.content"
                    :cover-url="radarLink.coverUrl"
                  />
                </div>
                <div v-else>
                  <el-form-item label-width="0" prop="url">
                    <el-input
                      v-model="radarLink.url"
                      placeholder="必填，请填写链接访问地址"
                      :autosize="{ minRows: 4, maxRows: 4 }"
                      :style="{ width: '340px' }"
                      clearable
                      @change="sendWordsUrl"
                    />
                  </el-form-item>
                  <VerbalTrickImgLink
                    :title="radarLink.title"
                    :content="radarLink.content"
                    :cover-url="radarLink.coverUrl"
                  />
                </div>
              </div>
            </div>
          </el-form-item>
          <p class="config-title" style="margin-bottom: 10px">高级设置</p>
          <el-form-item label="行为通知" prop="enableClickNotice">
            <div style="width: 600px">
              <el-switch
                v-model="form.enableClickNotice"
                :active-value="true"
                :inactive-value="false"
              />
              <span class="we-emple-code-tags-tip">开启后，当客户点击雷达链接，将发送应用提醒通知所属员工</span>
            </div>
          </el-form-item>
          <el-form-item label="轨迹记录" prop="enableBehaviorRecord">
            <div style="width: 600px">
              <el-switch
                v-model="form.enableBehaviorRecord"
                :active-value="true"
                :inactive-value="false"
              />
              <span class="we-emple-code-tags-tip">开启后，当客户点击雷达链接，会记录在其客户资料的活动轨迹下</span>
            </div>
          </el-form-item>
          <el-form-item label="客户标签">
            <el-switch
              v-model="form.enableCustomerTag"
              :active-value="true"
              :inactive-value="false"
            />
            <span class="we-emple-code-tags-tip">开启后，根据使用场景做标记，自动为扫码添加的客户打上标签</span>
          </el-form-item>
          <el-form-item v-show="form.enableCustomerTag" label="" prop="customerTags">
            <div>
              <el-button
                class="mr10"
                icon="el-icon-plus"
                size="mini"
                @click="dialogVisibleSelectTag = true"
              >添加标签</el-button>
              <el-tag
                v-for="(item, index) in customerTags"
                :key="index"
                size="medium"
                closable
                @close="closeTag(item, index)"
              >{{ item.tagName || item.name }}</el-tag>
            </div>
          </el-form-item>
        </el-form>
        <div class="confirm-div">
          <div v-if="activeRadar !== RADAR_TYPE['personal']">
            <el-switch
              v-model="form.enableUpdateNotice"
              :active-value="true"
              :inactive-value="false"
            />
            <span class="switch-tip">更新后，发送应用提醒通知使用员工</span>
          </div>
          <div class="confirm-btn-div">
            <el-button @click="Pvisible = false">取消</el-button>
            <RequestButton
              type="primary"
              :request-method="submitForm"
              button-type="submit"
            >确定</RequestButton>
          </div>
        </div>
      </div>
    </el-drawer>
    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      :selected="customerTags"
      type="search"
      info-msg="客户点击雷达链接后，将自动打上选中的标签"
      :is-show-add="true"
      @success="submitSelectTag"
    />
  </div>
</template>

<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import SelectTag from '@/components/SelectTag';
import differenceBy from 'lodash/differenceBy';
import { getWordsUrlContent } from '@/api/wordsGroup';
import UploadDrag from '@/components/uploadDrag.vue';
import { addRadar, getRadaDetail, updateRadar } from '@/api/radar';
import VerbalTrickImgLink from '@/views/verbalTrickLibrary/component/verbalTrickPreview/verbalTrickImgLink.vue';
import {
  MEDIA_TYPE_IMGLINK,
  DEFAULT_LINK,
  CUSTOM_LINK,
  MEDIA_TYPE_POSTER,
  LINK_CONTENT_MAXLENGTH,
  LINK_TITLE_MAXLENGTH,
  RADAR_TYPE,
  IMG_LINK_DIGEST,
  DEFAULT_IMG
} from '@/utils/constant';
const LIMIT_FILENAME = 32;
export default {
  components: { SelectTag, VerbalTrickImgLink, UploadDrag, RequestButton },
  props: {
    radarId: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    activeRadar: {
      type: Number,
      default: RADAR_TYPE['enterprise']
    }
  },
  data() {
    return {
      CUSTOM_LINK,
      DEFAULT_LINK,
      DEFAULT_IMG,
      MEDIA_TYPE_IMGLINK,
      LINK_CONTENT_MAXLENGTH,
      LINK_TITLE_MAXLENGTH,
      MEDIA_TYPE_POSTER,
      LIMIT_FILENAME,
      IMG_LINK_DIGEST,
      RADAR_TYPE,
      form: {
        radarTitle: '',
        enableClickNotice: false,
        enableBehaviorRecord: false,
        enableCustomerTag: false,
        enableUpdateNotice: false
      },
      // 雷达链接
      radarLink: {
        isDefined: DEFAULT_LINK,
        title: '', // 标题
        url: '', // 链接url
        coverUrl: '', // 封面图
        content: '' // 摘要
      },
      customerTags: [],
      dialogVisibleSelectTag: false,
      // 移除的标签列表
      removeTagList: [],
      // 表单验证规则
      rules: Object.freeze({
        radarTitle: [
          { required: true, message: '请填写雷达标题', trigger: 'blur' }
        ],
        radarLink: [
          {
            required: true,
            validator: (rule, value, callback) => {
              const { url, title } = this.radarLink;
              if (!url) {
                callback(new Error('请填写雷达链接'));
                return;
              }
              if (!title) {
                callback(new Error('请填写链接标题'));
                return;
              }
              callback();
            },
            trigger: 'blur'
          }
        ]
      })
    };
  },
  computed: {
    Pvisible: {
      get(val) {
        if (val.visible && this.radarId) {
          // 当点击变编辑,窗口打开后即调用接口
          this.getRadaDetail();
        }
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        // 新增雷达时初始化值
        this.form = this.$options.data().form;
        this.radarLink = this.$options.data().radarLink;
        this.customerTags = [];
        this.removeTagList = [];
      }
    }
  },
  created() {},
  methods: {
    /**
     * 获取雷达详情
     */
    getRadaDetail() {
      getRadaDetail({ id: this.radarId }).then((res) => {
        const {
          radarTitle,
          enableBehaviorRecord,
          enableClickNotice,
          enableCustomerTag,
          enableUpdateNotice,
          radarTagList,
          weRadarUrl
        } = res.data;
        this.form = {
          ...this.form,
          id: this.radarId,
          radarTitle,
          enableBehaviorRecord,
          enableClickNotice,
          enableCustomerTag,
          enableUpdateNotice
        };
        this.customerTags = radarTagList;
        this.radarLink = weRadarUrl;
      });
    },
    /**
     * 选择客户标签
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
     * 输入链接后获取链接的标题、封面信息
     */
    async sendWordsUrl() {
      if (this.radarLink.url) {
        getWordsUrlContent({ url: this.radarLink.url }).then((res) => {
          this.radarLink.content = res.data?.desc?.substring(
            0,
            LINK_CONTENT_MAXLENGTH
          );
          // 定义一个数字作为截取字符串的长度
          const IMG_FORMAT_LENGTH = 4;
          this.radarLink.title = res.data?.title?.substring(0, LINK_TITLE_MAXLENGTH);
          if (!res.data.isUrl && res.data.image) {
            // 判断是否是BASE64格式
            if (res.data.image.substring(0, IMG_FORMAT_LENGTH) === 'data') {
              this.radarLink.coverUrl = DEFAULT_IMG.link;
              return;
            }
            // 这里定义一个url来获取链接中的域名部分
            const url = this.radarLink.url.split('/');
            this.radarLink.coverUrl =
              'https://' +
              url[2] +
              (res.data.image[0] !== '/' ? '/' : '') +
              res.data.image;
          } else {
            this.radarLink.coverUrl = res.data.image || DEFAULT_IMG.link;
          }
        });
      }
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'submit');
        if (!this.radarLink.content) {
          this.radarLink = {
            ...this.radarLink,
            content: '请点击查看链接'
          };
        }
        if (!this.radarLink.coverUrl) {
          this.radarLink = {
            ...this.radarLink,
            coverUrl: DEFAULT_IMG.link
          };
        }
        this.form.type = this.activeRadar;
        const params = {
          ...this.form,
          radarTagList: this.customerTags.map((item) => {
            return {
              tagId: item.tagId
            };
          }),
          weRadarUrl: this.radarLink
        };
        if (this.radarId) {
          this.$confirm('您修改了雷达链接地址，之前发出去的雷达链接也会被更新为最新的链接地址，您确定要继续该操作吗？', '操作须知', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            updateRadar(params).then((res) => {
              changeButtonLoading(this.$store, 'submit');
              this.$emit('getRadaList');
              this.$emit('update:visible', false);
            });
          }).catch(() => { changeButtonLoading(this.$store, 'submit'); });
          return;
        }
        addRadar(params).then(() => {
          changeButtonLoading(this.$store, 'submit');
          this.$emit('getRadaList');
          this.$emit('update:visible', false);
        });
      });
    }
  }
};
</script>

<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style lang="scss" scoped>
.radar-add-drawer {
  /deep/ .el-drawer__container {
    .el-drawer {
      width: 780px !important;
      .el-drawer__header {
        > span {
          font-size: 20px;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
  .drawer-div {
    .form {
      padding: 0px 15px;
      margin-left: 5px;
    }
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .operate-btn-div {
    padding-left: 90px;
    margin-top: 10px;
  }
  .confirm-div {
    display: flex;
    align-items: center;
    padding: 20px 30px;
    position: relative;
    height: 60px;
    .switch-tip {
      margin-left: 10px;
    }
    .confirm-btn-div {
      position: absolute;
      right: 30px;
    }
  }
}
.content-item {
  display: flex;
  margin-bottom: 10px;
  .content-form-item {
    display: flex;
  }
  .item-div {
    border: 1px solid $borderColor;
    padding: 10px;
    width: 360px;
    /deep/ .el-form-item__error {
      position: relative;
    }
    /deep/ .upload-drag-div {
      width: 340px;
    }
    /deep/ .el-input,
    .el-textarea,
    .upload-drag-div {
      margin-top: 15px;
    }
    /deep/ .el-input {
      input {
        padding: 0 10px;
      }
    }
    /deep/ .preview-div,
    .link-preview,
    /deep/ .appid-preview-div {
      margin-top: 10px;
    }
  }
  .el-form-item {
    padding: 0;
  }
}
</style>
