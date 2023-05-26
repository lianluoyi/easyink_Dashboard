<!--
 * @Description: 客户标签/群标签
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <RightContainer :class="viewType === VIEW_TYPE['chart'] ? 'chart-show' : ''">
    <template v-slot:search>
      <el-form
        ref="queryForm"
        :inline="true"
        :model="query"
        label-width="100px"
        class="top-search"
        size="small"
      >
        <el-form-item prop="status">
          <el-select v-model="query.tagGroupIds" collapse-tags filterable multiple placeholder="请选择标签组" clearable>
            <el-option
              v-for="item in tagGroup"
              :key="item.tagGroupId"
              :label="item.groupTagName"
              :value="item.tagGroupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="name">
          <div class="tag-input" @click="dialogVisibleSelectUser = true">
            <span v-if="!userAndDepartmentList.length" class="tag-place">请选择员工/部门</span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in userAndDepartmentList"
                :key="unique"
                class="theme-text-color user-tag iaic"
              >
                <TagUserShow :name="unit.name" :show-icon="!unit.userId" />
              </el-tag>
            </template>
          </div>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="dateRange"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onSearch"
          >查询</el-button>
          <el-button
            class="btn-reset"
            @click="resetForm"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:data-stat>
      <div class="total-text">
        {{ LABEL_STAT[activeType] }}
      </div>
    </template>
    <template v-slot:operate-btn>
      <div class="flex">
        <el-radio-group v-model="viewType" size="small" @input="dimensionTypeChange">
          <el-radio-button :label="VIEW_TYPE['table']">表格视图</el-radio-button>
          <el-radio-button :label="VIEW_TYPE['chart']">图表视图</el-radio-button>
        </el-radio-group>
        <el-button v-hasPermi="['statistic:labelStatistics:export']" @click="exportForms">导出报表</el-button>
      </div>
    </template>
    <template v-slot:data>
      <TableShow v-if="viewType === VIEW_TYPE['table']" ref="tableShow" :get-search-payload="getSearchPayload" />
      <ChartShow v-else ref="chartShow" :get-search-payload="getSearchPayload" />
      <!-- 选择员工/部门弹窗 -->
      <SelectUser
        :visible.sync="dialogVisibleSelectUser"
        title="选择员工/部门"
        :is-only-leaf="false"
        :selected-user-list="userAndDepartmentList"
        @success="selectedUserOrDepartment"
      />
    </template>
  </RightContainer>
</template>
<script>
import RightContainer from '@/components/RightContainer';
import TagUserShow from '@/components/TagUserShow';
import SelectUser from '@/components/SelectUser/index.vue';
import { groupByScopeType } from '@/utils/common';
import TableShow from './components/TableShow.vue';
import ChartShow from './components/ChartShow.vue';
import { TAG_LABEL_TYPE } from '@/utils/constant';
import { exportGroupTagsView, exportCustomerTagsView } from '@/api/statistics';
import { groupTagList } from '@/api/customer/grouptag';
import { tagGroupList } from '@/api/customer/tag';
const VIEW_TYPE = {
  'table': 1,
  // eslint-disable-next-line no-magic-numbers
  'chart': 2
};
const LABEL_STAT = {
  [TAG_LABEL_TYPE['customer']]: '统计员工在查询时间内添加的客户，被打上企业客户标签的情况（受官方接口限制，不提供个人标签的统计）',
  [TAG_LABEL_TYPE['group']]: '统计员工在查询时间内创建的客户群，被打上群标签的情况'
};
export default {
  name: '',
  components: { RightContainer, TagUserShow, SelectUser, TableShow, ChartShow },
  data() {
    return {
      // 选择添加人弹窗显隐
      dialogVisibleSelectUser: false,
      // 搜索框选择的员工/部门
      userAndDepartmentList: [],
      dateRange: [],
      // 查询参数
      query: {
        beginTime: undefined,
        endTime: undefined,
        tagGroupIds: []
      },
      tagGroup: [],
      viewType: VIEW_TYPE['table'],
      VIEW_TYPE,
      LABEL_STAT
    };
  },
  inject: ['tagType'],
  computed: {
    // 该处增加一个activeType 为了在切换标签类型的时候可以进行监听并调用接口更新值
    activeType() {
      return this.tagType();
    }
  },
  watch: {
    activeType() {
      this.viewType = VIEW_TYPE['table'];
      this.resetForm();
      this.getTagGroupList();
    }
  },
  created() {
    this.onSearch();
    this.getTagGroupList();
  },
  methods: {
    dimensionTypeChange() {
      this.onSearch();
    },
    /**
     * @description 选择员工/部门的回调
     */
    selectedUserOrDepartment(list) {
      this.userAndDepartmentList = list;
    },
    // 查询
    onSearch() {
      this.$nextTick(() => {
        if (this.viewType === VIEW_TYPE['table']) {
          this.$refs['tableShow'].getList(true);
        } else {
          this.$refs['chartShow'].reset();
        }
      });
    },
    //
    /**
     * @description 获取标签组列表
     */
    getTagGroupList() {
      // TODO 是否需要缓存到当前组件上 避免每次切换的时候都调用接口
      const fn = this.activeType === TAG_LABEL_TYPE['customer'] ? tagGroupList : groupTagList;
      fn().then((res) => {
        this.tagGroup = res.rows;
      });
    },
    // 重置
    resetForm() {
      this.userAndDepartmentList = [];
      this.query = this.$options.data().query;
      this.dateRange = [];
      this.$nextTick(() => {
        if (this.viewType === VIEW_TYPE['table']) {
          this.$refs['tableShow'].reset();
        } else {
          this.$refs['chartShow'].reset();
        }
      });
    },
    /**
     * @description 获取搜索的传参 该方法提供给子组件 子组件搜索的时候获取搜索框中的参数
     */
    getSearchPayload() {
      if (this.dateRange) {
        this.query.beginTime = this.dateRange[0];
        this.query.endTime = this.dateRange[1];
      } else {
        this.query.beginTime = '';
        this.query.endTime = '';
      }
      if (this.userAndDepartmentList && this.userAndDepartmentList.length > 0) {
        const allListObj = groupByScopeType(this.userAndDepartmentList);
        this.query.departmentIds = allListObj.useDepartmentList.map(item => item.id);
        this.query.userIds = allListObj.useEmployeesList.map(item => item.userId);
      } else {
        this.query.departmentIds = [];
        this.query.userIds = [];
      }
      return this.query;
    },
    // 导出报表
    exportForms() {
      let payload;
      if (this.viewType === VIEW_TYPE['table']) {
        payload = this.$refs['tableShow'].getPayload();
      } else {
        payload = this.$refs['chartShow'].getPayload();
      }
      const fn = this.activeType === TAG_LABEL_TYPE['customer'] ? exportCustomerTagsView : exportGroupTagsView;
      fn(payload).then((res) => {
        this.download(res.data.msg, true);
      }).catch(() => {
        this.msgError('导出失败!');
      });
    }
  }
};
</script>
<style scoped lang='scss'>
.chart-show {
  /deep/ .show-data-wrapper {
    overflow: auto;
    padding-bottom: 0;
    .data-container {
      height: calc(100% - 49px);
    }
  }
}
</style>
