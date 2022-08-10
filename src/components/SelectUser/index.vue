<script>
import * as api from '@/api/organization';
import { createUniqueString } from '@/utils';
import { changeDeptTreeData } from '@/utils/common';
import { EventBus } from '@/event-bus.js';
import store from '@/store';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import CommonTree from '@/components/CommonTree';
import UserItem from './UserItem.vue';
import { groupBy } from 'lodash';

const DEFAULT_ROOT_DEPARTMENT_ID = '1';
const USER_PAGE_LIMIT = '1000';
/**
 * 员工选择树弹窗
 * @displayName SelectUser(员工选择树弹窗)
 */
export default {
  name: 'SelectUser',
  components: { EmptyDefaultIcon, CommonTree, UserItem },
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
    },
    checkStrictly: {
      type: Boolean,
      default: true
    },
    departmentIdKey: {
      type: String,
      default: 'id'
    },
    // 是否允许选择的员工列表为空
    isNull: {
      type: Boolean,
      default: true
    }
    // 是否不禁止选择父节点
    // unDisableParent: {
    //   type: Boolean,
    //   default: false
    // }
  },
  data() {
    const isOnlyLeaf = this.isOnlyLeaf;
    const ignorePermission = this.ignorePermission;
    const isSuperAdmin = store.getters.isSuperAdmin;
    return {
      treeData: [],
      // 筛选出来的部门员工树数据
      searchTreeData: [],
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
          return !!data.userId && !data.totalUserCount;
        }
      },
      defaultExpandNode: [],
      defaultCheckedKeys: [],
      deptList: [],
      rootDeptId: DEFAULT_ROOT_DEPARTMENT_ID, // 最外层部门id
      filterText: '',
      allUserList: [],
      moreFlag: 'more-',
      loadingFlag: 'loading-',
      // 是否显示提示语
      showTip: false,
      // 正在搜索
      isSearching: false
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
    // 监听当前窗口是否打开 若清空人员列表点击取消后 再次打开弹窗会出现已选择的人员为空的情况 在窗口打开为userList进行赋值
    Pvisible(val) {
      if (val) {
        this.userList = this.selectedUserList;
      }
    },
    filterText(val) {
      this.searchTreeData = [];
      this.isSearching = false;
    },
    // 监听不同的敏感词的审计范围人员列表和审计人员
    selectUserList(val) {
      if (val) {
        this.userList = val;
      }
    },
    /**
     * 监听原先已被选择的员工列表变化
     */
    selectedUserList: {
      // 深度监听变化
      handler(curVal, oldVal) {
        if (curVal?.length !== oldVal?.length) {
          this.userList = curVal;
        }
      },
      deep: true,
      immediate: true
    },
    /**
     * 监听选择的员工列表变化
     */
    userList(val) {
      const hasSelectDepart = val.some(item => item[this.departmentIdKey] && !item.userId);
      this.showTip = hasSelectDepart;
    }
  },
  created() {
  },
  mounted() {
    this.initGetData();
    EventBus.$on('resetUser', this.resetChecked);
  },
  methods: {
    /**
     * 由于树组件需要有children才会显示下拉箭头，所以先增加一个假节点
     */
    addChildrenLoading(data) {
      data = data.map(item => {
        if (item.totalUserCount) return { ...item, children: [{ key: `${this.loadingFlag}${item[this.departmentIdKey]}` }] };
        return item;
      });
      return data;
    },
    /**
     * 将员工列表放进树的第一个部门中，并根据情况增加“查看更多”的节点，去除loading假节点
     * @param firstDepartData 第一个部门的数据
     * @param list 员工列表
     * @param _data 当前树数据结构
     */
    setUserIntoTree(firstDepartData, list, _data) {
      // 增加树节点-“查看更多”
      if (USER_PAGE_LIMIT <= list.length) {
        list.push({
          key: `${this.moreFlag}${firstDepartData && firstDepartData[this.departmentIdKey]}`,
          mainDepartment: firstDepartData && firstDepartData[this.departmentIdKey],
          lastId: list[list.length - 1]?.userId,
          lastIndex: (firstDepartData?.children?.length || 0) + (list.length - 1)
        });
      }
      // 获取完员工列表后把loading假节点去掉
      _data[0].children = _data[0].children.filter(item => !item.key.startsWith(this.loadingFlag));
      changeDeptTreeData(_data, firstDepartData && firstDepartData[this.departmentIdKey], list, 'loaded', this.departmentIdKey);
    },
    /**
     * 初始获取部门数据，一级部门的员工列表
     */
    async initGetData() {
      let data = await this.getTreeList();
      data = this.addChildrenLoading(data);
      const _data = this.handleTreeFilterLoading(data);
      const firstDepartData = _data[0];
      // 自动展开第一个部门节点
      this.defaultExpandNode = (data && firstDepartData) ? [firstDepartData.key] : [];
      const res = await this.getUserList(firstDepartData && firstDepartData[this.departmentIdKey]);
      const { list } = res;
      this.setUserIntoTree(firstDepartData, list, _data);
      this.treeData = [..._data];
    },
    // 处理选中的左侧列表复选框
    dealNodeList(val) {
      const defaultCheckedKeys = this.dealSelectUser(this.allUserList, val);
      this.$refs.tree && this.$refs.tree.$refs.commonTree.setCheckedKeys(defaultCheckedKeys);
    },
    async getTreeList() {
      const treeRes = await api.getTree({
        isActivate: 1
      });
      const { data } = treeRes;
      let deptList = [...data];
      deptList = deptList.map(item => {
        return {
          ...item,
          [this.departmentIdKey]: item.id
        };
      });
      this.deptList = [...deptList];
      this.rootDeptId = deptList[0] ? deptList[0][this.departmentIdKey] : this.rootDeptId;
      deptList.forEach((element) => {
        element.key = createUniqueString();
      });
      return deptList;
    },
    /**
     * 分批获取获取员工列表
     */
    async getUserList(departmentStr, params = {}) {
      const querys = {
        pageNum: params.lastId ? undefined : 1,
        pageSize: USER_PAGE_LIMIT,
        departmentStr,
        isActivate: 1,
        ...params
      };
      const res = await api[this.ignorePermission ? 'getBriefList' : 'getList'](querys);
      const { rows, total } = res;
      // 将员工按照部门分组
      rows.forEach((element) => {
        element.key = createUniqueString();
      });
      this.allUserList = [...rows];
      // this.dealSelectUser(this.allUserList, this.selectedUserList);
      return { list: rows, total };
    },
    /**
     * 将已经选择的人员放入userlist
     */
    dealSelectUser(list, selectedUserList) {
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
      this.$refs?.tree?.$refs.commonTree.setCheckedKeys([]);
    },

    // 选择变化
    handleCheckChange(data) {
      if (!data.userId) return;
      const checkedList = [...this.userList];
      const checked = checkedList.some(item => item.userId === data.userId);
      // 单选
      if (this.isSigleSelect) {
        this.userList = [data];
      } else {
        if (!checked) {
          this.userList.push(data);
        } else {
          const index = this.userList.findIndex(ele => (ele.userId === data.userId) || (data[this.departmentIdKey] && ele[this.departmentIdKey] === data[this.departmentIdKey]));
          data.userId && index > -1 && this.userList.splice(index, 1);
        }
      }
    },
    getDeptFromTreeData(tree, deptId) {
      let dept = tree.find(ele => ele[this.departmentIdKey] === deptId);
      if (!dept) {
        for (let i = 0; i < tree.length; i++) {
          const ele = tree[i];
          dept = ele.children && this.getDeptFromTreeData(ele.children, deptId);
          if (dept) break;
        }
      }
      return dept;
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
    cancle(index, item) {
      if (index > -1) {
        this.userList.splice(index, 1);
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.userId && (data.name && data.name.indexOf(value) !== -1);
    },
    /**
     * 展开某节点
     */
    async nodeExpand(data, node) {
      if (data.loaded) return;
      if (this.isSearching) return;
      this.updateUserList(data[this.departmentIdKey], data);
    },
    async updateUserList(departId, data, params) {
      const res = await this.getUserList(departId, params);
      const filterList = data.children?.filter(item => item.userId || item[this.departmentIdKey]) || [];
      const newList = res.list;
      const moreLoadNode = { key: `${this.moreFlag}${data[this.departmentIdKey]}`, mainDepartment: data[this.departmentIdKey], lastId: newList[newList.length - 1]?.userId, lastIndex: filterList.length + newList.length - 1 };
      // 还有下一页数据
      if (USER_PAGE_LIMIT <= res.list.length) {
        this.$set(data, 'children', [...filterList, ...newList, moreLoadNode]);
      } else {
        this.$set(data, 'children', [...filterList, ...newList]);
      }
      this.$set(data, 'loaded', true);
    },
    /**
     * 更新某个节点的子节点数据，可以进行局部刷新
     */
    async handleUpdateKeyChildren(departId, parentKey, params, func) {
      const { lastId, lastIndex } = params;
      const res = await this.getUserList(departId, { lastId });
      const { list, total } = res;
      const parentNode = this.$refs.tree.$refs.commonTree.getNode(parentKey);
      const preList = parentNode?.data?.children || [];
      let newList = [];
      // 部门列表 + 员工列表
      const lastList = preList.slice(0, lastIndex + 1);
      // 查看更多
      const moreItem = preList[lastIndex + 1];
      // 没有下一页数据了
      if (total - list.length <= 0) {
        newList = [...lastList, ...list];
      } else {
        moreItem.lastId = list[list.length - 1]?.userId;
        moreItem.lastIndex = lastList.length + list.length - 1;
        newList = [...lastList, ...list, moreItem];
      }
      this.$refs.tree.$refs.commonTree.updateKeyChildren(parentKey, newList);
      func && func();
    },
    /**
     * 筛选部门员工树
     */
    async searchList() {
      // 如果没有填写要搜索的员工姓名则不进行调用接口搜索，走原先的逻辑
      if (!this.filterText) return;
      this.isSearching = true;
      this.searchTreeData = [];
      const res = await this.getUserList(null, { name: this.filterText, pageNum: undefined, pageSize: undefined });
      const deptTreeData = this.dealUserIntoDept(res.list);
      this.searchTreeData = [...deptTreeData];
      // 由于接口只能筛选员工数据，无法筛选部门，所以需要在页面更新后调用树的过滤方法
      this.$nextTick(() => {
        this.$refs.tree.filter(this.filterText);
      });
    },
    /**
     * 将员工列表塞到treeData中对应的部门
     * @param list 员工列表
     */
    dealUserIntoDept(list) {
      const deptList = [...this.deptList];
      deptList.forEach((element) => {
        element.key = createUniqueString();
      });
      const deptTreeData = this.handleTree(deptList);
      const allUserList = [...list];
      const deptUserListMap = groupBy(allUserList, 'mainDepartment');
      Object.keys(deptUserListMap).forEach(deptId => {
        const userList = deptUserListMap[deptId];
        changeDeptTreeData(deptTreeData, deptId, userList);
      });
      return deptTreeData;
    },
    /**
     * 组装员工部门树，并过滤loading假节点
     */
    handleTreeFilterLoading(data, id, parentId, children) {
      id = id || 'id';
      parentId = parentId || 'parentId';
      children = children || 'children';
      const result = [];
      data = JSON.parse(JSON.stringify(data));
      if (!Array.isArray(data)) {
        return result;
      }
      const map = {};
      data.forEach(item => {
        map[item[id]] = item;
      });
      data.forEach(item => {
        const parent = map[item[parentId]];
        if (parent) {
          const filterList = parent[children]?.filter(item => !item.key.startsWith(this.loadingFlag));
          filterList?.length ? parent[children] : (parent[children] = []);
          parent[children].push(item);
        } else {
          result.push(item);
        }
      });
      return result;
    }
  }
};
</script>
<template>
  <el-dialog :title="title" :visible.sync="Pvisible" :close-on-click-modal="false" class="dialog-div">
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
            placeholder="请输入员工姓名，回车搜索"
            @keyup.enter.native="searchList"
          />
          <common-tree
            ref="tree"
            class="select-user-tree"
            node-key="key"
            accordion
            :data="searchTreeData.length ? searchTreeData : treeData"
            :render-after-expand="false"
            :expand-on-click-node="true"
            :default-expanded-keys="defaultExpandNode"
            :props="defaultProps"
            :filter-node-method="filterNode"
            :check-strictly="checkStrictly"
            icon-class="el-icon-caret-right"
            @node-expand="nodeExpand"
            @node-click="handleCheckChange"
          >
            <template slot="empty">
              <empty-default-icon
                text="暂无员工"
              />
            </template>
            <div slot-scope="{ node, data }" :class="`custom-tree-node ${node.key}`">
              <UserItem
                :node="node"
                :data="data"
                :user-list.sync="userList"
                :more-flag="moreFlag"
                :loading-flag="loadingFlag"
                :is-sigle-select="isSigleSelect"
                :is-only-leaf="isOnlyLeaf"
                :department-id-key="departmentIdKey"
                @handleUpdateKeyChildren="handleUpdateKeyChildren"
              />
            </div>
          </common-tree>
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
