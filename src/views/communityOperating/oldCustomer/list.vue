<script>
import { getList, remove, getStat } from '@/api/communityOperating/oldCustomer';
import { goRouteWithQuery } from '@/utils';
import { PAGE_LIMIT, CREATE_TYPE } from '@/utils/constant';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import RightContainer from '@/components/RightContainer';

const UN_SEND_STATUS = '0';
const SEND_STATUS_SUCCESS = '1';
const SEND_STATUS_ERROR_NOT_FRIEND = '2';
const SEND_STATUS_ERROR_REPEAT = '3';

// 送达状态
const SEND_STATUS_TEXT = {
  [SEND_STATUS_SUCCESS]: '已送达',
  [SEND_STATUS_ERROR_NOT_FRIEND]: '送达失败',
  [SEND_STATUS_ERROR_REPEAT]: '送达失败',
  [UN_SEND_STATUS]: '未送达'
};

// 客户进群详情备注
const REMARK_MAP = {
  '2': '已不是好友',
  '3': '其他员工已发送',
  '4': '接收已达上限',
  '5': '创建失败，小程序未关联企业或信息错误',
  '6': '创建失败，未获取到有效附件信息',
  '7': '未发送',
  '8': '创建失败，群发内容异常'
};
export default {
  components: { EmptyDefaultIcon, RightContainer },
  props: {},
  data() {
    return {
      // 老客老客进群查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        taskName: '', // 任务名称
        createBy: '', // 创建人
        beginTime: '', // 创建开始时间
        endTime: '' // 创建结束时间
      },
      total: 0, // 老客老客进群总数据量
      loading: false, // 主页table加载状态
      list: [], // 老客老客进群数据
      dateRange: [], // 创建日期[开始时间, 结束时间]
      multiSelect: [], // 多选数据
      customerSearchId: '', // 客户统计所查询的任务ID
      // 客户统计查询参数
      customerQuery: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        customerName: '', // 客户名称
        isInGroup: '', // 是否在群
        isSent: '' // 是否送达
      },
      customerTotal: 0, // 客户统计总数据量
      customerLoading: false, // 客户统计table加载状态
      customerList: [], // 客户统计数据
      customerShowList: [], // 展示用客户统计数据
      // 是否在群选择项
      inGroupOptions: [
        { label: '在群', value: 1 },
        { label: '不在群', value: 0 }
      ],
      // 是否送达选择项
      sendStatusOptions: [
        { label: '已送达', value: 1 },
        { label: '未送达', value: 0 },
        { label: '送达失败', value: Number(SEND_STATUS_ERROR_NOT_FRIEND) }
      ],
      dialogVisible: false, // 客户统计会话
      REMARK_MAP,
      SEND_STATUS_TEXT,
      CREATE_TYPE,
      // 当前任务所选群活码的进群方式
      createType: null
    };
  },
  computed: {
    // 是否为代开发应用
    isDKCorp() {
      return this.$store.state.serverInfo.dkCorp;
    }
  },
  watch: {
    // 日期选择器数据同步至查询参数
    dateRange(dateRange) {
      // eslint-disable-next-line no-magic-numbers
      if (!dateRange || dateRange.length !== 2) {
        this.query.beginTime = '';
        this.query.endTime = '';
      } else {
        [this.query.beginTime, this.query.endTime] = dateRange;
      }
    },
    dialogVisible(val) {
      if (!val) this.$refs['customerForm'].resetFields();
      this.customerList = [];
      this.customerTotal = 0;
    }
  },
  created() {
    if (this.$route.query) {
      Object.keys(this.query).forEach(key => {
        if (this.$route.query[key]) {
          this.query[key] = this.$route.query[key];
        }
      });
    }
    this.getList(1);

    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>企业通过下发任务通知员工给选中的标签客户主动发送加群引导语以及群活码，客户扫码后入群。</div>
      `
    );
  },
  methods: {
    // 获取老客老客进群数据
    getList(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      getList(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 获取客户统计数据
    getStat(page) {
      page && (this.customerQuery.pageNum = page);
      this.customerLoading = true;

      getStat(this.customerSearchId, this.customerQuery)
        .then(({ rows, total }) => {
          this.customerList = rows;
          this.customerTotal = +total;
          this.customerLoading = false;
        })
        .catch(() => {
          this.customerLoading = false;
        });
    },
    // 新增/编辑老客数据
    goRoute(id) {
      goRouteWithQuery(this.$router, 'oldCustomerAev', this.query, { id });
    },
    // 重置查询参数
    resetQuery() {
      this.dateRange = [];
      this.$refs['queryForm'].resetFields();

      this.$nextTick(() => {
        this.getList(1);
      });
    },
    // 获取显示用tag字符串
    getDisplayTags(row) {
      const tags = row.tagList.map((tag) => tag && tag.name);

      return tags.join(' ');
    },
    // 批量删除
    handleBulkRemove() {
      if (!this.multiSelect.length) {
        this.msgWarn('请至少选择一个任务');
        return;
      }
      this.confirmModal({
        msg: '即将删除该任务，删除后将不可见且无法撤销，是否继续？'
      }, () => {
        const ids = this.multiSelect.map((task) => task.taskId);
        remove(ids + '').then((res) => {
          this.getList();
        });
      });
    },
    // 删除
    handleRemove(id) {
      this.confirmModal({
        msg: '即将删除该任务，删除后将不可见且无法撤销，是否继续？'
      }, () => {
        remove(id + '').then((res) => {
          this.getList();
        });
      });
    },
    // 处理多选
    handleSelectionChange(val) {
      this.multiSelect = val;
    },
    // 打开客户统计会话
    openCustomerDialog(row) {
      this.customerSearchId = row.taskId;
      this.dialogVisible = true;
      // 所选的活码进群方式
      this.createType = row.groupCodeInfo.createType;

      this.getStat(1);
    },
    // 客户统计查询
    customerSearch() {
      this.getStat(1);
    },
    // 客户统计重置
    resetCustomerQuery() {
      this.$refs['customerForm'].resetFields();

      this.getStat(1);
    },
    changePage(pageInfo) {
      this.getStat(pageInfo.page);
    },
    getString(data, paramName) {
      const arr = [];
      data.map((item) => arr.push(item[paramName]));
      return arr.join('、');
    },
    // 获取查询条件对象
    getQueryObj() {
      const {
        taskName,
        createBy,
        beginTime,
        endTime
      } = this.query;
      return {
        taskName,
        createBy,
        beginTime,
        endTime
      };
    }
  }
};
</script>

<template>
  <div>
    <RightContainer :config-keys="['contactSecret', 'customSecret']" page-title="正常使用老客进群">
      <template v-slot:search>
        <el-form
          ref="queryForm"
          inline
          label-position="right"
          :model="query"
          label-width="100px"
        >
          <el-form-item prop="taskName">
            <el-input v-model="query.taskName" placeholder="请输入任务名称" />
          </el-form-item>
          <el-form-item prop="createBy">
            <el-input v-model="query.createBy" placeholder="请输入创建人姓名" />
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              value-format="yyyy-MM-dd"
              type="daterange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              style="width: 240px;"
            />
          </el-form-item>
          <el-form-item label=" ">
            <el-button type="primary" @click="getList(1)">查询</el-button>
            <el-button class="btn-reset" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:operate-btn>
        <el-button
          v-hasPermi="['wecom:communitytagGroup:add']"
          type="primary"
          @click="goRoute()"
        >
          添加任务
        </el-button>
        <el-button
          v-hasPermi="['wecom:communitytagGroup:remove']"
          @click="handleBulkRemove"
        >
          批量删除
        </el-button>
      </template>
      <template v-slot:data>
        <el-table
          v-loading="loading"
          :data="list"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              btn-text="新建老客进群"
              :length="list.length"
              :btn-click="goRoute"
              :btn-show-condition="getQueryObj()"
              :btn-config="['customSecret']"
              :btn-permi-key="['wecom:communitytagGroup:add']"
            />
          </template>
          <el-table-column
            type="selection"
            width="50"
            align="center"
          />
          <el-table-column
            label="任务名称"
            align="center"
            prop="taskName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="emplList"
            label="使用员工"
            align="center"
            :class-name="'tag-wrapper'"
          >
            <template slot-scope="{ row }">
              <el-tooltip :content="getString(row.scopeList, 'name')" placement="bottom-end" effect="dark">
                <p class="ellipsis-style">{{ getString(row.scopeList, 'name') }}</p>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="sendScope" label="发送范围" align="center">
            <template #default="{ row }">
              {{ parseInt(row.sendScope) === 0 ? '全部客户' : '指定客户' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="createBy"
            label="创建人"
            align="center"
          >
            <template slot-scope="scope">
              <div class="al">
                <div class="cus-owner">{{ scope.row.createBy }}</div>
                <div class="cus-dept">{{ scope.row.mainDepartmentName }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            width="160"
          />

          <el-table-column
            label="操作"
            align="center"
            width="180"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['wecom:communitytagGroup:remove']"
                size="mini"
                type="text"
                @click="openCustomerDialog(scope.row)"
              >进群详情</el-button>
              <br>
              <el-button
                v-hasPermi="['wecom:communitytagGroup:remove']"
                size="mini"
                type="text"
                @click="handleRemove(scope.row.taskId)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          :select-data-len="multiSelect.length"
          @pagination="getList()"
        />
      </template>
    </RightContainer>
    <el-dialog title="客户进群详情" :visible.sync="dialogVisible" width="800px">
      <div class="enter-group-detail">
        <RightContainer>
          <template v-slot:search>
            <div class="top-search">
              <el-form
                ref="customerForm"
                inline
                label-position="right"
                :model="customerQuery"
                label-width="80px"
              >
                <el-form-item prop="customerName">
                  <el-input
                    v-model="customerQuery.customerName"
                    placeholder="请输入客户名称"
                  />
                </el-form-item>
                <el-form-item prop="isInGroup">
                  <el-select
                    v-model="customerQuery.isInGroup"
                    placeholder="请选择进群状态"
                    size="small"
                    clearable
                  >
                    <el-option
                      v-for="(inGroup, index) in inGroupOptions"
                      :key="index"
                      :label="inGroup.label"
                      :value="inGroup.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item prop="isSent">
                  <el-select
                    v-model="customerQuery.isSent"
                    placeholder="请选择发送状态"
                    size="small"
                    clearable
                  >
                    <el-option
                      v-for="(status, index) in sendStatusOptions"
                      :key="index"
                      :label="status.label"
                      :value="status.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label>
                  <el-button type="primary" @click="customerSearch">查询</el-button>
                  <el-button class="btn-reset" @click="resetCustomerQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </template>
          <template v-slot:data-stat>
            <div v-if="createType === CREATE_TYPE['corp']" class="tip-text">
              当前任务的进群方式是企微活码，无法获知所在客户群
            </div>
          </template>
          <template v-slot:data>
            <el-table v-loading="customerLoading" :data="customerList" height="430px">
              <template slot="empty">
                <empty-default-icon :length="customerList.length" />
              </template>
              <el-table-column
                label="客户"
                align="center"
                prop="customerName"
                width="180px"
              >
                <template #default="{ row }">
                  <div style="display: flex; align-items:center;">
                    <el-image
                      style="width: 35px; height: 35px"
                      :src="row.avatar || require('@/assets/image/card-avatar.svg')"
                      fit="fill"
                    /><p class="customer-name">{{ row.customerName }}</p>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                label="所属员工"
                align="center"
                prop="username"
              >
                <template slot-scope="scope">
                  <div class="al">
                    <div class="cus-owner">{{ scope.row.username }}</div>
                    <div class="cus-dept">{{ scope.row.mainDepartmentName }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="送达状态" align="center">
                <template slot="header">
                  <div>
                    送达状态
                    <el-tooltip class="item" effect="dark" content="若员工在企业微信执行了群发任务，则视为已发" placement="top">
                      <svg class="icon-question" :width="14" :height="14">
                        <use href="#icon-question" />
                      </svg>
                    </el-tooltip>
                  </div>
                </template>
                <template #default="{ row }">
                  <span>{{ SEND_STATUS_TEXT[row.status] || '' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="inGroup" label="是否已进群" align="center">
                <template slot="header">
                  <div>
                    是否已进群
                    <el-tooltip class="item" effect="dark" content="若客户已经在群活码下的客户群，则是为已进群" placement="top">
                      <svg class="icon-question" width="14px" height="14px">
                        <use href="#icon-question" />
                      </svg>
                    </el-tooltip>
                  </div>
                </template>
                <template #default="{ row }">
                  <template v-if="createType !== CREATE_TYPE['corp']">
                    {{ row.inGroup * 1 ? '是' : '否' }}
                  </template>
                </template>
              </el-table-column>
              <el-table-column
                label="所在客户群"
                align="center"
                prop="inGroupName"
              >
                <template #default="{ row }">{{ createType === CREATE_TYPE['corp'] ? '' : row.inGroupName }}</template>
              </el-table-column>
              <el-table-column
                label="备注"
                align="center"
                prop="remark"
              >
                <template #default="{ row }">
                  <span>{{ REMARK_MAP[row.status] || '' }}</span>
                </template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="customerTotal > 0"
              :total="customerTotal"
              :page.sync="customerQuery.pageNum"
              :limit.sync="customerQuery.pageSize"
              @pagination="changePage"
            />
          </template>
        </RightContainer>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.overflow-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-desc {
  max-width: 120px;
}
.customer-name{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  width: 125px;
  line-height: 17px;
  margin-left: 5px;
}
.icon-question{
  vertical-align: text-bottom;
}
.tip-text {
  color: $grayColor;
}
.enter-group-detail {
  /deep/ .show-data-wrapper {
    padding-top: 0;
  }
}
</style>
