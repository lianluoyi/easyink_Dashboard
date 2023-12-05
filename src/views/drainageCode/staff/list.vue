<script>
import {
  getList,
  remove,
  downloadBatch,
  download,
  getApplink
} from '@/api/drainageCode/staff';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { goRouteWithQuery, copyText } from '@/utils';
import { PAGE_LIMIT } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import ListUserShow from '@/components/ListUserShow';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  name: 'CodeStaff',
  components: { EmptyDefaultIcon, RightContainer, ListUserShow },
  mixins: [loadingMixin],
  data() {
    return {
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        useUserName: undefined,
        scenario: undefined,
        createBy: undefined,
        beginTime: undefined,
        endTime: undefined
      },
      // 日期范围
      dateRange: [],
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 表格数据
      list: []
    };
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
        <div>支持单人、批量单人及多人方式新建员工活码，客户可以通过扫描员工活码添加员工为好友，并支持自动给客户打标签和发送欢迎语。</div>
      `
    );
  },
  methods: {
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
      getList(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
          this.loading = false;
          this.ids = [];
        })
        .finally(() => {
          this.loading = false;
          this.modifyButtonStatus();
        });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.query = this.$options.data().query;
      this.getList(1);
    },
    goRoute(path, id) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.query
      });
      goRouteWithQuery(this.$router, path, {}, { id });
    },
    goToStaffAdd() {
      this.goRoute('staffAdd');
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },
    /** 删除按钮操作 */
    remove(id) {
      if (!id && !this.ids.length) {
        this.msgWarn('请至少选择一个员工活码');
        return;
      }
      const ids = id || this.ids;
      this.confirmModal({
        msg: '删除后，已下载的活码将失效，是否继续？'
      }, () => {
        return remove(ids)
          .then(() => {
            this.getList();
            this.msgSuccess('删除成功');
          });
      });
    },
    download(id, userName, scenario) {
      const name = userName + '-' + scenario + '.png';
      download(id).then((res) => {
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
    /** 下载 */
    downloadBatch(qrCode) {
      if (!this.ids.length) {
        this.msgWarn('请至少选择一个员工活码');
        return;
      }
      this.confirmModal({
        msg: '即将以压缩包形式下载已选中的活码图片，是否继续？'
      }, () => {
        return downloadBatch(this.ids + '')
          .then((res) => {
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
    // 获取查询条件对象
    getQueryObj() {
      const {
        useUserName,
        scenario,
        createBy,
        beginTime,
        endTime
      } = this.query;
      return {
        useUserName,
        scenario,
        createBy,
        beginTime,
        endTime
      };
    },
    // 赋值小程序短链,并复制
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
    <RightContainer :config-keys="['contactSecret']" page-title="正常使用员工活码">
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :model="query"
          :inline="true"
          label-width="100px"
          class="top-search"
        >
          <el-form-item prop="useUserName">
            <el-input
              v-model="query.useUserName"
              placeholder="请输入员工姓名"
              clearable
              @keyup.enter.native="getList(1)"
            />
          </el-form-item>
          <!-- <el-form-item label="姓名">
            <el-input
              v-model="query.operName"
              placeholder="请输入"
              clearable
              @keyup.enter.native="getList(1)"
            />
          </el-form-item> -->
          <el-form-item prop="scenario">
            <el-input
              v-model="query.scenario"
              placeholder="请输入活动场景"
              clearable
              @keyup.enter.native="getList(1)"
            />
          </el-form-item>
          <el-form-item prop="createBy">
            <el-input
              v-model="query.createBy"
              placeholder="请输入创建人姓名"
              clearable
              @keyup.enter.native="getList(1)"
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
        <el-button
          v-hasPermi="['wecom:code:add']"
          type="primary"
          size="mini"
          @click="goRoute('staffAdd')"
        >新建员工活码</el-button>
        <el-button
          v-hasPermi="['wecom:code:remove']"
          type="reset"
          size="mini"
          class="btn-reset"
          @click="remove()"
        >批量删除</el-button>
        <el-button
          type="reset"
          class="btn-reset"
          size="mini"
          @click="downloadBatch()"
        >批量下载</el-button>
      </template>
      <template v-slot:data>
        <el-table
          v-loading="loading"
          :data="list"
          max-height="600"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              btn-text="新建员工活码"
              :length="list.length"
              :btn-click="goToStaffAdd"
              :btn-show-condition="getQueryObj()"
              :btn-config="['contactSecret']"
              :btn-permi-key="['wecom:code:add']"
            />
          </template>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="活码预览" align="center" width="200" prop="qrCode">
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
                  @click="download(row.id, row.useUserName, row.scenario)"
                >下载</el-button>
                <el-button
                  v-copy="row.qrCode"
                  type="text"
                  class="copy-btn"
                >复制图片链接</el-button>
                <el-button
                  type="text"
                  class="copy-btn"
                  @click="getLink(row)"
                >复制小程序链接</el-button>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="使用员工" align="center" prop="useUserName" /> -->
          <el-table-column
            label="员工"
            align="center"
            prop="useUserName,departmentName"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <ListUserShow :use-user-name="scope.row.useUserName" :department-name="scope.row.departmentName" />
            </template>
          </el-table-column>

          <el-table-column
            label="活动场景"
            align="center"
            prop="scenario"
            show-overflow-tooltip
          />
          <el-table-column label="创建人" align="center" prop="createBy">
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
            width="180"
          />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="{ row }">
              <el-button
                v-hasPermi="['wecom:code:query']"
                type="text"
                @click="goRoute('staffDetail', row.id)"
              >详情</el-button>
              <el-button
                v-hasPermi="['wecom:code:edit']"
                type="text"
                @click="goRoute('staffAdd', row.id)"
              >编辑</el-button>
              <el-button
                v-hasPermi="['wecom:code:remove']"
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
          :disabled="loading"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          :select-data-len="ids.length"
          @pagination="getList()"
        />
      </template>
    </RightContainer>
  </div>
</template>

<style lang="scss" scoped>
.code-image {
  width: 200px;
  height: 200px;
}
.code-image--small {
  width: 70px;
  height: 70px;
  border: 1px solid #eee;
}
.code-right {
    display: inline-block;
    width: 60px;
    position: absolute;
    margin-top: 3px;
    /deep/ .el-button--small{
      padding: 3px 0px;
    }
}
.code-left {
    display: inline-block;
}
.copy-btn {
  margin: 0;
}
</style>
