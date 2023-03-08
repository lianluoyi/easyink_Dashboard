<script>
import {
  getList,
  exportCustomer,
  lossRemind,
  getLossRemindStatus
} from '@/api/customer';
import { getList as getListTag } from '@/api/customer/tag';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import SelectUser from '@/components/SelectUser/index.vue';
import SelectTag from '@/components/SelectTag';
import { EventBus } from '@/event-bus.js';
import { goRouteWithQuery } from '@/utils';
import { dealAtInfo } from '@/utils/common';
import { PAGE_LIMIT, WX_TYPE, CUSTOMER_DEATIL_PATH } from '@/utils/constant';
export default {
  name: 'LossRemind',
  components: { SelectUser, SelectTag, RightContainer, EmptyDefaultIcon },
  props: {},
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        name: '', // "客户名称",
        userIds: '', // "添加人id",
        tagIds: '', // "标签id,多个标签，id使用逗号隔开",
        beginTime: '', // "开始时间",
        endTime: '', // "结束时间"
        status: 1
      },
      queryTag: [], // 搜索框选择的标签
      queryUser: [], // 搜索框选择的添加人
      dateRange: [], // 添加日期
      loading: false,
      isMoreFilter: false,
      total: 0,
      list: [], // 客户列表
      listOrganization: [], // 组织架构列表
      multipleSelection: [], // 多选数组
      dialogVisible: false, // 选择标签弹窗显隐
      dialogVisibleSelectUser: false, // 选择添加人弹窗显隐
      selectedGroup: '', // 选择的标签分组
      selectedTag: [], // 选择的标签
      removeTag: [], // 可移除的标签
      tagDialogType: {
        title: '', // 选择标签弹窗标题
        type: '' // 弹窗类型
      },
      isNotice: '0',
      wxType: WX_TYPE
    };
  },
  computed: {},
  watch: {},
  created() {
    if (this.$route.query) {
      Object.keys(this.query).forEach(key => {
        if (this.$route.query[key]) {
          this.query[key] = this.$route.query[key];
        }
      });
    }
    this.getList();
    this.getListTag();
    this.getLossRemindStatus();

    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>客户将企业成员删除后，会生成一条流失记录。如需告知被删除的成员，则开启通知提醒</div>
      `
    );
  },
  mounted() {},
  methods: {
    getList(page) {
      // console.log(this.dateRange);
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
          this.list = rows;
          this.total = +total;
          this.loading = false;
          this.multipleSelection = [];
        })
        .catch(() => {
          this.loading = false;
        });
    },
    getListTag() {
      getListTag().then(({ rows }) => {
        this.listTagOneArray = [];
        rows.forEach((element) => {
          element.weTags.forEach((d) => {
            this.listTagOneArray.push(d);
          });
        });
      });
    },
    getLossRemindStatus() {
      getLossRemindStatus().then(({ data }) => {
        this.isNotice = data;
      });
    },
    showTagDialog() {
      this.selectedTag = this.queryTag;
      this.tagDialogType = {
        title: '选择标签',
        type: 'query'
      };
      this.dialogVisible = true;
    },
    /**
     * 导出按钮操作
     * @param perms 权限标识
     */
    exportCustomer(perms) {
      const queryParams = {
        ...this.query,
        perms
      };
      this.confirmModal({
        msg: '即将导出当前查询结果，是否继续？'
      }, () => {
        return exportCustomer(queryParams)
          .then((response) => {
            this.download(response.msg);
          });
      });
    },
    selectedUser(list) {
      this.queryUser = list;
      this.query.userIds = list.map((d) => d.userId) + '';
    },
    submitSelectTag(selected) {
      if (this.tagDialogType.type === 'query') {
        this.query.tagIds = selected.map((d) => d.tagId) + '';
        // debugger;
        this.queryTag = selected;
        this.dialogVisible = false;
      }
    },
    resetForm(formName) {
      this.dateRange = [];
      this.queryTag = [];
      this.queryUser = [];
      this.selectedTag = [];
      this.$refs['queryForm'].resetFields();
      this.query.userIds = '';
      this.query.tagIds = '';
      EventBus.$emit('resetTag');
      EventBus.$emit('resetUser');
      this.$nextTick(() => {
        this.getList(1);
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },
    // 流失提醒开关事件
    remindSwitch(val) {
      lossRemind(val).then(() => {
        this.msgSuccess('操作成功');
      });
    },
    goRoute(item) {
      goRouteWithQuery(this.$router, CUSTOMER_DEATIL_PATH, this.query, { id: item.externalUserid, userId: item.userId, userName: item.userName, prePageType: 'lossRemind' });
    },
    /**
     * 处理 @微信 的字样
     */
    renderUserInfo(item, type) {
      return dealAtInfo(item, type);
    }
  }
};
</script>

<template>
  <RightContainer :config-keys="['contactSecret', 'customSecret']" page-title="管理离职员工">
    <template v-slot:search>
      <el-form
        ref="queryForm"
        :inline="true"
        :model="query"
        label-width="100px"
        class="top-search"
        size="small"
      >
        <el-form-item prop="name">
          <el-input v-model="query.name" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item>
          <div class="tag-input" @click="dialogVisibleSelectUser = true">
            <span v-if="!queryUser.length" class="tag-place">请选择员工</span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in queryUser"
                :key="unique"
                type="info"
              >{{ unit.name }}</el-tag>
            </template>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="tag-input" @click="showTagDialog">
            <span v-if="!queryTag.length" class="tag-place">请选择标签</span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in queryTag"
                :key="unique"
                type="info"
              >{{ unit.name }}</el-tag>
            </template>
          </div>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
        </el-form-item>
        <el-form-item label=" ">
          <el-button
            type="primary"
            @click="getList(1)"
          >查询</el-button>
          <el-button
            class="btn-reset"
            @click="resetForm()"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:data-stat>
      <div v-hasPermi="['wechat:corp:startCustomerChurnNoticeSwitch']">
        客户流失提醒<el-switch
          v-model="isNotice"
          class="ml10 mr10"
          active-value="1"
          inactive-value="0"
          inactive-color="#DDD"
          @change="remindSwitch"
        />
      </div>
    </template>
    <template v-slot:operate-btn>
      <el-button
        v-hasPermi="['customerManage:lossRemind:export']"
        class="btn-reset"
        @click="exportCustomer('customerManage:lossRemind:export')"
      >导出列表</el-button>
    </template>
    <template v-slot:data>
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="list"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <template slot="empty">
          <empty-default-icon
            text="暂无数据"
          />
        </template>
        <el-table-column
          type="selection"
          align="center"
          width="55"
        />
        <el-table-column label="客户" prop="name" align="left">
          <template slot-scope="{ row }">
            <div class="customer-info cp" @click="goRoute(row)">
              <img :src="row.avatar">
              <div class="customer-name">
                <div class="inoneline" :title="(row.remark || row.name || row.alias) + renderUserInfo(row, 'type')">
                  <span>{{ row.remark || row.name || row.alias }}</span>
                  <span :class="row.type === wxType ? 'wx-type-flag' : 'corp-type-name'">
                    {{ renderUserInfo(row, 'type') }}
                  </span>
                </div>
                <div class="customer-real-name inoneline" :title="row.name">{{ row.name }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="添加时间" align="left">
          <template slot-scope="scope">{{
            scope.row.createTime
          }}</template>
        </el-table-column>
        <el-table-column prop="userName" label="所属员工" align="left">
          <template slot-scope="{ row }">
            <div class="al">
              <div class="cus-owner">{{
                row.userName
              }}</div>
              <div class="cus-dept">{{
                row.department
              }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="标签" align="left">
          <template slot-scope="scope">
            <el-tag
              v-for="(unit, unique) in scope.row.weFlowerCustomerTagRels"
              :key="unique"
              type="info"
            >{{ unit.tagName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['customerManage:lossRemind:view']"
              type="text"
              size="small"
              @click="
                goRoute(scope.row)
              "
            >详情</el-button>
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

      <!-- 选择标签弹窗 -->
      <SelectTag
        :visible.sync="dialogVisible"
        :title="tagDialogType.title"
        :selected="selectedTag"
        :type="tagDialogType.type"
        @success="submitSelectTag"
      />

      <!-- 选择添加人弹窗 -->
      <SelectUser
        :visible.sync="dialogVisibleSelectUser"
        title="选择添加人"
        @success="selectedUser"
      />
    </template>
  </RightContainer>
</template>

<style lang="scss" scoped>
.el-icon-s-custom {
  font-size: 16px;
  margin-left: 4px;
  color: #999;
  &.man {
    color: #13a2e8;
  }
  &.woman {
    color: #f753b2;
  }
}
.bfc-d + .bfc-d .el-checkbox:first-child {
  margin-left: 10px;
}
.el-tag {
  height: 18px;
  line-height: 12px;
  font-size: 12px;
  padding: 3px;
  border-radius: 3px;
  margin-bottom: 2px;
}
</style>
