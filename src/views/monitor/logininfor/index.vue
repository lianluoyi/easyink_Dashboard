<template>
  <div>
    <RightContainer>
      <template v-slot:search>
        <el-form v-show="showSearch" ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item prop="ipaddr">
            <el-input
              v-model="queryParams.ipaddr"
              placeholder="请输入登录地址"
              clearable
              style="width: 240px;"
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              style="width: 240px;"
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              size="small"
              style="width: 240px"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleQuery">查询</el-button>
            <el-button size="small" class="btn-reset" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:operate-btn>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:logininfor:remove']"
              size="mini"
              @click="handleDelete"
            >批量删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:logininfor:remove']"
              size="mini"
              @click="handleClean"
            >一键清空</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['system:logininfor:export']"
            >导出</el-button>
          </el-col> -->
        </el-row>
      </template>
      <template v-slot:data>
        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="访问编号" align="center" prop="infoId" />
          <el-table-column label="用户名称" align="center" prop="userName" />
          <el-table-column label="登录地址" align="center" prop="ipaddr" width="130" :show-overflow-tooltip="true" />
          <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
          <el-table-column label="浏览器" align="center" prop="browser" />
          <el-table-column label="操作系统" align="center" prop="os" />
          <el-table-column label="登录状态" align="center" prop="status" :formatter="statusFormat" />
          <el-table-column label="操作信息" align="center" prop="msg" />
          <el-table-column label="登录日期" align="center" prop="loginTime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total*1"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          :select-data-len="ids.length"
          @pagination="getList"
        />
      </template>
    </RightContainer>
  </div>
</template>

<script>
import { list, delLogininfor, cleanLogininfor, exportLogininfor } from '@/api/monitor/logininfor';
import { PAGE_LIMIT } from '@/utils/constant';
import RightContainer from '@/components/RightContainer';

export default {
  name: 'Logininfor',
  components: { RightContainer },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 状态数据字典
      statusOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        ipaddr: undefined,
        userName: undefined,
        status: undefined
      }
    };
  },
  created() {
    this.getList();
    this.getDicts('sys_common_status').then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      list(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      }
      );
    },
    // 登录状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm('queryForm');
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.infoId);
      this.multiple = !selection.length;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      if (!this.ids.length) {
        this.msgWarn('请至少选择一条日志');
        return false;
      }
      const infoIds = row.infoId || this.ids;
      this.confirmModal({
        msg: '是否确认删除访问编号为"' + infoIds + '"的数据项?'
      }, () => {
        return delLogininfor(infoIds)
          .then(() => {
            this.getList();
            this.msgSuccess('删除成功');
          }).catch(function() {});
      });
    },
    /** 清空按钮操作 */
    handleClean() {
      this.confirmModal({
        msg: '是否确认清空所有登录日志数据项?'
      }, () => {
        return cleanLogininfor()
          .then(() => {
            this.getList();
            this.msgSuccess('清空成功');
          }).catch(function() {});
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.confirmModal({
        msg: '是否确认导出所有操作日志数据项?'
      }, () => {
        return exportLogininfor(queryParams)
          .then(response => {
            this.download(response.msg);
          }).catch(function() {});
      });
    }
  }
};
</script>

