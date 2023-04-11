<script>
import VideoModal from '@/views/conversation/component/videoModal.vue';
import FormPreview from './PhoneDialog/FormPreview.vue';
import { MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_VIDEO, DEFAULT_IMG, MEDIA_TYPE_FILE, MEDIA_TYPE_MINIAPP, MEDIA_TYPE_TEXT, MEDIA_TYPE_RADARLINK, MEDIA_TYPE_SMARTFORM } from '@/utils/constant';
import { getFileIcon, filterSize } from '@/utils/common';
/**
 * 手机对话框样式
 * @displayName PhoneDialog(手机对话框样式)
 */
export default {
  components: { VideoModal, FormPreview },
  props: {
    /**
     * 文字（聊天内容）
     */
    message: {
      type: String,
      default: ''
    },
    /**
     * 聊天内容渲染传入的组件内容
     */
    isOther: {
      type: Boolean,
      default: false
    },
    /**
     * 图片列表（聊天内容）
     */
    imageList: {
      type: Array,
      default: () => []
    },
    /**
     * 文字列表（聊天内容）
     */
    messageList: {
      type: Array,
      default: () => []
    },
    /**
     * 手机顶部文字显示内容
     */
    title: {
      type: String,
      default: '客户昵称'
    },
    /**
     * 是否显示自定义布局
     */
    customDomFlag: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示底部工具栏
     */
    toolShow: {
      type: Boolean,
      default: true
    },
    /**
     * 除文本外的消息列表
     */
    msgList: {
      type: Array,
      default: () => []
    },
    materialField: {
      type: String,
      default: 'materialName'
    },
    digestField: {
      type: String,
      default: 'digest'
    },
    materialUrlField: {
      type: String,
      default: 'materialUrl'
    },
    /**
     * 是否显示视频封面
     */
    unShowVideoCover: {
      type: Boolean,
      default: false
    },
    /**
     * 是否是表单预览样式
     */
    isFormPreview: {
      type: Boolean,
      default: false
    },
    formSetting: {
      type: Object,
      default: () => {}
    },
    // TODO  编辑/新增表单 表单详情 表单预览页的字段需要修改 用单个对象传递即可。去掉多余的formSetting字段，自行在使用组件的地方组装
    form: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_MINIAPP,
      MEDIA_TYPE_TEXT,
      MEDIA_TYPE_RADARLINK,
      DEFAULT_IMG,
      MEDIA_TYPE_SMARTFORM,
      visible: false
    };
  },
  methods: {
    /**
     * 预览素材大图
     */
    onPreview(msg) {
      this.visible = true;
      this.$refs.videoModal.play(msg[this.materialUrlField]);
    },
    closeModal() {
      this.visible = false;
    },
    /**
     * 获取文件类型图标class
     */
    getFileIconClass(url) {
      return getFileIcon(url);
    },
    /**
     * 获取文件大小
     */
    getFileSize(msg) {
      return filterSize(msg.content);
    },
    /**
     * @description 获取雷达链接文案
     */
    getContent(msg) {
      return msg?.radar?.weRadarUrl?.content || msg?.content || '';
    },
    /**
     * @description 获取雷达链接封面url
     */
    getCoverUrl(msg) {
      return msg?.coverUrl || msg?.radar?.weRadarUrl?.coverUrl || DEFAULT_IMG.link;
    }
  }
};
</script>

