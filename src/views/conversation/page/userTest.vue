<template>
  <div class="employ">
    <el-row>
      <el-col :span="6" class="borderR">
        <div class="hd_box" style="height: 92px">
          <div class="hd_name">客户列表（{{ employAmount }}）</div>
          <div class="paddingT10">
            <el-input
              v-model="employName"
              placeholder="输入客户昵称，回车搜索"
              prefix-icon="el-icon-search"
              @keyup.enter.native="() => {
                customerQuery.pageNum = 1;
                customerList()
              }"
            />
          </div>
        </div>
        <div v-loading="userListLoading" class="ct_box ct_boxFirst">
          <empty-default-icon
            class="h100"
            text="暂无客户"
            desc="若首次加载，请耐心等待后台数据同步，稍后回来"
            :desc-show-condition="{ employName }"
            :length="CList.length"
          >
            <ul class="customer-list">
              <li v-for="i in CList" :key="i.externalUserid" :class="{'liActive': i.externalUserid === employId}" @click="personCheck(i)">
                <div class="customer-item">
                  <img :src="i.avatar || require('@/assets/image/card-avatar.svg')" alt="头像">
                  <div class="toe">{{ i.name }}</div>
                </div>
              </li>
            </ul>
            <div class="footer-button">
              <el-button size="mini" class="mr10" :disabled="customerQuery.pageNum === DEFAULT_PAGE_NUM" type="primary" plain icon="el-icon-arrow-left" @click="customerPageChange(false)">
                上一页
              </el-button>
              <el-button size="mini" class="ml10" :disabled="CList.length < customerQuery.pageSize" type="primary" plain @click="customerPageChange(true)">
                <span>下一页</span>
                <i class="el-icon-arrow-right" />
              </el-button>
            </div>
          </empty-default-icon>
        </div>
      </el-col>
      <el-col :span="6" class="borderR">
        <div class="hd_box">
          <div class="hd_name">{{ talkName }}</div>
        </div>
        <div class="hd_tabs">
          <el-tabs v-model="activeName" class="group-tabs" @tab-click="handleChatTabClick">
            <div v-if="activeName === PRIVATE_CHAT" class="search">
              <el-input
                v-model="query.chatName"
                placeholder="请输入聊天对象昵称"
                clearable
                prefix-icon="el-icon-search"
                @clear="handleChatTabClick"
                @keyup.enter.native="() => {
                  query.pageNum = DEFAULT_PAGE_NUM;
                  handleChatTabClick()
                }"
              />
            </div>
            <el-tab-pane class="hd-tab-pane" label="单聊" :name="PRIVATE_CHAT">
              <list v-if="activeName === PRIVATE_CHAT" :person-list="showPersonList" :loading="loading" @chatFn="chatFn" />
            </el-tab-pane>
            <el-tab-pane class="hd-tab-pane" label="群聊" :name="GROUP_CHAT">
              <grouplist v-if="activeName === GROUP_CHAT" :person-list="showPersonList" :loading="loading" @groupFn="groupFn" />
            </el-tab-pane>
          </el-tabs>
          <div v-if="showPersonList.length" class="footer-button">
            <el-button
              :disabled="query.pageNum === DEFAULT_PAGE_NUM"
              type="primary"
              size="mini"
              plain
              icon="el-icon-arrow-left"
              class="mr10"
              @click="pageChange(false)"
            >
              上一页
            </el-button>
            <el-button
              :disabled="showPersonList.length < query.pageSize"
              type="primary"
              size="mini"
              plain
              class="ml10"
              @click="pageChange(true)"
            >
              <span>下一页</span>
              <i class="el-icon-arrow-right" />
            </el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="12" class="chat-content-div">
        <div class=" hd_tabthree">
          <el-tabs v-model="activeNameThree" class="tabthree-tabs" @tab-click="activeNameThreeClick()">
            <el-tab-pane class="tabthree-tab-pane" label="全部" :name="MSG_TYPE_ALL">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <DatePicker
                    align="right"
                    :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter"
                    type="daterange"
                    :time.sync="takeTime"
                    value-format="yyyy-MM-dd"
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
                  <DatePicker
                    align="right"
                    :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter"
                    type="daterange"
                    :time.sync="takeTime"
                    value-format="yyyy-MM-dd"
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
                  <DatePicker
                    align="right"
                    :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter"
                    type="daterange"
                    :time.sync="takeTime"
                    value-format="yyyy-MM-dd"
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
                  <DatePicker
                    align="right"
                    :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter"
                    type="daterange"
                    :time.sync="takeTime"
                    value-format="yyyy-MM-dd"
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
                  <DatePicker
                    align="right"
                    :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter"
                    type="daterange"
                    :time.sync="takeTime"
                    value-format="yyyy-MM-dd"
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
                  <DatePicker
                    align="right"
                    :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter"
                    type="daterange"
                    :time.sync="takeTime"
                    value-format="yyyy-MM-dd"
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
import DatePicker from '@/components/DatePicker';
import moment from 'moment';
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
import { listDistinct, listDistinctCount } from '@/api/customer/index';
import { DATE_DISABLED_TYPE, DEFAULT_PAGE_NUM, PAGE_LIMIT_TWENTY, MSG_TYPE, MSG_TYPE_VIDEO, MSG_TYPE_IMG, MSG_TYPE_FILE, MSG_TYPE_LINK, MSG_TYPE_VOICE, MSG_TYPE_ALL } from '@/utils/constant/index';
const GROUP_CHAT = '2';
const PRIVATE_CHAT = '0'; // 单聊
export default {
  components: {
    list,
    chats,
    grouplist,
    EmptyDefaultIcon,
    DatePicker
  },
  data() {
    return {
      DATE_DISABLED_TYPE,
      employAmount: 0,
      employName: '',
      talkName: '',
      chatContent: '',
      activeName: PRIVATE_CHAT,
      activeNameThree: '0',
      takeTime: [moment().subtract(1, 'month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
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
      userListLoading: true,
      DEFAULT_PAGE_NUM,
      query: {
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT_TWENTY,
        chatName: ''
      },
      customerQuery: {
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT_TWENTY
      },
      PRIVATE_CHAT,
      GROUP_CHAT
    };
  },
  mounted() {
    this.customerList();
  },

  methods: {
    filterSize,
    chatFn(data) {
      this.takeTime = [moment().subtract(1, 'month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
      this.chatData = data;
      this.activeNameThreeClick();
    },
    /**
     * @description 聊天列表切换页码
     * @param flag 为true时上一页 false时下一页
     */
    pageChange(flag) {
      if (flag) {
        this.query.pageNum++;
      } else {
        this.query.pageNum--;
      }
      this.getChatList();
    },
    /**
     * @description 客户列表切换页码
     * @param flag 为true时上一页 false时下一页
     */
    customerPageChange(flag) {
      if (flag) {
        this.customerQuery.pageNum++;
      } else {
        this.customerQuery.pageNum--;
      }
      this.customerList();
    },
    groupFn(data) {
      this.takeTime = [moment().subtract(1, 'month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
      this.chatData = data;
      this.activeNameThreeClick('', true);
    },
    currentChange(e) {
      this.currentPage = e;
      if (this.activeName === GROUP_CHAT) {
        return this.activeNameThreeClick(true, true);
      }
      this.activeNameThreeClick(true);
    },
    personCheck(data) {
      this.talkName = data.name;
      this.employId = data.externalUserid;
      this.query.pageNum = DEFAULT_PAGE_NUM;
      this.query.chatName = '';
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
        searchType: this.activeName,
        ...this.query
      }).then((
        { rows }
      ) => {
        this.personList = rows;
        this.matchChatObject(this.chatContent);
      }).finally(() => {
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
        name: this.employName,
        userId: '',
        tagIds: '',
        beginTime: '',
        endTime: '',
        status: '',
        isOpenChat: '1',
        queryType: 1,
        ...this.customerQuery
      };
      this.userListLoading = true;
      if (this.activeName === GROUP_CHAT) {
        querys.chatName = '';
      }
      if (!this.employAmount) {
        listDistinctCount(querys).then((res) => {
          this.employAmount = res.data.ignoreDuplicateCount;
        }).catch(() => {});
      }
      listDistinct(querys).then(res => {
        this.CList = res.rows;
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
    handleChatTabClick() {
      if (this.activeName === GROUP_CHAT) {
        this.chatType = 'groupChat';
        this.query.chatName = '';
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
    /deep/ .el-row {
      height: 100%;
    }
    .footer-button {
       box-shadow: 0px -5px 10px 0px rgba(0, 0, 0, 0.11);
       display: flex;
       height: 52px;
       align-items: center;
       justify-content: center;
       border-top: 1px solid #efefef;
       button {
         width: 90px;
       }
       .el-icon-arrow-right:before {
         margin-left: 10px;
       }
     }
    .hd_tabs {
      background: #fff;
      height: calc(100% - 52px);
      .group-tabs {
        height: calc(100% - 52px);
         /deep/ .el-tabs__content {
          height: calc(100% - 40px);
          .hd-tab-pane {
            height: 100%;
            .el-tab-pane {
              height: 100%;
            }
          }
        }
      }
      /deep/ .el-tabs__header {
        margin: 0;
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

    .ct_box {
      background: white;
      padding: 10px;
      height: 100%;
      overflow-y: auto;
      color: #999;
      text-align: center;
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
      height: calc(100% - 92px);
      padding: 0;
      .customer-list {
        height: calc(100% - 54px);
        overflow: auto;
      }
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
  .search {
    padding: 6px 11px;
    z-index :999;
    background-color: #F6F6F6;
    width: 100%;
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
