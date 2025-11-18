<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { editCustomerEmployCodeTag } from '@/api/drainageCode/staff';
export default {
  name: 'SelectTag',
  components: { EmptyDefaultIcon },
  props: {
    // 添加标签显隐
    visible: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Array,
      default: () => []
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      list: [],
      listOneArray: [],
      selectedGroup: '', // 选择的标签分组
      Pselected: [],
      dialogVisibleAddTag: false,
      tagName: '',
      saveLoading: false
    };
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    filterTagList: {
      get() {
        return this.list.filter(group => this.groupFilterFn(group));
      }
    }
  },
  watch: {
    selected(val) {
      this.Pselected = [];
      this.dealSelectTag(val);
    },
    list() {
      this.selected.forEach((element) => {
        if (!element.tagId) {
          find && !this.Pselected.find(select => !select.tagId && select.groupId === element.groupId) && this.Pselected.push(find);
        } else {
          const find = this.listOneArray.find((tag) => element.tagId === tag.tagId);
          find && !this.Pselected.find(select => select.tagId === element.tagId) && this.Pselected.push(find);
        }
      });
    },
    Pvisible(val) {
      if (!val) {
        this.Pselected = [];
      } else {
        this.list.forEach(group => {
          this.$set(group, 'checked', false);
          group.weTags.forEach(tag => {
            this.$set(tag, 'checked', false);
          });
        });
        this.dealSelectTag(this.selected);
      }
    }
  },
  created() {
    this.getList();
  },
  mounted() {
    this.dealSelectTag(this.selected);
  },
  methods: {
    /**
     * 处理显示已选中的标签
     */
    dealSelectTag(val) {
      val.forEach((element) => {
        if (!element.tagId) {
          const find = this.list.find((tagGroup) => element.groupId === tagGroup.groupId);
          if (find) {
            this.$set(find, 'checked', true);
          }
          find && !this.Pselected.find(select => !select.tagId && select.groupId === element.groupId) && this.Pselected.push(find);
        } else {
          const find = this.listOneArray.find((tag) => element.tagId === tag.tagId);
          if (find) {
            const group = this.list.find((tagGroup) => find.groupId === tagGroup.groupId);
            if (group) {
              const tag = group.weTags.find((tag) => element.tagId === tag.tagId);
              if (tag) {
                this.$set(tag, 'checked', true);
              }
            }
          }
          find && !this.Pselected.find(select => select.tagId === element.tagId) && this.Pselected.push(find);
        }
      });
    },
    getList() {
      this.$store.dispatch('listInfo/getTagList').then(({ rows, data }) => {
        this.list = rows;
        this.listOneArray = [];
        this.list.forEach((element) => {
          element.weTags.forEach((tag) => {
            this.listOneArray.push({
              groupName: element.groupName,
              ...tag
            });
          });
        });
      });
    },
    submit() {
      // 构造请求参数
      const params = {
        selectGroupIdList: [],
        selectTagIdList: []
      };
      this.Pselected.forEach(tag => {
        if (!tag.tagId) {
          params.selectGroupIdList.push(tag.groupId);
        } else {
          params.selectTagIdList.push(tag.tagId);
        }
      });
      this.saveLoading = true;
      editCustomerEmployCodeTag({
        originEmpleId: this.currentRow.id,
        ...params
      }).then(() => {
        this.msgSuccess('设置成功');
        this.$emit('success', this.Pselected);
      }).finally(() => {
        this.saveLoading = false;
      });
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
    handleSelect(tag) {
      const index = this.Pselected.findIndex(ele => {
        if (!tag.tagId) {
          return !ele.tagId && ele.groupId === tag.groupId;
        }
        return ele.tagId === tag.tagId;
      });
      if (index === -1) {
        this.$set(tag, 'checked', true);
        this.Pselected.push(tag);
      } else {
        this.$set(tag, 'checked', false);
        this.Pselected.splice(index, 1);
      }
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    closed() {
      this.tagName = '';
      this.selectedGroup = '';
    },
    handleSelectAll() {
      this.Pselected = [...this.filterTagList];
      this.filterTagList.forEach(item => {
        this.$set(item, 'checked', true);
      });
    },
    handleCommand() {
      this.Pselected = [];
      this.filterTagList.forEach(item => {
        this.$set(item, 'checked', false);
        item.weTags.forEach(tag => {
          this.$set(tag, 'checked', false);
        });
      });
    }
  }
};
</script>

<template>
  <el-dialog title="选择标签" :visible.sync="Pvisible" :close-on-click-modal="false" append-to-body @closed="closed">
    <el-alert
      class="theme-el-alert"
      title="现场人员只可给客户预设以下选中的标签组或标签"
      type="info"
      show-icon
      :closable="false"
    />
    <div>
      <div class="search-area">
        <el-select v-model="selectedGroup" clearable filterable placeholder="所有标签组">
          <el-option
            v-for="(item, index) in list"
            :key="index"
            :label="item.groupName"
            :value="item.groupId"
          />
        </el-select>
        <el-input v-model="tagName" placeholder="请输入标签" clearable :suffix-icon="!tagName ? 'el-icon-search' : ''" />
      </div>
      <el-dropdown class="mt20" @command="handleCommand">
        <span style="cursor: pointer;color:#6BB4AB;" @click="handleSelectAll">
          全选<i class="el-icon-arrow-down el-icon--right" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>全不选</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div v-if="Pvisible" class="mt20">
        <div class="tag-group-container">
          <empty-default-icon
            :length="filterTagList.length"
          />
          <div v-for="item in filterTagList" :key="item.groupId" class="tag-group">
            <el-checkbox v-model="item.checked" :label="item.groupName" @change="handleSelect(item)" />
            <div class="tag-group-list flex">
              <div class="tag-list">
                <el-checkbox
                  v-for="unit in item.weTags.filter(tag => tagFilterFn(tag))"
                  :key="unit.tagId"
                  v-model="unit.checked"
                  style="margin:0 5px 5px 0"
                  border
                  @change="handleSelect(unit)"
                >
                  <span>{{ unit.name }}</span>
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
      <slot />
    </div>
    <div slot="footer">
      <el-button @click="Pvisible = false">取 消</el-button>
      <el-button type="primary" :loading="saveLoading" @click="submit">确 定</el-button>
    </div>
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
.tag-group-list {
  margin-top: 10px;
  margin-left: 20px;
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
