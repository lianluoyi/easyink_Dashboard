<!--
 * @Description: 兑换活动列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <RightContainer>
      <template v-slot:search>
        <el-form ref="queryForm" :inline="true" :model="query" class="top-search">
          <el-form-item prop="activityName">
            <el-input
              v-model="query.activityName"
              clearable
              placeholder="请输入活动名称"
              @keyup.enter.native="getList(1)"
              @clear="getList(1)"
            />
          </el-form-item>
          <el-form-item prop="createBy">
            <el-input v-model="query.createBy" placeholder="请输入创建人姓名" />
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
            <el-button type="primary" @click="getList(1)">查询</el-button>
            <el-button class="btn-reset" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:data-stat>
        <span>客户通过兑换码换取专属权益，是店铺快速引流渠道之一<el-button
          type="text"
          class="data-count-num"
          @click="openHowTouseActiveDrawer = true"
        >如何使用兑换活动？</el-button></span>
      </template>
      <template v-slot:operate-btn>
        <el-button
          type="primary"
          size="mini"
          @click="goRoute('conversionCodeAdd')"
        >新建兑换活动</el-button>
        <el-button
          type="reset"
          size="mini"
          class="btn-reset"
          @click="batchDel()"
        >批量删除</el-button>
      </template>
      <template v-slot:data>
        <el-table
          v-loading="loading"
          :data="list"
          max-height="600"
          @selection-change="handleSelectionChange"
        >
          <template slot="empty">
            <empty-default-icon :length="list.length" />
          </template>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="活动名称" align="center" prop="activityName">
            <template #default="{ row }">
              <div class="code-left">{{ row.activityName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="活动时间" align="center">
            <template #default="{ row }">
              <div class="code-left">{{ row.effectStartTime }}~{{ row.effectEndTime }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" width="150" prop="status">
            <template #default="{ row }">
              <div>123</div>
            </template>
            <template #header>
              <div>
                <span>库存</span>
                <el-popover
                  placement="top-start"
                  trigger="hover"
                  popper-class="tip-popover"
                  content="库存即剩余未领取的兑换码"
                >
                  <i
                    slot="reference"
                    class="iconfont icon-question"
                    style="font-size: 14px"
                  />
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="创建人" align="center" prop="createBy" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="{ row }">
              <el-button type="text" @click="goRoute('conversionCodeDetail',row.id)">兑换码</el-button>
              <el-button type="text" @click="goRoute('conversionCodeAdd',row.id)">编辑</el-button>
              <el-button type="text" @click="handleDelete(row.id)">删除</el-button>
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
      </template>
    </RightContainer>
    <el-drawer
      title="如何使用兑换活动"
      :visible.sync="openHowTouseActiveDrawer"
      size="780px"
    >
      <div class="draw-body">
        <div class="draw-body-step">
          <div class="draw-body-title">一、创建兑换活动</div>
          <div class="draw-body-content">在营销活动下，填写基本信息，创建兑换活动</div>
        </div>
        <div class="draw-body-step">
          <div class="draw-body-title">二、导入兑换码</div>
          <div class="draw-body-content">根据模板填入兑换码数据，一键导入</div>
        </div>
        <div class="draw-body-step">
          <div class="draw-body-title">三、应用兑换活动</div>
          <div class="draw-body-content">前往员工活码，设置欢迎语类型为“活动欢迎语”，选择兑换活动，在欢迎语中插入“#兑换码#”并生成员工活码。当客户通过活码添加员工时，将“#兑换码#”替换为真正的兑换码并作为欢迎语发出，客户即可拿到兑换码换取权益。
            <div>
              （新客进群也支持兑换活动）
            </div>
          </div>
        </div>
        <div class="confirm-div">
          <div class="confirm-btn-div">
            <el-button type="primary" @click="goRoute('conversionCodeAdd')">现在去创建活动</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { goRouteWithQuery } from '@/utils';
import RightContainer from '@/components/RightContainer';
import { getConversionCodeActiveList, deleteConversionCodeActive } from '@/api/redeem';
import { PAGE_LIMIT } from '@/utils/constant';
const DEFAULT_PAGE_NUM = 1;
export default {
  name: 'List',
  components: { RightContainer, EmptyDefaultIcon },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      query: {
        activityName: '',
        effectStartTime: '',
        effectEndTime: '',
        createBy: '',
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT
      },
      // 日期范围
      dateRange: [],
      list: [],
      total: 0,
      openHowTouseActiveDrawer: false
    };
  },
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>客户通过兑换码领取内容商品等专属权益，帮助店铺快速引流、拓宽销售渠道、提高商品转化率</div>
      `
    );
    this.getList();
  },
  methods: {
    // 获取兑换码活动列表
    getList(pageNum) {
      this.query.effectStartTime = this.dateRange && this.dateRange[0];
      this.query.effectEndTime = this.dateRange && this.dateRange[1];
      pageNum && (this.query.pageNum = pageNum);
      this.loading = true;
      getConversionCodeActiveList(this.query).then(({ rows, total }) => {
        this.list = rows;
        this.total = total;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    goRoute(path, id) {
      if (this.openHowTouseActiveDrawer) {
        this.openHowTouseActiveDrawer = false;
        setTimeout(() => {
          goRouteWithQuery(this.$router, path, {}, { id });
        }, 100);
      } else {
        goRouteWithQuery(this.$router, path, {}, { id });
      }
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.$refs['queryForm'].resetFields();
      this.getList(1);
    },

    /**
     * 删除单个兑换码活动
     * @param row 对应兑换码活动
     */
    handleDelete(id) {
      this.delConversionCodeActive({
        //   需要删除的标签规则id列表
        idList: [id]
      });
    },

    /*
    * 批量删除兑换码活动
    */
    batchDel() {
      if (this.ids.length <= 0) {
        this.msgWarn('请至少选择一个兑换码活动');
        return;
      }
      this.delConversionCodeActive({
        idList: this.ids
      });
    },
    /**
     * 删除兑换码活动
     * @param
     * "idList": []
     */
    delConversionCodeActive(params) {
      this.confirmModal({
        msg: '若该活动在员工活码或新客进群中被使用，删除后将失效，且不可恢复，是否继续？'
      }, async() => {
        deleteConversionCodeActive(params).then(() => {
          this.getList();
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.draw-body {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  .draw-body-title {
    margin-left: 20px;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 9px;
  }
  .draw-body-content {
    margin-bottom: 10px;
    line-height:20px;
    margin-left: 58px;
  }
    .confirm-div {
    display: flex;
    align-items: center;
    padding: 20px 30px;
    position: relative;
    height: 60px;
    .switch-tip {
      margin-left: 10px;
    }
    .confirm-btn-div {
      position: absolute;
      right: 30px;
    }
  }
}
</style>
