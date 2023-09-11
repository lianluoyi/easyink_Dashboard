<script>
import * as api from '@/api/customer/group';
import * as tagApi from '@/api/customer/grouptag';
import SelectTag from '@/components/SelectTag';
import RightContainer from '@/components/RightContainer';
import CustomerOrGroupInfo from './components/CustomerOrGroupInfo.vue';
import { PAGE_LIMIT, JOIN_SCENE, GROUP_ENTER_WAY_MAP, MEMBER_TYPE, CUSTOMER_DETAIL } from '@/utils/constant/index';
export default {
  // name: 'GroupDetail',
  components: { SelectTag, RightContainer, CustomerOrGroupInfo },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 群信息
      group: {},
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        groupId: undefined,
        memberName: undefined,
        joinScene: undefined
      },
      joinScene: JOIN_SCENE,
      memberType: MEMBER_TYPE,
      dateRange: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      statusOptions: Object.keys(GROUP_ENTER_WAY_MAP).map(status => ({ label: GROUP_ENTER_WAY_MAP[status], value: status })),
      customerCount: 0,
      staffCount: 0,
      dialogVisible: false,
      selectedTags: [],
      activeTabName: CUSTOMER_DETAIL['groupMemInfo'],
      CUSTOMER_DETAIL
    };
  },
  created() {
    this.group = this.$route.query;
    this.query.chatId = this.group.chatId;
    this.getGroup();
    this.getList();
  },
  methods: {
    getGroup() {
      api.getList({ chatId: this.query.chatId }).then(res => {
        this.group = res.rows ? res.rows[0] : this.group;
        this.group.weTags = this.group.tagList;
      });
    },
    getList(page) {
      const params = {
        ...this.query
      };
      if (this.dateRange.length > 0) {
        params.startTime = this.dateRange[0];
        params.endTime = this.dateRange[1];
      }
      page && (this.query.pageNum = page);
      this.loading = false;
      api.getMembers(params).then((response) => {
        this.list = response.rows;
        this.total = +response.total;
        this.loading = false;
      });
      api.getMemberCount(params).then(({ data }) => {
        const { customerCount, staffCount } = data;
        this.customerCount = customerCount;
        this.staffCount = staffCount;
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.operId);
      this.multiple = !selection.length;
    },
    handleGoBack() {
      this.$router.go(-1);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.$refs['queryForm'].resetFields();
      this.$nextTick(() => {
        this.getList(1);
      });
    },
    showTagDialog(group) {
      this.selectedTags = [...group.weTags];
      this.dialogVisible = true;
    },
    submitSelectTag(selected) {
      const chatIdList = [this.group.chatId];
      const addList = selected.filter(tag => !this.group.weTags.find(tag_ => tag_.tagId === tag.tagId));
      const delList = this.group.weTags.filter(tag => !selected.find(tag_ => tag_.tagId === tag.tagId));
      if (!addList.length && !delList.length) {
        this.msgSuccess('操作成功');
        this.dialogVisible = false;
        return;
      }
      if (addList.length) {
        tagApi.batchAddTagRel({
          chatIdList,
          tagIdList: addList.map(tag => tag.tagId)
        }).then(() => {
          !delList.length && this.msgSuccess('操作成功');
          this.dialogVisible = false;
          this.getGroup();
        });
      }
      if (delList.length) {
        tagApi.batchDelTagRel({
          chatIdList,
          tagIdList: delList.map(tag => tag.tagId)
        }).then(() => {
          this.msgSuccess('操作成功');
          this.dialogVisible = false;
          this.getGroup();
        });
      }
    }
  }
};
</script>

