<!--
 * @Description: 在职继承
 * @Author: 佚名
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <RightContainer>
      <template v-slot:search>
        <el-form ref="queryForm" :inline="true" :model="query" label-width="100px" class="top-search">
          <el-form-item prop="name">
            <el-input v-model="query.name" placeholder="请输入客户昵称" />
          </el-form-item>

          <el-form-item>
            <div class="tag-input" @click="selectUserType = 'query'">
              <span v-if="!queryUser.length" class="tag-place">请选择员工</span>
              <template v-else>
                <el-tag v-for="(unit, unique) in queryUser" :key="unique" type="info">{{ unit.name }}</el-tag>
              </template>
            </div>
          </el-form-item>

          <el-form-item>
            <div class="tag-input" @click="selectTagVisible = true">
              <span v-if="!selectedTags.length" class="tag-place">请选择标签</span>
              <template v-else>
                <el-tag
                  v-for="(unit, unique) in selectedTags"
                  :key="unique"
                  type="info"
                  closable
                  @close="deleteTag(unit)"
                >
                  {{ unit.name }}
                </el-tag>
              </template>
            </div>
          </el-form-item>

          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
            />
          </el-form-item>

          <el-form-item label=" ">
            <el-button
              v-preventReClick="200"
              type="primary"
              :loading="searchButtonLoading"
              @click="()=>{
                searchButtonLoading = true;
                handleQuery()
              }"
            >查询</el-button>
            <el-button
              v-preventReClick="200"
              class="btn-reset"
              :loading="resetButtonLoading"
              @click="()=>{
                resetButtonLoading = true;
                resetForm()
              }"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-slot:operate-btn>
        <el-button
          v-preventReClick
          v-hasPermi="['customerManage:active:transfer']"
          type="primary"
          @click="allocatedCustomer"
        >
          分配客户
        </el-button>
        <el-button v-preventReClick v-hasPermi="['customerManage:transfer:record']" @click="inheritRecord">
          分配记录
        </el-button>

        <el-popover v-model="inheritSettingShow" placement="bottom-end" width="400" trigger="click">
          <div>
            <el-alert title="若接替员工之前已添加客户，则不会同步客户信息" type="warning" close-text=" " show-icon />
            <el-form ref="form" :model="query" label-width="8em" label-position="left" size="mini">
              <el-form-item label="继承客户信息">
                <el-switch v-model="transferConfig.enableTransferInfo" />
                <p class="we-emple-code-tags-tip">开启后，在职继承时，将同步客户信息至接替员工，方便员工跟进客户</p>
              </el-form-item>
              <el-form-item label="员工转接客户">
                <el-switch v-model="transferConfig.enableSideBar" />
                <p class="we-emple-code-tags-tip">开启后，员工可在侧边栏【客户画像】将客户转接给其他在职员工</p>
              </el-form-item>
              <el-form-item class="ar">
                <el-button type="text" @click="inheritSettingShow = false">取 消</el-button>
                <el-button type="primary" @click="inheritSettingSave">确 定</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-button slot="reference" v-hasPermi="['customerManage:transfer:config']">继承设置</el-button>
        </el-popover>
      </template>

      <template v-slot:data>
        <el-table
          ref="table"
          v-loading="loading"
          :data="list"
          tooltip-effect="dark"
          align="left"
          highlight-current-row
          @selection-change="(selection) => (selectedCustomers = selection)"
        >
          <template slot="empty">
            <empty-default-icon text="暂无数据" />
          </template>

          <el-table-column type="selection" width="55" :selectable="(row) => !isInheriting(row.transferStatus)" />

          <el-table-column label="客户" prop="name">
            <template slot-scope="{ row }">
              <div class="customer-info" @click="goRoute(row)">
                <img :src="row.avatar">
                <div>
                  <div class="inoneline" :title="(row.remark || row.name || row.alias) + renderUserInfo(row)">
                    <span>{{ row.remark || row.name || row.alias }}</span>
                    <span :class="row.type === wxType ? 'wx-type-flag' : 'corp-type-name'">{{
                      renderUserInfo(row)
                    }}</span>
                  </div>
                  <div class="customer-real-name inoneline" :title="row.name">{{ row.name }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="添加时间" />

          <el-table-column label="所属员工">
            <template slot-scope="scope">
              <div class="al">
                <div class="cus-owner">{{ scope.row.userName }}</div>
                <div class="cus-dept">{{ scope.row.department }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="标签">
            <template slot-scope="scope">
              <el-tag v-for="(unit, unique) in scope.row.weFlowerCustomerTagRels" :key="unique" type="info">
                {{ unit.tagName }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="接替状态">
            <template slot-scope="scope">
              {{ isInheriting(scope.row.transferStatus) ? '接替中' : '' }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="goRoute(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          :disabled="loading"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          :select-data-len="selectedCustomers.length"
          @pagination="getList()"
        />
      </template>
    </RightContainer>

    <!-- 搜索框 -->
    <SelectUser
      is-sigle-select
      :visible="selectUserType === 'query'"
      title="选择查询员工"
      :selected-user-list="queryUser"
      @click="selectUserType = 'query'"
      @success="submitSelectUser"
      @close="selectUserType = ''"
    />

    <!-- 分配客户按钮 -->
    <SelectUser
      ref="selectUser"
      is-sigle-select
      :visible="selectUserType === 'inherit'"
      title="选择接替员工"
      alert-text="为保障客户服务体验，90个自然日内，企业下每位客户仅可被在职继承2次。"
      @click="selectUserType = 'inherit'"
      @close="selectUserType = ''"
    >
      <template v-slot:footer>
        <el-button
          v-if="inheritFail"
          type="text"
          :class="['inheritFail', { hide: selectUserType !== 'inherit' }]"
          @click="inheritFailDrawerVisible = true"
        >
          分配失败？
        </el-button>

        <el-button @click="selectUserType = ''">取 消</el-button>
        <el-button type="primary" :loading="selectUserLoading" @click="submitSelectUser"> 确 定</el-button>
      </template>
    </SelectUser>

    <SelectTag
      type="query"
      title="选择标签"
      :visible.sync="selectTagVisible"
      :selected="selectedTags"
      @success="submitSelectTag"
    />

    <InheritFailDrawer :visible.sync="inheritFailDrawerVisible" />
  </div>
</template>
<script>
import { goRouteWithQuery } from '@/utils';
import { dealAtInfo } from '@/utils/common';
import { PAGE_LIMIT, INHERIT_STATUS_INHERITING, WX_TYPE } from '@/utils/constant/index';
import { CUSTOMER_DEATIL_PATH } from '@/utils/constant/routePath';
import { getCustomerList, transfer, getTransferConfig, editConfig } from '@/api/transfer';

import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import SelectUser from '@/components/SelectUser/index.vue';
import SelectTag from '@/components/SelectTag';
import InheritFailDrawer from './InheritFailDrawer';
import loadingMixin from '@/mixin/loadingMixin';
const defaultQuery = {
  pageNum: 1,
  pageSize: PAGE_LIMIT
};

export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon, SelectUser, SelectTag, InheritFailDrawer },
  mixins: [loadingMixin],
  props: {},
  data() {
    return {
      query: { ...defaultQuery },
      total: 1,
      list: [],
      dateRange: [],
      queryUser: [],
      // 选中的客户
      selectedCustomers: [],
      // 标签弹窗
      selectedTags: [],
      selectTagVisible: false,
      // 继承设置弹出框
      inheritSettingShow: false,
      transferConfig: {
        enableTransferInfo: true,
        enableSideBar: false
      },
      // 员工选择弹窗
      selectUserType: '',
      selectUserLoading: false,
      inheritFailDrawerVisible: false,
      inheritFail: false,
      wxType: WX_TYPE,
      remotetransferConfig: null,
      loading: false
    };
  },
  watch: {
    inheritSettingShow(val) {
      if (!val) {
        this.transferConfig = { ...this.remotetransferConfig };
      }
    }
  },
  created() {
    this.getList();

    getTransferConfig().then(({ data }) => {
      this.transferConfig = { ...data };
      this.remotetransferConfig = { ...data };
    });

    this.$store.dispatch(
      'app/setBusininessDesc',
      '<div>将在职员工的客户分配给指定员工，让优质客户得到更好的服务</div>'
    );
  },
  mounted() {},
  methods: {
    getList() {
      const params = {
        ...this.query,
        beginTime: this.dateRange[0],
        endTime: this.dateRange[1]
      };
      this.loading = true;
      getCustomerList(params).then(({ rows, total }) => {
        this.list = rows;
        this.total = +total;
      }).finally(() => {
        this.modifyButtonStatus();
        this.loading = false;
      });
    },
    goRoute(row) {
      goRouteWithQuery(this.$router, CUSTOMER_DEATIL_PATH, this.query, {
        id: row.externalUserid,
        userId: row.userId,
        prePageType: 'customer'
      });
    },
    submitSelectUser(userList) {
      if (this.selectUserType === 'inherit') {
        const list = this.$refs.selectUser.userList;
        if (list.length) {
          this.selectUserLoading = true;
          const params = {
            customerList: this.selectedCustomers.map((customer) => ({
              externalUserid: customer.externalUserid,
              handoverUserid: customer.userId
            })),
            takeoverUserid: this.$refs.selectUser.userList[0].userId
          };
          transfer(params)
            .then(() => {
              this.msgSuccess('分配成功，等待接替');
              this.selectUserType = '';
              this.selectUserLoading = false;
              this.getList();
            })
            .catch(() => {
              this.inheritFail = true;
              this.selectUserLoading = false;
              this.getList();
            });
        } else {
          this.msgWarn('请选择接替员工');
        }
      }
      if (this.selectUserType === 'query') {
        this.queryUser = userList;
        this.query.userIds = userList[0]?.userId;
        this.selectUserType = '';
      }
    },
    submitSelectTag(selected) {
      this.query.tagIds = selected.map((tag) => tag.tagId).toString();
      this.selectedTags = [...selected];
      this.selectTagVisible = false;
    },
    handleQuery() {
      this.query.pageNum = 1;
      this.getList();
    },
    resetForm() {
      this.query = { ...defaultQuery };
      this.dateRange = [];
      this.queryUser = [];
      this.selectedTags = [];
      this.getList();
    },
    // 分配客户
    allocatedCustomer() {
      if (this.selectedCustomers.length) {
        this.selectUserType = 'inherit';
      } else {
        this.msgWarn('请勾选要分配的客户');
      }
    },
    // 保存继承设置
    inheritSettingSave() {
      editConfig(this.transferConfig)
        .then(() => {
          this.msgSuccess('设置成功');
          this.remotetransferConfig = { ...this.transferConfig };
        })
        .finally(() => {
          this.inheritSettingShow = false;
        });
    },
    deleteTag(tag) {
      const index = this.selectedTags.findIndex((tag_) => tag_.tagId === tag.tagId);
      this.selectedTags.splice(index, 1);
      this.query.tagIds = this.selectedTags.map((tag) => tag.tagId) + '';
    },
    isInheriting(type) {
      return type === INHERIT_STATUS_INHERITING;
    },
    inheritRecord() {
      this.$router.push('inheritRecord');
    },
    renderUserInfo(item) {
      return dealAtInfo(item);
    }
  }
};
</script>

<style scoped lang="scss">
.cus-owner {
  font-size: 14px;
  color: #333;
}

.cus-dept {
  font-size: 12px;
  color: #666;
}

.el-tag {
  height: 18px;
  line-height: 12px;
  font-size: 12px;
  padding: 3px;
  border-radius: 3px;
  margin-bottom: 2px;
}

.we-emple-code-tags-tip {
  color: #999;
  font-size: 12px;
  text-align: left;
  line-height: 1.2em;
}

.inheritFail {
  float: left;
  color: #f56c6c;
}
</style>
