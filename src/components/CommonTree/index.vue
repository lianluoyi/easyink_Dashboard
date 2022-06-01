<!--
 * @Description: 公共树组件（统一判断空值情况）
 * @Author: broccoli
 * @LastEditors: broccoli
 * @remrk 空值调用时slot命名为empty
-->

<script>
/**
 * 公共树组件（统一判断空值情况，基本属性用法与el-tree相同）
 * @displayName CommonTree(公共树组件)
 */
/* eslint-disable vue/no-template-shadow */
export default {
  name: 'CommonTree',
  components: {},
  props: {
    /**
     * 树的data
     */
    data: {
      type: Array,
      default: () => []
    },
    /**
     * 树的类名
     */
    treeClass: {
      type: String,
      default: ''
    },
    /**
     * el-tree -> node-key属性
     */
    nodeKey: {
      type: String,
      default: ''
    },
    props: {
      type: Object,
      default: () => {}
    },
    /**
     * el-tree -> default-expanded-keys属性
     */
    defaultExpandedKeys: {
      type: Array,
      default: () => []
    },
    /**
     * 过滤节点
     */
    filterNodeMethod: {
      type: Function,
      default: () => {}
    },
    /**
     * el-tree -> node-click属性
     */
    nodeClick: {
      type: Function,
      default: () => {}
    },
    /**
     * el-tree -> render-content属性
     */
    renderContent: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      // 是否为空值
      treeDataEmpty: false
    };
  },
  computed: {},
  watch: {
    data(val) {
      this.treeDataEmpty = val.length === 0;
    }
  },
  created() {},
  mounted() {},
  methods: {
    filterNode(value, data, node) {
      return this.filterNodeMethod(value, data, node);
    },
    filter(val) {
      this.$refs.commonTree.filter(val);
      this.treeDataEmpty = this.$refs.commonTree.isEmpty;
    }
  }
};
</script>

<template>
  <div class="common-tree">
    <div v-show="treeDataEmpty" class="common-tree-empty">
      <!-- @slot slot为empty的传入节点 -->
      <slot name="empty" />
    </div>
    <div v-show="!treeDataEmpty" class="common-tree-content">
      <el-tree
        ref="commonTree"
        :node-key="nodeKey"
        :data="data"
        :props="props"
        :default-expanded-keys="defaultExpandedKeys"
        :filter-node-method="filterNode"
        v-bind="$attrs"
        v-on="$listeners"
        @node-click="nodeClick"
      >
        <template slot-scope="{ node, data }">
          <!--
            @slot 传入的自定义树节点
            @binding {object} node
            @binding {object} data
          -->
          <slot :node="node" :data="data" />
        </template>
      </el-tree>
    </div>
  </div>
</template>

