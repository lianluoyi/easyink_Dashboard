<!--
 * @Description: 话术管理页面（分组+列表）
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<template>
  <div class="verbal-trick-content-page">
    <div :class="groupData.length ? 'verbal-trick-group' : 'verbal-trick-group empty'">
      <common-tree
        ref="tree"
        :data="groupData.length ? treeData : []"
        class="left-tree"
        node-key="id"
        default-expand-all
        highlight-current
        :props="defaultProps"
      >
        <template slot="empty">
          <empty-default-icon
            text="暂无分组"
          >
            <template slot="customBtn">
              <div v-if="roleKey" class="customBtn">分组用于话术分类，添加话术前先<el-button type="text" @click="addGroup">添加分组</el-button></div>
            </template>
          </empty-default-icon>
        </template>
        <div slot-scope="{ node, data }" class="custom-tree-node" @click.stop="selectGroup(data)">
          <div class="group-left">
            <svg v-if="data.id !== ALL_GROUP_ID" class="icon-folder" :width="20" :height="20">
              <use href="#icon-folder" />
            </svg>
            <span>{{ node.label }}</span>
          </div>
          <span class="right-tool">
            <i
              v-if="data.id === ALL_GROUP_ID && roleKey"
              class="iconfont icon-add"
              title="添加"
              @click.stop="addGroup(data, 0)"
            />
            <el-dropdown v-if="data.id !== ALL_GROUP_ID && roleKey" class="dropdown-list" trigger="click" @command="(command) => handleCommand(command, data)">
              <i
                v-if="roleKey"
                class="iconfont icon-more"
                @click="(e) => e.stopPropagation()"
              />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit"><i class="iconfont el-icon-edit-outline" />编辑</el-dropdown-item>
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
                  <i class="iconfont el-icon-top" />上移</el-dropdown-item>
                <el-dropdown-item
                  command="moveBottom"
                  :disabled="checkLastItem(dealList(data))"
                >
                  <i class="iconfont el-icon-bottom" />下移</el-dropdown-item>
                <el-dropdown-item command="delete"><i class="iconfont el-icon-delete" />删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </div>
      </common-tree>
    </div>
    <VerbalTrickList
      ref="verbalTrickList"
      :type="type"
      :all-group-data="groupData"
      :group-tree-data="treeData"
      :category-ids="categoryIds"
      :role-key="roleKey"
      :selected-group="selectGroupData"
      :handle-get-group="getAllList"
    />
    <GroupModal
      :visible.sync="groupVisible"
      :title="`${groupFromData.id ? '编辑' : '新增'}分组`"
      width="443px"
      :group-data="firstGroup"
      :form-data.sync="groupFromData"
      :type="type"
      :get-list="() => getWordScategoryListByType(type)"
    />
  </div>
</template>
<script>
import { getWordScategoryList, removeGroup, changeGroupSort } from '@/api/wordscategory';
import { VERBAL_TRICK_TYPE } from '@/utils/constant/index';
import GroupModal from './component/groupModal.vue';
import VerbalTrickList from './verbalTrickList.vue';
import { dealChildIdList } from '@/utils/common';
import { checkPermi } from '@/utils/permission';
import CommonTree from '@/components/CommonTree';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';

