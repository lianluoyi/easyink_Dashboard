<template>
  <div class="takecontent">
    <ul>
      <li v-for="(item,index) in allChat" :key="index">
        <div :style="{'color':item.action=='send'?'#199ed8':'#999'}">{{ item.from }} <span
          :style="{'color':item.action=='send'?'#199ed8':'#999'}"
        >{{ parseTime(item.msgtime) }}</span></div>
        <div v-if="item.msgtype=='text'" class="msgtypetext">
          {{ item.text.content }}
        </div>
        <div v-else-if="item.msgtype=='image'" class="msgtypeimg">
          <img :src="item.image.attachment">
        </div>
        <div v-else-if="item.msgtype=='file'" class="msgtypefile" @click="down(item.file)">
          {{ item.file.filename }}
        </div>
        <div v-else-if="item.msgtype=='voice'" class="msgtypevoice">
          <i class="el-icon-video-play" @click="play(item,'voice')" />
        </div>
        <div v-else-if="item.msgtype=='video'" class="msgtypevideo">
          <i class="el-icon-video-play" @click="play(item,'video')" />
        </div>

        <div v-else-if="item.msgtype=='location'" class="msgtypecard ">
          <div class="card_name" />
          <div class="card_foot">{{ item.location.address }}</div>
        </div>
        <div v-else-if="item.msgtype=='weapp'" class="msgtypecard ">
          <div class="card_name" />
          <div class="card_foot">小程序</div>
        </div>
        <div v-else-if="item.msgtype=='external_redpacket'">
          [这是一条红包消息]
        </div>
        <div v-else-if="item.msgtype=='card'" class="msgtypecard ">
          <div class="card_name">{{ item.card.corpname }}</div>
          <div class="card_foot">个人名片</div>
        </div>
        <div v-else-if="item.msgType=='link'" class="msgtypelink">
          <a class="msg-type-link" :href="item.link.linkUrl" target="_blank">
            <div class="msg-type-title">{{ item.link.title }}</div>
            <div class="msg-type-desc">
              <div>{{ item.link.description }}</div>
              <img :src="item.link.image_url || item.link.imageUrl">
            </div>
          </a>
        </div>
      </li>
    </ul>
    <el-dialog :visible.sync="dia" :show-close="false">
      <p>播放</p>

    </el-dialog>
  </div>
</template>

<script>
import {
  downloadFile
} from '@/utils/common.js';
export default {
  props: {
    allChat: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      dia: false
    };
  },
  methods: {
    play() {
      this.dia = true;
    },
    down(e) {
      downloadFile(e.attachment, e.fileName || e.file.filename);
    }
  }
};
</script>
<style lang="scss" scoped>
    * {
        padding: 0;
        margin: 0;
    }

    .takecontent {
        text-align: left;
        width: 100%;
        height: 600px;
        overflow-y: scroll;

        ::-webkit-scrollbar {
            display: none;
        }

        ul li {
            padding: 8px;
        }

        .msgtypetext {
            padding: 10px 0;
        }

        .msgtypevoice {
            margin: 10px;
        }

        .msgtypefile {
            margin: 10px;
            width: 200px;
            height: 40px;
            line-height: 40px;
             cursor: pointer;
               color: #199ed8;
            text-indent: 10px;
            box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2), 0 1px 4px 0 rgba(0, 0, 0, 0.19);
        }
        .card_name{ line-height: 80px;text-indent: 10px;}
        .msgtypevideo {
            margin: 10px;
            font-size: 40px;
            cursor: pointer;
            color: #199ed8;
            border-radius: 8px;
        }

        .msgtypeimg {
            height: 80px;
            margin: 10px;
            width: calc(100% - 10px);
        }

        .msgtypecard {
            width: 300px;
            height: 140px;
            margin: 10px;
            border-radius: 8px;
            -webkit-box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 8px 0 rgba(0, 0, 0, 0.19);
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 8px 0 rgba(0, 0, 0, 0.19);
            position: relative;

            .card_foot {
                position: absolute;
                height: 20px;
                border-top: 1px solid #efefef;
                text-align: left;
                bottom: 15px;
                padding: 10px;
                color: #333;
                font-weight: bold;
                width: 100%;
            }
        }

    }
.msg-type-link {
    margin-top: 5px;
    display: block;
    padding: 10px;
    width: 293px;
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(229, 229, 229);
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
    img {
        width: 45px;
        height: 45px;
    }
}
</style>
