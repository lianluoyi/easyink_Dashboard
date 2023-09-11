<template>
  <div>
    <RightContainer>
      <template v-slot:search>
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item prop="ipaddr">
            <el-input
              v-model="queryParams.ipaddr"
              placeholder="请输入登录地址"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleQuery">查询</el-button>
            <el-button size="small" class="btn-reset" @click="resetQuery">重置</el-button>
          </el-form-item>

        </el-form>
      </template>
      <template v-slot:data>
        <el-table
          v-loading="loading"
          :data="list.slice((pageNum-1)*pageSize,pageNum*pageSize)"
          style="width: 100%;"
        >
          <el-table-column label="序号" type="index" align="center">
            <template slot-scope="scope">
              <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="会话编号" align="center" prop="tokenId" :show-overflow-tooltip="true" />
          <el-table-column label="登录名称" align="center" prop="userName" :show-overflow-tooltip="true" />
          <el-table-column label="部门名称" align="center" prop="deptName" />
          <el-table-column label="主机" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
          <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
          <el-table-column label="浏览器" align="center" prop="browser" />
          <el-table-column label="操作系统" align="center" prop="os" />
          <el-table-column label="登录时间" align="center" prop="loginTime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['monitor:online:forceLogout']"
                size="mini"
                type="text"
                @click="handleForceLogout(scope.row)"
              >
                <span class="flex" style="align-items: center;">
                  <i class="iconfont iconoffline" style="padding-right: 3px;" />
                  <span>强制退出</span>
                </span>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />
      </template>

    </RightContainer>
  </div>
</template>

<script>
import { list, forceLogout } from '@/api/monitor/online';
import { PAGE_LIMIT } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';

export default {
  name: 'Online',
  components: { RightContainer },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      pageNum: 1,
      pageSize: PAGE_LIMIT,
      // 查询参数
      queryParams: {
        ipaddr: undefined,
        userName: undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      list(this.queryParams).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },
    /** 强退按钮操作 */
    handleForceLogout(row) {
      this.confirmModal({
        msg: '是否确认强退名称为"' + row.userName + '"的数据项?'
      }, () => {
        return forceLogout(row.tokenId)
          .then(() => {
            this.getList();
            this.msgSuccess('强退成功');
          }).catch(function() {});
      });
    }
  }
};
</script>

<style scoped>
  .el-button >span {
    display: flex;
    align-items: center;
  }
</style>