<template>
  <div v-if="isFormPreview" class="preview" style="padding:29px 18px 13px;">
    <FormPreview class="preview-content" :form-setting="formSetting" :form="form" />
  </div>
  <div v-else class="preview ac">
    <div class="preview-content">
      <div class="top">{{ title }}</div>
      <ul class="msg-ul">
        <li v-if="message" class="flex msg-li">
          <el-avatar
            shape="square"
            size="small"
            fit="fill"
            :src="require('@/assets/logo/logo_green.svg')"
          />
          <div class="msg">{{ message }}</div>
        </li>
        <li v-if="isOther" class="flex msg-li">
          <el-avatar
            shape="square"
            size="small"
            fit="fill"
            :src="require('@/assets/logo/logo_green.svg')"
          />
          <div class="msg msg-img" style="line-height: 0; padding: 5px;">
            <!-- @slot isOther为true时传入的组件 -->
            <slot />
          </div>
        </li>
        <li v-for="messageItem in messageList" :key="messageItem" class="flex msg-li">
          <el-avatar
            shape="square"
            size="small"
            :src="require('@/assets/logo/logo_green.svg')"
          />
          <div class="msg">
            <slot name="text" :text="messageItem" />
          </div>
        </li>
        <li v-for="image in imageList" :key="image" class="flex msg-li">
          <el-avatar
            shape="square"
            size="small"
            :src="require('@/assets/logo/logo_green.svg')"
          />
          <div class="msg" style="line-height: 0; padding: 5px;">
            <slot name="image" :image="image" />
          </div>
        </li>
        <li v-for="msg in msgList" :key="msg.messageId" class="flex msg-li">
          <el-avatar
            shape="square"
            size="small"
            :src="require('@/assets/logo/logo_green.svg')"
          />
          <div class="msg-item" style="padding-left: 5px;">
            <div v-if="String(msg.mediaType) === MEDIA_TYPE_TEXT" class="msg-item-image">
              {{ msg.content }}
            </div>
            <div v-else-if="String(msg.mediaType) === MEDIA_TYPE_POSTER" class="msg-item-image">
              <el-image
                style="border-radius: 6px;"
                :src="msg[materialUrlField]"
              />
            </div>
            <div v-else-if="String(msg.mediaType) === MEDIA_TYPE_IMGLINK" class="msg-card">
              <div class="msg-card-info">
                <div class="msg-card-title">{{ msg[materialField] }}</div>
                <div class="msg-card-desc">{{ msg[digestField] }}</div>
              </div>
              <el-image
                :src="msg.coverUrl"
              />
            </div>
            <div v-else-if="String(msg.mediaType) === MEDIA_TYPE_RADARLINK" class="msg-card">
              <div class="msg-card-info">
                <div class="msg-card-title inoneline">{{ msg.title || msg.radar.weRadarUrl.title }}</div>
                <div class="msg-card-desc">{{ getContent(msg) }}</div>
              </div>
              <el-image
                :src="getCoverUrl(msg)"
              />
            </div>
            <div v-else-if="String(msg.mediaType) === MEDIA_TYPE_SMARTFORM" class="msg-card">
              <div class="msg-card-info msg-card-info-smart-form">
                <div class="msg-card-title">{{ msg.formName || msg.form.formName }}</div>
                <div class="msg-card-desc">{{ msg.description || msg.form.description }}</div>
              </div>
              <svg-icon icon-class="form-preview" class-name="el-image" />
            </div>
            <div v-else-if="String(msg.mediaType) === MEDIA_TYPE_FILE" class="msg-card">
              <div class="msg-card-info">
                <div class="msg-card-title">{{ msg[materialField] }}</div>
                <div class="msg-card-desc">{{ getFileSize(msg) }}</div>
              </div>
              <svg class="icon" aria-hidden="true" width="50" height="50">
                <use :xlink:href="'#icon-' + getFileIconClass(msg[materialUrlField])" />
              </svg>
            </div>
            <div v-else-if="String(msg.mediaType) === MEDIA_TYPE_MINIAPP" class="msg-card">
              <div class="msg-card-info">
                <div class="msg-card-title">{{ msg[materialField] }}</div>
                <div class="msg-card-desc">小程序</div>
              </div>
              <el-image
                :src="msg.coverUrl"
              />
            </div>
            <div v-else-if="String(msg.mediaType) === MEDIA_TYPE_VIDEO" class="msg-video">
              <video :src="msg[materialUrlField]" :poster="unShowVideoCover ? '' : msg.coverUrl" />
              <!-- 遮罩 -->
              <div class="video-layer">
                <i class="iconfont icon-play" @click="onPreview(msg)" />
              </div>
            </div>
          </div>
        </li>
      </ul>
      <VideoModal v-show="visible" ref="videoModal" @closeModal="closeModal" />
      <div v-if="customDomFlag" class="preview-custom-dom">
        <!-- @slot customDomFlag为true时传入的组件 -->
        <slot />
      </div>
      <div v-if="toolShow" class="tool">
        <i
          class="iconfont icon-voice"
          style="color: #333; font-size: 18px; margin-left: 0;"
        />
        <div class="chat-input" />
        <div class="tool-right">
          <i
            class="iconfont icon-emoji"
            style="color: #333; font-size: 18px"
          />
          <i
            class="iconfont icon-add"
            style="color: #333; font-size: 18px"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.preview {
  width: 262px;
  min-width: 262px;
  height: 436px;
  border-radius: 38px;
  padding: 15px 10px;
  line-height: 1.25;
  position: relative;
  background: #f5f5f5;
  padding: 42px 26px;
  background-image: url('../assets/image/phone-background.png');
  background-size: 260px 436px;
  .preview-custom-dom {
    overflow: auto;
    height: 100%;
  }
  .preview-content {
    height: 100%;
    .top {
      font-weight: 600;
      padding-bottom: 10px;
    }
    .small {
      font-size: 10px;
    }
    .time {
      font-size: 12px;
      color: #aaa;
      transform: scale(0.8);
      padding: 10px 0 5px;
    }
    .msg-ul {
      margin: 0;
      padding: 0;
      max-height: 90%;
      overflow: auto;
    }
    .msg-li {
      margin-bottom: 10px;
      .msg-img {
        /deep/ img {
          max-width: 120px;
        }
      }
    }
    .msg {
      min-height: 28px;
      background-color: #fff;
      border: 1px solid #e4e6e9;
      display: inline-block;
      position: relative;
      text-align: left;
      font-size: 14px;
      line-height: 22px;
      padding: 3px 6px;
      border-radius: 4px;
      max-width: 90%;
      min-width: 24px;
      box-sizing: border-box;
      word-break: break-all;
      white-space: pre-line;
      margin-left: 10px;
      &:before {
        content: ' ';
        display: block;
        position: absolute;
        left: -6px;
        border-width: 4px 6px;
        border-left: 0;
        width: 0;
        border-style: solid;
        border-color: transparent;
        border-right-color: #fff;
        top: 10px;
        z-index: 888;
      }
    }
  }
  .tool {
    position: absolute;
    bottom: 18px;
    display: flex;
    width: calc(100% - 52px);
    img {
      width: 20px;
    }
    .chat-input {
      background: #fff;
      flex: 1;
      margin: 0 0 0 5px;
    }
    .tool-right {
      width: 42px;
      display: flex;
      justify-content: space-between;
    }
  }
}

