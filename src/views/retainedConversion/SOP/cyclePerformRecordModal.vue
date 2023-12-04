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
          </div>
        </template>
        <template v-slot:data>
          <el-table v-loading="loading" :data="recordList" height="300px">
            <template slot="empty">
              <empty-default-icon :length="recordList.length" />
            </template>
            <el-table-column
              v-if="isGroupRule || isGroupEmployee"
              key="chatName"
              label="客户群"
              align="center"
              prop="chatName"
              width="180px"
            >
              <template slot-scope="scope">
                <div class="flex">
                  <svg class="icon-groupChat mr5" :width="35" :height="35">
                    <use href="#icon-groupChat" />
                  </svg>
                  <span class="intwoline" style="flex: 1;">{{ scope.row.chatName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-if="isGroupRule"
              key="chatCreatorName"
              label="群主"
              align="center"
              prop="chatCreatorName"
              width="180px"
            />
            <el-table-column
              v-if="isGroupEmployee"
              key="ruleName"
              label="任务名称"
              align="center"
              prop="ruleName"
            />
            <el-table-column
              key="cycleNum"
              label="循环次数"
              align="center"
              prop="cycleNum"
            />
            <el-table-column
              key="executed"
              label="已执行"
              align="center"
              prop="executed"
            />
            <el-table-column
              key="unExecute"
              label="未执行"
              align="center"
              prop="unExecute"
            />
            <el-table-column
              key="executeRate"
              label="执行率"
              align="center"
              prop="executeRate"
            >
              <template slot-scope="scope">
                <span>{{ (scope.row.executed / scope.row.cycleNum).toFixed(FIX)* 100 }}%</span>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="query.pageNum"
            :disabled="loading"
            :limit.sync="query.pageSize"
            @pagination="() => getDetailList()"
          />
        </template>
      </RightContainer>
    </div>
  </el-dialog>
</template>
<script>
import { PAGE_LIMIT, SOP_TYPE, PAGE_LIMIT_INFINITE } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { getCycleSopRulesDetailList, getSopRulesRecordList } from '@/api/sop';
import loadingMixin from '@/mixin/loadingMixin';
// 保留两位小数
const FIX = 2;
export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon },
  mixins: [loadingMixin],
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
    isGroupRule: {
      type: Boolean,
      default: false
    },
    isGroupEmployee: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'rule'
    },
    userId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // 执行状态选项
      performStatusOption: [
        { label: '全部', value: '0' },
        { label: '已执行', value: '1' },
        { label: '未执行', value: '2' }
      ],
      // 执行详情查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        chatName: '',
        chatOwnerName: ''
      },
      total: 0,
      loading: false,
      recordList: [],
      ruleList: [],
      remindTime: null,
      SOP_TYPE,
      FIX
    };
  },
  watch: {
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
        chatName: '',
        chatOwnerName: ''
      };
      this.remindTime = null;
    },
    getDetailList(params) {
      this.getCycleSopRulesDetailList(params);
    },
    getCycleSopRulesDetailList(newParams = {}) {
      let params = {
        sopId: this.sopId,
        ...this.query
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
      this.loading = true;
      getCycleSopRulesDetailList(params).then(res => {
        this.recordList = res.rows;
        this.total = res.total;
      }).finally(() => {
        this.loading = false;
        this.modifyButtonStatus();
      });
    },
    /**
     * 获取所有任务列表
     */
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
