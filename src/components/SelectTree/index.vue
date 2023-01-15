<script>
/**
 * 下拉框树选择器
 * @displayName SelectTree(下拉框树选择器)
 */
export default {
  name: 'SelectTree',
  props: {
    /**
     * 树结构数据
     */
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    /**
     * 树的节点属性配置
     */
    obj: {
      type: Object,
      required: false,
      default: () => {
        return {
          // ID
          id: 'id',
          // 显示名称
          label: 'label',
          // 子级字段名
          children: 'children',
          // 路径
          path: 'path',
          // 描述
          content: 'content',
          // 父id
          pid: 'pid'
        };
      }
    },
    /**
     * 配置是否可多选
     */
    multiple: {
      type: Boolean,
      default() {
        return false;
      }
    },
    /**
     * 配置是否可清空选择
     */
    clearable: {
      type: Boolean,
      default() {
        return false;
      }
    },
    /**
     * 配置多选时是否将选中值按文字的形式展示
     */
    collapseTags: {
      type: Boolean,
      default() {
        return false;
      }
    },
    /**
     * 显示复选框情况下，是否严格遵循父子不互相关联
     */
    checkStrictly: {
      type: Boolean,
      default() {
        return false;
      }
    },
    /**
     * 多选是设置点击节点是否可以选中
     */
    checkClickNode: {
      type: Boolean,
      default() {
        return false;
      }
    },
    /**
     * 多选时：点击节点展开还是点三角标
     */
    expandClickNode: {
      type: Boolean,
      default() {
        return false;
      }
    },
    /**
     * 默认选中的节点key
     */
    defaultKey: {
      type: [Number, String, Array, Object],
      default() {
        return [];
      }
    },
    /**
     * 宽度
     */
    width: {
      type: String,
      default() {
        return '100%';
      }
    },
    /**
     * 高度
     */
    height: {
      type: String,
      default() {
        return '300px';
      }
    },
    /**
     * 默认展开的key
     */
    defaultExpandKeys: {
      type: Array,
      default() {
        return [];
      }
    },
    placeholder: {
      type: String,
      default() {
        return '';
      }
    },
    selectStyle: {
      type: String,
      default() {
        return '';
      }
    }
  },
  data() {
    return {
      // 下拉框大小
      popoverWidth: '0px',
      // 是否显示树状选择器
      isShowSelect: false,
      // select option选项
      options: [],
      // 返回给父组件数组对象
      returnDatas: [],
      // 返回父组件数组主键值
      returnDataKeys: []
    };
  },
  computed: {
    treeData() {
      // 若非树状结构，则转化为树状结构数据
      this.$nextTick(() => {
        this.init();
      });
      return this.data;
      // return JSON.stringify(this.data).indexOf(this.obj.children) !== -1 ? this.data :  this.switchTree();
    },
    allDefaultKey() {
      return this.defaultKey;
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    isShowSelect(val) {
      // 隐藏select自带的下拉框
      this.$refs.select.blur();
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.addEventListener('click', e => {
        const sp = this.$refs.popTree;
        if (sp && !e.target.contains(sp)) {
          this.isShowSelect = false;
        }
      });
    });
  },
  methods: {
    init() {
      // eslint-disable-next-line no-undef,no-debugger
      // debugger
      if (this.defaultKey !== undefined && this.defaultKey.length > 0) {
        if (this.multiple) {
          // 多选
          if (
            Object.prototype.toString.call(this.defaultKey).indexOf('Array') !==
            -1
          ) {
            if (
              Object.prototype.toString
                .call(this.defaultKey[0])
                .indexOf('Object') !== -1
            ) {
              // 对象
              this.setDatas(this.defaultKey);
            } else if (
              Object.prototype.toString
                .call(this.defaultKey[0])
                .indexOf('Number') !== -1 ||
              Object.prototype.toString
                .call(this.defaultKey[0])
                .indexOf('String') !== -1
            ) {
              this.setKeys(this.defaultKey);
            } else {
              console.warn('多选：传入参数类型不匹配');
              return;
            }
          } else {
            console.warn('多选：传入参数类型不匹配');
            return;
          }
        } else {
          // 单选
          if (
            Object.prototype.toString.call(this.defaultKey).indexOf('Number') !==
              -1 ||
            Object.prototype.toString.call(this.defaultKey).indexOf('String') !==
              -1 ||
            Object.prototype.toString.call(this.defaultKey).indexOf('Object') !==
              -1
          ) {
            this.setKey(this.defaultKey);
          } else {
            console.warn('单选：传入参数类型不匹配');
            return;
          }
        }
      }
    },
    // 下拉框select点击[入口]
    selectClick() {
      const POPOVER_OFFSET = 26;
      this.$nextTick(function() {
        // 设置下拉框自适应宽度
        this.popoverWidth = this.$refs.select.$el.clientWidth - POPOVER_OFFSET;
      });
      // 显示下拉框
      return (this.isShowSelect = !this.isShowSelect);
    },
    // 单选: 树点击方法
    nodeClick(data, node) {
      if (!this.multiple) {
        // 单选
        this.isShowSelect = false;
        this.setKey(node.key);
      } else {
        // 多选
        var checkedKeys = this.$refs.tree.getCheckedKeys(); // 所有被选中的节点的 key 所组成的数组数据
        var t = [];
        this.options = checkedKeys.map((item) => {
          // 设置option选项
          const selectNode = this.$refs.tree.getNode(item); // 所有被选中的节点对应的node
          t.push(selectNode.data);
          return { label: selectNode.label, value: selectNode.key };
        });
        this.returnDataKeys = this.options.map((item) => {
          return item.value;
        });
        this.returnDatas = t;
      }
    },
    // 单选:清空选中
    clean() {
      this.$refs.tree.setCurrentKey(null); // 清除树选中key
      this.returnDatas = null;
      this.returnDataKeys = '';
      this.popoverHide();
    },
    // 单选:设置、初始化值 key
    setKey(thisKey) {
      this.$refs.tree.setCurrentKey(thisKey);
      var node = this.$refs.tree.getNode(thisKey);
      this.setData(node.data);
    },
    // 单选：设置、初始化对象
    setData(data) {
      this.options = [];
      this.options.push({
        label: data[this.obj.label],
        value: data[this.obj.id]
      });
      this.returnDatas = data;
      this.returnDataKeys = data[this.obj.id];
    },
    // 多选:设置、初始化值 keys
    setKeys(thisKeys) {
      this.$refs.tree.setCheckedKeys(thisKeys);
      this.returnDataKeys = thisKeys;
      var t = [];
      thisKeys.map((item) => {
        // 设置option选项
        var node = this.$refs.tree.getNode(item); // 所有被选中的节点对应的node
        t.push(node.data);
        return { label: node.label, value: node.key };
      });
      this.returnDatas = t;
      this.popoverHide();
    },
    // 多选:设置、初始化对象
    setDatas(data) {
      this.$refs.tree.setCheckedNodes(data);
      this.returnDatas = data;
      var t = [];
      data.map((item) => {
        // 设置option选项
        t.push(item[this.obj.id]);
      });
      this.returnDataKeys = t;
      this.popoverHide();
    },
    // 多选,删除任一select选项的回调
    removeTag(val) {
      this.$refs.tree.setChecked(val, false); // 设置为未选中
      var node = this.$refs.tree.getNode(val); // 获取节点
      if (!this.checkStrictly && node.childNodes.length > 0) {
        this.treeToList(node).map((item) => {
          if (item.childNodes.length <= 0) {
            this.$refs.tree.setChecked(item, false);
          }
        });
      }
      this.nodeClick();
      this.popoverHide();
    },
    // 下拉框关闭执行
    popoverHide() {
      /** 下拉框气泡关闭后触发事件
       * @event getValue
       * @property {Array} returnDataKeys 选中的keys
       * @property {Array} returnDatas 选中的datas
       */
      this.$emit('getValue', this.returnDataKeys, this.returnDatas);
    },
    // 多选，清空所有勾选
    clearSelectedNodes() {
      var checkedKeys = this.$refs.tree.getCheckedKeys(); // 所有被选中的节点的 key 所组成的数组数据
      for (let i = 0; i < checkedKeys.length; i++) {
        this.$refs.tree.setChecked(checkedKeys[i], false);
      }
    },

    // 树形转为集合
    treeToList(tree) {
      var queen = [];
      var out = [];
      queen = queen.concat(tree);
      while (queen.length) {
        var first = queen.shift();
        if (first.childNodes) {
          queen = queen.concat(first.childNodes);
        }
        out.push(first);
      }
      return out;
    },
    switchTree() {
      return this.buildTree(this.data, this.defaultValue);
    },
    // 将一维的扁平数组转换为多层级对象
    buildTree(data, id) {
      const fa = (needId) => {
        const temp = [];
        for (let i = 0; i < data.length; i++) {
          const n = data[i];
          if (n[this.obj.pid] === needId) {
            n[this.obj.children] = fa(n[this.obj.id]);
            temp.push(n);
          }
        }
        return temp;
      };
      return fa(id);
    }
  }
};
</script>