<template>
  <div class="container">
    <!-- <el-button slot="append" circle icon="el-icon-back" @click="$router.back()"></el-button>返回 -->
    <el-card shadow="hover" class="card">
      <div class="back-area">
        <i class="iconfont icon-restore" @click="handleGoBack" />
        <span @click="handleGoBack">返回</span>
      </div>
      <svg class="icon-groupChat" :width="100" :height="100">
        <use href="#icon-groupChat" />
      </svg>
      <div>
        <div class="creator-div">
          <div class="label title">{{ group.groupName }}({{ total }})</div>
        </div>
        <div class="creator-div">
          <div class="label">创建时间：</div>
          <span>{{ group.createTime }}</span>
          <div class="label">群主：</div>
          <span>{{ group.groupLeaderName || group.newOwnerName }}</span>
          <div class="label">标签：</div>
          <el-tag
            v-for="(unit, unique) in group.tagList"
            :key="unique"
            type="info"
          >{{ unit.name }}</el-tag>
          <i v-hasPermi="['customerManage:group:edit']" class="el-icon-edit theme-text-color" @click="() => showTagDialog(group)" />
        </div>
        <div class="mt15 flex aic">
          <div class="label">群公告：</div>
          <div class="message-content">
            {{ group.notice || '未设置' }}
          </div>
        </div>
      </div>
    </el-card>
    <div class="tab" :style="{ height:(activeTabName === CUSTOMER_DETAIL['groupMemInfo'] ? '100%' : '40px')}">
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="群成员信息" :name="CUSTOMER_DETAIL['groupMemInfo']">
          <RightContainer>
            <template v-slot:search>
              <el-form
                ref="queryForm"
                :inline="true"
                :model="query"
                label-width="100px"
                class="top-search"
                size="small"
              >
                <el-form-item prop="memberName" class="group-member-search">
                  <el-input v-model="query.memberName" placeholder="请输入群成员昵称" />
                </el-form-item>
                <el-form-item>
                  <el-date-picker
                    v-model="dateRange"
                    value-format="yyyy-MM-dd"
                    type="daterange"
                    :picker-options="pickerOptions"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  />
                </el-form-item>
                <el-form-item prop="joinScene">
                  <el-select v-model="query.joinScene" placeholder="请选择入群方式">
                    <el-option
                      v-for="item in statusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="getList(1)"
                  >查询</el-button>
                  <el-button
                    class="btn-reset"
                    @click="resetQuery"
                  >重置</el-button>
                </el-form-item>
              </el-form>
            </template>
            <template v-slot:data-stat>
              <span>群内客户<span class="data-count-num">{{ customerCount }}</span>人，企业成员<span class="data-count-num">{{ staffCount }}</span>人</span>
            </template>
            <template v-slot:data>
              <el-table
                v-loading="loading"
                :data="list"
                @selection-change="handleSelectionChange"
              >
                <el-table-column label="群成员" prop="memberName">
                  <template slot-scope="scope">
                    <span v-if="scope.row.userId === group.owner" class="owner-label theme-text-color">群主</span>
                    {{ scope.row.memberName }}
                  </template>
                </el-table-column>
                <el-table-column label="成员类型" prop="joinType">
                  <template slot-scope="scope">
                    <span>{{ memberType[scope.row.joinType] }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="入群时间" prop="joinTime" />
                <el-table-column label="入群方式" prop="joinScene">
                  <template slot-scope="scope">
                    <span>{{ joinScene[scope.row.joinScene] }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="邀请者" prop="invitorName">
                  <template #header>
                    <span>邀请者</span>
                    <el-popover
                      placement="top-start"
                      content="仅本企业内部成员邀请入群时显示邀请者"
                      trigger="hover"
                      popper-class="tip-popover"
                    >
                      <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
                    </el-popover>
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
        </el-tab-pane>
        <el-tab-pane label="待办事项" :name="CUSTOMER_DETAIL['todo']" />
      </el-tabs>
    </div>
    <div v-if="activeTabName === CUSTOMER_DETAIL['todo']" class="todo-tab">
      <CustomerOrGroupInfo
        :active-tab="CUSTOMER_DETAIL['todo']"
        :external-userid="query.chatId"
        is-group
      />
    </div>
    <SelectTag
      ref="selectTag"
      :visible.sync="dialogVisible"
      title="客户群标签"
      type="search"
      :selected="selectedTags"
      info-msg="请选择要为当前客户群打上的标签"
      :is-show-add="true"
      :tag-type="'group'"
      @success="submitSelectTag"
    />

  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.el-input {
  display: table;
  // width: 30%;
}
.group-name {
  font-size: 16px;
  color: #333;
}
.info-wrap {
  background: #fff;
  padding: 20px;
  width: 100%;
  .info {
    color: #666;
  }
  .line {
    padding: 28px;
    color: #dbdbdb;
  }
}
.key {
  color: #7f7f7f;
  font-size: 14px;
  line-height: 24px;
}
.value {
  color: #333;
}
.el-form {
  margin-top: 15px;
  margin-bottom: 12px;
  background: #fff;
}
.icon-groupChat {
  margin-right: 15px;
}
.el-card {
  overflow: unset;
}
.back-area {
  position: absolute;
  left: 0;top: 0;
  width: 100%;
  height: 48px;
  line-height: 48px;
  padding-left: 15px;
  i, span {
    cursor: pointer;
  }
  i {
    margin-right: 10px;
  }
}
.label {
  color: #999;
  font-size: 14px;
}
.title {
  color: #303133;
  font-size: 24px;
}
.container {
  display: flex;
  flex-direction: column;
  .tab {
    margin-top: 10px;
    /deep/ .el-form {
      margin-top: 0;
    }
    /deep/ .search-form-container {
      background-color: #eee;
    }
  }
  .todo-tab {
    flex: 1;
    position: relative;
    /deep/ .customer-info-list {
      height: 100%;
    }
  }
  /deep/ .el-tabs {
    height: 100%;
    background-color: #fff;
    .el-tabs__active-bar {
      margin-left: 5px;
    }
    .el-tabs__item {
      padding: 0 15px;
    }
    .el-tabs__nav {
      padding-left: 5px;
    }
    .el-tabs__header {
      margin: 0;
    }
  }
  .card {
    /deep/ .el-card__body {
      display: flex;
      position: relative;
      padding-top: 60px;
    }
  }
}
.creator-div {
  display: flex;
  align-items: center;
  &:nth-of-type(1) {
    margin-top: 10px;
  }
  &:nth-of-type(2) {
    margin-top: 15px;
  }
  span:not(.el-tag) {
    color: #333;
    margin-right: 30px;
  }
}
.owner-label {
  padding: 1px 2px;
  border-radius: 3px;
  background-color: #f0f8f7;
  font-size: 12px;
  text-align: center;
  font-family: Roboto;
  @include border_style($width: 1px);
}
.el-tag {
  background-color: #fff1e8!important;
  border-color: #fee3d0!important;
  color: #fa7216!important;
  margin-right: 10px;
}
.el-icon-edit {
  cursor: pointer;
}
</style>
