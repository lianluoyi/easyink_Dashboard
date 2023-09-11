<!--
 * @Description: 全局检索单个消息布局
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="chat-item-div">
    <li>
      <div v-if="item.msgType=='location'" class="msg-type-location">
        [位置] {{ item.location.address }}
      </div>
      <div v-else-if="item.msgType=='weapp'" class="msg-type-weapp">
        [小程序]{{ item.weApp && item.weApp.title || item.weapp && item.weapp.title }}
      </div>
      <div v-else-if="item.msgType=='text'" class="msgtype-text">
        {{ item.text.content }}
      </div>
      <div v-else-if="item.msgType=='mixed'" class="msgtype-img">
        <MixedList :mixed="item.mixed.item" />
      </div>
      <div v-else-if="item.msgType=='image'" class="msgtype-img">
        <ImgChatItem :img-url="item.image.attachment" />
      </div>
      <div v-else-if="item.msgType=='video'" class="msgtype-video">
        <VideoChatItem :url="item.video.attachment" />
      </div>
      <div v-else-if="item.msgType=='voice'" class="msgtype-voice">
        <VoiceChatItem :item="item" />
      </div>
      <div v-else-if="item.msgType=='file'" class="msgtype-file">
        <div class="toe">
          [文件]
          <span class="file-name" :title="item.file.filename || item.file.fileName" @click="down(item.file)">{{ item.file.filename || item.file.fileName }}</span>
        </div>
      </div>
      <div v-else-if="item.msgType=='card'" class="msg-type-card">
        [名片]
        {{ item.card.userName || item.card.userId || item.card.username || item.card.userid }}
        <span :class="`${renderWxFlag(item) ? 'wx-source' : 'source'}`">@{{ renderWxFlag(item) ? '微信' : item.card.corpName || item.card.corpname }}</span>
      </div>
      <div v-else-if="item.msgType=='link'" class="msgtype-link">
        [链接]
        <a class="msg-type-link" :title="item.link.title" :href="item.link.linkUrl || item.link.link_url" target="_blank">
          {{ item.link.title }}
        </a>
      </div>
      <div v-else-if="item.msgType=='external_redpacket'" class="msgtype-redpacket">
        <div>[红包]
          <span v-if="item.redPacket || item.redpacket">
            <span>{{ (item.redPacket.type || item.redpacket.type) && (redpacketType[item.redPacket.type] || '未知红包类型') }} | </span><span>{{ item.redPacket.wish || item.redpacket.wish }}</span>
          </span>
        </div>
      </div>
      <div v-else-if="item.msgType=='collect'" class="msgtype-collect">
        [投票] {{ item.collect.title }}
      </div>
      <div v-else-if="item.msgType=='meeting'" class="msgtype-meeting">
        [会议] {{ item.meeting.topic }}
      </div>
      <div v-else-if="item.msgType=='calendar'" class="msgtype-calendar">
        [日程] {{ item.calendar.title }}
      </div>
      <div v-else-if="item.msgType=='sphfeed'" class="msgtype-sphfeed">
        [视频号] {{ (item.sphFeed || item.sphfeed) && (item.sphFeed.feedDesc || item.sphfeed.feed_desc) }}
      </div>
      <div v-else-if="item.msgType=='emotion'" class="msgtype-img">
        <ImgChatItem :img-url="item.emotion.attachment" />
      </div>
      <div v-else-if="item.msgType=='docmsg'" class="msg-doc">
        [文档] <a :href="item.doc.linkUrl || item.doc.linkurl" target="_blank">{{ item.doc.title }}</a>
      </div>
      <div v-else-if="item.msgType=='chatrecord'" class="msg-chatrecord">
        [会话记录] {{ item.chatReCord.title }}
      </div>
    </li>

  </div>
</template>

<script>
import 'video.js/dist/video-js.css';
import 'vue-video-player/src/custom-theme.css';
import VoiceChatItem from './voiceChatItem.vue';
import VideoChatItem from './videoChatItem.vue';
import ImgChatItem from './imgChatItem.vue';
import MixedList from './mixedList.vue';
import {
  downloadFile
} from '@/utils/common.js';

const COMMON_RED_PACKET = 1;
const SPELL_LUCK_RED_PACKET = 2;
const REDPACKET_TYPE = {
  [COMMON_RED_PACKET]: '普通红包',
  [SPELL_LUCK_RED_PACKET]: '拼手气群红包'
};
export default {
  components: { VoiceChatItem, VideoChatItem, ImgChatItem, MixedList },
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      redpacketType: REDPACKET_TYPE
    };
  },
  mounted() {
  },
  methods: {
    /**
     * 文件下载
     */
    down(e) {
      downloadFile(e.attachment, e.fileName || e.filename);
    },
    renderWxFlag(item) {
      return ['微信', '微信联系人'].includes(item.card.corpName || item.card.corpname);
    }
  }
};

</script>
<style lang="scss" scoped>
  .chat-item-div {
    .msgtype-voice, .msgtype-video {
      /deep/ img {
        cursor: pointer;
      }
    }
    .msgtype-img {
      /deep/ .thumb {
        width: 60px;
        height: 60px;
        cursor: pointer;
      }
    }
    .msgtype-file {
      .file-name {
        color: $blue;
        cursor: pointer;
      }
    }
    .msg-type-card {
      .wx-source, .source {
        color: #F2A622;
        font-size: 12px;
      }
      .wx-source {
        color: $wxGreen;
      }
    }
    .msgtype-link {
      a {
        color: $blue;
      }
    }
  }
</style>