const ALL_GROUP_ID = '0';
export default {
  name: 'VerbalTrickContent',
  components: { GroupModal, VerbalTrickList, CommonTree, EmptyDefaultIcon },
  props: {
    /**
     * 话术类型
     */
    type: {
      type: Number,
      default: VERBAL_TRICK_TYPE['enterprise']
    }
  },
  data() {
    return {
      groupData: [],
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      // 添加/编辑分组弹窗显示
      groupVisible: false,
      groupFromData: {
        parentId: undefined,
        name: undefined
      },
      ALL_GROUP_ID,
      categoryIds: [],
      roleKey: true,
      selectGroupData: ''
    };
  },
  computed: {
    treeData() {
      const allGroupData = [{ id: ALL_GROUP_ID, name: '全部' }, ...this.groupData];
      return this.handleTree(allGroupData);
    },
    firstGroup() {
      let allGroupData = [...this.groupData];
      allGroupData = allGroupData.filter(item => item.parentId === ALL_GROUP_ID);
      return allGroupData;
    }

  },
  watch: {
    // 切换话术类型
    type(val) {
      if (val !== undefined) {
        this.roleKey = this.verbalTrickManage(val);
        this.getAllList();
      }
    }
  },
  created() {
    this.getAllList();
    this.roleKey = this.verbalTrickManage(this.type);
  },
  mounted() {},
  methods: {
    /**
     * 判断话术管理权限
     */
    verbalTrickManage(type) {
      switch (type) {
        case VERBAL_TRICK_TYPE['enterprise']: {
          return checkPermi(['wecom:corpWords:manage']);
        }
        case VERBAL_TRICK_TYPE['department']: {
          return checkPermi(['wecom:deptWords:manage']);
        }
      }
      return true;
    },
    /**
     * 获取话术分组列表及话术列表
     */
    async getAllList() {
      // 获取分组列表
      const groupRes = await this.getWordScategoryListByType(this.type);
      if (groupRes) {
        this.$refs.tree && this.$refs.tree.$refs.commonTree.setCurrentKey(ALL_GROUP_ID);
        const list = groupRes.map(item => item.id);
        if (list.length === 0) {
          this.$refs.verbalTrickList.list = [];
          return;
        }
        this.categoryIds = [...list];
        // 获取全部话术列表
        this.$refs.verbalTrickList.getAllWordsList({
          categoryIds: list
        });
      }
    },
    /**
     * 选中分组
     */
    selectGroup(data) {
      this.selectGroupData = data.id;
      this.$refs.tree && this.$refs.tree.$refs.commonTree.setCurrentKey(data.id);
      const checkedIds = [];
      if (data.id !== ALL_GROUP_ID) checkedIds.push(data.id);
      if (data.children) {
        data.children.map(item => {
          checkedIds.push(item.id);
          if (item.children) {
            item.children.map(childItem => {
              checkedIds.push(childItem.id);
            });
          }
        });
      }
      this.categoryIds = [...checkedIds];
      this.$refs.verbalTrickList.query.pageNum = 1;
      this.$refs.verbalTrickList.getAllWordsList({
        categoryIds: checkedIds
      });
    },
    /**
     * 获取对应类型的话术列表
     */
    async getWordScategoryListByType(type, params = {}) {
      const wordScategoryRes = await getWordScategoryList({
        type,
        ...params
      });
      if (wordScategoryRes) {
        const wordsList = [...wordScategoryRes.data];
        // 对分组进行排序
        wordsList.sort(function(a, b) {
          return (b.sort - a.sort);
        });
        this.groupData = wordsList;
      }
      return this.groupData;
    },
    addGroup() {
      this.groupVisible = true;
      this.groupFromData = {};
    },
    handleCommand(command, data) {
      switch (command) {
        case 'edit': {
          this.groupVisible = true;
          this.groupFromData = { ...data };
          if (this.groupFromData.parentId === '0') this.groupFromData.parentId = null;
          break;
        }
        case 'delete': {
          this.confirmModal({
            msg: '该分组下分组和话术都将被删除，且不可撤回，是否继续？'
          }, async() => {
            const removeRes = await removeGroup({
              id: data.id
            });
            if (removeRes) {
              this.msgSuccess('删除成功');
              this.getWordScategoryListByType(this.type);
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
     * 修改分组排序
     */
    async changeGroupSort(list) {
      const dealSortList = [...dealChildIdList(list)];
      const changeRes = await changeGroupSort({
        sortList: dealSortList
      });
      if (changeRes) this.getWordScategoryListByType(this.type);
    },
    /**
     * 过滤出对应节点的列表
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
    // 判断是否为最后一个
    checkLastItem(dealObj) {
      return dealObj.index === dealObj.list?.length - 1;
    }
  }

};
</script>
<style scoped lang="scss">
.verbal-trick-content-page {
  display: flex;
  height: 100%;
  .empty{
    display: flex;
    align-items:center;
  }
  .verbal-trick-group {
    background-color: #fff;
    .left-tree {
      width: 300px;
      padding: 10px;
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
/deep/ .el-dropdown-menu__item {
  padding: 0 8px;
}
.customBtn{
  /deep/.el-button{
    font-size: 14px;
  }
}
</style>
