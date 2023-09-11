<!--
 * @Description: 分页组件(暂无更多配置，根据后续使用情况进行组件功能增加)
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <el-pagination
    v-bind="$attrs"
    layout="sizes,slot"
    :page-sizes="pageSizes"
    :page-size.sync="pageSize"
    :total="total"
    @size-change="handleSizeChange"
  >
    <span class="el-pagination__jump ml5">
      <i :class="[ currentPage > 1 ? 'pointer' : 'not-allowed', 'mr10 el-icon-arrow-left']" @click="previousPage" />
      <el-input
        :value="currentPage !== null ? currentPage : 1"
        class="el-pagination__editor is-in-pagination"
        type="number"
        :min="1"
        :max="pageCount"
        @input="handleInput"
        @change="handleChange"
      />
      <span class="no-select">
        <span class="ml20">/</span>
        <span>
          {{ pageCount }}
        </span>
      </span>
      <i :class="[ currentPage < pageCount ? 'pointer' : 'not-allowed', 'el-icon-arrow-right']" @click="nextPage" />
    </span>
  </el-pagination>

</template>
<script>
import { PAGE_LIMIT, PAGE_LIMIT_TWENTY, PAGE_LIMIT_THIRTY, PAGE_LIMIT_FIFTY, DEFAULT_PAGE_NUM } from '@/utils/constant/index';
export default {
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: [Number, String],
      default: DEFAULT_PAGE_NUM
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
    }
  },
  computed: {
    currentPage: {
      get() {
        return this.page;
      },
      set(val) {
        this.$emit('update:page', val);
      }
    },
    pageCount() {
      if (typeof this.total === 'number') {
        return Math.max(1, Math.ceil(this.total / this.pageSize));
      } else if (typeof this.pageCount === 'number') {
        return Math.max(1, this.pageCount);
      }
      return null;
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
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.handleCurrentChange();
      }
    },
    handleSizeChange() {
      this.$emit('update:page', DEFAULT_PAGE_NUM);
      this.$emit('pagination');
    },
    handleCurrentChange() {
      this.$emit('pagination');
    },
    nextPage() {
      if (this.currentPage < this.pageCount) {
        this.currentPage++;
        this.handleCurrentChange();
      }
    },
    /**
     * @description 获取合法的需要跳往页面的值
     */
    getValidCurrentPage(value) {
      value = parseInt(value, 10);
      const havePageCount = typeof this.pageCount === 'number';
      let resetValue;
      if (!havePageCount) {
        if (isNaN(value) || value < 1) resetValue = 1;
      } else {
        if (value < 1) {
          resetValue = 1;
        } else if (value > this.pageCount) {
          resetValue = this.pageCount;
        }
      }
      if (resetValue === undefined && isNaN(value) || resetValue === 0) {
        resetValue = 1;
      }
      return resetValue === undefined ? value : resetValue;
    },
    handleChange(val) {
      this.currentPage = this.getValidCurrentPage(val);
      this.handleCurrentChange();
    },
    handleInput(value) {
      this.currentPage = value;
    }
  }
};

</script>
<style scoped lang="scss">
@import '~@/styles/mixin.scss';
.pointer {
  cursor: pointer;
  &:hover {
    @include text_btn_color($color-theme2-1);
  }
}
.not-allowed {
  cursor: not-allowed;
}
.no-select {
  user-select:none;
  margin-top: 1px;
  span {
    font-weight: 100;
    font-size: 15px;
    margin-right: -10px;
  }
  span:first-child {
    font-size: 19px;
  }
}
/deep/ .el-input--small .el-input__inner {
  height: 24px;
  line-height: 0;
}
</style>
