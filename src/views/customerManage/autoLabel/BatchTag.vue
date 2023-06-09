<template>
  <div class="batch-tag">
    <RightContainer>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          size="small"
          class="top-search"
        >
          <el-form-item prop="name">
            <el-input
              v-model="query.taskName"
              placeholder="请输入任务名称"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <div class="tag-input" @click="selectTagVisible = true">
              <span
                v-if="!selectedTags.length"
                class="tag-place"
              >请选择标签</span>
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
          <el-form-item prop="status">
            <el-select
              v-model="query.executeFlag"
              placeholder="请选择执行状态"
              clearable
            >
              <el-option
                v-for="item in executeStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="user">
            <el-input
              v-model="query.createBy"
              placeholder="请输入创建人姓名"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch()">查询</el-button>
            <el-button class="btn-reset" @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:operate-btn>
        <el-button
          v-hasPermi="['wecom:batchtag:add']"
          type="primary"
          @click="importVisible = true"
        >新建打标任务</el-button>
        <el-button v-hasPermi="['wecom:batchtag:del']" @click="batchDel">批量删除</el-button>
      </template>
      <template v-slot:data>
        <el-table
          ref="table"
          v-loading="loading"
          :data="taskList"
          tooltip-effect="dark"
          size="medium"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon text="暂无数据" />
          </template>
          <el-table-column type="selection" align="center" width="55" />
          <el-table-column label="任务名称" prop="name" align="left" />
          <el-table-column label="客户数" prop="customerCnt" align="left" />
          <el-table-column label="标签" prop="tagList" align="left" width="210">
            <template #default="{ row }">
              <el-tag
                v-for="(item, index) in dealTagList(row.tagName)"
                :key="index"
                class="mb5"
                type="info"
              >{{ item }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="执行状态" align="left">
            <template slot-scope="{ row }">
              <div :class="row.executeFlag ? 'exected' :'executeing'">
                {{ row.executeFlag ? '已执行' : '执行中' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="创建人"
            prop="createBy"
            align="left"
          >
            <template slot-scope="{ row }">
              <div>
                <div class="al">
                  <div class="cus-owner">{{ row.createBy }}</div>
                  <div class="cus-dept">{{ row.department }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            prop="createTime"
            align="left"
            width="199"
          />
          <el-table-column label="操作" width="199">
            <template slot-scope="{ row }">
              <el-button type="text" size="medium" @click="goToDetail(row)">详情</el-button>
              <el-button
                v-hasPermi="['wecom:batchtag:del']"
                type="text"
                size="medium"
                @click="handleDelete(row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="total * 1"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          :select-data-len="multipleSelection.length"
          @pagination="getTaskList()"
        />
      </template>
    </RightContainer>
    <!-- 选择标签弹窗 -->
    <SelectTag
      type="query"
      title="选择标签"
      :visible.sync="selectTagVisible"
      :selected="selectedTags"
      @success="submitSelectTag"
    />
    <ImportTask :visible.sync="importVisible" href="批量打标签模板.xlsx" @onSearch="onSearch" />
  </div>
</template>

<script>
import RightContainer from '@/components/RightContainer';
import SelectTag from '@/components/SelectTag';
import ImportTask from './components/ImportTask.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { selectBatchTaskList, deleteTask } from '@/api/batchTagTask';
import { goRouteWithQuery } from '@/utils';
import { PAGE_LIMIT } from '@/utils/constant';
export default {
  name: 'BatchTag',
  components: { RightContainer, EmptyDefaultIcon, SelectTag, ImportTask },
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      selectedTags: [],
      selectTagVisible: false,
      executeStatus: [
        { value: false, label: '执行中' },
        { value: true, label: '已执行' }
      ],
      dateRange: [],
      taskList: [],
      multipleSelection: [],
      total: 0,
      importVisible: false,
      loading: false
    };
  },
  computed: {},
  beforeRouterEnter() {
  },
  created() {
    // 判断上一个页面是否来自详情在进行赋值操作
    const searchQuery = JSON.parse(sessionStorage.getItem('BatchTag'));
    if (searchQuery) {
      this.query = searchQuery.query;
      this.selectedTags = searchQuery.selectedTags;
      this.dateRange = searchQuery.dateRange;
    }
    sessionStorage.removeItem('BatchTag');
    this.getTaskList(1);
  },
  methods: {
    dealTagList(tagName) {
      return tagName ? tagName.split(',') : '';
    },
    // 选择的标签
    submitSelectTag(selected) {
      this.query.tagIds = selected.map((tag) => tag.tagId).join(',');
      this.selectedTags = selected;
      this.selectTagVisible = false;
    },
    // 删除标签
    deleteTag(tag) {
      const index = this.selectedTags.findIndex(
        (tag_) => tag_.tagId === tag.tagId
      );
      this.selectedTags.splice(index, 1);
      this.query.tagIds = this.selectedTags.map((item) => item.tagId).join(',');
    },
    /**
     * @description 搜索
     */
    onSearch() {
      this.saveQuery();
      this.getTaskList(1);
    },
    onReset() {
      this.selectedTags = [];
      this.dateRange = [];
      this.query = this.$options.data().query;
      this.onSearch();
    },
    getTaskList(page) {
      page && (this.query.pageNum = page);
      const params = this.query;
      if (this.dateRange) {
        params.beginTime = this.dateRange[0];
        params.endTime = this.dateRange[1];
      } else {
        params.beginTime = '';
        params.endTime = '';
      }
      this.loading = true;
      selectBatchTaskList(params).then((res) => {
        this.taskList = res.rows;
        this.total = res.total;
      }).finally(() => {
        this.loading = false;
      });
    },
    goToDetail(row) {
      goRouteWithQuery(this.$router, 'BatchTagTaskDetail', {
        ...this.query,
        dateRange: this.dateRange
      }, {
        taskId: row.id,
        taskName: row.name
      });
    },
    // TODO 保存查询参数 从详情返回时 使用原先的查询参数 待处理
    saveQuery() {
      const payload = {
        query: this.query,
        dateRange: this.dateRange,
        selectedTags: this.selectedTags
      };
      sessionStorage.setItem('BatchTag', JSON.stringify(payload));
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },
    /*
     * 批量删除
     */
    batchDel() {
      if (this.multipleSelection.length <= 0) {
        this.msgWarn('请至少选择一个任务');
        return;
      }
      this.deleteRule(
        this.multipleSelection.map((item) => item.id)
      );
    },
    /**
     * 删除单个规则
     * @param row 对应标签规则数据
     */
    handleDelete(row) {
      this.deleteRule(
        //   需要删除的标签规则id列表
        [row.id]
      );
    },
    /**
     * 删除规则
     * @param
     */
    async deleteRule(params) {
      this.confirmModal(
        {
          msg: `所选任务将被删除，且不可撤回，是否继续？`
        },
        async() => {
          deleteTask({ taskIds: params.join(',') }).then((res) => {
            this.msgSuccess('删除成功');
            this.onSearch();
          });
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.other-import {
  margin-top: 20px;
  .import-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .task-name {
      width: 100px;
      &::before {
        content: '*';
        color: red;
        margin-right: 3px;
      }
    }
  }
}
.base-execute-status {
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: red;
    margin-right: 8px;
  }
}
.executeing {
  @extend .base-execute-status;
  &::before {
    background-color: #37adff;
  }
}
.exected {
  @extend .base-execute-status;
  &::before {
    background-color: #51c41b;
  }
}
</style>
