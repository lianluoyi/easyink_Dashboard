<template>
  <div :class="{ hidden: hidden }" class="pagination-container">
    <el-pagination
      :background="background"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total*1"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to';
import { PAGE_LIMIT, PAGE_LIMIT_TWENTY, PAGE_LIMIT_THIRTY, PAGE_LIMIT_FIFTY } from '@/utils/constant';
const SCROLL_TO_DISTANCE = 800;

/**
 * 分页器
 * @displayName Pagination(分页器)
 */
export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: PAGE_LIMIT_TWENTY
    },
    pageSizes: {
      type: Array,
      default() {
        return [PAGE_LIMIT, PAGE_LIMIT_TWENTY, PAGE_LIMIT_THIRTY, PAGE_LIMIT_FIFTY];
      }
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    },
    selectDataLen: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      oldOPage: 1
    };
  },
  computed: {
    currentPage: {
      get() {
        return this.page;
      },
      set(val) {
        this.oldOPage = this.currentPage;
        this.$emit('update:page', val);
      }
    },
    pageSize: {
      get() {
        return this.limit;
      },
      set(val) {
        this.$emit('update:limit', val);
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('pagination', { page: this.currentPage, limit: val });
      if (this.autoScroll) {
        scrollTo(0, SCROLL_TO_DISTANCE);
      }
    },
    handleCurrentChange(val) {
      if (this.selectDataLen != null && this.selectDataLen > 0) {
        this.msgWarn('请先对已勾选数据完成操作');
        this.currentPage = this.oldOPage;
        return false;
      }
      this.$emit('pagination', { page: val, limit: this.pageSize });
      if (this.autoScroll) {
        scrollTo(0, SCROLL_TO_DISTANCE);
      }
    }
  }
};
</script>

<style scoped>
.pagination-container {
  padding: 15px 5px 0;
  text-align: right;
}
.pagination-container.hidden {
  display: none;
}
</style>
