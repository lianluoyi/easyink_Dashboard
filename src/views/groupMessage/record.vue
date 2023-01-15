<script>
import { getList, syncMsg, deleteGroupTask, getCopyInfo } from '@/api/groupMessage';
import { goRouteWithQuery } from '@/utils';
import { PAGE_LIMIT, GROUP_MESSAGE_PUSH_TYPE_GROUP, MESSAGE_MEDIA_TYPE, MEDIA_TYPE_TEXT, GROUP_MESSAG_STATUS_SENDED } from '@/utils/constant';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import RightContainer from '@/components/RightContainer';

export default {
  name: 'Operlog',
  components: { EmptyDefaultIcon, RightContainer },
  filters: {
    sendInfo(data) {
      const unit = data.pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP ? '个群' : '人';
      return `预计发送 ${data.expectSend} ${unit}\n已发送 ${data.actualSend} ${unit}`;
    }
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        sender: undefined, // 创建人姓名
        content: undefined, // 消息内容
        pushType: undefined, // 群发类型
        beginTime: undefined,
        endTime: undefined
      },
      pushType: {
        0: '发给客户',
        1: '发给客户群'
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now(); // 选当前时间之前的时间
        }
      },
      GROUP_MESSAG_STATUS_SENDED
    };
  },
  created() {
    if (this.$route.query) {
      Object.keys(this.query).forEach(key => {
        if (this.$route.query[key]) {
          this.query[key] = this.$route.query[key];
        }
      });
      if (this.query.beginTime && this.query.endTime) {
        this.dateRange = [this.query.beginTime, this.query.endTime];
      }
    }
    this.getList();
  },
  methods: {
    getList(page) {
      if (this.dateRange) {
        this.query.beginTime = this.dateRange[0];
        this.query.endTime = this.dateRange[1];
      } else {
        this.query.beginTime = '';
        this.query.endTime = '';
      }
      page && (this.query.pageNum = page);
      this.loading = true;
      getList(this.query)
        .then(({ rows, total }) => {
          const newRows = [...rows];
          newRows.forEach(item => {
            item.contentList = item.content.split(',');
          });
          this.list = newRows;
          this.total = +total;
          this.loading = false;
          this.ids = [];
        })
        .catch(() => {
          this.loading = false;
        });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.$set(this.query, 'sender', undefined);
      this.$set(this.query, 'content', undefined);
      this.$set(this.query, 'pushType', undefined);
      this.getList(1);
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },
    goRoute(id, path) {
      goRouteWithQuery(this.$router, path, this.query, { id });
    },
    syncMsg(data) {
      const { msgid, messageId } = data;
      const magArr = msgid.split(',');
      syncMsg({ msgids: magArr, messageId })
        .then(({ data: resData }) => {
          this.msgSuccess('同步成功');
          this.getList();
          // this.list = rows
          // this.total = +total
          // this.loading = false
          // this.ids = []
        })
        .catch(() => {
          // this.loading = false
        });
    },
    dealAttachments(attachments) {
      return JSON.stringify(attachments.map(attachment => {
        const attach = { ...attachment };
        attachment.imageMessage && (attach.imageMessage = JSON.stringify(attachment.imageMessage));
        attachment.fileDTO && (attach.fileDTO = JSON.stringify(attachment.fileDTO));
        attachment.linkMessage && (attach.linkMessage = JSON.stringify(attachment.linkMessage));
        attachment.miniprogramMessage && (attach.miniprogramMessage = JSON.stringify(attachment.miniprogramMessage));
        attachment.videoDTO && (attach.videoDTO = JSON.stringify(attachment.videoDTO));
        return attach;
      }));
    },
    goToGroupMessageAdd(type, params = {}) {
      if (type === 'copy' || type === 'edit') {
        getCopyInfo({
          messageId: params.messageId
        }).then(res => {
          const param = { ...res.data };
          param.content = param.textMessage.content;
          param.attachments = this.dealAttachments(param.attachments);
          delete param.textMessage;
          if (type === 'copy') {
            delete param.messageId;
          } else {
            param.messageId = params.messageId;
          }
          goRouteWithQuery(this.$router, 'add', {}, param);
        });
      } else {
        goRouteWithQuery(this.$router, 'add', {}, params);
      }
    },
    // 获取查询条件对象
    getQueryObj() {
      const {
        sender,
        content,
        pushType,
        beginTime,
        endTime
      } = this.query;
      return {
        sender,
        content,
        pushType,
        beginTime,
        endTime
      };
    },
    dealMessageList(msgList) {
      return msgList.map(msg => '[' + MESSAGE_MEDIA_TYPE[msg.messageType] + ']').join('');
    },
    getTextMessageList(msgList) {
      const textArr = [];
      msgList.map(item => { item.messageType === MEDIA_TYPE_TEXT && textArr.push(item.content); });
      return textArr.join(',');
    },
    deleteTask(task) {
      this.confirmModal({
        msg: `当前群发记录将从系统删除，员工不再执行，是否继续？`
      }, async() => {
        deleteGroupTask({
          messageId: task.messageId
        }).then(() => {
          this.msgSuccess('删除成功');
          this.getList();
        });
      });
    }
  }
};
</script>
<template>
  <div>
    <RightContainer>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :model="query"
          :inline="true"
          class="top-search"
          label-width="100px"
        >
          <el-form-item prop="sender">
            <el-input
              v-model="query.sender"
              placeholder="请输入创建人姓名"
              clearable
              @keyup.enter.native="getList(1)"
            />
          </el-form-item>
          <el-form-item prop="content">
            <el-input
              v-model="query.content"
              placeholder="请输入消息内容"
              clearable
              @keyup.enter.native="getList(1)"
            />
          </el-form-item>
          <el-form-item prop="pushType">
            <el-select v-model="query.pushType" placeholder="请选择群发类型" size="small">
              <el-option
                v-for="(value, key, index) in pushType"
                :key="index"
                :label="value"
                :value="key"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              :picker-options="pickerOptions"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label=" ">
            <el-button type="primary" @click="getList(1)">查询</el-button>
            <el-button class="btn-reset" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:data>
        <el-table
          v-loading="loading"
          :data="list"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              btn-text="新建群发"
              :length="list.length"
              :btn-click="goToGroupMessageAdd"
              :btn-show-condition="getQueryObj()"
              :btn-config="['customSecret']"
            />
          </template>
          <!-- <el-table-column type="selection" width="55" align="center" /> -->
          <el-table-column label="消息内容" align="center" prop="contentList">
            <template slot-scope="scope">
              <div class="message-text intwoline">{{ getTextMessageList(scope.row.seedMessageList || []) }}</div>
              <div class="message-appendix">{{ dealMessageList(scope.row.seedMessageList.slice(1)) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="任务名称" align="center" prop="taskName">
            <template slot-scope="scope">
              <pre>{{ scope.row.taskName }}</pre>
            </template>
          </el-table-column>
          <el-table-column label="群发类型" align="center">
            <template slot-scope="scope">
              {{ pushType[scope.row.pushType] }}
            </template>
          </el-table-column>
          <el-table-column label="发送结果" align="center" prop="sendInfo" width="160">
            <template slot-scope="scope">
              <pre>{{ scope.row | sendInfo }}</pre>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="sendTime"
            width="180"
          />
          <el-table-column label="操作" align="center" width="180">
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['customerMessagePush:push:view']"
                size="mini"
                type="text"
                @click="goRoute(scope.row.messageId, 'detail')"
              >详情</el-button>
              <el-button
                size="mini"
                type="text"
                @click="goToGroupMessageAdd('copy', scope.row)"
              >复制</el-button>
              <br>
              <el-button
                v-hasPermi="['customerMessagePush:push:asyncResult']"
                size="mini"
                type="text"
                @click="syncMsg(scope.row)"
              >刷新</el-button>
              <el-button
                v-hasPermi="['customerMessagePush:push:edit']"
                size="mini"
                type="text"
                :disabled="scope.row.checkStatus === GROUP_MESSAG_STATUS_SENDED || !scope.row.settingTime"
                @click="goToGroupMessageAdd('edit', scope.row)"
              >编辑</el-button>
              <el-button
                v-hasPermi="['customerMessagePush:push:edit']"
                size="mini"
                type="text"
                :disabled="scope.row.checkStatus === GROUP_MESSAG_STATUS_SENDED || !scope.row.settingTime"
                @click="deleteTask(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="getList()"
        />
      </template>
    </RightContainer>
  </div>
</template>

<style lang="scss" scoped>
pre {
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
}
</style>
