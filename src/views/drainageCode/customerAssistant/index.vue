<!--
 * @Description: 获客助手
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="container">
    <div class="box-card">
      <span class="title"> 获客助手 </span>
      <span class="explain">
        线上获客时，可将获客链接配置在微信内/外，如网页、App、公众号、短信等，客户点击即可跳到成员详情页一键添加，有效提升获客转化。
        <span class="use-tips theme-text-color" @click="useTipDrawer = true">使用指引</span>
      </span>
      <div class="image">
        <el-image
          class="part-img"
          :src="require('@/assets/image/addCustomerByNormal.png')"
          :preview-src-list="[require('@/assets/image/addCustomerByNormal.png')]"
        />
        <i class="el-icon-d-arrow-right" />
        <el-image
          class="part-img"
          :src="require('@/assets/image/addCustomerByLink.png')"
          :preview-src-list="[require('@/assets/image/addCustomerByLink.png')]"
        />
      </div>
    </div>
    <CustomerAssistantSituation v-if="checkPermi(['customer:assistant:situation'])" />
    <div class="search-table">
      <RightContainer>
        <template v-slot:search>
          <el-form
            ref="queryForm"
            :inline="true"
            :model="query"
            label-width="100px"
          >
            <el-form-item prop="scenario">
              <el-input v-model="query.scenario" placeholder="请输入链接名称" clearable @keyup.enter.native="getList(1)" />
            </el-form-item>
            <el-form-item prop="useUserName">
              <el-input v-model="query.useUserName" placeholder="请输入使用员工" clearable @keyup.enter.native="getList(1)" />
            </el-form-item>
            <el-form-item prop="qrCode">
              <el-input v-model="query.qrCode" placeholder="请输入链接" clearable @keyup.enter.native="getList(1)" />
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
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 240px"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <el-form-item class="last-btn">
              <el-button type="primary" @click="onSearch">查询</el-button>
              <el-button class="btn-reset" @click="onReset">重置</el-button>
            </el-form-item>
            <el-form-item class="fix-right-operate-btn">
              <el-button v-hasPermi="['customer:assistant:add']" type="primary" @click="goRoute('customerAssistantAdd', {})">新增链接</el-button>
              <el-button v-hasPermi="['customer:assistant:delete']" class="btn-reset" @click="batchDelete">批量删除</el-button>
            </el-form-item>
          </el-form>
        </template>
        <template v-slot:data>
          <el-table
            ref="multipleTable"
            v-loading="loading"
            :data="list"
            @selection-change="handleSelectionChange"
          >
            <template slot="empty">
              <empty-default-icon text="暂无数据" :length="list.length" />
            </template>
            <el-table-column type="selection" width="55" align="center" fixed />
            <el-table-column
              prop="scenario"
              label="链接名称"
              align="center"
              width="220"
              fixed
            >
              <template #default="{ row }">
                <el-popover
                  :open-delay="600"
                  placement="top-start"
                  trigger="hover"
                  popper-class="tip-popover"
                  :content="`${row.scenario}`"
                >
                  <div slot="reference" class="intwoline">
                    {{ row.scenario }}
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="获客链接" align="center" prop="qrCode" min-width="300" />
            <el-table-column
              label="使用员工"
              align="center"
              prop="useUserName,departmentName"
              show-overflow-tooltip
              min-width="175"
            >
              <template slot-scope="scope">
                <ListUserShow :use-user-name="scope.row.useUserName" :department-name="scope.row.departmentName" />
              </template>
            </el-table-column>
            <el-table-column label="创建人" align="center" prop="createBy" min-width="125" />
            <el-table-column label="创建时间" align="center" prop="createTime" min-width="175" />
            <el-table-column label="操作" align="center" min-width="185" fixed="right">
              <template slot-scope="{ row }">
                <div>
                  <el-button size="mini" type="text" @click="goRoute('customerAssistantDetail', {id: row.id})">详情</el-button>
                  <el-button size="mini" type="text" @click="openVisible(row.id)">自定义渠道</el-button>
                  <el-button v-copy="row.qrCode" size="mini" type="text">复制链接</el-button>
                </div>
                <div>
                  <el-button v-hasPermi="['customer:assistant:edit']" size="mini" type="text" @click="goRoute('customerAssistantEdit', { id:row.id })">编辑</el-button>
                  <el-button v-hasPermi="['customer:assistant:delete']" size="mini" type="text" @click="handleDelete(row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="total > 0"
            :total="total * 1"
            :page.sync="query.pageNum"
            :limit.sync="query.pageSize"
            :select-data-len="ids.length"
            @pagination="getList()"
          />
        </template>
      </RightContainer>
    </div>
    <UseTip :visible.sync="useTipDrawer" />
    <CustomChannel :visible.sync="customChannelVisible" :emple-code-id="selectEmpleCodeId" />
  </div>
