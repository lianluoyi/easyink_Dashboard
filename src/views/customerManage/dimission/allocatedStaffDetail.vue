<script>
import AllocatedStaffDetailList from './allocatedStaffDetailList';
import RightContainer from '@/components/RightContainer';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  name: 'AllocatedStaffDetail',
  components: { AllocatedStaffDetailList, RightContainer },
  mixins: [loadingMixin],
  props: {},
  data() {
    return {
      active: 'customer',
      dateRange: [] // 离职日期
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.active = this.$route.query.type || 'customer';
  },
  methods: {
    getList() {
      this.$refs[this.active] && this.$refs[this.active].getList(1);
    },
    resetForm() {
      this.dateRange = [];
      this.getList();
    },
    /**
     * 点击重置按钮
     */
    resetQuery() {
      this.resetForm('queryForm');
    },
    // 切换tab
    changeTab() {
      // 切换后调用接口
      this.getList();
      const query = { ...this.$route.query, type: this.active };
      this.$router.push({
        path: this.$route.path,
        query
      });
    }
  }
};
</script>

<template>
  <RightContainer>
    <template v-slot:search>
      <el-form
        ref="queryForm"
        :inline="true"
        label-width="70px"
        class="top-search"
      >
        <el-form-item label="离职日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
        </el-form-item>
        <el-form-item label>
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
    <template v-slot:data>
      <el-tabs v-model="active" @tab-click="changeTab">
        <el-tab-pane label="已分配客户" name="customer">
          <AllocatedStaffDetailList
            v-if="active === 'customer'"
            ref="customer"
            :date-range="dateRange"
            :modify-button-status="modifyButtonStatus"
          />
        </el-tab-pane>
        <el-tab-pane label="已分配客户群" name="group">
          <AllocatedStaffDetailList
            v-if="active === 'group'"
            ref="group"
            :date-range="dateRange"
            type="group"
            :modify-button-status="modifyButtonStatus"
          />
        </el-tab-pane>
      </el-tabs>
    </template>
  </RightContainer>
</template>

<style lang="scss" scoped>
/deep/ .el-tabs__item {
  height: 32px!important;
  line-height: 32px!important;
}
/deep/ .el-tabs__nav-wrap::after {
  display: none;
}
</style>
