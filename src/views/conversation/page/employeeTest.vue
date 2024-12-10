<template>
  <div class="employ">
    <el-row>
      <el-col :span="6" class="borderR">
        <div class="hd_box" style="height: 92px">
          <div class="hd_name">成员</div>
          <div class="paddingT10">
            <el-input v-model="employName" placeholder="请输入内容" prefix-icon="el-icon-search" />
          </div>
        </div>
        <div ref="employTree" class="ct_box ct_boxFirst">
          <UserTree
            ref="userTree"
            class="filter-tree conversation-user-tree"
            v-bind="$attrs"
            :filter-text="employName"
            :click-node="clickNode"
            is-only-click
            @updateUserList="handleNodeClick"
          />
        </div>
      </el-col>
      <el-col :span="6" class="borderR">
        <div class="hd_box">
          <div class="hd_name">{{ talkName }}</div>
        </div>
        <div class="hd_tabs">
          <el-tabs v-model="contactTabType" class="tabs-div" @tab-click="loadContactList">
            <div v-if="contactTabType !== CONTACT_TYPE_GROUP" class="search">
              <el-input
                v-model="query.chatName"
                placeholder="请输入聊天对象昵称"
                clearable
                prefix-icon="el-icon-search"
                @clear="loadContactList"
                @keyup.enter.native="() => {
                  query.pageNum = 1;
                  loadContactList()
                }"
              />
            </div>
            <el-tab-pane v-for="tab in contactTypeTabs" :key="tab.value" class="hd-tab-pane" :label="tab.label" :name="tab.value">
              <insideList v-if="contactTabType===CONTACT_TYPE_INNER" :person-list="personList" :loading="loading" @chatFn="chatFn" />
              <list v-else-if="contactTabType===CONTACT_TYPE_EXTERNAL" :person-list="personList" :loading="loading" @chatFn="chatFn" />
              <grouplist v-else :person-list="personList" :loading="loading" @groupFn="groupFn" />
            </el-tab-pane>
          </el-tabs>
          <div v-if="personList.length" class="footer-button">
            <el-button
              size="mini"
              class="mr10"
              :disabled="query.pageNum === DEFAULT_PAGE_NUM"
              type="primary"
              plain
              icon="el-icon-arrow-left"
              @click="pageChange(false)"
            >
              上一页
            </el-button>
            <el-button
              size="mini"
              class="ml10"
              :disabled="personList.length < query.pageSize"
              type="primary"
              plain
              @click="pageChange(true)"
            >
              <span>下一页</span>
              <i class="el-icon-arrow-right" />
            </el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="12" class="chat-content-col">
        <div class="hd_box">
          <div class="hd_name"><span v-if="chat.receiveName"> 与{{ chat.receiveName }}的聊天</span>
            <!-- <span class="fr hd_nameRi">下载会话</span> -->
          </div>
        </div>
        <div class="hd_tabthree">
          <el-tabs v-model="msgTabType" class="chat-content-tabs" @tab-click="loadMessageList()">
            <el-tab-pane label="全部" :name="MSG_TYPE_ALL">
              <div v-loading="contentLoading" class="ct_box">
                <div v-if="allChatStack.length > 1" class="chatrecord-title">
                  <el-button type="text" size="medium" @click="() => allChatStack.pop()">
                    <svg class="icon-restore" :width="18" :height="18">
                      <use href="#icon-restore" />
                    </svg>
                  </el-button>
                  {{ chatReCordShowTitle(currentChat.title) }}
                </div>
                <div v-else class="hds_time">
                  <!-- <el-date-picker v-model="takeTime" type="datetimerange" format='yyyy-MM-dd' range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" align="right" @change="loadMessageList">
                  </el-date-picker> -->
                  <DatePicker
                    unlink-panels
                    align="right"
                    :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter"
                    type="daterange"
                    :time.sync="takeTime"
                    value-format="yyyy-MM-dd"
                    @change="loadMessageList"
                  />
                </div>
                <chat :all-chat="allChat" :chat-data="chat" chat-type="employee" @openChatrecord="handleOpenChatrecord" />
                <el-pagination
                  v-if="allChat&&allChat.length>=1"
                  background
                  layout="prev, pager, next"
                  class="pagination"
                  :current-page="currentPage"
                  :total="total"
                  @current-change="currentChange"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="图片" :name="MSG_TYPE_IMG">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <!-- <el-date-picker v-model="takeTime" type="datetimerange" format='yyyy-MM-dd' range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" align="right" @change="loadMessageList">
                  </el-date-picker> -->
                  <DatePicker unlink-panels align="right" :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter" type="daterange" :time.sync="takeTime" value-format="yyyy-MM-dd" @change="loadMessageList" />
                </div>
                <chat :all-chat="allChat" :chat-data="chat" chat-type="employee" />
                <el-pagination
                  v-if="allChat&&allChat.length>=1"
                  background
                  class="pagination"
                  layout="prev, pager, next"
                  :total="total"
                  :current-page="currentPage"
                  @current-change="currentChange"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="视频" :name="MSG_TYPE_VIDEO">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <!-- <el-date-picker v-model="takeTime" type="datetimerange" format='yyyy-MM-dd' range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" align="right" @change="loadMessageList">
                  </el-date-picker> -->
                  <DatePicker unlink-panels align="right" :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter" type="daterange" :time.sync="takeTime" value-format="yyyy-MM-dd" @change="loadMessageList" />
                </div>
                <chat :all-chat="allChat" :chat-data="chat" chat-type="employee" />
                <el-pagination
                  v-if="allChat&&allChat.length>=1"
                  background
                  class="pagination"
                  layout="prev, pager, next"
                  :total="total"
                  :current-page="currentPage"
                  @current-change="currentChange"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="文件" :name="MSG_TYPE_FILE">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <!-- <el-date-picker v-model="takeTime" type="datetimerange" format='yyyy-MM-dd' range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" align="right" @change="loadMessageList">
                  </el-date-picker> -->
                  <DatePicker unlink-panels align="right" :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter" type="daterange" :time.sync="takeTime" value-format="yyyy-MM-dd" @change="loadMessageList" />
                </div>
                <el-table :data="allChat" style="width: 100%">
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
                    <template v-if="scope.row.file" slot-scope="scope">
                      {{ scope.row.file.filename || scope.row.file.fileName }}
                    </template>
                  </el-table-column>
                  <el-table-column label="大小">
                    <template v-if="scope.row.file" slot-scope="scope">
                      {{ filterSize(scope.row.file.fileSize || scope.row.file.filesize) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="action" label="来源">
                    <template v-if="scope.row.fromInfo" slot-scope="scope">
                      {{ scope.row.fromInfo && scope.row.fromInfo.name }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="action" label="操作">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="download(scope.row)">下载</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="图文链接" :name="MSG_TYPE_LINK">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <!-- <el-date-picker v-model="takeTime" type="datetimerange" format='yyyy-MM-dd' range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" align="right" @change="loadMessageList">
                  </el-date-picker> -->
                  <DatePicker unlink-panels align="right" :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter" type="daterange" :time.sync="takeTime" value-format="yyyy-MM-dd" @change="loadMessageList" />
                </div>
                <chat :all-chat="allChat" :chat-data="chat" chat-type="employee" />
                <el-pagination
                  v-if="allChat&&allChat.length>=1"
                  background
                  class="pagination"
                  layout="prev, pager, next"
                  :total="total"
                  :current-page="currentPage"
                  @current-change="currentChange"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="语音通话" :name="MSG_TYPE_VOICE">
              <div v-loading="contentLoading" class="ct_box">
                <div class="hds_time">
                  <!-- <el-date-picker v-model="takeTime" type="datetimerange" format='yyyy-MM-dd' range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" align="right" @change="loadMessageList">
                  </el-date-picker> -->
                  <DatePicker unlink-panels align="right" :disabled-type="DATE_DISABLED_TYPE.acrossMonthAndAfter" type="daterange" :time.sync="takeTime" value-format="yyyy-MM-dd" @change="loadMessageList" />
                </div>
                <el-table :data="allChat" style="width: 100%">
                  <template slot="empty">
                    <empty-default-icon
                      text="暂无聊天记录"
                    />
                  </template>
                  <el-table-column prop="date" label="发起人">
                    <template v-if="scope.row.fromInfo" slot-scope="scope">
                      {{ scope.row.fromInfo.name }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="通话时间">
                    <template v-if="scope.row.msgtime" slot-scope="scope">
                      {{ parseTime(scope.row.msgtime || scope.row.msgTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="address" label="时长">
                    <template v-if="scope.row.voice" slot-scope="scope">
                      {{ (scope.row.voice.play_length || scope.row.voice.playLength) }}s
                    </template>
                  </el-table-column>
                  <el-table-column prop="address" label="操作">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="voiceLook(scope.row.voice)">下载</el-button>
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
import list from '../component/list.vue';
import chat from '../component/chat.vue';
import insideList from '../component/insideList.vue';
import grouplist from '../component/groupList.vue';
import UserTree from '@/components/SelectUser/UserTree.vue';
import moment from 'moment';
import {
  content
} from '@/api/content.js';
import {
  yearMouthDay, downloadFile, filterSize, downloadAMR
} from '@/utils/common.js';
import { DATE_DISABLED_TYPE, PAGE_LIMIT_TWENTY, DEFAULT_PAGE_NUM, PAGE_LIMIT, MSG_TYPE, MSG_TYPE_ALL, MSG_TYPE_IMG, MSG_TYPE_FILE, MSG_TYPE_LINK, MSG_TYPE_VOICE, MSG_TYPE_VIDEO } from '@/utils/constant/index';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
const CONTACT_TYPE_INNER = '0';
const CONTACT_TYPE_EXTERNAL = '1';
const CONTACT_TYPE_GROUP = '2';
const CONTACT_TAB_TYPE = {
  [CONTACT_TYPE_INNER]: '内部联系人',
  [CONTACT_TYPE_EXTERNAL]: '外部联系人',
  [CONTACT_TYPE_GROUP]: '群聊'
};

const buildTextChat = (msgTime, content) => ({
  msgType: 'text',
  msgTime,
  text: { content }
});

// 构造图文混合消息内容
const buildMixedChat = (msgTime, content) => ({
  msgType: 'mixed',
  msgTime,
  mixed: content
});

const getMsgTime = item => item.msgTime || item.msgtime;

export default {
  components: {
    list,
    grouplist,
    insideList,
    chat,
    UserTree,
    EmptyDefaultIcon,
    DatePicker
  },
  data() {
    return {
      DATE_DISABLED_TYPE,
      employId: '',
      employName: '',
      talkName: '',
      contactTypeTabs: Object.entries(CONTACT_TAB_TYPE).map(arr => ({ value: arr[0], label: arr[1] })),
      contactTabType: CONTACT_TYPE_EXTERNAL,
      msgTabType: MSG_TYPE_ALL,
      takeTime: [moment().subtract(1, 'month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
      chat: {},
      personList: [],
      loading: false,
      // 显示消息栈
      allChatStack: [],
      // template中要用到的常量
      CONTACT_TYPE_INNER, CONTACT_TYPE_EXTERNAL,
      MSG_TYPE_ALL, MSG_TYPE_IMG, MSG_TYPE_FILE, MSG_TYPE_LINK, MSG_TYPE_VOICE, MSG_TYPE_VIDEO, DEFAULT_PAGE_NUM, CONTACT_TYPE_GROUP,
      contentLoading: false,
      query: {
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT_TWENTY,
        chatName: ''
      },
      clickNode: {}
    };
  },
  computed: {
    currentChat: function() {
      return this.allChatStack[this.allChatStack.length - 1];
    },
    allChat: function() {
      return this.currentChat?.allChat;
    },
    total: function() {
      return this.currentChat?.total;
    },
    departmentInfo() {
      return this.$store.state.departmentInfo;
    },
    currentPage: {
      get: function() {
        return this.currentChat?.currentPage ?? 1;
      },
      set: function(val) {
        if (this.currentChat) {
          this.currentChat.currentPage = val;
        }
      }
    }
  },
  // 组件销毁前，清除内部联系人和外部联系人存的session值
  beforeDestroy() {
    sessionStorage.removeItem('list');
    sessionStorage.removeItem('insideList');
  },
  methods: {
    filterSize,
    voiceLook(e) {
      downloadAMR(e.attachment);
    },
    download(e) {
      downloadFile(e.file.attachment, e.file.fileName || e.file.filename);
    },
    /**
     * @description 切换页码
     * @param flag 为true时上一页 false时下一页
     */
    pageChange(flag) {
      if (flag) {
        this.query.pageNum++;
      } else {
        this.query.pageNum--;
      }
      this.loadContactList();
    },
    /**
     * @description: 翻页操作
     * @param {*} e
     * @return {*}
     */
    currentChange(e) {
      this.currentPage = e;
      if (this.allChatStack.length <= 1) {
        this.loadMessageList(true);
      }
    },
    // 加载聊天记录列表
    loadMessageList(page) {
      if (!this.chat.fromId) {
        return; // 没有选择人
      }
      // 当日期组件触发时会传入事件对象，导致传参能接收到数据，所以应该判断true较为准确
      if (page !== true) {
        this.currentPage = 1;
      }
      if (this.chat) {
        let msgType = '';
        if (this.msgTabType === MSG_TYPE_ALL) {
          msgType = '';
        } else {
          msgType = MSG_TYPE[this.msgTabType];
        }
        const query = {
          fromId: this.employId,
          msgType,
          pageSize: PAGE_LIMIT,
          pageNum: this.currentPage,
          beginTime: this.takeTime ? yearMouthDay(this.takeTime[0]) : '',
          endTime: this.takeTime ? yearMouthDay(this.takeTime[1]) : ''
        };
        if (this.contactTabType === CONTACT_TYPE_GROUP) {
          query.roomId = this.chat.roomId;
        } else {
          query.receiveId = this.chat.receiveId;
        }
        this.contentLoading = true;
        if (this.contactTabType === CONTACT_TYPE_GROUP) {
          content.chatGrounpList(query).then(res => {
            this.allChatStack = [{
              allChat: res.data.list,
              total: +res.data.total,
              currentPage: this.currentPage
            }];
          }).finally(() => {
            this.contentLoading = false;
          });
        } else {
          content.chatList(query).then(res => {
            this.allChatStack = [{
              allChat: res.data.list,
              total: +res.data.total,
              currentPage: this.currentPage
            }];
          }).finally(() => {
            this.contentLoading = false;
          });
        }
      }
    },
    chatFn(data) {
      this.takeTime = [moment().subtract(1, 'month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
      this.chat = data;
      if (data) {
        this.chat.receiveName = data.receiveWeCustomer ? data.receiveWeCustomer.name : data.receiveWeUser?.name || '';
        this.loadMessageList();
      }
    },
    /**
     * 点击群聊
     */
    groupFn(data) {
      this.takeTime = [moment().subtract(1, 'month').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
      this.chat = data;
      if (data.roomId) this.chat.receiveName = data.roomInfo.groupName;
      this.loadMessageList('');
    },
    // 加载内/外联系人或群聊列表
    loadContactList() {
      if (!this.employId) {
        return;
      }
      this.loading = true;
      this.personList = [];
      const query = {
        fromId: this.employId,
        searchType: this.contactTabType,
        ...this.query
      };
      if (this.contactTabType === CONTACT_TYPE_GROUP) {
        query.chatName = '';
      }
      content.getTree(query).then(({ rows }) => {
        this.personList = rows;
      }).finally(() => {
        this.loading = false;
      });
    },
    /**
     * 点击员工节点的回调：移除之前选中元素样式，同时修改当前元素样式，并修改data
     */
    handleNodeClick(data) {
      this.clickNode = data;
      // 点击部门不做处理
      if (!data.userId) {
        this.clickNode = {};
        this.$refs['employTree'].classList.remove('ct_box_color');
        return;
      }
      const nowClickDom = document.querySelector(`[data-userid="${this.dealUserId(data.userId)}"]`);
      if (nowClickDom) {
        this.$refs['employTree'].classList.add('ct_box_color');
      }
      this.talkName = data.name;
      this.employId = data.userId;
      this.query.pageNum = DEFAULT_PAGE_NUM;
      this.query.chatName = '';
      this.loadContactList();
    },
    // 处理data-userId数据，因为querySelector接口查询属性时不支持数字开头
    dealUserId(userId) {
      if (!userId) return userId;
      const reg = (/[a-zA-Z]/);
      const match = userId.match(reg);
      if (match) {
        return userId.slice(match.index);
      }
      return userId;
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
    /**
     * 将数据转为正常聊天消息的类型
     */
    handleOpenChatrecordData(item) {
      switch (item.type) {
        // 聊天记录
        case 'chatrecord': {
          const data = JSON.parse(item.content);
          // 和某些不同结构的旧数据的兼容
          const chatReCord = data.item ? data : { title: '', item: data };

          return {
            msgType: 'chatrecord',
            msgTime: getMsgTime(item),
            chatReCord
          };
        }
        // 文本
        case 'ChatRecordText': {
          return {
            msgType: 'text',
            msgTime: getMsgTime(item),
            text: JSON.parse(item.content)
          };
        }
        // 链接
        case 'ChatRecordLink': {
          const {
            link_url,
            image_url,
            description,
            title
          } = JSON.parse(item.content);
          return {
            msgType: 'link',
            msgTime: getMsgTime(item),
            link: {
              linkUrl: link_url,
              imageUrl: image_url,
              title,
              description
            }
          };
        }
        // 位置
        case 'ChatRecordLocation': {
          return {
            msgType: 'location',
            msgTime: getMsgTime(item),
            location: JSON.parse(item.content)
          };
        }
        // 图文混合消息
        case 'ChatRecordMixed': {
          return buildMixedChat(getMsgTime(item), JSON.parse(item.content));
        }
        // 图片
        case 'ChatRecordImage': {
          const { attachment } = JSON.parse(item.content);

          // 兼容旧数据
          if (!attachment) {
            return buildTextChat(getMsgTime(item), '[图片]');
          }

          return {
            msgType: 'image',
            msgTime: getMsgTime(item),
            image: { attachment }
          };
        }
        // 视频
        case 'ChatRecordVideo': {
          const { attachment } = JSON.parse(item.content);

          // 兼容旧数据
          if (!attachment) {
            return buildTextChat(getMsgTime(item), '[视频]');
          }

          return {
            msgType: 'video',
            msgTime: getMsgTime(item),
            video: { attachment }
          };
        }
        // 文件
        case 'ChatRecordFile': {
          const { filename, attachment } = JSON.parse(item.content);
          return {
            msgType: 'file',
            msgTime: getMsgTime(item),
            file: {
              fileName: filename,
              attachment
            }
          };
        }
        // 视频号
        case 'ChatRecordSphFeed': {
          const data = JSON.parse(item.content);
          return {
            msgType: 'sphfeed',
            msgTime: getMsgTime(item),
            sphFeed: {
              feedDesc: data.feed_desc
            }
          };
        }

        default:
          return buildTextChat(getMsgTime(item), '[未知类型消息]');
      }
    },
    handleOpenChatrecord({ title, item }) {
      const allChat = item.map(this.handleOpenChatrecordData);
      const chatrecordChatData = {
        title,
        currentPage: 1,
        total: allChat.length,
        get allChat() {
          // 分页
          const begin = (this.currentPage - 1) * PAGE_LIMIT;
          return allChat.slice(begin, begin + PAGE_LIMIT);
        }
      };
      this.allChatStack.push(chatrecordChatData);
    }
  }
};

</script>
<style lang="scss" scoped>
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
  .chat-content-col {
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
      .tabs-div {
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
    .hd_tabthree {
      height: calc(100% - 52px);
      /deep/ .el-tabs__header {
        margin: 0;
        height: 40px;
      }
      .chat-content-tabs {
        height: 100%;
        position: relative;
        /deep/ .el-tabs__content {
          height: calc(100% - 40px);
          .el-tab-pane {
            height: 100%;
            .ct_box {
              height: 100%;
              .hds_time {
                text-align: left;
                width: 100%;
                padding: 10px;
                .el-date-editor {
                  width: 240px;
                }
              }
            }
          }
        }
      }
    }

    .hd_box {
      padding: 15px;
      height: 52px;
    }

    .hd_name {
      font-size: 18px;
      min-height: 20px;
    }

    .hd_nameRi {
      color: #199ed8;
      text-align: right;
      font-size: 16px;
      cursor: pointer;
    }

    .ct_boxFirst {
      height: calc(100% - 92px) !important;
      .conversation-user-tree {
        height: 100%;
        /deep/ .common-tree-empty {
          height: 100%;
        }
      }
    }

    .ct_box {
      background: white;
      height: 100%;
      overflow-y: auto;
      color: #999;
      text-align: center;
      /deep/.el-tree-node__content:hover {
        background-color: #EEE;
      }
      /deep/ .el-tree-node:focus > .el-tree-node__content {
        background-color: #EEE;
      }
    }
    .ct_box_color {
      /deep/ .is-current {
        background-color: #EEE;
      }
    }
  }
  .search {
    padding: 6px 11px;
    z-index :999;
    background-color: #F6F6F6;
    width: 100%;
  }
  .pagination {
    padding: 10px;
    height: 50px;
    float: left;
  }
  .user-info {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #606266;
  }
  .user-avatar {
    width: 30px;
    height: 30px;
    margin-right: 5px;
    border-radius: 4px;
  }

  .chatrecord-title{
    font-size: 14px;
    height: 3em;
    background-color: #fff;
    border: 0 solid #d7dae2;
    border-bottom-width: 1px;
    padding-left: 1em;
    text-align: left;
    display: flex;
    align-items: center;
    .icon-restore{
      margin-right: 10px;
    }
  }
</style>
