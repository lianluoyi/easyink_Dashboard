<!--
 * @Description: 员工绑定工单账号弹窗
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-dialog v-bind="$attrs" class="employee-bind-account-modal" width="800px" v-on="$listeners" @close="onClose">
    <RightContainer class="modal-container">
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          class="top-search"
          size="small"
        >
          <el-form-item prop="userName">
            <el-input v-model="query.userName" placeholder="请输入员工姓名" clearable />
          </el-form-item>
          <el-form-item prop="orderUserName">
            <el-input v-model="query.orderUserName" placeholder="请输入工单账号" />
          </el-form-item>
          <el-form-item prop="bindStatus">
            <el-select v-model="query.bindStatus" clearable filterable placeholder="请选择绑定状态">
              <el-option
                v-for="(item, index) in bindStatusOptions"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label=" ">
            <el-button
              type="primary"
              @click="onSearch"
            >查询</el-button>
            <el-button
              class="btn-reset"
              @click="resetForm"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:data-stat>
        <div class="count-info">
          <div>当前企业共 <span class="theme-text-color">{{ bindTotalInfo.userNum }}</span> 个在职员工</div>
          <div>已绑定 <span class="theme-text-color">{{ bindTotalInfo.bindNum }}</span> 个工单账号</div>
        </div>
      </template>
      <template v-slot:operate-btn>
        <div class="network-info">
          <div class="enperprise-name">
            <svg class="icon-enterprise-wx mr10" :width="16" :height="16">
              <use href="#icon-enterprise-wx" />
            </svg>
            {{ companyName }}
          </div>
          <svg class="icon-antOutline-link ml20 mr20" :width="24" :height="24">
            <use href="#icon-antOutline-link" />
          </svg>
          <div class="enperprise-name mr10">
            <i class="el-icon-map-location mr10" />
            <div>{{ config.networkName }}</div>
          </div>
        </div>
      </template>
      <template v-slot:data>
        <el-table
          ref="table"
          :data="list"
          class="bind-account-list-table"
          tooltip-effect="dark"
          row-key="id"
          highlight-current-row
          height="400px"
        >
          <template slot="empty">
            <empty-default-icon
              text="暂无数据"
            />
          </template>
          <el-table-column label="员工" prop="name">
            <template slot-scope="{ row }">
              <div class="user-info">
                <el-image class="mr10" :src="row.headImageUrl" style="height: 36px;width: 36px;">
                  <div slot="error" class="image-slot">
                    <img class="user-avatar" :src="require('@/assets/image/card-avatar.svg')" style="width: 100%;">
                  </div>
                </el-image>
                <div class="intwoline" style="flex: 1;">{{ row.userName }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="工单账号">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.orderUserId"
                clearable
                filterable
                placeholder="请选择工单账号"
                @change="(val) => handleChangeAccount(val, row)"
              >
                <el-option
                  v-for="(item, index) in accountList"
                  :key="index"
                  :label="item.orderUserName"
                  :value="item.orderUserId"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="绑定状态" prop="bindStatus" width="120">
            <template #header>
              <span>绑定状态</span>
              <el-popover
                placement="top-start"
                content="记录员工与工单下网点的账号绑定情况"
                trigger="hover"
                popper-class="tip-popover"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
              </el-popover>
            </template>
            <template slot-scope="{ row }">
              {{ row.bindStatus ? '已绑定': '未绑定' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="{ row }">
              <el-button
                v-if="row.bindStatus"
                type="text"
                size="small"
                @click="handleUnBind(row)"
              >解绑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="() => listOfBindDetail()"
        />
      </template>
    </RightContainer>

  </el-dialog>
</template>
<script>
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { listOfBindDetail, networkUser, unbindUser, bindUser } from '@/api/order';
import { PAGE_LIMIT } from '@/utils/constant';
import { mapGetters } from 'vuex';

export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon },
  props: {
    networkId: {
      type: String,
      default: null
    },
    bindTotalInfo: {
      type: Object,
      default: () => {}
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      query: {
        bindStatus: null,
        orderUserName: '',
        userName: '',
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      bindStatusOptions: [
        { label: '未绑定', value: 0 },
        { label: '已绑定', value: 1 }
      ],
      accountList: [],
      list: [],
      total: 0

    };
  },
  computed: {
    ...mapGetters(['companyName'])
  },
  created() {},
  mounted() {

  },
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    },
    onSearch() {
      this.query.pageNum = 1;
      this.listOfBindDetail();
    },
    resetForm() {
      this.query = {
        bindStatus: null,
        orderUserName: '',
        userName: '',
        pageNum: 1,
        pageSize: PAGE_LIMIT
      };
      this.listOfBindDetail();
    },
    /**
     * 解绑
     */
    handleUnBind(row) {
      this.confirmModal({
        msg: '解绑后，员工将不可在侧边栏【应用工具】中查看或操作工单数据，是否继续？'
      }, () => {
        this.unbindUser(row.userId);
      });
    },
    listOfBindDetail() {
      listOfBindDetail(this.query).then(res => {
        this.list = [...res.rows];
        this.total = res.total;
      });
    },
    networkUser() {
      networkUser().then(res => {
        this.accountList = [...res.data];
      });
    },
    unbindUser(userId) {
      unbindUser({
        userId: userId
      }).then(res => {
        this.msgSuccess('解绑成功');
        this.$emit('getBindTotal');
        this.listOfBindDetail();
      });
    },
    bindUser(params) {
      bindUser(params).then(res => {
        this.$emit('getBindTotal');
        this.msgSuccess('绑定成功');
        this.listOfBindDetail();
      });
    },
    handleChangeAccount(val, row) {
      const accountItem = this.accountList.find(item => item.orderUserId === val);
      this.bindUser({
        orderUserId: val,
        orderUserName: accountItem.orderUserName,
        userId: row.userId,
        id: row.id
      });
    }
  }

};
</script>
<style scoped lang='scss'>
.employee-bind-account-modal {
    /deep/ .el-dialog__body {
        padding: 10px 20px;
    }
    .user-info {
      display: flex;
      align-items: center;
    }
    .count-info {
      div {
        line-height: 18px;
        span {
          font-weight: bold;
        }
      }
    }
    .enperprise-name {
      display: flex;
      padding: 10px 5px;
      background-color: #D1EDFF;
      color: #37ADFF;
      align-items: center;
      height: 32px;
      border-radius: 3px;
    }
    .network-info {
      align-items: center;
      display: flex;
    }
}
</style>
