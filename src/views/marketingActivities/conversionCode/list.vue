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
            <el-popover
              placement="top-start"
              trigger="hover"
              popper-class="tip-popover"
              content="创建时间"
            >
              <el-date-picker
                slot="reference"
                v-model="dateRange"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-popover>
          </el-form-item>
          <el-form-item>
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
      <template v-slot:data-stat>
        <span>客户通过兑换码换取专属权益，是店铺快速引流渠道之一<el-button
          type="text"
          class="data-count-num"
          @click="openHowTouseActiveDrawer = true"
        >如何使用兑换活动？</el-button></span>
      </template>
      <template v-slot:operate-btn>
        <el-button
          v-hasPermi="['redeeomCode:activity:add']"
          type="primary"
          size="mini"
          @click="goRoute('conversionCodeAdd')"
        >新建兑换活动</el-button>
        <el-button
          v-hasPermi="['redeeomCode:activity:del']"
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
          <el-table-column prop="activityName" label="活动名称" align="center">
            <template #default="{ row }">
              <el-popover
                :open-delay="600"
                placement="top-start"
                trigger="hover"
                popper-class="tip-popover"
                :content="`${row.activityName}`"
              >
                <div slot="reference" class="intwoline">{{ row.activityName }}</div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="活动时间" align="center">
            <template #default="{ row }">
              <div v-if="row.effectStartTime">{{ row.effectStartTime }}~{{ row.effectEndTime }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" width="150" prop="status">
            <template #default="{ row }">
              <div>{{ row.remainInventory }}/{{ row.sumInventory }}</div>
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
              <el-button v-hasPermi="['redeeomCode:activity:edit']" type="text" @click="goRoute('conversionCodeAdd',row.id)">编辑</el-button>
              <el-button v-hasPermi="['redeeomCode:activity:del']" type="text" @click="handleDelete(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :disabled="loading"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="getList()"
        />
      </template>
    </RightContainer>
    <HowToUse :visible.sync="openHowTouseActiveDrawer" />
  </div>
</template>

<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { goRouteWithQuery } from '@/utils';
import HowToUse from '../components/HowToUse.vue';
import RightContainer from '@/components/RightContainer';
import { getConversionCodeActiveList, deleteConversionCodeActive } from '@/api/redeem';
import { PAGE_LIMIT } from '@/utils/constant/index';
import loadingMixin from '@/mixin/loadingMixin';
const DEFAULT_PAGE_NUM = 1;
export default {
  name: 'List',
  components: { RightContainer, EmptyDefaultIcon, HowToUse },
  mixins: [loadingMixin],
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
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
      const { effectStartTime, effectEndTime } = this.$store.getters.searchQuery[this.$route.name];
      if (effectStartTime && effectEndTime) {
        this.dateRange = [effectStartTime, effectEndTime];
      }
      this.query = this.$store.getters.searchQuery[this.$route.name];
    }
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>客户通过兑换码领取内容商品等专属权益，帮助店铺快速引流、拓宽销售渠道、提高商品转化率</div>
      `
    );
    this.getList();
  },
  methods: {
    /**
     * 获取兑换码活动列表
     */
    getList(pageNum) {
      this.query.effectStartTime = this.dateRange && this.dateRange[0];
      this.query.effectEndTime = this.dateRange && this.dateRange[1];
      pageNum && (this.query.pageNum = pageNum);
      this.loading = true;
      getConversionCodeActiveList(this.query).then(({ rows, total }) => {
        this.list = rows;
        this.total = total;
      }).finally(() => {
        this.modifyButtonStatus();
        this.loading = false;
      });
    },
    goRoute(path, id) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.query
      });
      goRouteWithQuery(this.$router, path, {}, { id });
    },
    /**
     * 多选框选中数据
     */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },
    /**
     * 重置按钮操作
     */
    resetQuery() {
      this.dateRange = [];
      this.query = this.$options.data().query;
      this.getList(1);
    },

    /**
     * 删除单个兑换码活动
     * @param id 对应兑换码活动id
     */
    handleDelete(id) {
      this.delConversionCodeActive({
        //   需要删除的标签规则id列表
        idList: [id]
      });
    },
    /**
     * 批量删除兑换码活动
     */
    batchDel() {
      if (this.ids.length <= 0) {
        this.msgWarn('请至少选择一个兑换活动');
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
