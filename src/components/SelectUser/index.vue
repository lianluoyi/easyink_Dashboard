<script>
import { EventBus } from '@/event-bus.js';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import UserTree from './UserTree.vue';
/**
 * 员工选择树弹窗
 * @displayName SelectUser(员工选择树弹窗)
 */
export default {
  name: 'SelectUser',
  components: { EmptyDefaultIcon, UserTree },
  props: {
    // 添加标签显隐
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '组织架构'
    },
    // 警告提示
    alertText: {
      type: String,
      default: ''
    },
    // 警告组件类名
    alertClass: {
      type: String,
      default: ''
    },
    departmentIdKey: {
      type: String,
      default: 'id'
    },
    // 是否允许选择的员工列表为空
    isNull: {
      type: Boolean,
      default: true
    },
    /**
     * 是否显示部门父子联动checkBox
     */
    isDepLinkage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userList: [],
      filterText: '',
      // 是否显示提示语
      showTip: false,
      depLinkage: false
    };
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
        if (!val) { this.$emit('close'); }
      }
    },
    departmentInfo() {
      return this.$store.state.departmentInfo;
    }
  },
  watch: {
    /**
     * 监听选择的员工列表变化
     */
    userList(val) {
      const hasSelectDepart = val.some(item => item[this.departmentIdKey] && !item.userId);
      this.showTip = hasSelectDepart;
    }
  },
  mounted() {
    EventBus.$on('resetUser', this.resetChecked);
  },
  methods: {
    resetChecked() {
      this.userList = [];
      this.$refs.userTree.resetChecked();
    },
    // 确 定
    submit() {
      if (!this.isNull && !this.userList.length) {
        this.msgWarn('请选择使用员工');
        return;
      }
      this.$emit('success', [...this.userList]);
      this.Pvisible = false;
    },
    // 取消选择
    cancle(index) {
      if (index > -1) {
        this.userList.splice(index, 1);
      }
    },
    /**
     * 筛选部门员工树
     */
    async searchList() {
      this.$refs.userTree.searchList();
    },
    /**
     * 修改当前选择的员工回调
     */
    updateUserList(list) {
      this.userList = list;
    }
  }
};
</script>
<template>
  <el-dialog :title="title" :visible.sync="Pvisible" :close-on-click-modal="false" class="dialog-div" append-to-body>
    <el-alert
      v-if="alertText"
      :class="`alert ${alertClass}`"
      :title="alertText"
      type="warning"
      close-text=" "
      show-icon
    />
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="12" :xs="24">
        <div class="head-container">
          <el-input
            v-model="filterText"
            prefix-icon="el-icon-search"
            placeholder="请输入员工姓名，回车搜索"
            @keyup.enter.native="searchList"
          />
          <el-checkbox v-if="isDepLinkage" v-model="depLinkage" class="dep-link mt5 mb5" label="父子联动" />
          <UserTree
            ref="userTree"
            class="select-user-tree"
            v-bind="$attrs"
            :dep-linkage="depLinkage"
            :filter-text="filterText"
            :visible="Pvisible"
            :department-id-key="departmentIdKey"
            @updateUserList="updateUserList"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="12" :xs="24" class="user-list">
        <el-row :gutter="10">
          <div class="user-list-top mb5">
            <span style="line-height: 32px;">选择人员列表
              <el-popover
                v-if="showTip"
                width="267"
                trigger="click"
                placement="top"
                content="若勾选部门，则表示该部门下当前所有员工被选中，不包含子部门的员工。"
              >
                <i slot="reference" class="el-icon-warning cp" style="color: #E65100;" />
              </el-popover>
            </span>
            <el-button @click="resetChecked">一键清空</el-button>
          </div>
        </el-row>
        <empty-default-icon
          text="暂无员工"
          :length="userList.length"
        />
        <div class="selected-list">
          <el-row v-for="(item, index) in userList" :key="index">
            <i :class="`${item.userId ? 'el-icon-user-solid' : 'iconfont icon-folder f14'}`" style="margin-left: 0" />
            {{ item.name }}
            <i
              class="el-icon-minus fr cp"
              title="取消选择"
              @click="cancle(index, item)"
            />
          </el-row>
        </div>
      </el-col>
    </el-row>
    <div slot="footer">
      <slot name="footer">
        <el-button @click="Pvisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </slot>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.head-container {
  >.el-input {
    width: 100%;
    margin-bottom: 5px;
  }
  .dep-link {
   /deep/ .el-checkbox__label {
      font-weight: initial
    }
  }
}
.user-list {
  .el-row {
    line-height: 26px;
  }
}

.user-list-top {
  display: flex;
  justify-content: space-between
}
.alert{
  margin-bottom: .5em;
  margin-top: -1em;
}
.select-user-tree, .selected-list {
  max-height: 500px;
  overflow: auto;
}
.selected-list {
  padding-right: 5px;
}
</style>
