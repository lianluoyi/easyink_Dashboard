<!--
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="content-item">
    <el-form
      ref="verbalTrickItemForm"
      class="content-form-item"
      :model="item"
      label-width="0"
      :disabled="disabled"
    >
      <template v-if="mediaType === MEDIA_TYPE_TEXT">
        <el-input
          v-model="item.content"
          type="textarea"
          :placeholder="textPlaceholder"
          :maxlength="1500"
          show-word-limit
          :autosize="{ minRows: 4, maxRows: 4 }"
          clearable
          :style="{ width: '360px' }"
        />

      </template>
      <template v-if="mediaType === MEDIA_TYPE_POSTER">
        <div class="item-div">
          <el-input
            v-model="item.title"
            placeholder="必填，请填写图片标题，方便检索"
            :autosize="{ minRows: 4, maxRows: 4 }"
            clearable
            :maxlength="LIMIT_FILENAME"
            show-word-limit
            :style="{ width: '340px' }"
          />
          <UploadDrag
            text="将图片拖到此处，或"
            tip="只能上传jpg/png文件，且不超过2M"
            accept="image/*"
            :file-url.sync="item.url"
            :file-name.sync="item.title"
            :file-size.sync="item.content"
            :multiple="false"
            :file-obj="item"
            :media-type="MEDIA_TYPE_POSTER"
            :limit-file-name="LIMIT_FILENAME"
            :disabled-edit="disabled"
          />
        </div>

      </template>
      <template v-if="mediaType === MEDIA_TYPE_VIDEO">
        <div class="item-div">
          <el-input
            v-model="item.title"
            placeholder="必填，请填写视频标题，方便检索"
            :autosize="{ minRows: 4, maxRows: 4 }"
            :style="{ width: '340px' }"
            clearable
            :maxlength="32"
            show-word-limit
          />
          <UploadDrag
            text="将视频拖到此处，或"
            tip="只能上传MP4文件，且不超过10M"
            accept="video/*"
            :file-url.sync="item.url"
            :file-name.sync="item.title"
            :file-size.sync="item.content"
            :multiple="false"
            :media-type="MEDIA_TYPE_VIDEO"
            :file-obj="item"
            :limit-file-name="LIMIT_FILENAME"
            :disabled-edit="disabled"
          />
        </div>

      </template>
      <template v-if="mediaType === MEDIA_TYPE_FILE">
        <div class="item-div">
          <el-input
            v-model="item.title"
            placeholder="必填，请填写文件标题，方便检索"
            :autosize="{ minRows: 4, maxRows: 4 }"
            :style="{ width: '340px' }"
            :maxlength="32"
            show-word-limit
            clearable
          />
          <UploadDrag
            text="将文件拖到此处，或"
            tip="支持上传doc、pdf等文件，且不超过20M"
            :file-url.sync="item.url"
            :file-name.sync="item.title"
            :file-size.sync="item.content"
            :multiple="false"
            :media-type="MEDIA_TYPE_FILE"
            :file-obj="item"
            :limit-file-name="LIMIT_FILENAME"
            :disabled-edit="disabled"
          />
        </div>
      </template>
      <template v-if="mediaType === MEDIA_TYPE_RADARLINK">
        <div class="item-div">
          <RadarLink
            class-name="material-preview"
            :radar-title="radarTitle"
            :link-title="item.title"
            :cover-url="item.coverUrl"
            :content="item.content"
          />
        </div>
      </template>
      <template v-if="mediaType === MEDIA_TYPE_SMARTFORM">
        <div class="form-link">
          <div class="msg-card-info">
            <div class="msg-card-title">{{ item.formName || item.form.formName }}</div>
            <div class="msg-card-desc intwoline">{{ item.description || item.form.description }}</div>
          </div>
          <svg-icon icon-class="form-preview" class-name="form-preview" />
        </div>
      </template>
      <template v-if="mediaType === MEDIA_TYPE_IMGLINK">
        <div class="item-div">
          <el-radio-group v-model="item.isDefined">
            <el-radio :label="DEFAULT_LINK">使用链接默认信息</el-radio>
            <el-radio :label="CUSTOM_LINK">自定义链接信息</el-radio>
          </el-radio-group>
          <div v-if="item.isDefined !== DEFAULT_LINK">
            <el-form-item label-width="0" prop="url">
              <el-input
                v-model="item.url"
                placeholder="必填，请填写链接访问地址"
                :autosize="{ minRows: 4, maxRows: 4 }"
                :style="{ width: '340px' }"
                clearable
              />
            </el-form-item>
            <el-form-item label-width="0" prop="title">
              <el-input
                v-model="item.title"
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
              v-model="item.content"
              type="textarea"
              :placeholder="`选填，请填写链接的摘要。默认是“${IMG_LINK_DIGEST}”`"
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
              :file-obj="{ ...item, url: item.coverUrl }"
              :file-url.sync="item.coverUrl"
              accept="image/*"
              :multiple="false"
              :show-content="false"
              :limit-file-name="LIMIT_FILENAME"
              :disabled-edit="disabled"
            />
            <VerbalTrickImgLink
              :title="item.title"
              :content="item.content"
              :cover-url="item.coverUrl"
            />
          </div>
          <div v-else>
            <el-form-item label-width="0" prop="url">
              <el-input
                v-model="item.url"
                placeholder="必填，请填写链接访问地址"
                :autosize="{ minRows: 4, maxRows: 4 }"
                :style="{ width: '340px' }"
                clearable
                @change="sendWordsUrl"
              />
            </el-form-item>
            <VerbalTrickImgLink
              :title="item.title"
              :content="item.content"
              :cover-url="item.coverUrl"
            />
          </div>
        </div>
      </template>
      <template v-if="mediaType === MEDIA_TYPE_MINIAPP">
        <div class="item-div">
          <el-form-item label-width="0" prop="accountOriginalId">
            <el-input
              v-model="item.accountOriginalId"
              placeholder="必填，请填写与企业关联小程序的账号原始ID"
              :autosize="{ minRows: 4, maxRows: 4 }"
              :style="{ width: '340px' }"
              clearable
            />
          </el-form-item>
          <el-form-item label-width="0" prop="appid">
            <el-input
              v-model="item.appid"
              placeholder="必填，请填写与企业关联小程序的appid"
              :autosize="{ minRows: 4, maxRows: 4 }"
              :style="{ width: '340px' }"
              clearable
            />
          </el-form-item>
          <el-form-item label-width="0" prop="url">
            <el-input
              v-model="item.url"
              placeholder="必填，请填写小程序消息打开后的路径，.html后缀"
              :autosize="{ minRows: 4, maxRows: 4 }"
              :style="{ width: '340px' }"
              clearable
            />
          </el-form-item>
          <el-form-item label-width="0" prop="title">
            <el-input
              v-model="item.title"
              placeholder="必填，请填写小程序的标题"
              maxlength="32"
              show-word-limit
              :autosize="{ minRows: 4, maxRows: 4 }"
              :style="{ width: '340px' }"
              clearable
            />
          </el-form-item>
          <UploadDrag
            text="将封面拖到此处，或"
            tip="只能上传jpg/png文件，且不超过2M"
            :media-type="MEDIA_TYPE_POSTER"
            :file-obj="{ ...item, url: item.coverUrl }"
            :file-url.sync="item.coverUrl"
            accept="image/*"
            :multiple="false"
            :show-content="false"
            :limit-file-name="LIMIT_FILENAME"
            :disabled-edit="disabled"
          />
          <VerbalTrickAppId :title="item.title" :cover-url="item.coverUrl" />
        </div>
      </template>
      <MoveTool
        :index="contentIndex"
        :item="item"
        :list.sync="allContentList"
        :show-tool="showTool"
        @getRemoveList="getRemoveList"
      />
    </el-form>
  </div>
