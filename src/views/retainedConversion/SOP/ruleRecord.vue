<!--
 * @Description: 规则执行记录
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<template>
  <div class="rule-record">
    <div class="record-search">
      <el-input
        v-if="type === 'rule'"
        v-model="query.ruleName"
        placeholder="请输入任务名称，回车搜索"
        style="width: 240px;"
        clearable
        @keyup.enter.native="() => dealGetList(1)"
        @submit.native.prevent
      />
      <el-input
        v-if="type === 'employee'"
        v-model="employeeQuery.userName"
        placeholder="请输入员工名称，回车搜索"
        style="width: 240px;"
        clearable
        @keyup.enter.native="() => dealGetList(1)"
        @submit.native.prevent
      />
    </div>
    <div>
      <el-table
        :data="list"
      >
        <template slot="empty">
          <empty-default-icon
            text="暂无数据"
          />
        </template>
        <el-table-column
          v-if="isCustomerRule || isGroupRule"
          key="id"
          label="序号"
          prop="id"
          width="80px"
        >
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="isCustomerRule || isGroupRule"
          key="ruleName"
          label="任务名称"
          prop="ruleName"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          v-if="isCustomerRule || isGroupRule"
          key="time"
          label="提醒时间"
          prop="time"
        >
          <template slot-scope="scope">
            <RemindPerform :rule-item="scope.row" :sop-type="sopType" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="isCustomerEmployee || isGroupEmployee"
          key="userName"
          label="员工"
          prop="userName"
          width="250px"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <div class="flex user-info-div">
              <div class="user-img">
                <el-image :src="getHeadImgUrl(scope.row.headImageUrl)" style="width: 35px; height: 35px;">
                  <div slot="error" class="image-slot">
                    <i class="iconfont icon-unknown-gender" style="font-size: 35px;vertical-align: text-top;" />
                  </div>
                </el-image>
              </div>
              <div class="user-info ml10">
                <div>{{ scope.row.userName }}</div>
                <div class="corp-type-name">{{ scope.row.corpName }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="isGroupEmployee"
          key="groupCount"
          label="客户群数"
          prop="groupCount"
        />
        <el-table-column
          key="taskCount"
          label="任务总数"
          prop="taskCount"
        />
        <el-table-column
          key="taskExecuteCount"
          label="已执行"
          prop="taskExecuteCount"
        />
        <el-table-column
          key="taskUnExecuteCount"
          label="未执行"
          prop="taskUnExecuteCount"
        />
        <el-table-column
          key="executeRate"
          label="执行率"
          prop="executeRate"
        />
        <el-table-column
          label="操作"
          class-name="small-padding fixed-width"
          prop="operate"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['customerManage:group:view']"
              size="mini"
              type="text"
              @click="onDetail(scope.row)"
            >执行详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="type === 'rule' && total > 0"
        :total="total"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        @pagination="() => dealGetList()"
      />
      <pagination
        v-show="type === 'employee' && total > 0"
        :total="total"
        :page.sync="employeeQuery.pageNum"
        :limit.sync="employeeQuery.pageSize"
        @pagination="() => dealGetList()"
      />
    </div>
    <PerformRecordModal
      v-if="![SOP_TYPE['cycle'], SOP_TYPE['groupCalendar']].includes(sopType)"
      ref="performRecordModal"
      :visible.sync="recordModalVisible"
      title="执行详情"
      :rule-id="currentRuleId"
      :user-id="currentUserId"
      :sop-id="sopId"
      :sop-type="sopType"
      :is-customer-rule="isCustomerRule"
      :is-customer-employee="isCustomerEmployee"
      :is-group-rule="isGroupRule"
      :is-group-employee="isGroupEmployee"
      :type="type"
    />
    <!-- 循环群sop执行详情 -->
    <CyclePerformRecordModal
      v-if="sopType === SOP_TYPE['cycle']"
      ref="cyclePerformRecordModal"
      :visible.sync="cycleRecordModalVisible"
      title="执行详情"
      :rule-id="currentRuleId"
      :user-id="currentUserId"
      :sop-id="sopId"
      :sop-type="sopType"
      :is-group-rule="isGroupRule"
      :is-group-employee="isGroupEmployee"
      :type="type"
    />
    <!-- 群日历执行详情弹窗 -->
    <CalendarPerformRecordModal
      v-if="sopType === SOP_TYPE['groupCalendar']"
      ref="calendarPerformRecordModal"
      :visible.sync="calendarRecordModalVisible"
      title="执行详情"
      :rule-id="currentRuleId"
      :user-id="currentUserId"
      :sop-id="sopId"
      :is-group-rule="isGroupRule"
      :is-group-employee="isGroupEmployee"
      :type="type"
    />
  </div>
</template>
<script>
import { getSopRulesRecordList, getSopEmployeeRecordList } from '@/api/sop';
import { PAGE_LIMIT, SOP_TYPE } from '@/utils/constant/index';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import RemindPerform from '../components/RemindPerform.vue';
import PerformRecordModal from './performRecordModal.vue';
import CyclePerformRecordModal from './cyclePerformRecordModal.vue';
import CalendarPerformRecordModal from './calendarPerformRecordModal.vue';
import { getHeadImgUrl } from '@/utils/common';
export default {
  name: '',
  components: { EmptyDefaultIcon, RemindPerform, PerformRecordModal, CyclePerformRecordModal, CalendarPerformRecordModal },
  props: {
    sopId: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: 'rule'
    }
  },
  inject: ['sopInfo'],
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        ruleName: ''
      },
      employeeQuery: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        userName: ''
      },
      list: [],
      total: 0,
      recordModalVisible: false,
      cycleRecordModalVisible: false,
      calendarRecordModalVisible: false,
      SOP_TYPE,
      currentRuleId: null,
      currentUserId: null
    };
  },
  computed: {
    sopType() {
      return this.sopInfo.sopType;
    },
    isCustomerRule() {
      return this.isCustomer && this.type === 'rule';
    },
    isCustomerEmployee() {
      return this.isCustomer && this.type === 'employee';
    },
    isGroupRule() {
      return this.isGroup && this.type === 'rule';
    },
    isGroupEmployee() {
      return this.isGroup && this.type === 'employee';
    },
    isGroup() {
      return [SOP_TYPE['timing'], SOP_TYPE['cycle'], SOP_TYPE['groupCalendar']].includes(this.sopType);
    },
    isCustomer() {
      return [SOP_TYPE['newCustomer'], SOP_TYPE['activity'], SOP_TYPE['birthday']].includes(this.sopType);
    }
  },
  watch: {
    // 切换规则/员工执行记录
    type(val) {
      this.dealGetList();
    }
  },
  created() {},
  mounted() {
    this.dealGetList(1);
  },
  methods: {
    getHeadImgUrl,
    dealGetList(pageNum) {
      const type = this.type;
      switch (type) {
        case 'rule': {
          this.getRulesRecordList(pageNum);
          break;
        }
        case 'employee': {
          this.getSopEmployeeRecordList(pageNum);
          break;
        }
      }
    },
    getRulesRecordList(pageNum = this.query.pageNum) {
      this.query.pageNum = pageNum;
      const query = this.query;
      getSopRulesRecordList({
        sopId: this.sopId,
        pageNum: pageNum,
        pageSize: query.pageSize,
        ruleName: query.ruleName
      }).then(res => {
        if (res) {
          this.list = res.rows?.length ? [...res.rows] : [];
          this.total = res.total;
        }
      });
    },
    getSopEmployeeRecordList(pageNum = this.employeeQuery.pageNum) {
      this.employeeQuery.pageNum = pageNum;
      const employeeQuery = this.employeeQuery;
      getSopEmployeeRecordList({
        sopId: this.sopId,
        pageNum: pageNum,
        pageSize: employeeQuery.pageSize,
        userName: employeeQuery.userName
      }).then(res => {
        if (res) {
          this.list = res?.rows?.length ? [...res.rows] : [];
          this.total = res?.total;
        }
      });
    },
    onDetail(row) {
      let params = {};
      switch (this.type) {
        case 'rule': {
          this.currentRuleId = row.ruleId;
          params = { ruleId: row.ruleId };
          break;
        }
        case 'employee': {
          this.currentUserId = row.userId;
          params = { userId: row.userId };
          break;
        }
      }
      const REF_MAP = {
        [SOP_TYPE['cycle']]: 'cyclePerformRecordModal',
        [SOP_TYPE['groupCalendar']]: 'calendarPerformRecordModal'
      };
      const VISIBLE_MAP = {
        [SOP_TYPE['cycle']]: 'cycleRecordModalVisible',
        [SOP_TYPE['groupCalendar']]: 'calendarRecordModalVisible'
      };
      const refName = REF_MAP[this.sopType] || 'performRecordModal';
      const visibleName = VISIBLE_MAP[this.sopType] || 'recordModalVisible';
      this.$refs[refName].getDetailList(params);
      this.$refs[refName].resetQuery();
      this[visibleName] = true;
    }
  }

};
</script>
<style scoped lang='scss'>
.rule-record {
    .record-search {
        margin-bottom: 15px;
    }
    .user-info-div {
        .user-img {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .user-info {
            .corp-type-name {
                color: #aaa;
                font-size: 12px;
            }
        }
    }
}
</style>
