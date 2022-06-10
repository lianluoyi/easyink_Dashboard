<script>
import { getList } from '@/api/customer/group';
import { PAGE_LIMIT } from '@/utils/constant';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';

export default {
  components: { EmptyDefaultIcon },
  props: {
    customerGroupId: {
      type: String,
      default: ''
    },
    appendToBody: {
      type: String,
      default: ''
    },
    cancelClick: {
      type: Function,
      default: () => {}
    },
    okClick: {
      type: Function,
      default: () => {}
    },
    // 已选择的客户群列表
    customerGroupList: {
      type: Array,
      default: () => []
    },
    /**
     * 是否单选
     */
    selectSingle: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      query: {
        groupLeader: '',
        groupName: '',
        beginTime: '',
        endTime: '',
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      searchDate: '', // 查询日期
      loading: false, // 加载状态
      total: 0, // 总数据量
      customerGroups: [], // 客户群数据
      currentRow: null, // 当前选中行,
      currentRowList: [] // 当前选中行(多选),
    };
  },
  watch: {
    searchDate(dateRange) {
      // eslint-disable-next-line no-magic-numbers
      if (!dateRange || dateRange.length !== 2) {
        this.query.beginTime = '';
        this.query.endTime = '';
      } else {
        [this.query.beginTime, this.query.endTime] = dateRange;
      }
    },
    customerGroupList(val) {
      this.dealCustomerGroupSelect(val);
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /**
     * 处理客户群的选中状态
     */
    dealCustomerGroupSelect(list) {
      if (list) {
        this.currentRowList = [...list];
        // 客户群选中列表为空时选中状态不会更改，需要手动清空已选中项
        if (!list.length) {
          this.$refs.customerTable?.clearSelection();
        } else {
          this.$nextTick(() => {
            this.currentRowList.forEach(currentItem => {
              const selectedItem = this.customerGroups.find(item => item.chatId === currentItem.chatId);
              selectedItem && this.$refs.customerTable?.toggleRowSelection(selectedItem, true);
            });
          });
        }
      }
    },
    onSearch() {
      this.query.pageNum = 1;
      this.getList();
    },
    // 获取客户群数据
    getList() {
      const params = Object.assign({}, this.query);
      this.loading = true;
      getList(params)
        .then((res) => {
          this.customerGroups = res.rows;
          this.dealCustomerGroupSelect(this.customerGroupList);
          this.total = parseInt(res.total);

          for (const group of this.customerGroups) {
            if (group.chatId === this.customerGroupId) this.currentRow = group;
          }

          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 单选变更
    handleSingleSelectionChange(val) {
      if (!val) return;
      if (this.selectable(val) < 0) this.currentRow = val;
    },
    /**
     * 多选
     */
    handleSelectionChange(selection, row) {
      if (!this.selectSingle) {
        this.currentRowList = [...selection.filter(Boolean)];
        return;
      }
    },
    resetQuery() {
      this.searchDate = [];
      this.$refs['queryForm'].resetFields();

      this.$nextTick(() => {
        this.getList();
      });
    },
    submit() {
      this.$emit('callback', this.selectSingle ? this.currentRow : this.currentRowList);
    },
    selectable(row) {
      if (!row) return -1;
      const currentIndex = this.customerGroups.findIndex(item => item.chatId === row.chatId);
      if (currentIndex < 0) return -1;
      const selectedIds = this.currentRowList.map(item => item.chatId) || [];
      const index = selectedIds.findIndex(item => item === row.chatId);
      return index;
    },
    onClose() {
      this.$emit('update:visible', false);
    },
    onChangePage() {
      this.getList();
    }
  }
};
</script>

<template>
  <el-dialog
    title="选择客户群"
    width="840px"
    v-bind="$attrs"
    append-to-body
    v-on="$listeners"
    @close="onClose"
  >
    <div>
      <el-form
        ref="queryForm"
        :model="query"
        :inline="true"
        class="top-search"
        label-width="100px"
      >
        <el-form-item prop="groupName">
          <el-input v-model="query.groupName" placeholder="请输入客户群昵称" />
        </el-form-item>
        <el-form-item prop="groupLeader">
          <el-input v-model="query.groupLeader" placeholder="请输入群主" />
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="searchDate"
            format="yyyy-MM-dd"
            value-format="yyyyMMdd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button class="btn-reset" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div style="border: 1px solid #eee">
        <el-table
          ref="customerTable"
          v-loading="loading"
          row-key="chatId"
          :data="customerGroups"
          highlight-current-row
          height="300"
          :header-cell-style="{background:'#EEE', textAlign: 'left'}"
          :cell-style="{textAlign: 'left'}"
          @current-change="handleSingleSelectionChange"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              :length="customerGroups.length"
            />
          </template>
          <el-table-column
            v-if="!selectSingle"
            type="selection"
            width="55"
            :reserve-selection="true"
          />
          <el-table-column
            v-if="selectSingle"
            key="check"
            width="55"
            align="center"
          >
            <template #default="{ row }">
              <el-checkbox :disabled="selectable(row) > -1" :value="currentRow && row.chatId === currentRow.chatId" />
            </template>
          </el-table-column>
          <el-table-column
            key="groupName"
            prop="groupName"
            label="群昵称"
            align="center"
          >
            <template slot-scope="{ row }">
              <div style="display:flex">
                <div style="display:flex; align-items: center;">
                  <svg class="icon-groupChat" :width="35" :height="35">
                    <use href="#icon-groupChat" />
                  </svg>
                </div>
                <el-tooltip :content="row.groupName" placement="bottom-end" effect="dark">
                  <div class="ellipsis-style" style="display:flex;align-items: center;">
                    {{ row.groupName }}
                  </div>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="memberNum"
            label="群成员"
            align="center"
          />
          <el-table-column
            prop="groupLeaderName"
            label="群主"
            align="center"
          >
            <template slot-scope="scope">
              <div class="al">
                <div class="cus-owner">{{ scope.row.groupLeaderName }}</div>
                <div class="cus-dept">{{ scope.row.mainDepartmentName }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            align="center"
          />
        </el-table>
      </div>
    </div>

    <div slot="footer" class="footer-flex">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        :pager-count="5"
        class="footer-left"
        @pagination="onChangePage"
      />
      <div class="footer-right">
        <el-button @click="cancelClick"> 取消 </el-button>
        <el-button type="primary" @click="okClick"> 确定 </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.footer-left{
  text-align: left;
  padding: 0;
}
.footer-right{
  flex: 1;
}
.footer-flex{
  display: flex;
  justify-content: space-between;
}
</style>
