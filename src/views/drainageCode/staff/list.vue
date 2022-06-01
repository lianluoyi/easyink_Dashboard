<script>
import {
  getList,
  remove,
  batchAdd,
  downloadBatch,
  download
} from '@/api/drainageCode/staff';
import SelectUser from '@/components/SelectUser';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import ClipboardJS from 'clipboard';
import { Notification } from 'element-ui';
import { goRouteWithQuery } from '@/utils';
import { PAGE_LIMIT, STAFF_CODE_TYPE } from '@/utils/constant';
import RightContainer from '@/components/RightContainer';

export default {
  name: 'CodeStaff',
  components: { SelectUser, EmptyDefaultIcon, RightContainer },
  data() {
    return {
      // 查询参数
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        useUserName: undefined,
        mobile: undefined,
        scenario: undefined,
        createBy: undefined,
        beginTime: undefined,
        endTime: undefined
      },
      // 日期范围
      dateRange: [],
      dialogVisible: false,
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 表单参数
      form: {
        codeType: STAFF_CODE_TYPE,
        qrcode: '',
        isJoinConfirmFriends: 0,
        weEmpleCodeTags: [],
        weEmpleCodeUseScops: []
      }
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
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>支持单人、批量单人及多人方式新建员工活码，客户可以通过扫描员工活码添加员工为好友，并支持自动给客户打标签和发送欢迎语。</div>
      `
    );
  },
  mounted() {
    var clipboard = new ClipboardJS('.copy-btn');
    clipboard.on('success', (e) => {
      Notification.closeAll();
      this.$notify({
        title: '成功',
        message: '链接已复制到剪切板，可粘贴。',
        type: 'success'
      });
    });
    clipboard.on('error', (e) => {
      this.msgError('链接复制失败');
    });
  },
  methods: {
    getList(page) {
      // console.log(this.dateRange);
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
        .catch(() => {
          this.loading = false;
        });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.$refs['queryForm'].resetFields();
      this.getList(1);
    },
    goRoute(path, id) {
      goRouteWithQuery(this.$router, path, this.query, { id });
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
    // 选择人员变化事件
    selectedUser(users) {
      this.form.weEmpleCodeUseScops = users.map((d) => {
        return {
          businessId: d.id || d.userId,
          businessName: d.name,
          // eslint-disable-next-line no-magic-numbers
          businessIdType: d.userId ? 2 : 1
        };
      });
      batchAdd(this.form).then(({ data }) => {
        this.msgSuccess('操作成功');
        this.getList(1);
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
        mobile,
        scenario,
        createBy,
        beginTime,
        endTime
      } = this.query;
      return {
        useUserName,
        mobile,
        scenario,
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
    <RightContainer :config-keys="['contactSecret', 'customSecret']" page-title="正常使用员工活码">
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
              type="primary"
              @click="getList(1)"
            >查询</el-button>
            <el-button class="btn-reset" @click="resetQuery">重置</el-button>
            <!-- <el-button @click="resetQuery">导出</el-button> -->
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
              :btn-config="['customSecret', 'contactSecret']"
              :btn-permi-key="['wecom:code:add']"
            />
          </template>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="活码预览" align="center" prop="qrCode">
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
                  type="text"
                  class="copy-btn"
                  :data-clipboard-text="row.qrCode"
                >复制链接</el-button>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="使用员工" align="center" prop="useUserName" /> -->
          <el-table-column
            label="员工"
            align="center"
            prop="useUserName"
            show-overflow-tooltip
          />
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
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          :select-data-len="ids.length"
          @pagination="getList()"
        />
      </template>
    </RightContainer>
    <!-- 批量新建弹窗 -->
    <SelectUser
      :visible.sync="dialogVisible"
      title="组织架构"
      @success="selectedUser"
    />
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
    margin-top: 7px;
}
.code-left {
    display: inline-block;
}
.copy-btn {
  margin: 0;
}
</style>
