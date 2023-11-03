<template>
  <div v-loading="loading" class="list group">
    <empty-default-icon
      v-if="!loading"
      text="暂无聊天对象"
      :length="personList.length"
    >
      <div v-if="personList">
        <ul>
          <li v-for="(item,index) in personList" :key="index" :class="{'liActive': index == groupIndex}" @click="liClick(item, index)">
            <el-row style="padding:10px;display:flex;">
              <span class="fl">
                <div class="ninebox">
                  <ul v-if="item.roomInfo">
                    <li v-for="(a,i) in item.roomInfo.avatar.split(',')" :key="i"><img :src="a"></li>
                  </ul>
                </div>

              </span>
              <span class="fl" style="margin-left: 10px;line-height: 25px;flex: 1;display:flex;flex-direction:column;justify-content: space-between;padding: 2px 0;overflow: hidden;">
                <p class="flex" style="justify-content: space-between;">
                  <span class="inoneline" style="width:70px;">{{ (item.roomInfo && item.roomInfo.groupName) || (item.finalChatContext && item.finalChatContext.roomInfo && item.finalChatContext.roomInfo.name) || '' }}</span>
                  <span v-if="item.finalChatContext" class="fr gray inoneline">{{ dealTime(item.finalChatContext.msgtime) }}</span>
                </p>
                <div v-if="item.finalChatContext && item.finalChatContext.fromInfo">
                  <p v-if="item.finalChatContext.text" class="gray inoneline" :title="item.finalChatContext.fromInfo.name + ':' + item.finalChatContext.text.content">{{ item.finalChatContext.fromInfo.name }}:{{ item.finalChatContext.text.content }}</p>
                  <p v-else-if="item.finalChatContext.image" class="gray inoneline" :title="item.finalChatContext.fromInfo.name + ':[图片]'">{{ item.finalChatContext.fromInfo.name }}:[图片]</p>
                  <p v-else class="gray inoneline" :title="item.finalChatContext.fromInfo.name + ':[消息]'">{{ item.finalChatContext.fromInfo.name }}:[消息]</p>
                </div>
              </span>
            </el-row>
          <!-- <el-row style="padding:10px" v-if="item.finalChatContext.msgtype=='file'">
                <el-col :span="3">&nbsp;</el-col>
                <el-col :span="21">
                   <p><span class="fr gray">{{parseTime(item.finalChatContext.msgtime)}}</span></p>
                   <p class="gray padt10" >{{item.finalChatContext.from}}:
                       <span v-if="item.finalChatContext.file.fileext=='mp4'">[视频]</span>
                       </p>
                </el-col>
                </el-row>   -->
          </li>
        </ul>
      </div>
    </empty-default-icon>
  </div>
</template>
<script>
import { parseTime } from '@/utils/common.js';
import moment from 'moment';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';

export default {
  components: { EmptyDefaultIcon },
  props: {
    personList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      defluat: false
    }
  },

  data() {
    return {
      loadings: true,
      groupIndex: -1
    };
  },
  watch: {
    personList() {
      this.groupIndex = -1;
    }
  },
  // 点击群聊时删除session里的信息
  mounted() {
    sessionStorage.removeItem('list');
    sessionStorage.removeItem('insideList');
  },
  methods: {
    liClick(e, index) {
      this.groupIndex = index;
      this.$emit('groupFn', e);
    },
    dealTime(time) {
      const timeMoment = moment(parseTime(time));
      const isCurYear = moment().diff(timeMoment, 'year') === 0;
      const isToday = moment().dayOfYear() === timeMoment.dayOfYear();
      const isYesterday = moment().dayOfYear() === timeMoment.dayOfYear() + 1;
      if (isCurYear) {
        if (isToday) {
          return timeMoment.format('HH:mm');
        } else if (isYesterday) {
          return '昨天';
        } else {
          return timeMoment.format('MM-DD');
        }
      } else {
        return timeMoment.format('YYYY-MM-DD');
      }
    }
  }
};
</script>
<style lang="scss" scoped>
*{ padding: 0;
.fl{float: left;}
      margin: 0;}
      .ninebox{ width: 54px; height: 54px; border: 1px solid #199ed8;
        ul li{
            float: left;
            width: 15px;
            height: 15px;
            padding: 0!important;
            margin:1px 1px 1px 1px;
        }}
    .list {
        overflow-y: auto;
        height: 100%;
        /deep/ .el-loading-spinner{margin-top: 20px;}
       .fr{float:right;}
       .gray{color: #999;}
       .padt10{padding-top: 10px;}
        ul li {
            overflow: hidden;
            border-bottom: 1px solid #efefef;
            cursor: pointer;
            p{white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;}
            :hover{ background: #efefef;}
            img {
                width: 100%;
                height: 100%;
                float: left
            }
        }
        .liActive {
            background-color: #eeeeee;
        }
    }
</style>
