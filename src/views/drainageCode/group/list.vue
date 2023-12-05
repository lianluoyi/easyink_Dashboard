<script>
import RealCode from './realCode';
import {
  getList,
  remove,
  downloadBatch,
  download,
  getApplink
} from '@/api/drainageCode/group';
import { goRouteWithQuery, copyText } from '@/utils';
import { PAGE_LIMIT } from '@/utils/constant/index';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import RightContainer from '@/components/RightContainer';
import { CREATE_TYPE } from '@/utils/constant/index';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  components: { RealCode, EmptyDefaultIcon, RightContainer },
  mixins: [loadingMixin],
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        activityName: '',
        createBy: '',
        beginTime: '',
        endTime: ''
      },
      loading: false,
      searchDate: '', // 查询日期
      multiGroupCode: [], // 多选数据
      groupCodes: [], // 群活码数据
      total: 0, // 总数据量
      realCodeDialog: false, // 实际群码总数dialog
      openGroupCodeId: null, // 打开实际群码关联的群活码ID
      openGroupCodeStatus: -1, // 打开实际群码的检索状态
      // 打开实际群码的入群方式
      openCreateType: CREATE_TYPE
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
    // 如果实际群码弹出框关闭,刷新数据
    realCodeDialog(val) {
      if (val === false) this.getGroupCodes();
    }
  },
  created() {
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
      const { beginTime, endTime } = this.$store.getters.searchQuery[this.$route.name];
      if (beginTime && endTime) {
        this.searchDate = [beginTime, endTime];
      }
      this.query = this.$store.getters.searchQuery[this.$route.name];
    }

    this.getGroupCodes();

    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>群活码原理为把多个群二维码统一为固定的活码，群满自动切换新群，无需手动更新二维码，并未改变微信原有入群规则。</div>
      `
    );
  },
  methods: {
    // 获取活码数据
    getGroupCodes(page) {
      if (page === 1) {
        this.query.pageNum = 1;
      }
      const params = Object.assign({}, this.query);

      this.loading = true;

      getList(params)
        .then((res) => {
          this.groupCodes = res.rows;
          this.total = parseInt(res.total);
        })
        .finally(() => {
          this.modifyButtonStatus();
          this.loading = false;
        });
    },
    // 查询
    handleSearch() {
      this.getGroupCodes(1);
    },
    // 搜索栏清空
    resetQuery() {
      this.searchDate = '';
      this.query = this.$options.data().query;

      this.$nextTick(() => {
        this.getGroupCodes();
      });
    },
    // 批量下载
    handleBulkDownload() {
      if (!this.multiGroupCode.length) {
        this.msgWarn('请至少选择一个群活码');
        return;
      }
      const ids = this.multiGroupCode.map((group) => group.id);
      this.confirmModal({
        msg: '即将以压缩包形式下载已选中的活码图片，是否继续？'
      }, () => {
        return downloadBatch(ids + '')
          .then((res) => {
            if (res != null) {
              const blob = new Blob([res], { type: 'application/zip' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a'); // 创建a标签
              link.href = url;
              link.download = '批量群活码.zip'; // 重命名文件
              link.click();
              URL.revokeObjectURL(url); // 释放内存
            }
          });
      });
    },
    // 批量删除
    handleBulkRemove() {
      if (!this.multiGroupCode.length) {
        this.msgWarn('请至少选择一个群活码');
        return;
      }
      this.confirmModal({
        msg: '删除后，已下载的活码将失效，是否继续？'
      }, () => {
        const ids = this.multiGroupCode.map((group) => group.id);

        remove(ids + '').then((res) => {
          this.getGroupCodes();
        });
      });
    },
    // 下载
    handleDownload(codeId, activityName) {
      const name = activityName + '.png';

      download(codeId).then((res) => {
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
    // 删除
    handleRemove(codeId) {
      this.confirmModal({
        msg: '删除后，已下载的活码将失效，是否继续？'
      }, () => {
        remove(codeId).then((res) => {
          this.getGroupCodes();
        });
      });
    },
    // 处理多选
    handleSelectionChange(val) {
      this.multiGroupCode = val;
    },
    // 打开实际群码窗口
    handleRealCodeDialogOpen(groupCodeInfo, status) {
      this.openGroupCodeId = groupCodeInfo.id;
      this.openGroupCodeStatus = status;
      this.openCreateType = groupCodeInfo.createType;
      this.realCodeDialog = true;
    },
    goRoute(path, params) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.query
      });
      goRouteWithQuery(this.$router, path, {}, params);
    },
    goToGroupAdd() {
      this.goRoute('customerGroupDetail');
    },
    getQueryObj() {
      const {
        activityName,
        createBy,
        beginTime,
        endTime
      } = this.query;
      return {
        activityName,
        createBy,
        beginTime,
        endTime
      };
    },
    // 获取群活码小程序链接
    getApplink(row) {
      if (row.appLink) {
        copyText(row.appLink);
        return;
      }
      this.loading = true;
      getApplink({ id: row.id }).then(resp => {
        if (resp.data) {
          this.groupCodes.forEach(item => {
            if (item.id === row.id) {
              item.appLink = resp.data;
            }
          });
          copyText(resp.data);
        }
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
</script>

<template>
  <div class="page">
    <RightContainer :config-keys="['contactSecret']" page-title="正常使用群活码">
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :model="query"
          inline
          class="top-search"
          label-width="100px"
        >
          <el-form-item prop="activityName">
            <el-input
              v-model="query.activityName"
              placeholder="请输入活码名称"
            />
          </el-form-item>
          <el-form-item prop="createBy">
            <el-input
              v-model="query.createBy"
              placeholder="请输入创建人姓名"
            />
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
          <el-form-item label=" ">
            <el-button
              v-preventReClick="200"
              type="primary"
              :loading="searchButtonLoading"
              @click="()=>{
                searchButtonLoading = true;
                handleSearch()
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
        <div class="mid-action">
          <el-button
            v-hasPermi="['wecom:groupCode:add']"
            type="primary"
            @click="goRoute('customerGroupDetail')"
          >新建群活码</el-button>
          <el-button
            style="m"
            @click="handleBulkDownload"
          >批量下载</el-button>
          <el-button
            v-hasPermi="['wecom:groupCode:remove']"
            @click="handleBulkRemove"
          >批量删除</el-button>
        </div>
      </template>
      <template v-slot:data>
        <el-table
          v-loading="loading"
          :data="groupCodes"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon
              btn-text="新建群活码"
              :length="groupCodes.length"
              :btn-click="goToGroupAdd"
              :btn-show-condition="getQueryObj()"
              :btn-permi-key="['wecom:groupCode:add']"
            />
          </template>

          <el-table-column
            type="selection"
            width="55"
            align="center"
          />
          <el-table-column
            prop="codeUrl"
            label="活码预览"
            align="center"
            width="200"
          >
            <template #default="{ row }">
              <div class="code-left">
                <el-popover placement="bottom" trigger="hover">
                  <el-image
                    slot="reference"
                    :src="row.codeUrl"
                    class="code-image--small"
                  />
                  <el-image :src="row.codeUrl" class="code-image" />
                </el-popover>
              </div>
              <div class="code-right">
                <el-button
                  type="text"
                  size="mini"
                  @click="handleDownload(row.id, row.activityName)"
                >下载</el-button>
                <br>
                <el-button
                  v-copy="row.codeUrl"
                  type="text"
                  size="mini"
                >复制图片链接</el-button>
                <el-button
                  type="text"
                  size="mini"
                  @click="getApplink(row)"
                >复制小程序链接</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="activityName"
            label="活码名称"
            align="center"
          />
          <el-table-column
            prop="activityDesc"
            label="活码描述"
            align="center"
            width="160"
          >
            <template #default="{ row }">
              <el-popover
                placement="bottom"
                width="200"
                trigger="hover"
                :content="row.activityDesc"
              >
                <div slot="reference" class="table-desc overflow-ellipsis">
                  {{ row.activityDesc }}
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            prop="totalScanTimes"
            label="已扫码入群人数"
            align="center"
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
          />
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button
                v-hasPermi="['wecom:groupCode:edit']"
                type="text"
                size="mini"
                @click="handleRealCodeDialogOpen(row, -1)"
              >实际群聊详情</el-button>
              <br>
              <el-button
                v-hasPermi="['wecom:groupCode:edit']"
                type="text"
                size="mini"
                @click="goRoute('customerGroupDetail', { groupCodeId: row.id })"
              >编辑</el-button>
              <el-button
                v-hasPermi="['wecom:groupCode:remove']"
                type="text"
                size="mini"
                @click="handleRemove(row.id)"
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
          :total="total"
          :disabled="loading"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          :select-data-len="multiGroupCode.length"
          @pagination="getGroupCodes()"
        />
      </template>
    </RightContainer>

    <el-dialog
      v-if="realCodeDialog"
      title="客户群详情"
      :visible.sync="realCodeDialog"
      append-to-body
      width="70%"
    >
      <RealCode
        ref="realCode"
        :group-code-id="openGroupCodeId"
        :status="openGroupCodeStatus"
        :create-type="openCreateType"
      />
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
  max-width: 150px;
}
.code-image {
  width: 200px;
  height: 200px;
}
.code-image--small {
  width: 70px;
  height: 70px;
  border: 1px solid #eee;
}
.expire-icon {
  color: red;
}
.code-right {
    display: inline-block;
    width: 60px;
    position: absolute;
    margin-top: 3px;
    /deep/ .el-button--mini{
      padding: 3px 0px;
      margin-left: 0;
    }
}
.code-left {
    display: inline-block;
}
</style>
