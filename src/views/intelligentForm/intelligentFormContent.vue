<!--
 * @Description: 智能表单管理内容区域（分组+列表）
 * @Author: xulinbin
 * @LastEditors: wJiaaa
-->
<template>
  <div class="intelligent-form-content-page">
    <div :class="groupData.length ? 'intelligent-form-group' : 'intelligent-form-group empty'">
      <common-tree
        ref="tree"
        :data="groupData.length ? treeData : []"
        class="left-tree"
        node-key="id"
        default-expand-all
        highlight-current
        :props="defaultProps"
        :expand-on-click-node="false"
      >
        <template slot="empty">
          <empty-default-icon
            text="暂无分组"
          >
            <template slot="customBtn">
              <div v-if="roleKey" class="customBtn">分组用于表单分类，添加表单前先<el-button type="text" @click="addGroup">添加分组</el-button></div>
            </template>
          </empty-default-icon>
        </template>
        <div slot-scope="{ node, data }" class="custom-tree-node" @click.stop="selectGroup(data)">
          <div class="group-left">
            <svg v-if="data.id !== TREE_ALL_GROUP_ID" class="icon-folder" :width="20" :height="20">
              <use href="#icon-folder" />
            </svg>
            <span>{{ node.label }}</span>
          </div>
          <span class="right-tool">
            <i
              v-if="data.id === TREE_ALL_GROUP_ID && roleKey"
              class="iconfont icon-add"
              title="添加"
              @click.stop="addGroup()"
            />
            <el-dropdown v-if="data.id !== TREE_ALL_GROUP_ID && roleKey" class="dropdown-list" trigger="click" @command="(command) => handleCommand(command, data)">
              <i
                v-if="roleKey"
                class="iconfont icon-more"
                @click="(e) => e.stopPropagation()"
              />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="data.parentId === TREE_ALL_GROUP_ID" command="add">
                  <i class="iconfont el-icon-plus" />分组
                </el-dropdown-item>
                <el-dropdown-item command="edit">
                  <i class="iconfont el-icon-edit-outline" />编辑
                </el-dropdown-item>
                <el-dropdown-item
                  command="placedAtTop"
                  :disabled="dealList(data).index === 0"
                >
                  <i class="iconfont icon-placedAtTop" />置顶
                </el-dropdown-item>
                <el-dropdown-item
                  command="moveTop"
                  :disabled="dealList(data).index === 0"
                >
                  <i class="iconfont el-icon-top" />上移
                </el-dropdown-item>
                <el-dropdown-item
                  command="moveBottom"
                  :disabled="checkLastItem(dealList(data))"
                >
                  <i class="iconfont el-icon-bottom" />下移
                </el-dropdown-item>
                <el-dropdown-item command="delete">
                  <i class="iconfont el-icon-delete" />删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </div>
      </common-tree>
    </div>
    <GroupModal
      :visible.sync="groupVisible"
      :title="`${groupFromData.id ? '编辑' : '新增'}分组`"
      width="443px"
      :group-data="filterGroup"
      :form-data.sync="groupFromData"
      :type="type"
      :department-id="departmentId"
      :get-list="(params) => getFormGroupListByType(type, params)"
    />
    <IntelligentFormList
      ref="intelligentFormListRef"
      :type="type"
      :group-tree-data="treeData"
      :role-key="roleKey"
      :selected-group-id="selectGroupDataId"
      :select-group-parent-id="selectGroupParentId"
    />
  </div>
</template>
<script>
import { getGroupTree, removeGroupTreeLeaf, changeGroupTreeSort } from '@/api/form';
import { INTELLIGENT_FORM_TYPE, TREE_ALL_GROUP_ID } from '@/utils/constant/index';
import GroupModal from './groupModal.vue';
import { dealChildIdList } from '@/utils/common';
import { checkPermi } from '@/utils/permission';
import CommonTree from '@/components/CommonTree';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import IntelligentFormList from './intelligentFormList.vue';

