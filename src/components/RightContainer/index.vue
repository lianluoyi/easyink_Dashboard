<script>
import NoConfigInfo from '../NoConfigInfo';
/**
 * 表格布局
 * @displayName RightContainer(表格布局)
 */
export default {
  name: 'RightContainer',
  components: { NoConfigInfo },
  props: {
    /**
     * 未配置secret所展示的配置提醒
     */
    noConfigMessage: {
      type: String,
      default: ''
    },
    /**
     * 配置对应secret key的数组
     */
    configKeys: {
      type: Array,
      default: () => []
    },
    /**
     * 当前页配置对应功能
     */
    pageTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.dealSearchTool();
    /**
     * 部分搜索栏的按钮有自适应换行按钮和固定在右侧的按钮
     * 该方法用来处理固定右侧的按钮被挤出页面流时样式的更改
     * (若有类似使用则给对应按钮附上“fix-right-operate-btn”、“last-btn”的类名)
     */
    window.addEventListener('resize', this.dealSearchTool);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.dealSearchTool);
  },

  methods: {
    dealSearchTool() {
      const PADDING_WIDTH = 20;
      const customBtn = document.getElementsByClassName('fix-right-operate-btn')?.[0];
      const searchBtn = document.getElementsByClassName('last-btn')?.[0];
      if (!searchBtn || !customBtn) return;
      const resizeWidth = (searchBtn.offsetParent.clientWidth - (searchBtn.clientWidth + searchBtn.offsetLeft)) || 0;
      if ((resizeWidth - PADDING_WIDTH) < customBtn.clientWidth) {
        customBtn.style.position = 'relative';
        customBtn.style.bottom = 'initial';
        customBtn.style.right = 'initial';
        const EXTRA_WIDTH = 32;
        customBtn.style.left = `${searchBtn.offsetParent.clientWidth - customBtn.clientWidth - EXTRA_WIDTH}px`;
      } else {
        customBtn.style.position = 'absolute';
        customBtn.style.bottom = '15px';
        customBtn.style.right = '15px';
        customBtn.style.left = 'initial';
      }
    }
  }
};
</script>

<template>
  <div class="right-container" v-bind="$attrs">
    <!-- 缺少配置提示 -->
    <div class="no-config-info">
      <NoConfigInfo :message="noConfigMessage" :config-keys="configKeys" :page-title="pageTitle" />
    </div>
    <!-- TODO 头部组件配置 可将返回组件配置在该组件中 -->
    <slot name="header" />
    <div class="search-form-container">
      <!-- @slot 搜索区域(template根元素需传el-form) -->
      <slot name="search" />
      <slot name="show-search-value" />
      <slot name="search-operate-btn" />
    </div>
    <!-- 展示数据 -->
    <div class="show-data-wrapper">
      <div class="operate-container">
        <div class="operate-left">
          <!-- @slot 统计信息(template下需使用span或div包裹) -->
          <slot name="data-stat" />
        </div>
        <div class="operate-right">
          <!-- @slot 操作按钮区域(template下直接传el-button即可，不要用div包裹起来) -->
          <slot name="operate-btn" />
        </div>
      </div>
      <div class="data-container">
        <!-- @slot 表格及分页/其他组件(展示数据) -->
        <slot name="data" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
  .right-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    .show-data-wrapper {
      flex: 1;
    }
  }
  .no-config-info /deep/ .el-alert, .search-form-container /deep/ .el-form {
    margin-bottom: 10px;
  }
  .search-form-container {
    /deep/ .el-form {
      background: #fff;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 0 15px 15px;
      .el-form-item {
        padding: 0;
        margin-right: 5px!important;
        margin-top: 15px!important;
        &:last-child {
          height: 32px;
          margin-left: 2px!important;
          margin-right: 0px!important;
          .el-form-item__label {
            display: none;
          }
          .el-form-item__content {
            display: flex;
            justify-content: flex-start;
          }
        }
      }
      .fix-right-operate-btn {
        position: absolute;
        right: 15px;
        bottom: 15px;
      }
    }
    /deep/ .el-input {
      width: 240px;
    }
    /deep/ .el-button:not(:first-child) {
      margin-left: 8px!important;
    }
  }
  .show-data-wrapper {
    padding: 15px;
  }
  .operate-container {
    display: flex;
    justify-content: space-between;
    .operate-left {
      >span, >div {
        padding-bottom: 15px;
        display: inline-block;
        line-height: 32px;
      }
    }
    .operate-right /deep/ .el-button {
      margin-bottom: 15px;
      margin-left: 10px;
      &.el-button--default {
        @include btn_reset_color($color-theme2-1)
      }
      &.is-disabled {
        border-color: #e6ebf5;
        color: #C0C4CC;
      }
      &.el-dropdown__caret-button {
        margin-left: 0;
      }
    }
  }
  .operate-left {
    color: #606266;
    /deep/ .data-count-num {
      @include text_btn_color($color-theme2-1);
      padding-left: 5px;
      padding-right: 5px;
    }
  }
  .show-data-wrapper {
    background: #fff;
    /deep/ .el-table__body-wrapper {
      border-left: 1px solid #eee;
      border-right: 1px solid #eee;
    }
    /deep/ .el-table-column--selection .cell{
      padding-left: 14px;
    }
    /deep/ .el-table__cell {
      text-align: left!important;
    }
    /deep/ .el-table__body {
      .el-table__cell {
        border-bottom-color: #eee!important;
      }
    }
    /deep/ th{
      background: #eee!important;
      border-bottom: 0!important;
    }
  }
  .modal-container {
    /deep/ .el-form {
      padding: 0;
      .el-form-item {
        margin-right: 5px!important;
        margin-bottom: 10px!important;
        margin-top: 0px!important;
      }
    }
    .show-data-wrapper {
      padding: 0;
    }
  }
</style>

<docs lang="md">
这是页面的右侧容器组件，包括头部配置提醒、搜索条件表单、数据展示(包括统计信息、操作按钮和表格展示)

## 示例

标签管理右侧容器:（PS: 为节省篇幅，部分组件直接使用自闭合标签。(如el-table、pagination)）

```jsx
<RightContainer :config-keys="['contactSecret']" page-title="管理企业标签">
    <template v-slot:search>
      <el-form>
        <el-form-item>
          <el-input v-model="query.searchName" placeholder="请输入标签组或标签" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:data-stat>
      <span>当前企业标签已创建<span class="data-count-num">{{ total }}/10000</span></span>
    </template>
    <template v-slot:operate-btn>
      <el-button>新建标签组</el-button>
    </template>
    <template v-slot:data>
      <el-table />
      <pagination />
    </template>
  </RightContainer>
```

效果如图![效果](https://s3.bmp.ovh/imgs/2021/10/2a6df33c6ec6ab21.png)
</docs>
