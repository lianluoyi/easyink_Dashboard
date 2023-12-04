<script>
import {
  getList,
  remove,
  download,
  downloadBatch
} from '@/api/communityOperating/newCustomer';
import {
  getApplink
} from '@/api/drainageCode/staff';
import { goRouteWithQuery, copyText } from '@/utils';
import { PAGE_LIMIT } from '@/utils/constant/index';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import RightContainer from '@/components/RightContainer';
import ListUserShow from '@/components/ListUserShow';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  components: { EmptyDefaultIcon, RightContainer, ListUserShow },
  mixins: [loadingMixin],
  props: {},
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        scenario: '', // 活码名称
        createBy: '', // 创建人
        beginTime: '', // 开始日期
        endTime: '' // 结束日期
      },
      dateRange: [], // 添加日期
      total: 0, // 数据总量
      form: {},
      list: [],
      dialogVisible: false,
      disabled: false,
      loading: false,
      status: ['正常', '停用'],
      pushType: {
        0: '发给客户',
        1: '发给客户群'
      },
      queryUser: [], // 搜索框选择的添加人
      ids: []
    };
  },
  computed: {},
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
    }
  },
  created() {
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
      const { beginTime, endTime } = this.$store.getters.searchQuery[this.$route.name];
      if (beginTime && endTime) {
        this.dateRange = [beginTime, endTime];
      }
      this.query = this.$store.getters.searchQuery[this.$route.name];
    }
    this.getList();
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>指在客户通过员工活码加为好友后，员工自动推送入群引导语和群活码，客户可通过群活码扫码入群。</div>
      `
    );
  },
  methods: {
    // 获取新客数据
    getList(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      getList(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = total;
          if (!rows.length) {
            this.query.pageNum = 1;
            // 如果当前页面，数据为空，跳转第一页
            getList(this.query).then(({ rows: resRows, total: resTotal }) => {
              this.list = resRows;
              this.total = resTotal;
            }).finally(() => {
              this.modifyButtonStatus();
              this.loading = false;
            });
          }
        })
        .finally(() => {
          this.modifyButtonStatus();
          this.loading = false;
        });
    },
    // 新建/编辑新客数据
    goRoute(id) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.query
      });
      goRouteWithQuery(this.$router, 'newCustomerAev', {}, { id });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },
    /** 删除按钮操作 */
    remove(id) {
      if (!id && !this.ids.length) {
        this.msgWarn('请至少选择一个活码');
        return;
      }
      const ids = id || this.ids;
      this.confirmModal({
        msg: '删除后，已下载的活码将失效，是否继续？'
      }, () => {
        return remove(ids)
          .then(res => {
            this.getList();
            this.msgSuccess('删除成功');
          });
      });
    },
    // 下载
    download(data) {
      const name = data.scenario + '.png';
      download(data.id).then((res) => {
        if (res != null) {
          const blob = new Blob([res], { type: 'application/zip' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a'); // 创建a标签
          link.href = url;
          link.download = name; // 重命名文件
          link.click();
          URL.revokeObjectURL(url); // 释放内存
        }
      });
    },
    // 批量下载
    downloadBatch() {
      if (!this.ids.length) {
        this.msgWarn('请至少选择一个活码');
        return;
      }
      this.confirmModal({
        msg: '即将以压缩包形式下载已选中的活码图片，是否继续？'
      }, () => {
        return downloadBatch(this.ids + '')
          .then(res => {
            if (res != null) {
              const blob = new Blob([res], { type: 'application/zip' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a'); // 创建a标签
              link.href = url;
              link.download = '批量员工活码.zip'; // 重命名文件
              link.click();
              URL.revokeObjectURL(url); // 释放内存
            }
          });
      });
    },
    // 重置查询参数
    resetQuery() {
      this.dateRange = [];
      this.query = this.$options.data().query;

      this.$nextTick(() => {
        this.getList(1);
      });
    },
    // 获取查询条件对象
    getQueryObj() {
      const {
        scenario,
        createBy,
        beginTime,
        endTime
      } = this.query;
      return {
        scenario,
        createBy,
        beginTime,
        endTime
      };
    },
    // 获取逗号隔开的文本
    getString(data, paramName) {
      const arr = [];
      paramName === 'groupName' ? `${data.map((item) => arr.push(item['chatGroupName']))}`
        : `${data.map((item) => arr.push(item[paramName]))}`;
      return arr.join('、');
    },
    // 获取新客进群小程序链接
    getLink(row) {
      if (row.appLink) {
        copyText(row.appLink);
        return;
      }
      this.loading = true;
      getApplink({ id: row.id }).then(resp => {
        if (resp.data) {
          this.list.forEach(item => {
            if (item.id === row.id) {
              item.appLink = resp.data;
            }
          });
          copyText(resp.data);
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    }
  }
};
</script>

<template>
  <div>
    <RightContainer :config-keys="['contactSecret', 'customSecret']" :page-title="'正常使用新客进群'">
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          class="top-search"
          size="small"
        >
          <el-form-item prop="scenario">
            <el-input v-model="query.scenario" placeholder="请输入活码名称" />
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
            />
          </el-form-item>
          <el-form-item label=" ">
            <el-button
              v-preventReClick="200"
              type="primary"
              :loading="searchButtonLoading"
              @click="()=>{
                searchButtonLoading = true;
                getList(1)
              }"
            >查询</el-button>
            <el-button
              v-preventReClick="200"
              class="btn-reset"
              :loading="resetButtonLoading"
              @click="()=>{
                resetButtonLoading = true;
                resetQuery()
              }"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:operate-btn>
        <el-button v-hasPermi="['wecom:communityNewGroup:add']" type="primary" @click="goRoute()">新建活码</el-button>
        <el-button
          v-hasPermi="['customerManage:customer:export']"
          @click="remove()"
        >批量删除</el-button>
        <el-button
          @click="downloadBatch()"
        >批量下载</el-button>
      </template>
      <template v-slot:data>
        <el-table
          v-loading="loading"
          class="customer-table"
          :data="list"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              btn-text="新建活码"
              :length="list.length"
              :btn-click="goRoute"
              :btn-show-condition="getQueryObj()"
              :btn-config="['customSecret', 'contactSecret']"
              :btn-permi-key="['wecom:communityNewGroup:add']"
            />
          </template>
          <el-table-column
            type="selection"
            width="50"
            align="center"
            fixed
          />
          <el-table-column
            prop="qrCode"
            label="活码预览"
            align="center"
            width="200"
            fixed
          >
            <template #default="{ row }">
              <div class="code-left">
                <el-popover placement="bottom" trigger="hover">
                  <el-image
                    slot="reference"
                    :src="row.qrCode"
                    class="code-image--small"
                  />
                  <el-image :src="row.qrCode" class="code-image" />
                </el-popover>
              </div>
              <div class="code-right">
                <el-button
                  type="text"
                  @click="download(row)"
                >下载</el-button>
                <br>
                <el-button
                  v-copy="row.qrCode"
                  type="text"
                >复制图片链接</el-button>
                <el-button
                  type="text"
                  @click="getLink(row)"
                >复制小程序链接</el-button>
              </div>
            </template>
            <!-- <template slot-scope="{ row }">
              <el-image v-if="row.emplCodeUrl" :src="row.emplCodeUrl" class="code-image">
              </el-image>
            </template> -->
          </el-table-column>
          <el-table-column
            prop="scenario"
            label="活码名称"
            align="center"
            fixed
          />
          <el-table-column
            prop="weEmpleCodeUseScops"
            label="使用员工"
            align="center"
            :class-name="'tag-wrapper'"
          >
            <template slot-scope="{ row }">
              <ListUserShow :use-user-name="row.useUserName" :department-name="row.departmentName" />
            </template>
          </el-table-column>
          <el-table-column
            prop="weEmpleCodeTags"
            label="新客标签"
            align="center"
            width="160"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-tag
                v-for="(item, index) in row.weEmpleCodeTags"
                :key="index"
                size="medium"
                type="info"
              >{{ item.tagName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="cusNumber"
            label="添加好友数"
            align="center"
            width="100"
          />
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
            prop="createTime"
            label="创建时间"
            align="center"
            width="160"
          />
          <el-table-column
            label="操作"
            align="center"
            width="180"
            class-name="small-padding fixed-width"
            fixed="right"
          >
            <template slot-scope="{ row }">
              <el-button
                v-hasPermi="['wecom:communityNewGroup:edit']"
                type="text"
                @click="goRoute(row.id)"
              >编辑</el-button>
              <el-button
                v-hasPermi="['wecom:communityNewGroup:remove']"
                type="text"
                @click="remove(row.id)"
              >删除</el-button>
              <el-dropdown trigger="click" placement="bottom">
                <el-button
                  type="text"
                  class="ml10"
                >更多</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-copy="row.id">复制活码ID</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total * 1"
          :disabled="loading"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          :select-data-len="ids.length"
          @pagination="getList()"
        />
      </template>
    </RightContainer>
  </div>
</template>

<style scoped lang="scss">
.code-image {
  width: 200px;
  height: 200px;
}
.code-image--small {
  width: 70px;
  height: 70px;
  border: 1px solid #eee;
}
.el-tag {
  margin-bottom: 2px;
}
.ellipsis-style {
  letter-spacing: 0;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;  /*要显示的行数*/
  -webkit-box-orient: vertical;
}
.code-right {
    display: inline-block;
    width: 60px;
    position: absolute;
    margin-top: 3px;
    /deep/ .el-button--small{
      padding: 3px 0px;
      margin-left: 0;
    }
}
.code-left {
    display: inline-block;
}

</style>
