<template>
  <div ref="takeContent" class="takecontent">
    <empty-default-icon
      text="暂无聊天记录"
      :length="allChat.length"
    >
      <ul>
        <li
          v-for="(item,index) in allChat"
          :id="item.from + '--' + (chatData.fromId)"
          :key="index"
          :class="dealSender(item, chatData, chatType)"
        >
          <el-avatar
            v-if="!SYSTEM_MSG_TYPE_LIST.includes(item.msgType) && showAvatar"
            :style="(chatType === 'employee' && item.from === chatData.fromId || chatType !== 'employee' && item.from !== chatData.fromId) ? 'margin-left:5px':'margin-right:5px'"
            shape="square"
            size="medium"
            :src="item.fromInfo && (item.fromInfo.avatar || item.fromInfo.avatarMediaid || require('@/assets/image/card-avatar.svg'))"
            class="avatar"
          />
          <div>
            <div class="info-line">
              <template v-if="chatType === 'employee'">
                <span v-if="item.from !== chatData.fromId" class="name">{{ item.fromInfo && item.fromInfo.name }}</span>
                <span class="time" :style="item.from !== chatData.fromId ? 'margin-left:5px;':'margin-right:5px;'">{{ parseTime(item.msgTime) }}</span>
                <span v-if="item.from === chatData.fromId" class="name">{{ item.fromInfo && item.fromInfo.name }}</span>
              </template>
              <template v-else>
                <span v-if="item.from === chatData.fromId" class="name">{{ item.fromInfo && item.fromInfo.name }}</span>
                <span class="time" :style="item.from === chatData.fromId ? 'margin-left:5px;':'margin-right:5px;'">{{ parseTime(item.msgTime) }}</span>
                <span v-if="item.from !== chatData.fromId" class="name">{{ item.fromInfo && item.fromInfo.name }}</span>
              </template>
            </div>
            <Message v-if="item.msgType=='text'" :is-revoke="item.isRevoke" class="msgtypetext">
              {{ item.text.content }}
            </Message>
            <Message v-else-if="item.msgType=='image'" :is-revoke="item.isRevoke" class="msgtypeimg">
              <ImgChatItem :img-url="item.image.attachment" />
            </Message>
            <Message v-else-if="item.msgType=='mixed'" :is-revoke="item.isRevoke">
              <MixedList :mixed="item.mixed.item" />
            </Message>
            <Message v-else-if="item.msgType=='file'" :is-revoke="item.isRevoke" class="msgtypefile">
              <div class="toe" :title="item.file.filename || item.file.fileName" @click="down(item.file)">
                {{ item.file.filename || item.file.fileName }}
              </div>
            </Message>
            <Message v-else-if="item.msgType=='voice'" :is-revoke="item.isRevoke" class="msgtypevoice">
              <img v-if="voicePlayObj[item.msgId] && voicePlayObj[item.msgId].isPlaying" :src="dealVoiceImg(true, item)" @click="pauseVideo(item)">
              <img v-else :src="dealVoiceImg(false, item)" @click="playVideo(item)">
            </Message>
            <Message v-else-if="item.msgType=='emotion'" :is-revoke="item.isRevoke" class="msgtypeimg">
              <ImgChatItem :img-url="item.emotion.attachment" />
            </Message>
            <Message v-else-if="item.msgType=='video'" :is-revoke="item.isRevoke" class="msgtypevideo">
              <VideoChatItem :url="item.video.attachment" />
            </Message>
            <Message v-else-if="item.msgType=='location'" :is-revoke="item.isRevoke" class="msg-type-location">
              <div class="msgtypecard">
                <div class="title">
                  {{ item.location.address }}
                </div>
                <div class="info">
                  {{ item.location.title }}
                </div>
                <div class="name">位置</div>
              </div>
            </Message>
            <Message v-else-if="item.msgType=='weapp'" :is-revoke="item.isRevoke" class="msg-type-weapp">
              <div class="msgtypecard">
                <div class="title">
                  {{ item.weApp.title }}
                </div>
                <div class="info">
                  {{ item.weApp.displayname }}
                </div>
                <div class="name">小程序</div>
              </div>
            </Message>
            <Message v-else-if="item.msgType=='sphfeed'" :is-revoke="item.isRevoke" class="msgtypesph">
              <div class="toe" :title="item.sphFeed.feedDesc">
                [视频号] {{ item.sphFeed.feedDesc }}
              </div>
            </Message>
            <Message v-else-if="item.msgType=='external_redpacket'" :is-revoke="item.isRevoke" class="msgtypetext">
              [这是一条红包消息]
            </Message>
            <Message v-else-if="item.msgType=='chatrecord'" :is-revoke="item.isRevoke" class="msg-type-link">
              <div>
                <div class="msg-type-title">{{ chatReCordShowTitle(item.chatReCord.title) }}</div>
                <div class="chatrecord-content">
                  <p v-for="(chatrecordItem,cIndex) in item.chatReCord.item.slice(0,4)" :key="cIndex" class="toe">
                    {{ chatReCordShowText(chatrecordItem, 'unParsed') }}
                  </p>
                </div>
                <el-button type="text" class="chatrecord-button" @click="$emit('openChatrecord', item.chatReCord)">查看详情</el-button>
              </div>
            </Message>

            <!-- 系统提示消息 -->
            <div v-else-if="item.msgType=='agree'" class="msgtypetext system-msg">
              {{ item.fromInfo.name }}同意存档会话内容
            </div>
            <div v-else-if="item.msgType=='disagree'" class="msgtypetext">
              {{ item.fromInfo.name }}不同意存档会话内容，无法获取聊天记录
            </div>
            <div v-else-if="item.msgType=='revoke'" class="msgtypetext">
              {{ item.fromInfo.name }}撤回了一条消息
            </div>

            <Message v-else-if="item.msgType=='card'" :is-revoke="item.isRevoke" class="msg-type-card">
              <div>
                <div class="card_name">
                  <div class="card-left">
                    <div class="card-corp-name">
                      <img v-show="['微信', '微信联系人'].includes(item.card.corpName)" class="wx-logo" :src="require('@/assets/image/wx-logo.svg')">
                      {{ ['微信', '微信联系人'].includes(item.card.corpName) ? '微信' : item.card.corpName }}
                    </div>
                    <div class="card-user-name inoneline">{{ item.card.userName || item.card.userId }}</div>
                  </div>
                  <img :src="item.card.imageUrl || require('@/assets/image/card-avatar.svg')">
                </div>
                <div class="card-foot">个人名片</div>
              </div>
            </Message>
            <Message v-else-if="item.msgType=='link'" :is-revoke="item.isRevoke" class="msgtypelink">
              <template v-if="item.link">
                <a class="msg-type-link" :href="item.link.linkUrl" target="_blank">
                  <div class="msg-type-title">{{ item.link.title }}</div>
                  <div class="msg-type-desc">
                    <div>{{ item.link.description }}</div>
                    <img :src="item.link.imageUrl || item.link.image_url">
                  </div>
                </a>
              </template>
            </Message>
            <Message v-else-if="item.msgType=='docmsg'" :is-revoke="item.isRevoke" class="msg-doc">
              <a class="msg-type-doc" :href="item.doc.linkUrl" target="_blank">
                <div class="msg-type-title">{{ item.doc.title }}</div>
                <div class="msg-type-desc">
                  <div>点击查看文档</div>
                  <svg className="icon-docx" :width="45" :height="45">
                    <use href="#icon-docx" />
                  </svg>
                </div>
              </a>
            </Message>
          </div>
        </li>
      </ul>
    </empty-default-icon>
  </div>