export default {
  name: 'IntelligentFormContent',
  components: {
    CommonTree,
    EmptyDefaultIcon,
    GroupModal,
    IntelligentFormList
  },
  props: {
    // 表单类型
    type: {
      type: Number,
      default: INTELLIGENT_FORM_TYPE['enterprise']
    },
    // 部门id
    departmentId: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      // 接口得到的群组树数据
      groupData: [],
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      // 添加/编辑分组弹窗显示
      groupVisible: false,
      // 编辑添加分组表单数据
      groupFromData: {
        // 父分组的Id
        parentId: undefined,
        // 要添加的分组名称
        name: undefined
      },
      // 最外层parentId
      TREE_ALL_GROUP_ID,
      // 权限
      roleKey: true,
      // 选择的分组Id
      selectGroupDataId: undefined,
      // 当前选中分组的父分组
      selectGroupParentId: undefined
    };
  },
  computed: {
    treeData() {
      const allGroupData = [{ id: TREE_ALL_GROUP_ID, name: '全部' }, ...this.groupData];
      return this.handleTree(allGroupData);
    },
    // 过滤掉拼接进去的 "全部"
    filterGroup() {
      let allGroupData = [...this.groupData];
      allGroupData = allGroupData.filter(item => item.parentId === TREE_ALL_GROUP_ID);
      return allGroupData;
    }
  },
  watch: {
    // 切换话术类型
    type(val) {
      if (val !== undefined) {
        this.roleKey = this.formHandlePermission(val);
        // 如果之前有选择分组的话，则不需要另外进行表单列表组件的重新搜索(watch已监听)
        if (val === INTELLIGENT_FORM_TYPE['department']) {
          this.selectGroupDataId ? this.getAllListByParams(true, false) : this.getAllListByParams(true);
        } else {
          this.selectGroupDataId ? this.getAllListByParams(false, false) : this.getAllListByParams();
        }
      }
    },
    departmentId(val) {
      // 如果是部门表单，则切换部门时要重新请求数据
      if (this.type === INTELLIGENT_FORM_TYPE['department']) {
        this.getAllListByParams(true);
      }
    }
  },
  created() {
    this.getAllListByParams(Boolean(this.departmentId));
    this.roleKey = this.formHandlePermission(this.type);
  },
  mounted() {},
  methods: {
    /**
     * @description: 调用getAllList是否传部门id
     * @param {*} hasDepartmentId
     * @param {*} needFormListSearch 是否需要表单组件进行重新查询操作
     * @return {*}
     */
    getAllListByParams(hasDepartmentId, needFormListSearch = true) {
      hasDepartmentId ? this.getAllList({ departmentId: this.departmentId }, needFormListSearch) : this.getAllList({}, needFormListSearch);
    },
    /**
     * 判断智能表单管理权限
     */
    formHandlePermission(type) {
      switch (type) {
        case INTELLIGENT_FORM_TYPE['enterprise']: {
          return checkPermi(['intelligentForm:manage:corp']);
        }
        case INTELLIGENT_FORM_TYPE['department']: {
          return checkPermi(['intelligentForm:manage:dept']);
        }
      }
      return true;
    },
    /**
     * @description: 获取表单分组列表及表单列表
     * @param {*} params
     * @param {*} needFormListSearch 是否需要表单组件进行重新查询操作
     * @return {*}
     */
    async getAllList(params, needFormListSearch = true) {
      // 重置选中分组为"全部"
      this.selectGroupDataId = undefined;
      // 获取分组列表
      this.getFormGroupListByType(this?.type, { ...params });
      if (needFormListSearch) {
        // 获取表单列表 (使用子暴露出来的onSearch)
        await this.$nextTick();
        this.$refs?.intelligentFormListRef?.onSearch(true);
      }
    },
    /**
     * @description: 选中分组
     * @param {*} data
     * @return {*}
     */
    selectGroup(data) {
      this.selectGroupParentId = data.parentId;
      // 选"全部" 则传undefined
      this.selectGroupDataId = data?.id === TREE_ALL_GROUP_ID ? undefined : data?.id;
      // 设置节点的选中状态(否则高亮有bug)
      this.$refs.tree && this.$refs.tree.$refs.commonTree.setCurrentKey(data.id);
    },
    /**
     * @description: 获取对应类型的分组列表
     * @param {*} type
     * @param {*} params
     * @return {*}
     */
    async getFormGroupListByType(type, params) {
      getGroupTree({ sourceType: type, ...params }).then(res => {
        this.groupData = res.data;
      }).catch(() => {
        this.groupData = [];
      });
    },
    /**
     * @description: 添加分组
     * @return {*}
     */
    addGroup() {
      this.groupVisible = true;
      this.groupFromData = {};
    },
    /**
     * @description: 分组菜单操作
     * @param {*} command
     * @param {*} data
     * @return {*}
     */
    handleCommand(command, data) {
      switch (command) {
        case 'add' : {
          this.addGroup();
          // 添加时需要的父节点id即为此刻操作添加的叶子id
          this.groupFromData.parentId = data.id;
          break;
        }
        case 'edit': {
          this.addGroup();
          this.groupFromData = { ...data, isEdit: true };
          // 若是最外层，则把parentId置空
          if (this.groupFromData.parentId === '0') this.groupFromData.parentId = null;
          break;
        }
        case 'delete': {
          this.confirmModal({
            msg: '该分组下分组和表单都将被删除，且不可撤回，是否继续？'
          }, async() => {
            const removeRes = await removeGroupTreeLeaf({
              id: data.id
            });
            if (removeRes) {
              this.msgSuccess('删除成功');
              this.differentGetFormGroupList();
            }
          });
          break;
        }
        case 'placedAtTop': {
          const listInfo = this.dealList(data);
          const list = [...listInfo.list];
          const index = listInfo.index;
          if (index > -1) {
            list.splice(index, 1);
            list.unshift(data);
          }
          this.changeGroupSort(list);
          break;
        }
        case 'moveTop': {
          const listInfo = this.dealList(data);
          const list = [...listInfo.list];
          list.splice(listInfo.index - 1, 0, list.splice(listInfo.index, 1)[0]);
          this.changeGroupSort(list);
          break;
        }
        case 'moveBottom': {
          const listInfo = this.dealList(data);
          const list = [...listInfo.list];
          list.splice(listInfo.index, 0, list.splice(listInfo.index + 1, 1)[0]);
          this.changeGroupSort(list);
          break;
        }
      }
    },
    /**
     * @description: 修改分组排序
     * @param {*} list
     * @return {*}
     */
    async changeGroupSort(list) {
      const dealSortList = [...dealChildIdList(list)];
      const changeRes = await changeGroupTreeSort({
        sortList: dealSortList
      });
      if (changeRes) {
        this.differentGetFormGroupList();
      }
    },
    /**
     * @description: 进行不同表单调用获取分组列表请求
     * @return {*}
     */
    differentGetFormGroupList() {
      this.type === INTELLIGENT_FORM_TYPE['department']
        ? this.getFormGroupListByType(this.type, { departmentId: this.departmentId })
        : this.getFormGroupListByType(this.type);
    },
    /**
     * @description: 过滤出不同层级的叶子列表
     * @param {*} data
     * @return {*}
     */
    dealList(data) {
      let index;
      let list;
      if (data.parentId === '0') {
        list = [...this.treeData[0].children];
        index = list.findIndex(listItem => listItem.id === data.id);
      } else {
        const parentIndex = this.treeData[0].children.findIndex(listItem => listItem.id === data.parentId);
        if (parentIndex > -1) {
          list = [...this.treeData[0].children[parentIndex].children];
          index = list.findIndex(listItem => listItem.id === data.id);
        }
      }
      return { list, index };
    },
    /**
     * @description: 判断是否为最后一个
     * @param {*} dealObj
     * @return {*}
     */
    checkLastItem(dealObj) {
      return dealObj.index === dealObj.list?.length - 1;
    }
  }

};
</script>
<style scoped lang="scss">
.intelligent-form-content-page {
  display: flex;
  height: 100%;
  .empty{
    display: flex;
    align-items:center;
  }
  .intelligent-form-group {
    background-color: #fff;
    .left-tree {
      width: 300px;
      height: 100%;
      padding: 10px;
      /deep/ .common-tree-empty{
        height: 100%;
      }
      .custom-tree-node {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 1;
        .group-left {
          display: flex;
          align-items: center;
          .icon-folder {
            margin-right: 4px;
          }
        }
        .icon-more {
          visibility: hidden;
        }
        &:hover .icon-more{
          visibility: visible;
        }
      }
    }
  }

}
.icon-tool-edit, .icon-tool-delete {
  font-size: 14px;
}
/deep/ .common-tree-content {
  height: 100%;
}
/deep/ .el-tree--highlight-current {
  height: 100%;
  > .el-tree-node {
    height: 100%;
    > .el-tree-node__children {
      height: calc(100% - 30px);
      overflow: scroll;
    }
  }
}

/deep/ .el-dropdown-menu__item {
  padding: 0 8px;
}
.customBtn {
  /deep/ .el-button {
    font-size: 14px;
  }
}
</style>