</template>
<script>
import {
  MEDIA_TYPE_POSTER,
  MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_TEXT,
  MEDIA_TYPE_IMGLINK,
  MEDIA_TYPE_RADARLINK,
  MEDIA_TYPE_MINIAPP,
  CUSTOM_LINK,
  DEFAULT_LINK,
  IMG_LINK_DIGEST,
  DEFAULT_IMG,
  LINK_TITLE_MAXLENGTH,
  LINK_CONTENT_MAXLENGTH,
  MEDIA_TYPE_SMARTFORM
} from '@/utils/constant/index';
import MoveTool from '@/components/MoveTool.vue';
import UploadDrag from '@/components/uploadDrag.vue';
import VerbalTrickImgLink from './verbalTrickPreview/verbalTrickImgLink.vue';
import VerbalTrickAppId from './verbalTrickPreview/verbalTrickAppId.vue';
import { getWordsUrlContent } from '@/api/wordsGroup';
import RadarLink from '@/views/radarLibrary/components/radarLink.vue';
const LIMIT_FILENAME = 32;

export default {
  name: '',
  components: {
    MoveTool,
    UploadDrag,
    VerbalTrickImgLink,
    VerbalTrickAppId,
    RadarLink
  },
  props: {
    mediaType: {
      type: String,
      default: MEDIA_TYPE_TEXT
    },
    contentIndex: {
      type: Number,
      default: 0
    },
    formData: {
      type: Object,
      default: () => {}
    },
    contentList: {
      type: Array,
      default: () => []
    },
    item: {
      type: Object,
      default: () => {}
    },
    textPlaceholder: {
      type: String,
      default: '请填写文字'
    },
    showTool: {
      type: Array,
      default: () => ['placedAtTop', 'moveTop', 'moveBottom', 'remove']
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      LINK_TITLE_MAXLENGTH,
      LINK_CONTENT_MAXLENGTH,
      MEDIA_TYPE_RADARLINK,
      DEFAULT_LINK,
      CUSTOM_LINK,
      MEDIA_TYPE_TEXT,
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_MINIAPP,
      DEFAULT_IMG,
      // 上传文件
      uploadFile: {},
      LIMIT_FILENAME,
      IMG_LINK_DIGEST,
      MEDIA_TYPE_SMARTFORM
    };
  },
  computed: {
    allContentList: {
      get() {
        return this.contentList;
      },
      set(val) {
        this.$emit('update:contentList', val);
      }
    },
    radarTitle() {
      const item = { ...this.item };
      return item.radar?.radarTitle || item.radarTitle;
    }
  },
  watch: {
    uploadFile(val) {
      this.allContentList[this.contentIndex].title = val.name;
    }
  },
  created() {},
  methods: {
    /**
     * 获取移除的附件列表
     */
    getRemoveList(list) {
      this.$emit('getRemoveList', list);
    },
    /**
     * 输入链接后获取链接的标题、封面信息
     */
    async sendWordsUrl() {
      if (this.item.url) {
        getWordsUrlContent({ url: this.item.url }).then((res) => {
          this.item.content = res.data?.desc?.substring(
            0,
            LINK_CONTENT_MAXLENGTH
          );
          this.item.title = res.data?.title?.substring(0, LINK_TITLE_MAXLENGTH);
          // 定义一个数字作为截取字符串的长度
          const IMG_FORMAT_LENGTH = 4;
          if (!res.data.isUrl && res.data.image) {
            // 判断是否是BASE64格式
            if (res.data.image.substring(0, IMG_FORMAT_LENGTH) === 'data') {
              this.radarLink.coverUrl = DEFAULT_IMG.link;
              return;
            }
            // 这里定义一个url来获取链接中的域名部分
            const url = this.item.url.split('/');
            this.item.coverUrl =
              'https://' +
              url[2] +
              (res.data.image[0] !== '/' ? '/' : '') +
              res.data.image;
          } else {
            this.item.coverUrl = res.data.image;
          }
        });
      }
    }
  }
};
</script>
<style scoped lang="scss">
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
  .form-link {
    border: 1px solid $borderColor;
    width: 360px;
    display: flex;
    background: #fff;
    padding: 10px;
    .form-preview {
      width: 60px;
      height: 60px;
      border-radius: 3px;
      margin-left: 10px;
    }
    .msg-card-info {
      width: 260px;
      text-align: left;
    }
    .msg-card-title {
      font-size: 14px;
      line-height: 16px;
      margin-bottom: 10px;
      color: #333;
      display: -webkit-box !important;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }
    .msg-card-desc {
      font-size: 12px;
      line-height: 14px;
      color: #999;
    }
  }
  .el-form-item {
    padding: 0;
  }
}
</style>
