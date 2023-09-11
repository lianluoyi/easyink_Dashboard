<!--
 * @Description: 群发详情列表
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<script>
import { getPushResult, sendToUser } from '@/api/groupMessage';
import {
  PAGE_LIMIT, GROUP_MESSAGE_SEND_STATUS_MAP, GROUP_MESSAGE_PUSH_TYPE_CUSTOMER, GROUP_MESSAGE_PUSH_TYPE_GROUP,
  GROUP_MESSAGE_SEND_STATUS_UNEXEC, GROUP_MESSAGE_SEND_STATUS_EXECED
} from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { getHeadImgUrl } from '@/utils/common';
const MAX_SEND_TARGET_NUM = 5;
export default {
  components: { RightContainer, EmptyDefaultIcon },
  props: {
    type: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Number | String,
      default: GROUP_MESSAGE_SEND_STATUS_UNEXEC
    },
    total: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Number | String,
      default: 0
    },
    pushType: {
      type: String,
      default: GROUP_MESSAGE_PUSH_TYPE_CUSTOMER
    }
  },
  data() {
    return {
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        messageId: undefined,
        sendStatus: 0,
        customerName: '',
        status: '',
        userName: '',
        groupName: ''
      },
      loading: false,
      list: [],
      options: Object.freeze([
        ...Object.keys(GROUP_MESSAGE_SEND_STATUS_MAP).map(type => ({ label: GROUP_MESSAGE_SEND_STATUS_MAP[type], value: type }))
      ]),
      GROUP_MESSAGE_PUSH_TYPE_CUSTOMER,
      GROUP_MESSAGE_PUSH_TYPE_GROUP,
      GROUP_MESSAGE_SEND_STATUS_UNEXEC,
      GROUP_MESSAGE_SEND_STATUS_EXECED,
      GROUP_MESSAGE_SEND_STATUS_MAP
    };
  },
  computed: {},
  watch: {},
  created() {
    this.query.messageId = this.$route.query.id;
    this.query.sendStatus = this.type;
    this.getList();
  },
  mounted() {},
  methods: {
    getHeadImgUrl,
    /** 查询 */
    getList(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      const query = { ...this.query };
      if (query.status) {
        query.sendStatus = query.status;
        delete query.status;
      } else {
        query.sendStatus = this.type;
      }
      getPushResult(query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.loading = false;
          this.$emit('update:total', +total);
        })
        .catch(() => {
          this.loading = false;
        });
    },
    resetQuery() {
      this.query.userName = '';
      this.query.customerName = '';
      this.query.groupName = '';
      this.query.status = '';
      this.getList(1);
    },
    notify(pushResult) {
      const { userId, customers } = pushResult;
      sendToUser({
        userId, customers, pushType: this.pushType
      }).then(res => {
        this.msgSuccess('提醒成功');
      });
    },
    getSendTargets(pushResult) {
      const customerList = pushResult.customers.split('、');
      return pushResult.count > MAX_SEND_TARGET_NUM
        ? customerList.slice(0, MAX_SEND_TARGET_NUM).join('、') + '等' + pushResult.count + (this.pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER ? '人' : '个')
        : pushResult.customers;
    },
    getUserHeadImg(userId) {
      const user = this.$store.state.listInfo.userList.find(item => item.userId === userId);
      return user && user.avatarMediaid;
    }
  }
};
</script>

<template>
  <div class="push-result-wrapper">
    <RightContainer>
      <template v-slot:data>
        <div v-if="type === GROUP_MESSAGE_SEND_STATUS_UNEXEC" class="search-form">
          <el-input v-model="query.userName" placeholder="请输入员工姓名" size="small" />
          <el-button type="primary" @click="getList(1)">查询</el-button>
          <el-button class="btn-reset" @click="resetQuery">重置</el-button>
        </div>
        <div v-if="type === GROUP_MESSAGE_SEND_STATUS_EXECED" class="search-form">
          <el-input v-if="pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER" v-model="query.customerName" placeholder="请输入客户昵称" size="small" />
          <el-input v-if="pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP" v-model="query.groupName" placeholder="请输入客户群昵称" size="small" />
          <el-input v-model="query.userName" placeholder="请输入员工姓名" size="small" />
          <el-select v-model="query.status" placeholder="请选择发送状态">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button type="primary" @click="getList(1)">查询</el-button>
          <el-button class="btn-reset" @click="resetQuery">重置</el-button>
        </div>
        <el-table v-loading="loading" :data="list">
          <template slot="empty">
            <empty-default-icon :length="list.length" />
          </template>
          <el-table-column v-if="type === GROUP_MESSAGE_SEND_STATUS_EXECED" class="trest1" :label="pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER ? '客户' : '客户群'" align="center" prop="customers">
            <template slot-scope="scope">
              <div class="user-info">
                <i v-if="pushType === GROUP_MESSAGE_PUSH_TYPE_GROUP" class="iconfont icon-groupChat" />
                <img v-if="pushType === GROUP_MESSAGE_PUSH_TYPE_CUSTOMER" :src="scope.row.headImageUrl">
                <span>{{ scope.row.customers }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="type === GROUP_MESSAGE_SEND_STATUS_EXECED" label="执行员工" align="center" prop="userName" />
          <el-table-column v-if="type === GROUP_MESSAGE_SEND_STATUS_EXECED" label="发送状态" align="center" prop="remark">
            <template slot-scope="scope">
              {{ GROUP_MESSAGE_SEND_STATUS_MAP[scope.row.sendStatus] }}
            </template>
          </el-table-column>
          <el-table-column v-if="type === GROUP_MESSAGE_SEND_STATUS_EXECED" label="备注" align="center" prop="remark" />
          <el-table-column v-if="type === GROUP_MESSAGE_SEND_STATUS_UNEXEC" label="员工" align="center" prop="userName">
            <template slot-scope="scope">
              <div class="user-info">
                <img :src="getHeadImgUrl(scope.row.headImageUrl)">
                <span>{{ scope.row.userName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="type === GROUP_MESSAGE_SEND_STATUS_UNEXEC" label="发送对象" align="center" prop="customers">
            <template slot-scope="scope">
              {{ getSendTargets(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column v-if="type === GROUP_MESSAGE_SEND_STATUS_UNEXEC" label="操作" align="center" width="180">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                @click="notify(scope.row)"
              >提醒执行</el-button>
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
@import '~@/styles/mixin.scss';
.search-form {
  margin-bottom: 15px;
}
.el-input, .el-select {
  width: 240px;
  margin-right: 8px;
}
.el-button + .el-button {
  margin-left: 8px;
}
.user-info {
  display: flex;
  align-items: center;
  i {
    font-size: 35px;
    @include text_btn_color($color-theme2-1);
  }
  img {
    width: 35px;
    height: 35px;
  }
  span {
    color: #333;
    padding-left: 5px;
  }
}
.push-result-wrapper {
  /deep/ .el-table__body-wrapper .el-table__cell:nth-child(1) {
    .cell {
      line-height: 35px;
    }
  }
}
</style>
