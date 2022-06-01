<script>
import * as api from '@/api/organization';
import { createUniqueString } from '@/utils';
import { changeDeptTreeData } from '@/utils/common';
import { EventBus } from '@/event-bus.js';
import store from '@/store';
import { groupBy } from 'lodash';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import CommonTree from '@/components/CommonTree';

const DEFAULT_ROOT_DEPARTMENT_ID = '1';
const USER_PAGE_LIMIT = '999';
/**
 * 员工选择树弹窗
 * @displayName SelectUser(员工选择树弹窗)
 */
export default {
  name: 'SelectUser',
  components: { EmptyDefaultIcon, CommonTree },
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
    // 是否 只选择叶子节点（人员节点）/禁止选择父节点（部门节点）
    isOnlyLeaf: {
      type: Boolean,
      default: true
    },
    // 是否单选
    isSigleSelect: {
      type: Boolean,
      default: false
    },
    selectedUserList: {
      type: Array,
      default: () => []
    },
    // 是否无视权限
    ignorePermission: {
      type: Boolean,
      default: false
    },
    // 警告提示
    alertText: {
      type: String,
      default: ''
    },
    //  编辑时接收已选择的审计范围人员列表 和审计人员列表
    selectUserList: {
      type: Array,
      default: () => []
    }
    // 是否不禁止选择父节点
    // unDisableParent: {
    //   type: Boolean,
    //   default: false,
    // }
  },
  data() {
    const isOnlyLeaf = this.isOnlyLeaf;
    const ignorePermission = this.ignorePermission;
    const isSuperAdmin = store.getters.isSuperAdmin;
    return {
      treeData: [],
      userList: [],
      isSuperAdmin,
      defaultProps: {
        label: 'name',
        children: 'children',
        disabled(data) {
          // 部门
          if (!data.userId) {
            if (isOnlyLeaf) return true;
            return !data.enable && !ignorePermission && !isSuperAdmin;
          }
          // 员工
          return false;
        },
        isLeaf(data, node) {
          return !!data.userId;
        }
      },
      defaultExpandNode: [],
      defaultCheckedKeys: [],
      deptList: [],
      rootDeptId: DEFAULT_ROOT_DEPARTMENT_ID, // 最外层部门id
      filterText: '',
      allUserList: []
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
        if (!val) { this.$emit('close'); }
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    selectedUserList(val) {
      if (val) {
        this.dealNodeList(val);
      }
    },
    // 监听不同的敏感词的审计范围人员列表和审计人员
    selectUserList(val) {
      if (val) {
        this.userList = val;
        this.dealNodeList(val);
      }
    }
  },
  created() {},
  mounted() {
    this.getTreeList();
    EventBus.$on('resetUser', this.resetChecked);
  },
  methods: {
    // 处理选中的左侧列表复选框
    dealNodeList(val) {
      const defaultCheckedKeys = this.dealSelectUser(this.allUserList, val);
      this.$refs.tree && this.$refs.tree.$refs.commonTree.setCheckedKeys(defaultCheckedKeys);
    },
    getTreeList() {
      api.getTree({
        isActivate: 1
      }).then(({ data }) => {
        this.deptList = data;
        this.rootDeptId = data[0] ? data[0].id : this.rootDeptId;
        data.forEach((element) => {
          element.key = createUniqueString();
        });
        const _data = this.handleTree(data);
        this.treeData = _data;
        const departmentIds = data.filter(ele => ele.enable).map(ele => ele.id).join(',');
        this.getUserList(departmentIds);
        this.defaultExpandNode = (data && data[0]) ? [data[0].key] : [];
      });
    },
    getUserList(departmentStr) {
      const querys = {
        pageNum: '1',
        pageSize: USER_PAGE_LIMIT,
        departmentStr,
        isActivate: 1
      };
      api[this.ignorePermission ? 'getBriefList' : 'getList'](querys).then(({ rows }) => {
        // 将员工按照部门分组
        rows.forEach((element) => {
          element.key = createUniqueString();
        });
        this.allUserList = [...rows];
        this.dealSelectUser(this.allUserList, this.selectedUserList);
        const deptUserListMap = groupBy(rows, 'mainDepartment');
        Object.keys(deptUserListMap).forEach(deptId => {
          const userList = deptUserListMap[deptId];
          // 将员工列表塞到treeData中对应的部门
          changeDeptTreeData(this.treeData, deptId, userList);
        });
        // 重新赋值，否则子部门员工无法正常渲染
        this.treeData = [...this.treeData];
      });
    },
    dealSelectUser(list, selectedUserList) {
      // 将已经选择的人员放入userlist
      let tempArr = [];
      this.defaultCheckedKeys = [];
      this.userList = [];
      selectedUserList && selectedUserList.map((user) => {
        if (user && user.businessId) {
          tempArr = list.filter((item) => item.userId === user.businessId);
        } else if (user && user.userId) {
          tempArr = list.filter((item) => item.userId === user.userId);
        } else if (user && user.length > 0) {
          tempArr = list.filter((item) => item.userId === user);
        }
        if (tempArr.length > 0) {
          this.userList.push(tempArr[0]);
          this.defaultCheckedKeys.push(tempArr[0].key);
        }
      });
      return this.defaultCheckedKeys;
    },
    resetChecked() {
      this.userList = [];
      // todo 之后要找是否有更优美的写法
      this.$refs.tree && this.$refs.tree.$refs.commonTree.setCheckedKeys([]);
    },

    handleSingleSelect(data) {
    // 单选情况
      this.$refs.tree.$refs.commonTree.setCheckedKeys([data.key]);
      // if (this.isOnlyLeaf) {
      // this.userList = data.userId ? [data] : []
      // }
      if (data.userId) {
        this.userList = [data];
      }
    },
    /**
    * 只选择叶子节点（人员节点）/禁止选择父节点（部门节点）
    * @param {*} params
    * data: 选中的数据
    * relateDeptList: 部门列表
    */
    handleOnlyLeaf(data) {
      if (data.userId) {
        if (!this.userList.find(ele => ele.userId === data.userId)) {
          this.userList.push(data);
        }
      }
    },
    // 选择变化
    handleCheckChange(data, checked) {
      // debugger
      if (checked) {
        if (this.isSigleSelect) {
          this.handleSingleSelect(data);
        } else {
          if (this.isOnlyLeaf) {
            this.handleOnlyLeaf(data);
          } else {
            if (data.userId) {
              if (!this.userList.find(ele => ele.userId === data.userId)) {
                this.userList.push(data);
              }
            }
          }
        }
      } else {
        const index = this.userList.findIndex(ele => (ele.userId === data.userId) || (data.id && ele.id === data.id));
        data.userId && index > -1 && this.userList.splice(index, 1);
      }
    },
    getDeptFromTreeData(tree, deptId) {
      let dept = tree.find(ele => ele.id === deptId);
      if (!dept) {
        for (let i = 0; i < tree.length; i++) {
          const ele = tree[i];
          dept = ele.children && this.getDeptFromTreeData(ele.children, deptId);
          if (dept) break;
        }
      }
      return dept;
    },
    getChildDeptId(deptId) {
      const arr = this.deptList.filter(ele => ele.parentId === deptId).map(ele => ele.id);
      return arr;
    },
    getAllSubDeptId(deptId) {
      let arr = this.getChildDeptId(deptId);
      let loopList = [...arr];
      while (loopList.length > 0) {
        let subList = [];
        loopList.forEach(subDeptId => {
          const childList = this.getChildDeptId(subDeptId);
          subList = subList.concat(childList);
          arr = arr.concat(childList);
        });
        loopList = [...subList];
      }
      return arr;
    },
    getParentDept(dept) {
      const parent = this.deptList.find(ele => ele.id === dept.parentId);
      return parent;
    },
    getAllParentDept(deptId) {
      const dept = this.deptList.find(ele => ele.id === deptId);
      const arr = [dept];
      let parent = this.getParentDept(dept);
      while (parent.id !== this.rootDeptId) {
        arr.push(parent);
        parent = this.getParentDept(parent);
      }
      return arr;
    },
    // 确 定
    submit() {
      this.$emit('success', [...this.userList]);
      this.Pvisible = false;
    },
    // 取消选择
    cancle(key, item) {
      if (key) {
        this.$refs.tree.$refs.commonTree.setChecked(key, false);
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    }
  }
};
</script>
<template>
  <el-dialog :title="title" :visible.sync="Pvisible" :close-on-click-modal="false">
    <el-alert
      v-if="alertText"
      class="alert"
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
            placeholder="请输入员工姓名"
          />
          <!-- <div>部门架构</div> -->
          <!-- :filter-node-method="filterNode" -->
          <common-tree
            ref="tree"
            :data="treeData"
            class="select-user-tree"
            node-key="key"
            accordion
            show-checkbox
            :default-checked-keys="defaultCheckedKeys"
            :render-after-expand="false"
            :expand-on-click-node="true"
            :default-expanded-keys="defaultExpandNode"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @check-change="handleCheckChange"
          >
            <template slot="empty">
              <empty-default-icon
                text="暂无员工"
              />
            </template>
            <div slot-scope="{ node, data }" class="custom-tree-node">
              <div v-if="data.userId" class="user-info">
                <img class="user-avatar" :src="data.avatarMediaid || require('@/assets/image/card-avatar.svg')">
                <span>{{ node.label }}</span>
              </div>
              <span v-else>{{ node.label }}（{{ data.totalUserCount || 0 }}）</span>
            </div>
          </common-tree>
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="12" :xs="24" class="user-list">
        <el-row :gutter="10">
          <div class="user-list-top mb5">
            <span style="line-height: 32px;">选择人员列表</span>
            <el-button @click="resetChecked">一键清空</el-button>
          </div>
        </el-row>
        <empty-default-icon
          text="暂无员工"
          :length="userList.length"
        />
        <div class="selected-list">
          <el-row v-for="(item, index) in userList" :key="index">

            <i class="el-icon-user-solid" />
            {{ item.name }}
            <i
              class="el-icon-minus fr cp"
              title="取消选择"
              @click="cancle(item.key, item)"
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
}
.user-list {
  .el-row {
    line-height: 26px;
  }
}
.user-info {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}
.user-avatar {
  width: 30px;
  height: 30px;
  margin-right: 10px;
  border-radius: 4px;
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
  max-height: 400px;
  overflow: auto;
}
.selected-list {
  padding-right: 5px;
}
</style>
