<!--
 * @Description: 群日历执行详情弹窗
 * @Author: broccoli
 * @LastEditors: broccoli
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
              <el-form-item prop="chatName">
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
              <el-form-item v-if="isGroupEmployee" prop="time">
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
              <el-form-item v-if="isGroupEmployee">
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
              key="chatName"
              label="客户群"
              align="center"
              prop="chatName"
              width="180px"
            />
            <el-table-column
              v-if="isGroupRule"
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
              v-if="isGroupEmployee"
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
              v-if="isGroupEmployee"
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
import RightContainer from '@/components/RightContainer';
import { PAGE_LIMIT, SOP_TYPE, PAGE_LIMIT_INFINITE } from '@/utils/constant';
import { getSopRulesRecordList, getTimingSopRulesDetailList } from '@/api/sop';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';

export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon },
  props: {
    isGroupRule: {
      type: Boolean,
      default: false
    },
    isGroupEmployee: {
      type: Boolean,
      default: false
    },
    ruleId: {
      type: Number,
      default: null
    },
    sopId: {
      type: String,
      default: null
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
      // 执行详情查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        chatName: '',
        chatOwnerName: ''
      },
      loading: false,
      recordList: [],
      remindTime: null,
      // 执行状态选项
      performStatusOption: [
        { label: '全部', value: -1 },
        { label: '已执行', value: 1 },
        { label: '未执行', value: 0 }
      ],
      SOP_TYPE,
      ruleList: [],
      total: 0
    };
  },
  watch: {
    isGroupEmployee(val) {
      if (val && !this.ruleList.length) this.getRulesRecordList();
    }
  },
  created() {},
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    },
    /**
     * 点击查询
     */
    onSearch() {
      this.getDetailList({ pageNum: 1 });
    },
    /**
     * 重置
     */
    resetForm() {
      this.resetQuery();
      this.getDetailList({ pageNum: 1 });
    },
    /**
     * 获取列表
     */
    getDetailList(newParams) {
      const finishFlag = this.query.finishFlag;
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
    getRulesRecordList() {
      getSopRulesRecordList({
        sopId: this.sopId,
        pageNum: 1,
        pageSize: PAGE_LIMIT_INFINITE
      }).then(res => {
        if (res) {
          this.ruleList = [...res.rows] || [];
        }
      });
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
    /**
     * 重置查询条件
     */
    resetQuery() {
      this.query = {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        chatName: '',
        chatOwnerName: ''
      };
      this.remindTime = null;
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