.el-avatar {
  flex: none;
  background: none;
  /deep/ img {
    width: 100%;
  }
}
video {
  width: 70px;
  height: 70px;
}
.msg-item {
  position: relative;
  width: calc(100% - 35px);
}
.video-layer {
  position: absolute;
  top: 25px;
  left: 25px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border: 1px solid #fff;
  border-radius: 50%;
  background: #8080801a;
  i {
    color: #fff;
    line-height: 28px;
    text-align: center;
  }
}
.msg-video {
  width: fit-content;
}
.msg-item-image {
  width: fit-content;
  .el-image /deep/ img{
    max-width: 54px;
    max-height: 70px;
  }
}
.msg-card {
  width: 100%;
  display: flex;
  background: #fff;
  padding: 5px;
  border-radius: 5px;
  .el-image {
    width: 45px;
    height: 45px;
    border-radius: 3px;
  }
  .msg-card-info {
    width: calc(100% - 45px);
    text-align: left;
    margin-right: 5px;
  }
  .msg-card-title {
    font-size: 12px;
    line-height: 14px;
    color: #333;
    display: -webkit-box !important;
    overfLow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .msg-card-desc {
    font-size: 10px;
    line-height: 12px;
    margin-top: 4px;
    color: #999;
    overflow: hidden ;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .msg-card-info-smart-form {
    width: calc(100% - 50px);
  }
}
</style>
<docs lang="md">

## 示例

模拟手机聊天框样式（只有文字内容）:

```jsx
<PhoneDialog
  message="文字内容"
>
</PhoneDialog>
```
模拟手机聊天框样式（自定义聊天内容布局样式）:

```jsx
import image from '@/assets/logo/logo_green.svg';
<PhoneDialog
  title="logo"
  :is-other="true"
>
<div>
  <el-image :src="image" />
</div>
</PhoneDialog>
```
模拟手机聊天框样式（完全自定义内容布局样式，不显示头像）:

```jsx
import image from '@/assets/logo/logo_green.svg';
<PhoneDialog
  :custom-dom-flag="true"
  :toolShow="false"
>
<div>
  <div style="height: 20px; width: 20px; background-color: blue; border-radius: 50%;"></div>
</div>
</PhoneDialog>
```
</docs>
