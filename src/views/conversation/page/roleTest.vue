<template>
  <div class="h100">
    <RightContainer>
      <template v-slot:search>
        <el-form id="roleTestSearch" :inline="true" :model="form" class="demo-form-inline" label-width="100px">
          <el-row>
            <el-form-item>
              <el-input v-model="form.Ename" placeholder="请填写发送者的姓名/昵称" style="width:240px" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="form.Cname" placeholder="请填写接收者的姓名/昵称" style="width:240px" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="form.Scontent" placeholder="请输入聊天内容" style="width:240px" />
            </el-form-item>
            <el-form-item>
              <el-date-picker
                v-model="form.Stime"
                style="width:240px"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
                :default-time="['00:00:00', '23:59:59']"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                v-preventReClick="200"
                type="primary"
                :loading="searchButtonLoading"
                @click="()=>{
                  searchButtonLoading = true;
                  searchList()
                }"
              >查询</el-button>
              <el-button
                v-preventReClick="200"
                class="btn-reset"
                :loading="resetButtonLoading"
                @click="()=>{
                  resetButtonLoading = true;
                  resetQuery()
                }"
              >重置</el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </template>
      <template v-slot:data>
        <div id="roleTestContent" class="content">
          <el-table v-loading="loading" size="medium" :data="fileData" :height="tableHeight" style="width: 100%">
            <template slot="empty">
              <empty-default-icon
                :length="fileData.length"
              />
            </template>
            <el-table-column prop="date" label="发送者" width="200">
              <template slot-scope="scope">
                <div :class="`${(scope.row.fromInfo && scope.row.fromInfo.type) ? 'user-item-center' : ''} user-item`">
                  <img class="avatar" :src="(scope.row.fromInfo && (scope.row.fromInfo.avatar || scope.row.fromInfo.avatarMediaid)) || defaultAvatar">
                  <div>
                    <span v-if="scope.row.fromInfo" class="user-name">{{ scope.row.fromInfo.name }}</span>
                    <span v-if="scope.row.fromInfo" :class="scope.row.fromInfo.type === wxType ? 'wx-type-flag' : 'corp-type-name'">{{ renderUserInfo(scope.row.fromInfo) }}</span>
                    <div class="cus-dept">{{ (scope.row.fromInfo && scope.row.fromInfo.mainDepartment && departmentList[scope.row.fromInfo.mainDepartment]) ? departmentList[scope.row.fromInfo.mainDepartment].name : '' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="接收者" width="200">
              <template slot-scope="scope">
                <div :class="`${(scope.row.toListInfo && scope.row.toListInfo.type) ? 'user-item-center' : ''} user-item`">
                  <img class="avatar" :src="(scope.row.toListInfo && (scope.row.toListInfo.avatar || scope.row.toListInfo.avatarMediaid)) || defaultAvatar" @error="defImg">
                  <div>
                    <span v-if="scope.row.toListInfo" class="user-name">{{ scope.row.toListInfo.name || scope.row.toListInfo.groupName }}</span>
                    <span v-if="scope.row.toListInfo" :class="scope.row.toListInfo.type === wxType ? 'wx-type-flag' : 'corp-type-name'">{{ renderUserInfo(scope.row.toListInfo) }}</span>
                    <div class="cus-dept">{{ (scope.row.toListInfo && scope.row.toListInfo.mainDepartment && departmentList[scope.row.toListInfo.mainDepartment]) ? departmentList[scope.row.toListInfo.mainDepartment].name : '' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="消息内容">
              <template slot-scope="scope">
                <!-- <p v-if="!!scope.row.content" class="emcode" v-html="scope.row.content" />
              <p v-else-if="!!!scope.row.content&&scope.row.text">{{ scope.row.text.content }}</p> -->
                <chat :item="scope.row" />
              </template>
            </el-table-column>
            <el-table-column label="发送状态" width="160" label-class-name="send-label-cell" class-name="send-cell">
              <template #header>
                <el-select v-model="floorRange" size="mini" class="noborder send-type-select" @change="chechName(floorRange)">
                  <el-option v-for="item in displayOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
              <template slot-scope="scope">
                <div class="pers">
                  <span v-if="scope.row.action==''" />
                  <span v-else-if="scope.row.action=='send'">
                    <span class="green" />
                    已发送
                  </span>
                  <span v-else-if="scope.row.action=='recall'">
                    <span class="red" />
                    已撤回
                  </span>
                  <span v-else-if="scope.row.action=='switch'">
                    <span class="gay" />
                    企业日志
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="发送时间" width="200">
              <template slot-scope="scope">
                {{ parseTime(scope.row.msgTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="{ row }">
                <el-button size="mini" type="text" @click="viewContext(row)">查看上下文</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="currentPage"
            :limit.sync="pageSize"
            :disabled="loading"
            @pagination="currentChange"
          />
        </div>
      </template>
    </RightContainer>
    <CheckContext :visible.sync="checkContextVisible" :check-context-query="checkContextQuery" :chat-type="chatType" />
  </div>
</template>
<script>
import {
  content
} from '@/api/content.js';
import RightContainer from '@/components/RightContainer';
import { DEFAULT_AVATAR, WX_TYPE } from '@/utils/constant/index';
import chat from '../component/chatItem.vue';
import { dealAtInfo } from '@/utils/common';
import { PAGE_LIMIT, CORP_TYPE } from '@/utils/constant/index';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import CheckContext from '../component/CheckContext.vue';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  components: { RightContainer, chat, EmptyDefaultIcon, CheckContext },
  mixins: [loadingMixin],
  data() {
    return {
      wxType: WX_TYPE,
      corpType: CORP_TYPE,
      form: {
        Ename: '',
        Cname: '',
        Scontent: '',
        Stime: ''
      },
      currentPage: 1,
      total: 0,
      pageSize: PAGE_LIMIT,
      ac: '',
      fileData: [],
      floorRange: '发送状态',
      displayOptions: [{
        value: '',
        label: '全部'
      },
      {
        value: 'send',
        label: '已发送'
      },
      {
        value: 'recall',
        label: '已撤回'
      }
        // {
        //   value: "switch",
        //   label: "切回企业日志"
        // }
      ],
      // eslint-disable-next-line no-magic-numbers
      searchHeight: 120,
      // eslint-disable-next-line no-magic-numbers
      tableHeight: 100,
      defaultAvatar: DEFAULT_AVATAR,
      departmentList: [],
      checkContextVisible: false,
      checkContextQuery: null,
      chatType: 'employee',
      loading: false
    };
  },
  mounted() {
    this.init();
    this.calcHeight();
    setTimeout(() => {
      this.calcTableHeight();
    // eslint-disable-next-line no-magic-numbers
    }, 200);
  },
  created() {
    this.getDepartmentList();
  },
  methods: {
    viewContext(row) {
      this.chatType = row.fromInfo?.userId ? 'employee' : 'user';
      this.checkContextQuery = {
        msgId: row.msgId,
        fromId: row?.fromInfo.userId || row?.fromInfo.externalUserid
      };
      if (row.roomId) {
        this.checkContextQuery.roomId = row.roomId;
      } else {
        this.checkContextQuery.receiveId = row?.toListInfo.userId || row?.toListInfo.externalUserid;
      }
      this.checkContextVisible = true;
    },
    async getDepartmentList() {
      const data = await this.$store.dispatch('GetDepartmentList');
      const departmentList = {};
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          departmentList[data[i].id] = data[i];
        }
      }
      this.departmentList = departmentList;
    },
    defImg(event) {
      const img = event.srcElement;
      img.src = this.defaultAvatar;
      img.onerror = null;
    },
    // 点击查询全局检索列表
    searchList() {
      this.init(false);
    },
    calcHeight() {
      const dom = document.getElementById('roleTestSearch');
      let domHeight;
      if (dom) {
        domHeight = dom.clientHeight;
        this.searchHeight = domHeight;
      }
    },
    calcTableHeight() {
      const dom = document.getElementById('roleTestContent');
      let domHeight;
      if (dom) {
        domHeight = dom.clientHeight;
        // eslint-disable-next-line no-magic-numbers
        const PAGINATION_HEIGHT = 47;
        this.tableHeight = domHeight - PAGINATION_HEIGHT;
      }
    },
    currentChange() {
      this.init(true);
    },
    init(flag) {
      if (!flag) {
        this.currentPage = 1;
      }
      const query = {
        fromName: this.form.Ename,
        receiveName: this.form.Cname,
        keyWord: this.form.Scontent,
        beginTime: this.form.Stime ? this.parseTime(this.form.Stime[0]) : '',
        endTime: this.form.Stime ? this.parseTime(this.form.Stime[1]) : '',
        pageNum: this.currentPage,
        action: this.ac,
        pageSize: this.pageSize
      };
      // 处理消息内容
      this.loading = true;
      content.getChatAllList(query).then(res => {
        const revokeDate = res.data.list.map(chatDate => {
          if (chatDate.msgType === 'revoke') {
            const revokeDateStorage = chatDate.revoke.content ?? {};
            chatDate = { ...chatDate, ...revokeDateStorage };
            chatDate.action = 'recall';
            chatDate.msgType = revokeDateStorage.msgtype;
            chatDate.msgTime = revokeDateStorage.msgtime;
            return chatDate;
          } else {
            return chatDate;
          }
        });
        this.fileData = revokeDate;
        this.total = Number(res.data.total);
      }).finally(() => {
        this.modifyButtonStatus();
        this.loading = false;
      });
    },
    chechName(e) {
      if (e === '') {
        this.floorRange = '全部';
        this.ac = '';
      } else if (e === 'send') {
        this.floorRange = '已发送';
        this.ac = 'send';
      } else if (e === 'recall') {
        this.floorRange = '已撤回';
        this.ac = 'recall';
      }
      //  else {
      //   this.floorRange = '切回企业日志'
      //   this.ac = 'switch'
      // }
      // console.log(e, this.ac);
      this.init();
    },
    resetQuery() {
      this.form = {
        Ename: '',
        Cname: '',
        Scontent: '',
        Stime: ''
      };
      this.searchList();
    },
    /**
     * 处理 @微信 的字样
     */
    renderUserInfo(item) {
      return dealAtInfo(item);
    }
  }
};

</script>
<style lang="scss" scoped>
  .role-test-page {
    height: 100%;
  }
  .demo-form-inline {
    background: #f1f1f1;
    padding: 18px 10px 0 10px;
  }

  .pers {
    position: relative;

    .green {
      background: greenyellow;
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      top: 10px;
      left: -8px;
    }

    .red {
      background: red;
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      top: 10px;
      left: -8px;
    }

    .gay {
      background: gray;
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      top: 10px;
      left: -8px;
    }
  }

  .noborder {
    /deep/ .el-input--mini .el-input__inner {
      width: 100px;
      border: none
    }
    /deep/ input{
      padding-left: 17px;
      padding-right: 17px;
    }
  }

  .emcode /deep/ em {
    color: #ff0000;
  }
  .right-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    /deep/ .show-data-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      .data-container {
        flex: 1;
        #roleTestContent {
          height: 100%;
          .avatar {
            width: 35px;
            height: 35px;
            border-radius: 3px;
            margin-right: 5px;
          }
          .user-item-center {
            display: flex;
            align-items: center;
          }
          .user-item {
            display: flex;
            .wx-type-flag, .corp-type-name {
              margin-left: 3px;
              font-size: 12px;
            }
            .corp-type-name {
              color: $orange;
            }
            .user-name {
              font-size: 14px;
              color: $black;
            }
          }
          .send-cell {
            padding-left: 6px;
          }
          .send-label-cell {
            padding: 0
          }
        }
      }
    }
  }
  .send-type-select {
    color: #333;
    /deep/ .el-input__inner {
      color: #515a6e;
      font-weight: 600;
    }
  }
  .cus-dept{
    line-height: 14px;
  }

</style>