<template>
  <div ref="popTree" class="select-tree-div">
    <div v-show="isShowSelect" class="mask" />
    <el-popover
      v-model="isShowSelect"
      placement="bottom-start"
      :width="popoverWidth"
      trigger="manual"
      @hide="popoverHide"
    >
      <el-tree
        ref="tree"
        class="common-tree"
        :width="width"
        :data="treeData"
        :props="obj"
        :show-checkbox="multiple"
        :node-key="obj.id"
        :check-strictly="checkStrictly"
        :default-expanded-keys="defaultExpandKeys"
        :expand-on-click-node="multiple && expandClickNode"
        :check-on-click-node="checkClickNode"
        :highlight-current="true"
        @check-change="nodeClick"
        @node-click="nodeClick"
      />
      <el-select
        slot="reference"
        ref="select"
        v-model="returnDataKeys"
        :multiple="multiple"
        :clearable="clearable"
        :collapse-tags="collapseTags"
        class="tree-select"
        :placeholder="placeholder"
        :style="selectStyle"
        @click.native="selectClick"
        @remove-tag="removeTag"
        @clear="clean"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-row>
        <el-button
          v-if="multiple"
          class="ok"
          size="mini"
          type="text"
          @click="isShowSelect = false"
        >确定</el-button>
      </el-row>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.mask {
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 11;
}
.common-tree {
  overflow: auto;
}
.tree-select {
  z-index: 111;
}
.ok {
  float: right;
}
.el-row {
  padding-top: 0px !important;
}
</style>
