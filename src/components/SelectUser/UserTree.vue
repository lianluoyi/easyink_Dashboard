<!--
 * @Description: 选择员工树
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <common-tree
    ref="tree"
    v-loading="loadingEmployee"
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
        :is-only-click="isOnlyClick"
        :department-id-key="departmentIdKey"
        :is-show-main-dep="isShowMainDep"
        :dep-linkage="depLinkage"
        @getOtherUserList="getOtherUserList"
        @handleUpdateKeyChildren="handleUpdateKeyChildren"
        @dealDepLinkage="dealDepLinkage"
      />
    </div>
  </common-tree>
</template>

<script>
import * as api from '@/api/organization';
import { createUniqueString } from '@/utils';
import { changeDeptTreeData } from '@/utils/common';
import store from '@/store';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { groupBy, cloneDeep } from 'lodash';
import uniqBy from 'lodash/uniqBy';
import differenceBy from 'lodash/differenceBy';
import { USER_AND_DEPARTMENT_LIMIT, IS_ACTIVATE } from '@/utils/constant/index';
// 根部门Id
const DEFAULT_ROOT_DEPARTMENT_ID = '1';
// 根部门父id
const DEFAULT_ROOT_PARENTID = '0';
const USER_PAGE_LIMIT = '1000';
import CommonTree from '@/components/CommonTree';
import UserItem from './UserItem.vue';
export default {
  components: { CommonTree, UserItem, EmptyDefaultIcon },
  props: {
    visible: {
      type: Boolean,
      default: false
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
    checkStrictly: {
      type: Boolean,
      default: true
    },
    departmentIdKey: {
      type: String,
      default: 'id'
    },
    /**
     * 是否部门父子联动
     */
    depLinkage: {
      type: Boolean,
      default: false
    },
    filterText: {
      type: String,
      default: ''
    },
    /**
     * 是否只能点击
     */
    isOnlyClick: {
      type: Boolean,
      default: false
    },
    /**
     * 点击的节点详情
     */
    clickNode: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const isOnlyLeaf = this.isOnlyLeaf;
    const ignorePermission = this.ignorePermission;
    const isSuperAdmin = store.getters.isSuperAdmin;
    return {
      treeData: [],
      // 筛选出来的部门员工树数据
      searchTreeData: [],
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
      allUserList: [],
      moreFlag: 'more-',
      loadingFlag: 'loading-',
      // 正在搜索
      isSearching: false,
      // 是否显示根部门
      isShowMainDep: false,
      userList: [],
      loadingEmployee: false
    };
  },
  computed: {
    departmentInfo() {
      return this.$store.state.departmentInfo;
    }
  },
  watch: {
    // 监听当前窗口是否打开 若清空人员列表点击取消后 再次打开弹窗会出现已选择的人员为空的情况 在窗口打开为userList进行赋值
    visible: {
      handler(val) {
        if (val) {
          this.userList = cloneDeep(this.selectedUserList);
        }
      },
      immediate: true
    },
    filterText(val) {
      if (!val || this.isOnlyClick) {
        this.searchList();
      }
    },
    /**
     * 监听选择的员工列表变化
     */
    userList: {
      handler(val) {
        if (!this.isOnlyClick) {
          this.$emit('updateUserList', val);
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.initGetData();
  },
  methods: {
    /**
     * @description 获取当前部门和当前部门下的部门数据
     */
    getDepItem(depInfo, arr = []) {
      depInfo.children.forEach((item) => {
        if (!item.userId && (item.id)) {
          arr.push(item);
          if (item?.children?.length > 0) {
            this.getDepItem(item, arr);
          }
        }
      });
      return [...arr, depInfo];
    },
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
    setUserIntoFirstDep(firstDepartData, list, _data) {
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
      try {
        this.loadingEmployee = true;
        let data = await this.getTreeList();
        data = this.addChildrenLoading(data);
        const _data = this.handleTreeFilterLoading(data);
        const firstDepartData = _data[0];
        // 当有根部门的时候自动展开
        if ((firstDepartData && firstDepartData.parentId === DEFAULT_ROOT_PARENTID) || (_data.length === 1 && !this.departmentInfo.otherUserListTotal)) {
          this.isShowMainDep = true;
          // 自动展开第一个部门节点
          this.defaultExpandNode = (data && firstDepartData) ? [firstDepartData.key] : [];
          const res = await this.getUserList(firstDepartData && firstDepartData[this.departmentIdKey]);
          const { list } = res;
          // 将一级部门员工塞到部门中并且展示
          this.setUserIntoFirstDep(firstDepartData, list, _data);
          this.treeData = [..._data];
        } else {
          this.treeData = [..._data, ...this.departmentInfo.otherUserList, this.getMoreNodeTreeData(firstDepartData)];
          if (this.departmentInfo.otherUserList.length === this.departmentInfo.otherUserListTotal) {
            this.treeData = this.treeData.filter((item) => !item?.key?.startsWith(this.moreFlag));
          }
        }
        this.loadingEmployee = false;
      } catch (error) {
        this.loadingEmployee = false;
      }
    },
    /**
     * @description 处理需要设置的部门复选框
     * @param nodeInfo 当前节点数据信息
     * @param selectFlag 当前是否是全选 true 全选 false 取消全选
     */
    dealDepLinkage(nodeInfo, selectFlag) {
      // 获取当前部门和当前部门下的子部门
      const nowSelectDepItem = this.getDepItem(nodeInfo);
      if (selectFlag) {
        this.userList = uniqBy([...this.userList, ...nowSelectDepItem], 'id');
      } else {
        this.userList = differenceBy(this.userList, nowSelectDepItem, 'id');
      }
    },
    /**
     * @description 无根部门的情况下获取其他员工
     */
    async getOtherUserList(func) {
      const data = await this.$store.dispatch('GetOtherUserList', {
        isActivate: IS_ACTIVATE,
        lastId: this.departmentInfo.otherUserList[this.departmentInfo.otherUserList.length - 1]?.userId,
        pageSize: USER_AND_DEPARTMENT_LIMIT
      });
      this.treeData = this.treeData.filter((item) => !item?.key?.startsWith(this.moreFlag));
      this.treeData = [...uniqBy([...this.treeData, ...data]), this.getMoreNodeTreeData(this.treeData[0])];
      if (this.departmentInfo.otherUserList.length === this.departmentInfo.otherUserListTotal) {
        this.treeData = this.treeData.filter((item) => !item?.key?.startsWith(this.moreFlag));
      }
      func && func();
    },
    /**
     * @description 获取含有“获取更多”节点
     * @param firstDepartData 第一个部门
     */
    getMoreNodeTreeData(firstDepartData) {
      return {
        key: `${this.moreFlag}${firstDepartData && firstDepartData[this.departmentIdKey]}`,
        mainDepartment: undefined,
        lastId: this.departmentInfo.otherUserList[this.departmentInfo.otherUserList.length - 1]?.userId,
        lastIndex: (firstDepartData?.children?.length || 0) + (this.departmentInfo.otherUserList.length - 1)
      };
    },
    async getTreeList() {
      try {
        const data = await this.$store.dispatch('GetDepartmentList');
        let deptList = cloneDeep(data);
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
      } catch (error) {
        this.msgError('获取部门列表异常');
        return [];
      }
    },
    /**
     * 分批获取获取员工列表
     */
    async getUserList(departmentStr, params = {}) {
      const querys = {
        pageNum: params.lastId ? undefined : 1,
        pageSize: USER_PAGE_LIMIT,
        departmentStr,
        isActivate: IS_ACTIVATE,
        ...params
      };
      const res = await api[this.ignorePermission ? 'getBriefList' : 'getList'](querys);
      const { rows, total } = res;
      // 将员工按照部门分组
      rows.forEach((element) => {
        element.key = createUniqueString();
      });
      this.allUserList = [...rows];
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
      if (this.isOnlyClick) {
        this.$emit('updateUserList', data);
        return;
      }
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
      await this.updateUserList(data[this.departmentIdKey], data);
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
      if (!this.filterText) {
        this.searchTreeData = [];
        this.defaultExpandNode = [];
        this.isSearching = false;
        const depInfo = this.getDepItem(this.treeData[0]).find((item) => item.id === this.clickNode.mainDepartment);
        if (depInfo.parentId !== DEFAULT_ROOT_PARENTID) {
          await this.nodeExpand(depInfo);
        }
        const findNodeKeyByIdItem = this.getNodeItemByUserId(this.treeData).find((item) => item.userId === this.clickNode.userId);
        this.defaultExpandNode = findNodeKeyByIdItem ? [findNodeKeyByIdItem.key] : [this.treeData[0]?.key];
        this.$nextTick(() => {
          this.$refs.tree.$refs.commonTree.setCurrentKey(findNodeKeyByIdItem?.key || this.clickNode.key);
        });
        return;
      }
      const res = await this.getUserList(null, { name: this.filterText, pageNum: undefined, pageSize: undefined });
      // 没有部门的情况
      if (!this.departmentInfo.departmentList.length) {
        this.searchTreeData = [...res.list];
      } else {
        // 有根部门的情况
        if (this.departmentInfo.departmentList[0] === DEFAULT_ROOT_PARENTID) {
          const deptTreeData = this.dealUserIntoDept(res.list);
          this.searchTreeData = [...deptTreeData];
        } else {
        // 没有根部门的情况
        // 先把是部门里面的人塞进对应的部门
          const deptTreeData = this.dealUserIntoDept(res.list);
          // 遍历找到的员工列表 并且判断是否是其他员工(可见范围没有在部门下的人)，若不是其他员工则去除
          const diffOtherUserByRes = res.list.filter((item) => this.departmentInfo.otherUserList.map((item) => item.userId).includes(item.userId));
          this.searchTreeData = [...deptTreeData, ...diffOtherUserByRes];
        }
      }
      // 由于接口只能筛选员工数据，无法筛选部门，所以需要在页面更新后调用树的过滤方法
      this.$nextTick(() => {
        this.$refs.tree.filter(this.filterText);
        const findNodeKeyByIdItem = this.getNodeItemByUserId(this.searchTreeData).find((item) => item.userId === this.clickNode.userId);
        this.$refs.tree.$refs.commonTree.setCurrentKey(findNodeKeyByIdItem);
      });
    },
    /**
     * @description 根据userId获取当前点击的节点
     */
    getNodeItemByUserId(list) {
      const result = [];
      list.forEach(item => {
        if (item.userId) {
          result.push(item);
        }
        if (item.children && item.children.length > 0) {
          result.push(...this.getNodeItemByUserId(item.children));
        }
      });
      return result;
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
