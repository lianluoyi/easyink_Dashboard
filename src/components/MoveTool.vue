<!--
 * @Description: 移动工具
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<template>
  <div class="tool-div">
    <i
      v-if="showTool.includes('edit')"
      class="iconfont icon-tool-edit"
      title="编辑"
      @click="moveGroup('edit', index, item)"
    />
    <i
      v-if="showTool.includes('placedAtTop')"
      :class="'iconfont icon-placedAtTop' + (index === 0 ? ' disabled-tool' : '')"
      title="置顶"
      @click="moveGroup('placedAtTop', index, item, index === 0)"
    />
    <i
      v-if="showTool.includes('moveTop')"
      :class="'el-icon-top' + (index === 0 ? ' disabled-tool' : '')"
      title="上移"
      @click="moveGroup('moveTop', index, item, index === 0)"
    />
    <i
      v-if="showTool.includes('moveBottom')"
      :class="'el-icon-bottom' + (checkLastItem(index) ? ' disabled-tool' : '')"
      title="下移"
      @click="moveGroup('moveBottom', index, item, checkLastItem(index))"
    />
    <i
      v-if="showTool.includes('remove')"
      class="el-icon-remove-outline"
      title="移除"
      @click="moveGroup('remove', index, item)"
    />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    index: {
      type: Number,
      default: 0
    },
    item: {
      type: Object,
      default: () => {}
    },
    list: {
      type: Array,
      default: () => []
    },
    removeList: {
      type: Array,
      default: () => []
    },
    showTool: {
      type: Array,
      default: () => ['placedAtTop', 'moveTop', 'moveBottom', 'remove']
    },
    /**
     * 是否由外层组件手动移除
     */
    manualRemove: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 移动子分组
     */
    moveGroup(type, index, item, isDisabled) {
      // 不可点击状态下无法触发
      if (isDisabled) return;
      const newList = [...this.list];
      switch (type) {
        case 'edit': {
          this.$emit('handleEdit', item, index);
          break;
        }
        // 置顶
        case 'placedAtTop': {
          newList.splice(index, 1);
          newList.unshift(item);
          break;
        }
        // 上移
        case 'moveTop': {
          newList.splice(index - 1, 0, newList.splice(index, 1)[0]);
          break;
        }
        // 下移
        case 'moveBottom': {
          newList.splice(index, 0, newList.splice(index + 1, 1)[0]);
          break;
        }
        // 移除
        case 'remove': {
          // 触发外部组件的移除方法
          if (this.manualRemove) {
            this.$emit('handleRemove', index, item);
            return;
          }
          newList.splice(index, 1);
          const list = [...this.removeList];
          list.push(item);
          this.$emit('getRemoveList', list);
          break;
        }
      }
      this.$emit('update:list', newList);
    //   this.lowerGroupList = newList;
    },
    // 判断是否为最后一个
    checkLastItem(index) {
      return index === this.list?.length - 1;
    }
  }

};
</script>
<style scoped lang='scss'>
.tool-div {
    width: 178px;
    i {
        font-size: 18px;
        margin-left: 10px;
        cursor: pointer;
    }
    .disabled-tool {
        cursor: not-allowed;
        color: $grayColor;
    }
}
</style>
