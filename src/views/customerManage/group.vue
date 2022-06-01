<script>
import * as api from '@/api/customer/group';
import * as tagApi from '@/api/customer/grouptag';
import RightContainer from '@/components/RightContainer';
import SelectTag from '@/components/SelectTag';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { goRouteWithQuery } from '@/utils';
import {
  PAGE_LIMIT, MILI_SECOND_OF_ONE_WEEK, MILI_SECOND_OF_ONE_MONTH, MILI_SECOND_OF_ONE_SEASON,
  GROUP_STATUS_MAP, GROUP_STATUS_ORDER
} from '@/utils/constant';
export default {
  name: 'Group',
  components: { RightContainer, EmptyDefaultIcon, SelectTag },
  data() {
    return {
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        groupName: undefined,
        groupLeader: undefined,
        beginTime: undefined,
        endTime: undefined,
        tagIds: '',
        groupStatus: undefined
      },
      // 日期范围
      dateRange: [],
      // 日期快捷选项
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - MILI_SECOND_OF_ONE_WEEK);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - MILI_SECOND_OF_ONE_MONTH);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - MILI_SECOND_OF_ONE_SEASON);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      },
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
      statusOptions: GROUP_STATUS_ORDER.map(status => ({ label: GROUP_STATUS_MAP[status], value: status })),
      // 批量标签（true:批量移除标签; false:批量打标签）
      batchTag: false,
      // 批量标签弹窗
      dialogVisible: false,
      tagDialogType: {
        title: '', // 选择标签弹窗标题
        type: '' // 弹窗类型
      },
      selectedTags: [],
      queryTag: [],
      removeTags: [],
      tagDialogLoading: false,
      multipleSelection: [],
      GROUP_STATUS_MAP
    };
  },
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
  },
  methods: {
    /** 查询 */
    getList(page) {
      if (this.dateRange) {
        this.query.beginTime = this.dateRange[0];
        this.query.endTime = this.dateRange[1];
      } else {
        this.query.beginTime = '';
        this.query.endTime = '';
      }
      page && (this.query.pageNum = page);
      this.loading = true;
      api
        .getList(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryTag = [];
      this.query.tagIds = '';
      this.dateRange = [];
      this.$refs['queryForm'].resetFields();
      this.$nextTick(() => {
        this.getList(1);
      });
    },
    sync() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      api.sync().then((r) => {
        loading.close();
        this.msgSuccess('后台开始同步数据，请稍后关注进度');
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
    },
    goRoute(item) {
      goRouteWithQuery(this.$router, 'groupDetail', this.query, item);
    },
    makeTag(type) {
      if (!this.multipleSelection.length) {
        let msg = '请选择一个客户群';
        if (type === 'batchAdd') msg = '请至少选择一个客户群';
        this.msgWarn(msg);
        return;
      }
      this.selectedTags = [];
      const hasErrorTag = [];
      const repeat = [];
      this.multipleSelection.forEach((element) => {
        element.tagList.forEach((child) => {
          // 判断是否有重复标签
          const isRepeat = this.selectedTags.some((tag) => {
            return tag.tagId === child.tagId;
          });
            // 去重
          if (isRepeat) {
            repeat.push(child.tagName);
            return;
          }
          const filter = this.listTagOneArray.find((tag) => {
            return tag.id === child.tagId;
          });
          // 如果没有匹配到，则说明该便签处于异常状态，可能已被删除或破坏
          if (!filter) {
            hasErrorTag.push(child.tagName);
            return;
          }
          type !== 'batchAdd' && this.selectedTags.push(filter);
        });
      });
      if (hasErrorTag.length > 0) {
        this.msgError('已有标签[' + hasErrorTag + ']不在标签库中，或存在异常');
        return;
      }
      if (type === 'remove' && this.selectedTags.length === 0) {
        this.msgError('该客户没有标签，不可进行移除');
        return;
      }
      if (type === 'remove') {
        this.removeTags = [...this.selectedTags.map(tag => ({ ...tag, tagId: tag.id }))];
        this.selectedTags = [];
      }

      this.tagDialogType = {
        title:
          (type === 'batchAdd' ? '批量打标签' : '批量移除标签'),
        infoMsg:
          (type === 'batchAdd' ? '请选择要为已勾选的客户群打上的标签' : '以下选中的标签，将从已勾选客户群下移除'),
        type: type
      };
      this.dialogVisible = true;
    },
    showTagDialog() {
      this.selectedTags = [...this.queryTag];
      this.tagDialogType = {
        title: '选择标签',
        type: 'query'
      };
      this.dialogVisible = true;
    },
    deleteTag(tag) {
      const index = this.queryTag.findIndex(tag_ => tag_.tagId === tag.tagId);
      this.queryTag.splice(index, 1);
      this.query.tagIds = this.queryTag.map((tag) => tag.tagId) + '';
    },
    getListTag() {
      tagApi.getGroupTagList().then(({ data }) => {
        this.listTagOneArray = [];
        data.forEach((element) => {
          element.tagList.forEach((tag) => {
            const newTag = { ...tag, tagId: tag.id, groupName: element.groupName || element.name };
            this.listTagOneArray.push(newTag);
          });
        });
      });
    },
    submitSelectTag(selected) {
      if (this.tagDialogType.type === 'query') {
        this.query.tagIds = selected.map(tag => tag.tagId) + '';
        this.queryTag = [...selected];
        this.dialogVisible = false;
      } else {
        this.tagDialogLoading = true;
        const data = {
          chatIdList: this.multipleSelection.map(group => group.chatId),
          tagIdList: selected.map(tag => tag.id)
        };
        tagApi[this.tagDialogType.type === 'batchAdd' ? 'batchAddTagRel' : 'batchDelTagRel'](data).then(() => {
          this.tagDialogLoading = false;
          this.msgSuccess('操作成功');
          this.dialogVisible = false;
          this.getList();
          this.getListTag();
        }).catch(() => {
          this.tagDialogLoading = false;
        });
      }
    }
  }
};
</script>

<template>
  <RightContainer :config-keys="['customSecret', 'contactSecret']" page-title="查看客户群信息">
    <template v-slot:search>
      <el-form
        ref="queryForm"
        :model="query"
        :inline="true"
        class="top-search"
        label-width="80px"
      >
        <el-form-item prop="groupName">
          <el-input
            v-model="query.groupName"
            placeholder="请输入客户群昵称"
            clearable
          />
        </el-form-item>
        <el-form-item prop="groupLeader">
          <el-input
            v-model="query.groupLeader"
            placeholder="请输入群主"
            clearable
          />
        </el-form-item>
        <el-form-item prop="groupStatus">
          <el-select v-model="query.groupStatus" placeholder="请选择客户群状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="tag-input" @click="showTagDialog">
            <span v-if="!queryTag.length" class="tag-place">请选择标签</span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in queryTag"
                :key="unique"
                type="info"
                closable
                @close="deleteTag(unit)"
              >{{ unit.name }}</el-tag>
            </template>
          </div>
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
        <el-form-item label=" ">
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
    <template v-slot:operate-btn>
      <el-dropdown
        v-hasPermi="['customerManage:group:edit']"
        class="dropdown-reset"
        split-button
        style="margin-right: 10px"
        @click="makeTag('batchAdd')"
        @command="(e) => makeTag(e)"
      >
        批量打标签
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item style="width: 120px" :command="'remove'">批量移除标签</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button
        v-hasPermi="['customerManage:group:sync']"
        @click="sync"
      >同步客户群</el-button>
    </template>
    <template v-slot:data>
      <el-table
        v-loading="loading"
        :data="list"
        @selection-change="handleSelectionChange"
      >
        <template slot="empty">
          <empty-default-icon
            text="暂无数据"
            desc="若首次加载，请耐心等待后台数据同步，稍后回来"
            :desc-show-condition="{ groupName: query.groupName, groupLeader: query.groupLeader, beginTime: query.beginTime, endTime: query.endTime }"
            :desc-config="['customSecret']"
          />
        </template>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="群昵称" align="left">
          <template slot-scope="scope">
            <div class="group-name">
              <svg class="icon-groupChat mr5" :width="35" :height="35">
                <use href="#icon-groupChat" />
              </svg>
              <div>{{ scope.row.groupName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="群成员" align="left" prop="memberNum" />
        <el-table-column label="群主" align="left">
          <template slot-scope="scope">
            <div class="al">
              <div class="cus-owner">{{ scope.row.groupLeaderName }}</div>
              <div class="cus-dept">{{ scope.row.mainDepartmentName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="标签" align="left">
          <template slot-scope="{ row }">
            <el-tag
              v-for="(unit, unique) in row.tagList"
              :key="unique"
              type="info"
            >{{ unit.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="客户群状态" prop="status">
          <template #header>
            <span>客户群状态</span>
            <el-popover
              placement="top-start"
              content="待继承：离职员工的客户群，等待被分配给在职员工"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
            </el-popover>
          </template>
          <template slot-scope="{ row }">
            <span>{{ row.groupStatus ? GROUP_STATUS_MAP[row.groupStatus] : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="left"
          prop="createTime"
          width="180"
        />
        <el-table-column
          label="操作"
          align="left"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['customerManage:group:view']"
              size="mini"
              type="text"
              @click="goRoute(scope.row)"
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
      <SelectTag
        ref="selectTag"
        :visible.sync="dialogVisible"
        :title="tagDialogType.title"
        :selected="selectedTags"
        :type="tagDialogType.type"
        :info-msg="tagDialogType.infoMsg"
        :remove-tags="removeTags"
        :is-show-add="tagDialogType.type === 'batchAdd'"
        :loading="tagDialogLoading"
        :tag-type="'group'"
        @success="submitSelectTag"
      />
    </template>
  </RightContainer>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.group-name {
  display: flex;
  align-items: center;
  img {
    width: 35px;
    height: 35px;
    margin-right: 3px;
  }
  div {
    line-height: 16px;
    text-align: left;
  }
}
.dropdown-reset {
  /deep/ button {
    @include btn_reset_color($color-theme2-1);
    margin-bottom: 0!important;
    &:nth-child(1) {
      padding-right: 0;
      span {
        padding-right: 15px;
        border-right: 1px solid #FFF!important;
      }
    }
  }
}
.el-tag {
  margin-bottom: 2px;
}
</style>