</template>
<script>
import { goRouteWithQuery } from '@/utils';
import { getList, remove } from '@/api/drainageCode/customerAssistant';
import { PAGE_LIMIT } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import UseTip from './components/UseTip.vue';
import CustomerAssistantSituation from './components/CustomerAssistantSituation.vue';
import CustomChannel from './components/CustomChannel.vue';
import ListUserShow from '@/components/ListUserShow';
import { checkPermi } from '@/utils/permission';

export default {
  components: { CustomChannel, RightContainer, EmptyDefaultIcon, UseTip, ListUserShow, CustomerAssistantSituation },
  data() {
    return {
      loading: false,
      list: [],
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        beginTime: undefined,
        endTime: undefined,
        scenario: undefined,
        useUserName: undefined,
        qrCode: undefined,
        createBy: undefined
      },
      // 日期范围
      dateRange: [],
      useTipDrawer: false,
      customChannelVisible: false,
      // 已勾选的项id
      ids: [],
      total: 0,
      selectEmpleCodeId: undefined
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
  },
  methods: {
    handleSelectionChange(list) {
      this.ids = list.map((item) => item.id);
    },
    openVisible(id) {
      this.selectEmpleCodeId = id;
      this.customChannelVisible = true;
    },
    handleDelete(row) {
      this.deleteLink(
        [row.id]
      );
    },
    goRoute(path, param) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.query
      });
      goRouteWithQuery(this.$router, path, {}, param);
    },
    /**
     * @description 批量删除
     */
    batchDelete() {
      if (this.ids.length <= 0) {
        this.msgWarn('请至少选择一个获客链接');
        return;
      }
      this.deleteLink(
        this.ids
      );
    },
    /**
     * @description 删除链接
     * @param 需要删除的链接IdList
     */
    async deleteLink(idList) {
      this.confirmModal(
        {
          msg: `删除后，链接失效，之前的统计数据也将被删除并不可恢复，是否继续？`
        },
        async() => {
          const delIds = idList.join(',');
          remove(delIds).then(() => {
            this.msgSuccess('删除成功');
            this.getList(1);
          });
        }
      );
    },
    onSearch() {
      this.getList(1);
    },
    onReset() {
      this.dateRange = [];
      this.query = this.$options.data().query;
      this.getList(1);
    },
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
          this.ids = [];
        })
        .catch(() => {
          this.list = [];
          this.total = 0;
        }).finally(() => {
          this.loading = false;
        });
    },
    checkPermi(key) {
      return checkPermi(key);
    }
  }
};
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  .box-card {
    background-color: white;
    padding: 15px;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    min-width: 900px;
    .title {
      color: #333333;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .explain {
      font-size: 16px;
      color: #333333;
      margin-bottom: 20px;
      .use-tips {
        cursor: pointer;
      }
    }
    .image {
      display: flex;
      align-items: center;
      i {
        font-size: 30px;
        margin: 0 20px;
      }
      .part-img {
        width: 400px;
      }
    }
  }
}
.search-table {
  flex: 1;
}
.statistic {
  width: 60px;
  font-size: 14px;
  cursor: default;
}
.popover-content {
  width: 390px;
  font-size: 12px;
  line-height: 20px;
}
/deep/ .search-form-container {
    margin-top: 10px;
    margin-bottom: -25px;
    position: relative;
    .el-form {
      position: relative;
      min-height: 111px;
      display: flex;
      align-items: flex-start;
    }
}
</style>
