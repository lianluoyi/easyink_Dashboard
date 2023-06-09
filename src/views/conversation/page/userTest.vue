<template>
  <div class="employ">
    <el-row class="user-test-div">
      <el-col :span="6" class="borderR">
        <div class="hd_box" style="height: 92px">
          <div class="hd_name">客户列表（{{ employAmount }}）</div>
          <div class="paddingT10">
            <el-input v-model="employName" placeholder="输入客户昵称，回车搜索" prefix-icon="el-icon-search" @keyup.enter.native="customerList" />
          </div>
        </div>
        <div v-loading="userListLoading" class="ct_box ct_boxFirst">
          <empty-default-icon
            text="暂无客户"
            desc="若首次加载，请耐心等待后台数据同步，稍后回来"
            :desc-show-condition="{ employName }"
            :length="CList.length"
          >
            <ul>
              <li v-for="(i,t) in CList" :key="t" :class="{'liActive':t==personIndex}" @click="personCheck(i,t)">
                <div class="customer-item">

                  <img :src="i.avatar || require('@/assets/image/card-avatar.svg')" alt="头像">
                  <div class="toe">{{ i.name }}</div>
                </div>
              </li>
            </ul>
          </empty-default-icon>
        </div>
      </el-col>
      <el-col :span="6" class="borderR">
        <div class="hd_box">
          <div class="hd_name">{{ talkName }}</div>
        </div>
        <div class="hd_tabs">
          <el-tabs v-model="activeName" class="group-tabs" @tab-click="handleChatTabClick">
            <el-tab-pane class="chat-list single-chat" label="单聊" name="0">
              <div class="hd_tabs_content">
                <list v-if="activeName==0" :person-list="showPersonList" :loading="loading" @chatFn="chatFn" />
              </div>
            </el-tab-pane>
            <el-tab-pane class="chat-list group-chat" label="群聊" name="2">
              <grouplist v-if="activeName==2" :person-list="showPersonList" :loading="loading" @groupFn="groupFn" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
      <el-col :span="12" class="chat-content-div">
        <!-- <div class="hd_box">
          <div class="hd_name">
              <span
              v-if="chatData&&chatData.finalChatContext">与{{chatData.finalChatContext.fromInfo.name}} 的聊天</span>
              判断 activeName
            <span class="fr hd_nameRi">下载会话</span>
          </div>
        </div> -->
        <div class=" hd_tabthree">
          <el-tabs v-model="activeNameThree" class="tabthree-tabs" @tab-click="activeNameThreeClick()">
            <el-tab-pane class="tabthree-tab-pane" label="全部" :name="MSG_TYPE_ALL">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <el-date-picker
                    v-model="takeTime"
                    type="daterange"
                    format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    @change="activeNameThreeClick"
                  />
                </div>
                <chats :all-chat="allChat" :chat-data="chatData" chat-type="user" />
                <el-pagination
                  v-if="allChat.length>=1"
                  background
                  layout="prev, pager, next"
                  class="pagination"
                  :current-page="currentPage"
                  :total="total"
                  @current-change="currentChange"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane class="tabthree-tab-pane" label="图片" :name="MSG_TYPE_IMG">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <el-date-picker
                    v-model="takeTime"
                    type="daterange"
                    format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    @change="activeNameThreeClick"
                  />
                </div>
                <chats :all-chat="allChatImg" :chat-data="chatData" chat-type="user" />
                <el-pagination
                  v-if="allChatImg.length>=1"
                  background
                  class="pagination"
                  layout="prev, pager, next"
                  :total="total"
                  :current-page="currentPage"
                  @current-change="currentChange"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane class="tabthree-tab-pane" label="视频" :name="MSG_TYPE_VIDEO">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <el-date-picker
                    v-model="takeTime"
                    type="daterange"
                    format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    @change="activeNameThreeClick"
                  />
                </div>
                <chats :all-chat="allVideo" :chat-data="chatData" chat-type="user" />
                <el-pagination
                  v-if="allVideo.length>=1"
                  background
                  class="pagination"
                  layout="prev, pager, next"
                  :total="total"
                  :current-page="currentPage"
                  @current-change="currentChange"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane class="tabthree-tab-pane" label="文件" :name="MSG_TYPE_FILE">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <el-date-picker
                    v-model="takeTime"
                    type="daterange"
                    format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    @change="activeNameThreeClick"
                  />
                </div>
                <el-table :data="allFile" style="width: 100%">
                  <template slot="empty">
                    <empty-default-icon
                      text="暂无聊天记录"
                    />
                  </template>
                  <el-table-column label="类型">
                    <template slot-scope="scope">
                      {{ scope.row.msgType || scope.row.msgtype }}
                    </template>
                  </el-table-column>
                  <el-table-column label="名称">
                    <template slot-scope="scope">
                      {{ scope.row.file.filename || scope.row.file.fileName }}
                    </template>
                  </el-table-column>
                  <el-table-column label="大小">
                    <template slot-scope="scope">
                      {{ filterSize(scope.row.file.fileSize || scope.row.file.filesize) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="action" label="来源">
                    <template slot-scope="scope">
                      {{ scope.row.fromInfo && scope.row.fromInfo.name }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="action" label="操作">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="download(scope.row)">下载</el-button>
                      <!-- <el-button type="text" size="small">查看</el-button> -->
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane class="tabthree-tab-pane" label="图文链接" :name="MSG_TYPE_LINK">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <el-date-picker
                    v-model="takeTime"
                    type="daterange"
                    format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    @change="activeNameThreeClick"
                  />
                </div>
                <chats :all-chat="allLInk" :chat-data="chatData" chat-type="user" />
                <el-pagination
                  v-if="allLInk&&allLInk.length>=1"
                  background
                  class="pagination"
                  layout="prev, pager, next"
                  :total="total"
                  :current-page="currentPage"
                  @current-change="currentChange"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane class="tabthree-tab-pane" label="语音通话" :name="MSG_TYPE_VOICE">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <el-date-picker
                    v-model="takeTime"
                    type="daterange"
                    format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right"
                    @change="activeNameThreeClick"
                  />
                </div>
                <el-table :data="allVoice" style="width: 100%">
                  <template slot="empty">
                    <empty-default-icon
                      text="暂无聊天记录"
                    />
                  </template>
                  <el-table-column prop="date" label="发起人">
                    <template slot-scope="scope">
                      {{ scope.row.fromInfo.name }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="通话时间">
                    <template slot-scope="scope">
                      {{ parseTime(scope.row.msgtime || scope.row.msgTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="address" label="时长">
                    <template slot-scope="scope">
                      {{ (scope.row.voice.play_length || scope.row.voice.playLength) }}s
                    </template>
                  </el-table-column>
                  <el-table-column prop="address" label="操作">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="voiceLook(scope.row.voice)">查看</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>

  </div>
</template>
<script>
import list from '../component/customerList.vue';
import chats from '../component/chat.vue';
import grouplist from '../component/groupList.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import {
  content
} from '@/api/content.js';
import {
  yearMouthDay,
  downloadFile,
  filterSize,
  downloadAMR
} from '@/utils/common.js';
import { listDistinct } from '@/api/customer/index';
import { MSG_TYPE, MSG_TYPE_VIDEO, MSG_TYPE_IMG, MSG_TYPE_FILE, MSG_TYPE_LINK, MSG_TYPE_VOICE, MSG_TYPE_ALL } from '@/utils/constant';
export default {
  components: {
    list,
    chats,
    grouplist,
    EmptyDefaultIcon
  },
  data() {
    return {
      employAmount: 0,
      employName: '',
      talkName: '',
      chatContent: '',
      personIndex: '-1',
      activeName: '0',
      activeNameThree: '0',
      takeTime: '',
      fileData: [],
      CList: [],
      personList: [],
      showPersonList: [],
      loading: false,
      employId: '',
      chatData: {},
      allChat: [],
      allChatImg: [],
      allFile: [],
      allLInk: [],
      allVoice: [],
      allVideo: [],
      // 分页
      currentPage: 1,
      total: 0,
      chatType: 'singleChat',
      MSG_TYPE_VIDEO,
      MSG_TYPE_IMG,
      MSG_TYPE_FILE,
      MSG_TYPE_LINK,
      MSG_TYPE_VOICE,
      MSG_TYPE_ALL,
      contentLoading: false,
      userListLoading: true
    };
  },
  mounted() {
    this.customerList();
  },

  methods: {
    filterSize,
    chatFn(data) {
      this.chatData = data;
      this.activeNameThreeClick();
    },
    groupFn(data) {
      this.chatData = data;
      this.activeNameThreeClick('', true);
    },
    currentChange(e) {
      this.currentPage = e;
      if (this.activeName === '2') {
        return this.activeNameThreeClick(true, true);
      }
      this.activeNameThreeClick(true);
    },
    personCheck(data, e) {
      this.personIndex = e;
      this.talkName = data.name;
      this.employId = data.externalUserid;
      this.getChatList();
    },
    getChatList() {
      if (!this.employId) {
        return;
      }
      this.loading = true;
      this.personList = [];
      content.getTree({
        fromId: this.employId,
        searchType: this.activeName
      }).then((
        { rows }
      ) => {
        this.loading = false;
        this.personList = rows;
        this.matchChatObject(this.chatContent);
      }).catch(() => {
        this.loading = false;
      });
    },
    activeNameThreeClick(page, group) {
      const isGroup = this.chatType === 'groupChat' || group;
      if (!page) {
        this.currentPage = 1;
      }
      let msgType = '';
      if (this.activeNameThree === '0') {
        msgType = '';
      } else {
        msgType = MSG_TYPE[this.activeNameThree];
      }
      const query = {
        fromId: this.chatData.fromId,
        msgType,
        pageSize: '10',
        pageNum: this.currentPage,
        beginTime: this.takeTime ? yearMouthDay(this.takeTime[0]) : '',
        endTime: this.takeTime ? yearMouthDay(this.takeTime[1]) : ''
      };
      if (isGroup) {
        query.roomId = this.chatData.roomId;
      } else {
        query.receiveId = this.chatData.receiveId;
      }
      this.contentLoading = true;
      if (isGroup) {
        content.chatGrounpList(query).then(res => {
          this.total = Number(res.data.total);
          this.resortData(res.data);
        }).finally(() => {
          this.contentLoading = false;
        });
      } else {
        content.chatList(query).then(res => {
          this.total = Number(res.data.total);
          this.resortData(res.data);
        }).finally(() => {
          this.contentLoading = false;
        });
      }
    },
    resortData(res) {
      if (!res) return;
      const resData = res.list || [];
      switch (this.activeNameThree) {
        case MSG_TYPE_ALL: {
          this.allChat = resData;
          break;
        }
        case MSG_TYPE_IMG: {
          this.allChatImg = resData;
          break;
        }
        case MSG_TYPE_FILE: {
          this.allFile = resData;
          break;
        }
        case MSG_TYPE_LINK: {
          this.allLInk = resData;
          break;
        }
        case MSG_TYPE_VOICE: {
          this.allVoice = resData;
          break;
        }
        case MSG_TYPE_VIDEO: {
          this.allVideo = resData;
          break;
        }
      }
    },
    customerList() {
      const querys = {
        pageNum: 1,
        // eslint-disable-next-line no-magic-numbers
        pageSize: 999,
        name: this.employName,
        userId: '',
        tagIds: '',
        beginTime: '',
        endTime: '',
        status: '',
        isOpenChat: '1',
        queryType: 1
      };
      this.userListLoading = true;
      listDistinct(querys).then(res => {
        this.CList = res.rows;
        this.employAmount = res.total;
      }).finally(() => {
        this.userListLoading = false;
      });
    },
    download(e) {
      downloadFile(e.file.attachment, e.file.fileName || e.file.filename);
    },
    voiceLook(e) {
      downloadAMR(e.attachment);
    },
    handleChatTabClick(tab, event) {
      if (tab.name === '2') {
        this.chatType = 'groupChat';
      } else {
        this.chatType = 'singleChat';
      }
      this.getChatList();
    },
    matchChatObject(value) {
      if (value) {
        this.showPersonList = this.personList.filter(item => {
          return (item?.receiveWeUser?.name?.indexOf(value) >= 0) || (item?.roomInfo?.groupName?.indexOf(value) >= 0) || 0;
        });
      } else {
        this.showPersonList = [...this.personList];
      }
    }
  }
};

</script>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
  /deep/.el-tabs__nav-scroll {
    padding-left: 15px;
  }

  .fr {
    float: right;
  }

  .borderR {
    border-right: 2px solid #ccc;
    height: 100%;
  }
  .chat-content-div {
    height: 100%;
  }

  .paddingT10 {
    padding-top: 10px
  }

  .employ {
    background: #f6f6f9;
    height: 100%;
    .user-test-div {
      height: 100%;
    }

    .hd_tabs {
      background: #fff;
      height: calc(100% - 92px);
      /deep/ .el-tabs__content {
        height: calc(100% - 40px);
      }
      .chat-list {
        height: 100%;
        .hd_tabs_content {
          height: 100%;
          .list {
            height: 100%;
          }
        }
      }
      .group-tabs {
        height: 100%;
      }
    }

    /deep/ .el-tabs__header {
      margin: 0;
    }

    .hd_box {
      padding: 15px;
      height: 52px;
    }

    .hd_name {
      font-size: 18px;
      min-height: 20px;
    }

    .hd_tabs_content {
      width: 100%;
      border-bottom: 1px solid #efefef;
    }

    .hd_nameRi {
      color: #199ed8;
      text-align: right;
      font-size: 16px;
      cursor: pointer;
    }

    .ct_box {
      background: white;
      border-bottom: 1px solid #efefef;
      // min-height: 709px;
      padding: 10px;
      overflow-y: auto;
      color: #999;
      text-align: center;

      ::-webkit-scrollbar {
        display: none;
      }

      ul {
        margin: 0;
        padding: 0;
      }

      ul li {

        text-align: left;
        cursor: pointer;
        border-bottom: 1px solid #efefef;

        :hover {
          background: #efefef;
        }

        img {
          width: 40px;
          height: 40px;
        };
      }
      .liActive {
        background-color: #eeeeee;
      }
      .hds_time {
        text-align: left;
        width: 100%;
        padding: 10px 0;
      }
    }

    .ct_boxFirst {
      // height: 700px;
      height: calc(100% - 92px);
      padding: 10px 0;
      .customer-item {
        padding: 10px;
        margin: 0px;
        display: flex;
        img {
          margin-right: 10px;
        }
        div {
          flex: 1;
          width: 0;
          line-height: 40px;
        }
      }
    }
  }

  .pagination {
    padding: 10px 0;
    height: 30px;
    float: left;
  }

  .hd_tabthree {
    height: 100%;
    /deep/ .tabthree-tabs {
      height: 100%;
      .el-tabs__content {
        height: calc(100% - 40px);
        .tabthree-tab-pane {
          height: 100%;
          .ct_box {
            height: 100%;
          }
        }
      }
    }
  }

</style>