</template>

<script>
import 'video.js/dist/video-js.css';
import 'vue-video-player/src/custom-theme.css';
import BenzAMRRecorder from 'benz-amr-recorder';
import {
  downloadFile
} from '@/utils/common.js';
import ImgChatItem from './imgChatItem.vue';
import MixedList from './mixedList.vue';
import VideoChatItem from './videoChatItem.vue';
import Message from './message.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';

const zoom = 15;
const RECEIVER_CLASS_NAME = 'receiver';
const SENDER_CLASS_NAME = 'sender';
const SYSTEM_MSG_TYPE_LIST = ['agree', 'disagree', 'revoke'];
export default {
  components: {
    MixedList,
    ImgChatItem,
    VideoChatItem,
    Message,
    EmptyDefaultIcon
  },
  props: {
    allChat: {
      type: Array,
      default: () => []
    },
    chatData: {
      type: Object,
      default: () => ({})
    },
    chatType: {
      type: String,
      default: 'employee'
    },
    showAvatar: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      zoom,
      voicePlayObj: {},
      SYSTEM_MSG_TYPE_LIST
    };
  },
  mounted() {},
  methods: {
    playVideo(msg) {
      this.urlToBlob(msg.voice.attachment, msg);
    },
    /**
     * @description 初始化滚动条
     */
    initScollTop() {
      this.$refs['takeContent'] && (this.$refs['takeContent'].scrollTop = 0);
    },
    down(e) {
      downloadFile(e.attachment, e.filename || e.fileName || e.file.filename);
    },
    dealSender(item, chatData, chatType) {
      if (SYSTEM_MSG_TYPE_LIST.includes(item.msgType)) {
        return 'system-msg';
      }
      let className = SENDER_CLASS_NAME;
      const flag = item.from === chatData.fromId;
      switch (chatType) {
        // 员工检索
        case 'employee': {
          className = flag ? SENDER_CLASS_NAME : RECEIVER_CLASS_NAME;
          break;
        }
        // 客户检索
        case 'user': {
          className = flag ? RECEIVER_CLASS_NAME : SENDER_CLASS_NAME;
          break;
        }
      }
      return className;
    },
    dealVoiceImg(isPlaying, item) {
      const isReceiver = this.dealSender(item, this.chatData, this.chatType) === RECEIVER_CLASS_NAME;
      if (isPlaying) {
        if (isReceiver) return require('@/assets/image/voice-left.gif');
        return require('@/assets/image/voice-right.gif');
      } else {
        if (isReceiver) return require('@/assets/image/voice-left.png');
        return require('@/assets/image/voice-right.png');
      }
    },
    urlToBlob(file_url, msg) {
      const xhr = new XMLHttpRequest();
      const this_ = this;
      xhr.open('get', file_url, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        const blob = this.response;
        const file = new File([blob], '语音.amr', { type: 'audio/amr' });
        this_.playOrResumeAudio(file, msg);
      };
      xhr.send();
    },
    playOrResumeAudio(file, msg) {
      const this_ = this;
      const msgId = msg.msgId;

      // 第一次点击语音
      if (!this.voicePlayObj[msgId]) {
        const amr = new BenzAMRRecorder();
        try {
          amr.initWithBlob(file).then(function() {
            this_.voicePlayObj[msgId] = {};
            this_.voicePlayObj[msgId].amr = amr;
            amr.play();
            this_.changeMsgVoiceStatus(msgId, true);

            amr.onEnded(function() {
              this_.changeMsgVoiceStatus(msgId, false);
            });
          });
        } catch (err) {
          console.error('语音初始化失败', err);
        }
      } else {
        const amr = this_.voicePlayObj[msgId].amr;
        amr.playOrResume();
        this_.changeMsgVoiceStatus(msgId, true);
        amr.onEnded(function() {
          this_.changeMsgVoiceStatus(msgId, false);
        });
      }
    },
    pauseVideo(msg) {
      const msgId = msg.msgId;
      const amr = this.voicePlayObj[msgId].amr;
      amr.pause();
      this.changeMsgVoiceStatus(msgId, false);
    },
    changeMsgVoiceStatus(msgId, status) {
      this.voicePlayObj[msgId].isPlaying = status;
      // 产生一个新的对象，让页面重新渲染。
      this.voicePlayObj = { ...this.voicePlayObj };
    },
    /** 聊天记录消息的标题 */
    chatReCordShowTitle(title) {
      if (!title) {
        return '聊天记录';
      } else if (!/的聊天记录$/.test(title)) {
        // 有的聊天记录标题本身就包含了「的聊天记录」这几个字
        return `${title}的聊天记录`;
      }
      return title;
    },
    chatReCordShowText(item, type) {
      switch (item.type) {
        // 文本
        case 'text':
        case 'ChatRecordText': {
          return type !== 'unParsed' ? item.content.content : JSON.parse(item.content).content;
        }
        // 文件
        case 'ChatRecordFile': {
          return `[${JSON.parse(item.content).filename}]`;
        }
        // 链接
        case 'ChatRecordLink': {
          const data = JSON.parse(item.content);
          return `[链接]${data.title}`;
        }
        // 视频号
        case 'ChatRecordSphFeed': {
          return `[视频号]${JSON.parse(item.content).feed_desc}`;
        }
        // 图文消息
        case 'ChatRecordMixed': {
          return JSON.parse(item.content).item.map(this.chatReCordShowText).join('');
        }
        // 位置
        case 'ChatRecordLocation': {
          return '[位置]';
        }
        // 图片
        case 'image':
        case 'ChatRecordImage': {
          return '[图片]';
        }
        // 视频
        case 'ChatRecordVideo': {
          return '[视频]';
        }
        // 聊天记录
        case 'chatrecord': {
          return '[聊天记录]';
        }
      }
      return `${item.content}`;
    }
  }
};

