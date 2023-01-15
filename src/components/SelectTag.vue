<script>
import AddTag from '@/components/AddTag';
import { EventBus } from '@/event-bus.js';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
/**
 * 选择标签弹窗
 * @displayName SelectTag(选择标签弹窗)
 */
export default {
  name: 'SelectTag',
  components: { EmptyDefaultIcon, AddTag },
  props: {
    // 添加标签显隐
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择标签'
    },
    selected: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'add'
    },
    infoMsg: {
      type: String,
      default: ''
    },
    addTagFn: {
      type: Function,
      default: () => {}
    },
    removeTags: {
      type: Array,
      default: () => []
    },
    /**
     * 是否必选
     */
    isMandatory: {
      type: Number,
      default: 1
    },
    /**
     * 是否显示添加标签/组按钮
     */
    isShowAdd: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    tagType: {
      type: String,
      default: 'customer'
    }
  },
  data() {
    return {
      list: [],
      listOneArray: [],
      selectedGroup: '', // 选择的标签分组
      removeTag: [],
      Pselected: [],
      dialogVisibleAddTag: false,
      tagName: '',
      // 添加标签表单
      form: {
        groupName: '',
        weTags: []
      }
    };
  },
  computed: {
    Pvisible: {
      get() {
        // this.getTree();
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    filterTagList: {
      get() {
        return this.list.filter(group => this.removeGroupFilterFn(group) && this.groupFilterFn(group));
      }
    }
  },
  watch: {
    selected(val) {
      this.dealSelectTag(val);
    },
    list(val) {
      if (this.type === 'add') {
        this.selected.forEach((element) => {
          const find = this.listOneArray.find((tag) => {
            return element.tagId === tag.tagId;
          });
          find && !this.Pselected.find(select => select.tagId === element.tagId) && this.Pselected.push(find);
        });
      } else if (this.type === 'remove') {
        this.removeTag = this.selected.slice();
        this.Pselected = this.selected.slice();
      }
    },
    Pvisible(val) {
      if (!val) {
        this.Pselected = [];
        this.removeTag = [];
      }
    }
  },
  created() {
    this.getList();
  },
  mounted() {
    EventBus.$on('resetTag', () => {
      this.Pselected = [];
    });
    this.dealSelectTag(this.selected);
  },
  methods: {
    /**
     * 处理显示已选中的标签
     */
    dealSelectTag(val) {
      if (this.type === 'add') {
        val.forEach((element) => {
          const find = this.listOneArray.find((tag) => {
            return element.tagId === tag.tagId;
          });
          find && !this.Pselected.find(select => select.tagId === element.tagId) && this.Pselected.push(find);
        });
      } else if (this.type === 'remove') {
        this.removeTag = val.slice();
        this.Pselected = val.slice();
      } else {
        this.Pselected = [...val];
      }
    },
    getList(addTags) {
      this.$store.dispatch('listInfo/' + (this.tagType === 'customer' ? 'getTagList' : 'getGroupTagList')).then(({ rows, data }) => {
      // this.list = Object.freeze(rows)
        if (this.tagType === 'customer') {
          this.list = rows;
        } else {
          this.list = data.map(tag => ({ ...tag, groupName: tag.name, groupId: tag.id, weTags: tag.tagList.map(item => ({ ...item, tagId: item.id })) }));
        }
        this.listOneArray = [];
        this.list.forEach((element) => {
          element.weTags.forEach((tag) => {
            this.listOneArray.push({
              groupName: element.groupName,
              ...tag
            });
          });
        });
        if (addTags) {
          let index;
          addTags.map((addTag) => {
            index = -1;
            index = this.listOneArray.findIndex((item) => {
              return addTag.groupName === item.groupName && addTag.name === item.name;
            });
            index !== -1 && this.Pselected.push(this.listOneArray[index]);
          });
        }
      });
    },
    submit() {
      if (this.isMandatory && !this.Pselected.length) {
        this.msgError('请至少选择一个标签');
        return;
      }
      this.$emit('success', this.Pselected);
    },
    isChecked(unit) {
      // debugger
      return this.Pselected.some((el) => {
        return unit.tagId === el.tagId;
      });
    },
    toJson(data) {
      return JSON.stringify(data);
    },
    // 过滤remove标签时分组下无标签的分组
    removeGroupFilterFn(group) {
      if (this.type !== 'remove') return true;
      const isGroupInRemoveTag = this.removeTags.find(tag => tag.groupId === group.groupId);
      return isGroupInRemoveTag;
    },
    // 过滤remove标签时不在列表中的标签
    removeTagFilterFn(group) {
      if (this.type !== 'remove') return true;
      const isTagInRemoveTag = this.removeTags.find(tag => tag.tagId === group.tagId);
      return isTagInRemoveTag;
    },
    groupFilterFn(group) {
      const isSelectGroup = this.selectedGroup ? group.groupId === this.selectedGroup : true;
      if (this.tagName) {
        const isTagInSearch = group.weTags.find(ele => ele.name.includes(this.tagName));
        return isTagInSearch && isSelectGroup;
      }
      return isSelectGroup;
    },
    tagFilterFn(tag) {
      if (!this.tagName) return true;
      return tag.name.includes(this.tagName);
    },
    selectOneTag(tag) {
      const index = this.Pselected.findIndex(ele => ele.tagId === tag.tagId);
      if (index === -1) {
        this.Pselected.push(tag);
      } else {
        this.Pselected.splice(index, 1);
      }
    },
    showAddTagDialog(data) {
      this.form = JSON.parse(
        JSON.stringify({ weTags: [], ...data })
      );
      this.dialogVisibleAddTag = true;
    },
    closed() {
      this.tagName = '';
      this.selectedGroup = '';
    }
  }
};
</script>

<template>
  <el-dialog class="tag-dialog" :title="title" :visible.sync="Pvisible" :close-on-click-modal="false" @closed="closed">
    <el-alert
      v-show="infoMsg"
      :title="infoMsg"
      type="info"
      show-icon
      :closable="false"
    />
    <div>
      <div class="search-area">
        <el-select v-model="selectedGroup" clearable filterable placeholder="所有标签组">
          <!-- <el-option label="所有标签" value /> -->
          <el-option
            v-for="(item, index) in list.filter(removeGroupFilterFn)"
            :key="index"
            :label="item.groupName"
            :value="item.groupId"
          />
        </el-select>
        <el-input v-model="tagName" placeholder="请输入标签" clearable :suffix-icon="!tagName ? 'el-icon-search' : ''" />
      </div>
      <div v-if="Pvisible" class="mt20">
        <div class="tag-group-container">
          <empty-default-icon
            :length="filterTagList.length"
          />
          <div v-for="item in filterTagList" :key="item.groupId" class="tag-group">
            <BorderColor class="tag-group-name">{{ item.groupName }}</BorderColor>
            <div class="tag-group-list flex">
              <el-button v-show="type === 'add'" v-hasPermi="['customerManage:tag:edit']" icon="el-icon-plus" @click="addTagFn(item)">添加标签</el-button>
              <el-button v-if="isShowAdd" v-hasPermi="['customerManage:tag:edit']" icon="el-icon-plus" @click="showAddTagDialog(item)">添加标签</el-button>
              <div class="tag-list">
                <el-button v-for="unit in item.weTags.filter(tag => removeTagFilterFn(tag) && tagFilterFn(tag))" :key="unit.tagId" :class="isChecked(unit) ? 'selected' : ''" @click="selectOneTag(unit)">{{ unit.name }}</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <slot />
    </div>
    <div slot="footer">
      <el-button v-show="type === 'add'" v-hasPermi="['customerManage:tag:add']" class="fl" type="primary" icon="el-icon-plus" @click="addTagFn({})">添加标签组</el-button>
      <el-button v-if="isShowAdd" v-hasPermi="['customerManage:tag:add']" class="fl" type="primary" icon="el-icon-plus" @click="showAddTagDialog({})">添加标签组</el-button>
      <el-button @click="Pvisible = false">取 消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">确 定</el-button>
    </div>
    <!-- 添加标签弹窗 -->
    <AddTag
      :visible.sync="dialogVisibleAddTag"
      :is-add-tag="true"
      :tag-type="tagType"
      :form="form"
      @success="getList"
    />
  </el-dialog>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.user-list {
  .el-row {
    line-height: 26px;
  }
}
.mr30 {
  margin-right: 30px;
}
.el-alert {
  border-color: #C4E1DD;
  color: #7F7F7F;
  background: $bgLightBaseColor;
  margin: -15px 0 15px;
}
.search-area {
  display: flex;
  .el-select {
    width: 207px;
    border-radius: 3px 0 0 3px;
  }
  .el-input {
    flex: 1;
    border-radius: 0 3px 3px 0;
  }
}
.tag-group-container {
  max-height: 350px;
  overflow-y: auto;
}
.tag-group {
  margin-bottom: 10px;
  .el-button {
    height: 28px;
    font-size: 12px;
    color: #7F7F7F;
    padding: 7px 10px;
    border-color: #D9D9D9;
    background: #FFFFFF;
    &:hover {
      @include tag_hover_color($color-theme2-1);
    }
    &.selected {
      @include tag_color($color-theme2-1);
    }
  }
}
.tag-group-name {
  border-left-width: 3px;
  border-left-style: solid;
  font-size: 14px;
  color: #606266;
  padding-left: 5px;
  line-height: 20px;
}
.tag-group-list {
  margin-top: 10px;
  >div {
    margin-left: 5px;
    .el-button {
      margin-right: 5px;
      margin-left: unset;
    }
  }
}
.tag-list {
  .el-button {
    margin-bottom: 5px;
  }
}
</style>
