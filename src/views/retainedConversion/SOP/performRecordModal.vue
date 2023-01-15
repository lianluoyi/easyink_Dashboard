<!--
 * @Description: 执行详情
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog v-bind="$attrs" class="perform-record-modal" width="800px" v-on="$listeners" @close="onClose">
    <div>
      <RightContainer>
        <template v-slot:search>
          <div class="top-search">
            <el-form
              ref="customerForm"
              inline
              label-position="right"
              :model="query"
              label-width="80px"
            >
              <el-form-item v-if="isCustomerRule || isCustomerEmployee" prop="customerName">
                <el-input
                  v-model="query.customerName"
                  placeholder="请输入客户名称"
                  clearable
                />
              </el-form-item>
              <el-form-item v-if="isGroupRule || isGroupEmployee" prop="chatName">
                <el-input
                  v-model="query.chatName"
                  placeholder="请输入群昵称"
                  clearable
                />
              </el-form-item>
              <el-form-item v-if="isGroupRule" prop="chatOwnerName">
                <el-input
                  v-model="query.chatOwnerName"
                  placeholder="请输入群主名称"
                  clearable
                />
              </el-form-item>
              <el-form-item v-if="isCustomerRule" prop="employName">
                <el-input
                  v-model="query.employName"
                  placeholder="请输入员工名称"
                  clearable
                />
              </el-form-item>
              <el-form-item>
                <el-select
                  v-model="query.finishFlag"
                  placeholder="请选择执行状态"
                  size="small"
                  clearable
                >
                  <el-option
                    v-for="(inGroup, index) in performStatusOption"
                    :key="index"
                    :label="inGroup.label"
                    :value="inGroup.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item prop="time">
                <el-tooltip class="item" effect="dark" content="提醒时间" placement="top">
                  <el-date-picker
                    v-model="remindTime"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  />
                </el-tooltip>
              </el-form-item>
              <el-form-item v-if="isCustomerEmployee || isGroupEmployee">
                <el-select
                  v-model="query.ruleId"
                  placeholder="请选择任务"
                  size="small"
                  clearable
                >
                  <el-option
                    v-for="(ruleItem, ruleIndex) in ruleList"
                    :key="ruleIndex"
                    :label="ruleItem.ruleName"
                    :value="ruleItem.ruleId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button class="btn-reset" @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </template>
        <template v-slot:data>
          <el-table v-loading="loading" :data="recordList" height="300px">
            <template slot="empty">
              <empty-default-icon :length="recordList.length" />
            </template>
            <el-table-column
              v-if="isCustomerRule || isCustomerEmployee"
              key="customerName"
              label="客户"
              align="center"
              prop="customerName"
              width="180px"
            >
              <template #default="{ row }">
                <div style="display: flex; align-items:center;">
                  <el-image
                    class="mr5"
                    style="width: 35px; height: 35px"
                    :src="row.avatar || require('@/assets/image/card-avatar.svg')"
                    fit="fill"
                  />
                  <div class="user-info" style="flex: 1;">
                    <span class="customer-name">{{ row.customerName || '' }}</span>
                    <span :class="row.customerType === wxType ? 'wx-type-flag' : 'corp-type-name'">
                      {{ renderUserInfo(row, 'customerType') }}
                    </span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-if="isGroupRule || isGroupEmployee"
              key="chatName"
              label="客户群"
              align="center"
              prop="chatName"
              width="180px"
            />
            <el-table-column
              v-if="(isCustomerRule || isGroupRule)"
              key="chatCreatorName"
              label="员工"
              align="center"
              prop="chatCreatorName"
            >
              <template slot-scope="scope">
                <div class="al">
                  <div class="cus-owner">{{ scope.row.chatCreatorName }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-if="isCustomerEmployee || isGroupEmployee"
              key="ruleName"
              label="任务名称"
              align="center"
              prop="ruleName"
            />
            <el-table-column prop="status" label="执行状态" align="center">
              <template #default="{ row }">
                <div class="flex" style="align-items: center;">
                  <div :class="`mr5 ${row.isFinish ? 'dot-green' : 'dot-orange'}`" />
                  <span>{{ row.isFinish ? '已执行' : '未执行' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              key="alertTime"
              label="提醒时间"
              align="center"
              prop="alertTime"
            />
            <el-table-column
              key="finishTime"
              label="完成时间"
              align="center"
              prop="finishTime"
            />
          </el-table>
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="query.pageNum"
            :limit.sync="query.pageSize"
            @pagination="() => getDetailList()"
          />
        </template>
      </RightContainer>
    </div>
  </el-dialog>
</template>
<script>
import { PAGE_LIMIT, SOP_TYPE, PAGE_LIMIT_INFINITE, WX_TYPE } from '@/utils/constant';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { getCustomerSopRulesDetailList, getSopRulesRecordList, getTimingSopRulesDetailList } from '@/api/sop';
import { dealAtInfo } from '@/utils/common';

export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon },
  props: {
    ruleId: {
      type: Number,
      default: null
    },
    sopId: {
      type: String,
      default: null
    },
    sopType: {
      type: Number,
      default: null
    },
    isCustomerRule: {
      type: Boolean,
      default: false
    },
    isCustomerEmployee: {
      type: Boolean,
      default: false
    },
    isGroupRule: {
      type: Boolean,
      default: false
    },
    isGroupEmployee: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: 'rule'
    }
  },
  data() {
    return {
      // 执行状态选项
      performStatusOption: [
        { label: '全部', value: -1 },
        { label: '已执行', value: 1 },
        { label: '未执行', value: 0 }
      ],
      // 执行详情查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        customerName: '', // 客户名称
        employName: ''
      },
      total: 0,
      loading: false,
      recordList: [],
      ruleList: [],
      remindTime: null,
      SOP_TYPE,
      wxType: WX_TYPE
    };
  },
  watch: {
    isCustomerEmployee(val) {
      if (val) this.getRulesRecordList();
    },
    isGroupEmployee(val) {
      if (val && !this.ruleList.length) this.getRulesRecordList();
    }
  },
  created() {},
  mounted() {
  },
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    },
    onSearch() {
      this.getDetailList({ pageNum: 1 });
    },
    resetForm() {
      this.resetQuery();
      this.getDetailList({ pageNum: 1 });
    },
    resetQuery() {
      this.query = {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        customerName: '', // 客户名称
        employName: ''
      };
      this.remindTime = null;
    },
    getDetailList(newParams) {
      const finishFlag = this.query.finishFlag;
      switch (this.sopType) {
        case SOP_TYPE['newCustomer']:
        case SOP_TYPE['activity']:
        case SOP_TYPE['birthday']: {
          this.getCustomerSopRulesDetailList(finishFlag, newParams);
          break;
        }
        case SOP_TYPE['timing']: {
          this.getTimingSopRulesDetailList(finishFlag, newParams);
          break;
        }
      }
    },
    getTimingSopRulesDetailList(finishFlag, newParams = {}) {
      let params = {
        sopId: this.sopId,
        beginTime: this.remindTime && this.parseTime(this.remindTime[0], '{y}-{m}-{d}'),
        endTime: this.remindTime && this.parseTime(this.remindTime[1], '{y}-{m}-{d}'),
        ...this.query,
        finishFlag: finishFlag === -1 ? null : finishFlag
      };
      switch (this.type) {
        case 'rule': {
          params.ruleId = this.ruleId;
          break;
        }
        case 'employee': {
          params.userId = this.userId;
          break;
        }
      }
      params = { ...params, ...newParams };
      getTimingSopRulesDetailList(params).then(res => {
        this.recordList = res.rows;
        this.total = res.total;
      });
    },
    getCustomerSopRulesDetailList(finishFlag, newParams = {}) {
      let params = {
        sopId: this.sopId,
        beginTime: this.remindTime && this.parseTime(this.remindTime[0], '{y}-{m}-{d}'),
        endTime: this.remindTime && this.parseTime(this.remindTime[1], '{y}-{m}-{d}'),
        ...this.query,
        finishFlag: finishFlag === -1 ? null : finishFlag
      };
      switch (this.type) {
        case 'rule': {
          params.ruleId = this.ruleId;
          break;
        }
        case 'employee': {
          params.userId = this.userId;
          break;
        }
      }
      params = { ...params, ...newParams };
      getCustomerSopRulesDetailList(params).then(res => {
        this.recordList = res.rows;
        this.total = res.total;
      });
    },
    getRulesRecordList() {
      getSopRulesRecordList({
        sopId: this.sopId,
        pageNum: 1,
        pageSize: PAGE_LIMIT_INFINITE
      }).then(res => {
        if (res) {
          this.ruleList = res.rows?.length ? [...res.rows] : [];
        }
      });
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
<style scoped lang='scss'>
.perform-record-modal {
    /deep/ .search-form-container {
        .el-form {
            margin-bottom: 0;
            padding: 0;
        }
    }
    /deep/ .show-data-wrapper {
        padding: 15px 0;
    }
}
</style>

