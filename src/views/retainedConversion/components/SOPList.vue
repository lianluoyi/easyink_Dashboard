<!--
 * @Description: sop任务列表公共样式
 * @Author: broccoli
 * @LastEditors: chenchengjie
-->
<template>
  <div class="sop-list-page">
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
          <el-form-item prop="name">
            <el-input v-model="query.name" :placeholder="`请输入${sopName}名称`" clearable />
          </el-form-item>
          <el-form-item v-if="showUseEmployees" prop="user">
            <el-input v-model="query.userName" placeholder="请输入员工姓名" />
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="query.isOpen" placeholder="请选择启用状态" clearable>
              <el-option
                v-for="item in enabledStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              v-preventReClick="200"
              type="primary"
              :loading="searchButtonLoading"
              @click="()=>{
                searchButtonLoading = true;
                onSearch()
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
      <template v-slot:data-stat>
        <div>
          {{ sopTip }}
        </div>
      </template>
      <template v-slot:operate-btn>
        <el-dropdown
          v-hasPermi="dealPermission('switch')"
          class="dropdown-reset"
          split-button
          @click="() => handleBatchIsOpen(true)"
          @command="(e) => handleBatchIsOpen(e)"
        >
          批量开启
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item style="width: 108px" :command="false">批量关闭</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-hasPermi="dealPermission('del')"
          @click="batchDel"
        >批量删除</el-button>
        <el-button
          v-hasPermi="dealPermission('add')"
          type="primary"
          @click="goRoute('addSOP')"
        >{{ `新增${sopName}` }}</el-button>
      </template>
      <template v-slot:data>
        <el-table
          ref="table"
          :key="sopType"
          v-loading="loading"
          :data="list"
          tooltip-effect="dark"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              text="暂无数据"
            />
          </template>
          <el-table-column
            key="row-1"
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column key="row-2" :label="`${sopName}名称`" prop="name" align="left" />
          <el-table-column v-if="showUseEmployees" key="row-3" label="使用员工" prop="scopeList" align="left" :show-overflow-tooltip="true">
            <template slot-scope="{ row }">
              <ListUserShow
                v-if="row.scopeList"
                :use-user-name="getUseUserName(row.scopeList.map(item => item.type === SCOPELIST_TYPE.USER ? item.userName : undefined).filter(item => item && item.trim()))"
                :department-name="getUseUserName(row.scopeList.map(item => item.type === SCOPELIST_TYPE.DEPARTMENT ? item.departmentName : undefined).filter(item => item && item.trim()))"
              />
            </template>
          </el-table-column>
          <el-table-column key="row-4" label="启用状态" prop="isOpen" align="left">
            <template slot-scope="{ row }">
              <el-switch
                v-model="row.isOpen"
                :disabled="!checkPermi()"
                @change="(value) => changeStatus(value, row)"
              />
            </template>
          </el-table-column>
          <el-table-column key="row-5" label="创建人" prop="username" align="left">
            <template slot-scope="{ row }">
              <div>
                <div>{{ row.createUserName }}</div>
                <div>{{ row.mainDepartmentName }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column key="row-6" label="创建时间" prop="createTime" align="left" />
          <el-table-column key="row-7" label="操作" width="120">
            <template slot-scope="{ row }">
              <el-button
                type="text"
                size="small"
                @click="onDetail(row)"
              >详情</el-button>
              <el-button v-if="showUseEmployees" v-hasPermi="dealPermission('edit')" type="text" size="small" @click="() => editEmployee(row)">修改员工</el-button>
              <br>
              <el-button v-hasPermi="dealPermission('edit')" type="text" size="small" @click="goRoute('addSOP', { id: row.id })">编辑</el-button>
              <el-button v-hasPermi="dealPermission('del')" type="text" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total * 1"
          :page.sync="query.pageNum"
          :disabled="loading"
          :limit.sync="query.pageSize"
          :select-data-len="multipleSelection.length"
          @pagination="getSopList()"
        />
      </template>
    </RightContainer>
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      :selected-user-list="selectUserList || []"
      :is-only-leaf="false"
      is-dep-linkage
      :is-null="false"
      @success="submitSelectUser"
    />
  </div>
</template>
<script>
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import SelectUser from '@/components/SelectUser/index.vue';
import { goRouteWithQuery } from '@/utils';
import { SOP_TYPE, PAGE_LIMIT, SCOPELIST_TYPE } from '@/utils/constant/index';
import { checkPermi } from '@/utils/permission';
import { getSopList, batchSwitchSop, deleteSop, editUser } from '@/api/sop';
import ListUserShow from '@/components/ListUserShow';
import { groupByScopeType } from '@/utils/common';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon, SelectUser, ListUserShow },
  mixins: [loadingMixin],
  props: {
    sopType: {
      type: Number,
      default: null
    },
    showUseEmployees: {
      type: Boolean,
      default: false
    },
    sopName: {
      type: String,
      default: 'SOP'
    },
    sopTip: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'customer'
    }
  },
  data() {
    return {
      enabledStatus: [{
        label: '全部',
        value: -1
      }, {
        label: '启用',
        value: 1
      }, {
        label: '关闭',
        value: 0
      }],
      query: {
        name: '',
        userName: '',
        isOpen: null,
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      total: 0,
      // SOP任务列表
      list: [],
      multipleSelection: [], // 多选数组
      // 修改员工弹窗
      dialogVisibleSelectUser: false,
      // 已选择的员工列表
      selectUserList: [],
      // 列表加载状态
      loading: false,
      currentSopId: null,
      // 员工类型(员工/部门)
      SCOPELIST_TYPE
    };
  },
  computed: {
    /**
     * 是否为群聊
     */
    isGroup() {
      return [SOP_TYPE['timing'], SOP_TYPE['cycle']].includes(this.sopType);
    }
  },
  watch: {
    sopType(val) {
      if (val || val === 0) {
        this.$nextTick(() => {
          this.query.pageNum = 1;
          this.multipleSelection = [];
          this.$refs.table && this.$refs.table.doLayout();
          this.getSopList();
        });
      }
    }
  },
  created() {
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
      this.query = this.$store.getters.searchQuery[this.$route.name];
    }
    this.getSopList();
  },
  mounted() {},
  methods: {
    // 通过数组拼接出用户名str
    getUseUserName(list) {
      return list.join(',');
    },
    /**
       * 查询
       */
    onSearch() {
      this.getSopList({ pageNum: 1 });
    },
    /**
       * 重置
       */
    resetForm() {
      this.query = {
        name: '',
        userName: '',
        isOpen: null,
        pageNum: 1,
        pageSize: PAGE_LIMIT
      };
      this.getSopList();
    },
    batchDel() {
      if (this.multipleSelection.length <= 0) {
        this.msgWarn(`${this.type === 'groupCalendar' ? '请至少选择一个群日历' : '请至少选择一个sop任务'}`);
        return;
      }
      this.deleteSop({
        sopIdList: this.multipleSelection.map(item => item.id),
        sopType: this.sopType
      }, 'batch');
    },
    goRoute(path, params = {}) {
      const newParams = { ...params };
      switch (this.sopType) {
        case SOP_TYPE['timing']:
        case SOP_TYPE['cycle']: {
          newParams.prePageType = 'groupSOP';
          break;
        }
        case SOP_TYPE['newCustomer']:
        case SOP_TYPE['activity']:
        case SOP_TYPE['birthday']: {
          newParams.prePageType = 'customerSOP';
          break;
        }
        case SOP_TYPE['groupCalendar']: {
          newParams.prePageType = 'groupCalendarSOP';
          break;
        }
      }
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.query
      });
      goRouteWithQuery(this.$router, path, {}, { ...newParams, sopType: this.sopType });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },
    onDetail(row) {
      this.goRoute('SOPDetail', { id: row.id });
    },
    /**
     * 批量修改启用状态
     * @param value 启用状态
     */
    handleBatchIsOpen(value) {
      if (this.multipleSelection.length <= 0) {
        this.msgWarn(`${this.type === 'groupCalendar' ? '请至少选择一个群日历' : '请至少选择一个sop任务'}`);
        return;
      }
      let confirmTip = '';
      switch (this.type) {
        case 'customer': {
          confirmTip = value ? '选中的SOP开启后，自动执行SOP下的规则，给使用员工发送任务提醒，是否继续？' : '选中的SOP关闭后，SOP下的规则将失效，不会给使用员工发送任务提醒，是否继续？';
          break;
        }
        case 'group': {
          confirmTip = value ? '选中的SOP开启后，自动执行SOP下的规则，给群聊的群主发送任务提醒，是否继续？' : '选中的SOP关闭后，SOP下的规则将失效，不会给群聊的群主发送任务提醒，是否继续？';
          break;
        }
        case 'groupCalendar': {
          confirmTip = value ? '选中的日历开启后，自动执行日历下的规则，给群聊的群主发送任务提醒，是否继续？' : '选中的日历关闭后，日历下的规则将失效，不会给群聊的群主发送任务提醒，是否继续？';
          break;
        }
      }
      this.confirmModal({
        msg: confirmTip
      }, async() => {
        this.batchSwitchSop({
          isOpen: value,
          sopIdList: this.multipleSelection.map(item => item.id)
        });
      });
    },
    batchSwitchSop(params) {
      batchSwitchSop(params).then(res => {
        if (res) {
          this.msgSuccess('设置成功');
          this.getSopList();
        }
      });
    },
    /**
     * 修改启用状态
     */
    changeStatus(value, row) {
      this.batchSwitchSop({
        isOpen: value,
        sopIdList: [row.id]
      });
    },
    /**
     * 选择人员变化事件
     */
    submitSelectUser(users) {
      const groupByUsers = groupByScopeType(users);
      this.editUser({
        id: this.currentSopId,
        userIdList: (groupByUsers?.useEmployeesList?.map(item => item.userId)) || [],
        departmentIdList: (groupByUsers?.useDepartmentList?.map(item => item.id)) || []
      });
    },
    /**
     * 点击修改员工
     */
    editEmployee(row) {
      this.dialogVisibleSelectUser = true;
      this.currentSopId = row.id;
      this.selectUserList = row.scopeList.map(item => { return { ...item, [item.type === SCOPELIST_TYPE['USER'] ? 'userId' : 'id']: item.targetId, name: item.type === SCOPELIST_TYPE['USER'] ? item.userName : item.departmentName }; });
    },
    async getSopList(params = {}) {
      try {
        const query = this.query;
        const newParams = {
          sopType: this.sopType,
          ...query,
          isOpen: query.isOpen === -1 ? null : query.isOpen,
          ...params
        };
        this.loading = true;
        const listRes = await getSopList(newParams);
        this.query = {
          ...query,
          pageNum: newParams.pageNum
        };
        if (listRes) {
          this.loading = false;
          const list = [...listRes.rows];
          this.list = list;
          this.modifyButtonStatus();
          this.total = listRes.total;
        }
      } catch (error) {
        this.modifyButtonStatus();
        this.loading = false;
      }
    },
    /**
     * 删除单个sop
     * @param row 对应sop数据
     */
    handleDelete(row) {
      this.deleteSop({
        sopIdList: [row.id],
        sopType: this.sopType
      });
    },
    /**
     * 删除sop
     * @param
     * "sopIdList": []
     * "sopType": 0
     */
    async deleteSop(params, type) {
      this.confirmModal({
        msg: `选中的${this.sopName}删除后，${this.sopName}下的规则将失效，数据将被删除且不可恢复，是否继续？`
      }, async() => {
        const delRes = await deleteSop(params);
        if (delRes) {
          this.msgSuccess('删除成功');
          const removeLength = type ? this.multipleSelection.length : 1;
          // 删除的时候页码跳到上一页，获取上一页数据
          const page = this.list.length === removeLength && this.query.pageNum > 1
            ? this.query.pageNum - 1
            : this.query.pageNum;
          this.getSopList({ pageNum: page });
        }
      });
    },
    /**
     * 修改使用员工
     */
    editUser(params) {
      editUser(params).then(res => {
        if (res) {
          this.msgSuccess('修改成功');
          this.getSopList();
        }
      });
    },
    checkPermi() {
      const permissionKey = this.dealPermission('switch');
      return checkPermi(permissionKey);
    },
    dealPermission(type) {
      let permissionKey = [];
      switch (this.sopType) {
        case SOP_TYPE['cycle']:
        case SOP_TYPE['timing']: {
          permissionKey = [`wecom:groupSop:${type}`];
          break;
        }
        case SOP_TYPE['newCustomer']:
        case SOP_TYPE['activity']:
        case SOP_TYPE['birthday']: {
          permissionKey = [`wecom:customerSop:${type}`];
          break;
        }
        case SOP_TYPE['groupCalendar']: {
          permissionKey = [`wecom:groupCalendar:${type}`];
          break;
        }
      }
      return permissionKey;
    }
  }
};
</script>