</script>
<style lang="scss" scoped>
  * {
    padding: 0;
    margin: 0;
  }

  .shabowboxvidoe {
    position: fixed;
    width: 800px;
    height: 475px;
    left: 50%;
    margin-left: -400px;
    top: 50%;
    margin-top: -235px;
    ;
    z-index: 2001;
    background: #fff;
  }

  .shabowboxaudio {
    height: 125px;
    padding: 12px;
  }

  .close {
    position: fixed;
    width: 50px;
    height: 50px;
    right: 10px;
    z-index: 2012;
    top: 10px;
    text-align: center;
    line-height: 50px;
    font-size: 20px;
    color: #FFF;
    cursor: pointer;
    font-size: 43px;
  }

  .takecontent {
    text-align: left;
    width: 100%;
    height: calc(100% - 52px - 50px);
    overflow: auto;
    ::-webkit-scrollbar {
      display: none;
    }

    ul li {
      padding: 8px;
      display: flex;
      .avatar {
        flex-shrink: 0;
        background: none;
      }
    }

    .msgtypetext {
      padding: 5px 0;
      color: #333;
    }

    .msgtypevoice {
      margin: 10px;
      img {
        cursor: pointer;
      }
    }

    .msgtypefile {
      width: calc(100% - 10px);
      div {
        height: 40px;
        line-height: 40px;
        cursor: pointer;
        color: #199ed8;
        text-indent: 10px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2), 0 1px 4px 0 rgba(0, 0, 0, 0.19);
        margin: 10px;
        width: 200px;
        display: inline-block;
        text-align: left;
      }
    }

    .msgtypesph {
      div {
        max-width: 290px;
        height: 40px;
        line-height: 40px;
        cursor: pointer;
        color: #199ed8;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2), 0 1px 4px 0 rgba(0, 0, 0, 0.19);
        margin: 10px 0;
        display: inline-block;
        text-align: left;
        padding: 0 10px;
      }
    }

    .card_name {
      width: 320px;
      height: 105px;
      line-height: 80px;
      text-indent: 10px;
    }

    .msgtypevideo {
      margin: 10px;
      cursor: pointer;
      border-radius: 8px;
    }
    .msgtypeimg {
      height: 80px;
      margin: 10px;
      width: calc(100% - 10px);
      /deep/ .thumb {
        width: 100px;
        height: 80px;
      }
    }
    .msg-type-card {
      top: 20px;
      width: 240px;
      height: 91px;
      margin: 5px 0px;
      border-radius: 8px;
      -webkit-box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 8px 0 rgba(0, 0, 0, 0.19);
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 8px 0 rgba(0, 0, 0, 0.19);

      .card_name {
        width: 100%;
        display: flex;
        padding: 10px 10px 10px 0;
        height: 65px;
        text-align: left;
      }
      .card-left {
        width: 185px;
      }
      .card-corp-name {
        font-size: 12px;
        color: #666;
        line-height: 12px;
        display: flex;
        align-items: center;
      }
      .card-user-name {
        font-size: 14px;
        line-height: 14px;
        margin-top: 15px;
        color: #333;
      }
      img {
        width: 45px;
        height: 45px;
      }
      .wx-logo {
        width: 16px;
        height: 16px;
        margin-left: 10px;
        margin-right: 5px;
      }
      .card-foot {
        border-top: 1px solid #efefef;
        text-align: left;
        padding-left: 8px;
        line-height: 26px;
        color: #666;
        font-size: 12px;
        width: 100%;
      }
    }
    .msg-type-location,.msg-type-weapp {
      margin: 5px 0px;
    }
    .msgtypecard {
      width: 290px;
      text-align: left;
      border-radius: 8px;
      -webkit-box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 8px 0 rgba(0, 0, 0, 0.19);
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 8px 0 rgba(0, 0, 0, 0.19);
      .title {
        font-size: 14px;
        color: #262626;
        padding: 10px 10px 5px 10px;
      }
      .info {
        font-size: 12px;
        color: #666;
        margin-bottom: 5px;
        padding: 0 10px;
      }
      .name {
        font-size: 12px;
        color: #666;
        border-top: 1px solid #efefef;
        padding: 5px 10px;
      }
    }
    .sender, .receiver {
      position: relative;
      .info-line {
        color: #199ed8;
        .time {
          color: #999;
        }
      }
    }
    .sender {
      text-align: right;
      flex-direction: row-reverse;
    }

  }

  .system-msg{
    text-align: center;
    justify-content: center;
    .name {
      display: none;
    }
    .msgtypetext{
      font-size: 14px;
      color: #999;
    }
  }

  .msg-type-link, .msg-type-doc {
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(229, 229, 229);
    width: 293px;
    padding: 10px;
    display: inline-block;
    margin-top: 5px;
    border-radius: 4px;
    text-align: left;
    .msg-type-title {
      font-size: 14px;
      color: rgb(38, 38, 38);
    }
    .msg-type-desc {
      margin-top: 3px;
      display: flex;
      font-size: 12px;
      div {
        flex: 1;
        padding-right: 5px;
      }
    }
  }
  .msg-type-link {
    img {
      width: 45px;
      height: 45px;
    }
  }

  .chatrecord-content{
    margin: .7em 0;
    line-height: 1.4em;
    font-size: 12px;
  }
</style>
