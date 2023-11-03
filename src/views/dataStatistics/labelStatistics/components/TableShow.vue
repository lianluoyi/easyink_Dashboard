<!--
 * @Description: 表格视图
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <el-table
      ref="showTable"
      v-loading="loading"
      :data="list"
      @sort-change="changeTableSort"
    >
      <template slot="empty">
        <empty-default-icon :length="list.length" />
      </template>
      <el-table-column prop="tagName" label="标签" min-width="200" />
      <el-table-column prop="groupTagName" label="所属标签组" min-width="180" />
      <el-table-column :sortable="tagType() === TAG_LABEL_TYPE['customer'] ? false : 'custom'" prop="customerCnt" :label="tagType() === TAG_LABEL_TYPE['customer'] ? '标签下客户数' :'标签下客户群'" min-width="180" />
      <el-table-column :sortable="tagType() === TAG_LABEL_TYPE['customer'] ? false : 'custom'" prop="createTime" label="标签创建时间" min-width="180" />
    </el-table>
    <pagination
      :total="total"
      :page.sync="query.pageNum"
      :limit.sync="query.pageSize"
      @pagination="getList()"
    />
  </div>

</template>

<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { getCustomerTagTableView, getGroupTagTableView } from '@/api/statistics';
import { PAGE_LIMIT, TAG_LABEL_TYPE } from '@/utils/constant/index';
const SORT_TYPE = {
  'ascending': 'ASC',
  'descending': 'DESC',
  'null': null
};
export default {
  components: { EmptyDefaultIcon },
  props: {
    getSearchPayload: {
      type: Function,
      default: null
    }
  },
  inject: ['tagType'],
  data() {
    return {
      loading: false,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      // 排序参数
      sortParams: {
        sortName: 'createTime', // 默认正序
        sortType: 'ascending'
      },
      list: [],
      total: 0,
      TAG_LABEL_TYPE
    };
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取客户概况表格数据
     * @param {*} initPage  是否重置为第一页
     * @return {*}
     */
    getList(initPage) {
      initPage && (this.query.pageNum = 1);
      this.loading = true;
      const fn = this.tagType() === TAG_LABEL_TYPE['customer'] ? getCustomerTagTableView : getGroupTagTableView;
      fn(this.getPayload()).then((res) => {
        this.list = res.rows;
        this.total = res.total || 0;
      }).catch(() => {
        this.list = [];
        this.total = 0;
        this.msgError('服务异常，请联系管理员');
      }).finally(() => {
        this.loading = false;
      });
    },
    /**
     * @description 处理查询参数
     */
    getPayload() {
      const searchValue = this.getSearchPayload();
      const payload = { ...this.query, ...searchValue };
      const { sortName, sortType } = this.sortParams;
      let sortPayload = {
        sortName: sortName + 'Sort',
        sortType: SORT_TYPE[sortType]
      };
      if (this.tagType() === TAG_LABEL_TYPE['customer']) {
        sortPayload = {};
      }
      return {
        ...payload, ...sortPayload
      };
    },
    /**
     * @description 重置
     */
    reset() {
      this.query = this.$options.data().query;
      this.$refs?.showTable?.sort('createTime', this.tagType() !== TAG_LABEL_TYPE['customer'] ? 'ascending' : null);
    },
    changeTableSort({ prop, order }) {
      this.sortParams = {
        sortName: prop,
        sortType: order
      };
      this.getList(true);
    }
  }
};
</script>
