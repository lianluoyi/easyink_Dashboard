<!-- 角色管理页面 -->
<template>
  <div class="app-container" style="padding-bottom: 0">
    <!--角色列表-->
    <div class="role-left">
      <div class="role-list-div">
        <h3>
          角色（{{ roleList.length }}）
          <i v-hasPermi="['system:role:add']" class="iconfont icon-add" title="新增角色" @click="handleAdd" />
        </h3>
        <ul class="role-list">
          <template v-for="(item, index) in roleList">
            <li
              :key="index"
              :class="['theme-list-hover-color', item.roleId === nowSelectedRole ? 'theme-list-selected-color' : '']"
              @click="selectRole(item.roleId)"
            >
              {{ item.roleName }}
              <i
                v-if="!ROLE_TYPE.includes(item.roleType)"
                v-hasPermi="['system:role:remove']"
                class="iconfont icon-tool-delete"
                @click="handleDelete(item)"
              />
            </li>
          </template>
        </ul>
      </div>
    </div>
    <!--角色详情-->
    <div class="role-right">
      <el-form ref="roleDetailForm" label-width="78px" :model="form" :rules="{}">
        <div class="header">
          <el-form-item label="角色名称" prop="roleName">
            <el-input
              v-model="form.roleName"
              :disabled="ROLE_TYPE.includes(form.roleType)"
              :maxlength="16"
              show-word-limit
              placeholder="请输入角色名称"
              :width="300"
            />
          </el-form-item>
          <el-form-item class="data-scope-div" label="数据权限" prop="dataScope">
            <el-select v-model="form.dataScope" placeholder="请选择">
              <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <SelectTree
              v-if="form.dataScope == 2"
              :check-strictly="true"
              :data="deptOptions"
              :default-key="form.deptIds"
              clearable
              :default-expand-keys="deptOptions[0] && deptOptions[0].id"
              multiple
              @getValue="setTreeMenu"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              :maxlength="64"
              show-word-limit
              placeholder="选填，备注角色分组的依据，以便更好管理"
            />
          </el-form-item>
        </div>
        <div id="role-tree-id" class="role-tree">
          <div class="tree-header">功能权限设置</div>
          <el-table
            ref="roleTreeTable"
            class="tree-table"
            :data="tableData"
            :height="tableHeight"
            border
            style="width: 100%"
            :span-method="objectSpanMethod"
          >
            <el-table-column prop="parentLabel" label="功能菜单" width="180">
              <template slot-scope="scope">
                <el-checkbox
                  :key="scope.row.id"
                  :value="checkData(scope.row.parentId)"
                  @change="(e) => changeCheck('menu', scope.row, e)"
                >
                  {{ scope.row.parentLabel }}
                </el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="label" label="功能模块" width="180">
              <template slot-scope="scope">
                <el-checkbox
                  :key="scope.row.id"
                  :value="checkData(scope.row.id)"
                  @change="(e) => changeCheck('model', scope.row, e)"
                >
                  {{ scope.row.label }}
                </el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="功能点" min-width="180">
              <template slot-scope="scope">
                <el-row :gutter="20" type="“flex”">
                  <template v-for="item in scope.row.children">
                    <el-col :key="item.id" :xl="6" :lg="8" :md="12" :sm="14">
                      <el-checkbox
                        :key="item.id"
                        class="pointer-checkbox"
                        :value="checkData(item.id)"
                        @change="(e) => changeCheck('pointer', item, e)"
                      >
                        {{ item.label }}
                      </el-checkbox>
                    </el-col>
                  </template>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-form-item label=" " class="tool">
          <RequestButton
            v-hasPermi="['system:role:edit']"
            size="small"
            type="primary"
            :request-method="updateRoleInfo"
            button-type="save"
          >保 存</RequestButton>
          <!-- <el-button v-hasPermi="['system:role:edit']" type="primary" size="small" @click="updateRoleInfo">保存</el-button> -->
        </el-form-item>
      </el-form>
    </div>
    <!-- 添加或修改角色配置对话框 -->
    <el-dialog
      class="foot-button-reverse-dialog-wrapper"
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" maxlength="16" show-word-limit />
        </el-form-item>
        <el-form-item label="数据权限">
          <el-select v-model="roleForm.dataScope">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="roleForm.dataScope == 2" v-model="roleForm.dataScopeList" label="">
          <el-tree
            ref="dept"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            check-strictly
            node-key="id"
            empty-text="加载中，请稍后"
            :props="defaultProps"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <RequestButton type="primary" :request-method="submitForm" button-type="submit">确 定</RequestButton>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import { listRole, getRole, delRole, addRole, updateRole } from '@/api/system/role';
import { roleMenuTreeselect } from '@/api/system/menu';
import { treeselect as deptTreeselect } from '@/api/system/dept';
import SelectTree from '@/components/SelectTree';
import { deepClone } from '@/utils';
import { ROLE_IN_USE_CODE } from '@/utils/constant';
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';
import { THIRD_INVISIBLE_MENUS } from '@/utils/constant';

const TABLE_HEIGHT = 650;
// 1： 系统管理员角色（管理员）
// 2： 系统默认角色（部门管理员和员工）
const ROLE_ADMIN = 1;
const ROLE_MANAGE_EMPLOYEE = 2;

export default {
  name: 'Role',
  components: { SelectTree, RequestButton },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 数据范围选项
      dataScopeOptions: [
        {
          value: '1',
          label: '全部数据权限'
        },
        {
          value: '2',
          label: '自定数据权限'
        },
        {
          value: '3',
          label: '本部门数据权限'
        },
        {
          value: '4',
          label: '本部门及以下数据权限'
        },
        {
          value: '5',
          label: '仅本人数据权限'
        }
      ],
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 表单参数
      form: {},
      // 添加角色表单
      roleForm: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 表单校验
      rules: {
        roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      },
      roleInfoDataScopeIds: [],
      nowSelectedRole: '',
      // 角色权限表格字段
      tableData: [],
      customDeptObj: {
        value: '',
        label: ''
      },
      tableHeight: TABLE_HEIGHT,
      checkedKeys: [],
      menuTree: {},
      // 三种默认角色对应的roleType
      // 1： 系统管理员角色（管理员）
      // 2： 系统默认角色（部门管理员和员工）
      // 3： 自定义角色
      ROLE_TYPE: [ROLE_ADMIN, ROLE_MANAGE_EMPLOYEE] // 1: admin, 6: manager, 7: employees
    };
  },
  watch: {
    /**
     * 更改选中的角色
     */
    nowSelectedRole(val) {
      // 获取角色详情
      this.getRoleInfo(val).then((resData) => {
        this.form = resData;
      });
      this.getRoleMenuTreeselect(val);
    }
  },
  created() {
    this.getList(0);
    this.getDicts('sys_normal_disable').then((response) => {
      this.statusOptions = response.data;
    });
    this.getDeptTreeselect();
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>员工可操作菜单和可见数据范围由系统角色决定，系统将根据其所在企业部门和角色自动为新员工初始化系统角色。</div>
        <div>管理员：最顶级部门的上级</div>
        <div>部门管理员：普通部门的上级</div>
        <div>普通员工：部门的普通成员</div>
      `
    );
  },
  methods: {
    /**
     * 合并单元格
     */
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1 || columnIndex === 0) {
        // 当 当前行与上一行内容相同时 返回0 0 意味消除
        if (rowIndex > 0 && row[column.property] === this.tableData[rowIndex - 1][column.property]) {
          return {
            rowspan: 0,
            colspan: 0
          };
        } else {
          let rows = 1;
          // 反之 查询相同的内容有多少行 进行合并
          for (let i = rowIndex; i < this.tableData.length - 1; i++) {
            if (row[column.property] === this.tableData[i + 1][column.property]) {
              rows++;
            }
          }
          // 返回相同内容的行数
          return {
            rowspan: rows,
            colspan: 1
          };
        }
      }
    },
    /** 查询角色列表 */
    getList(selectNum) {
      this.loading = true;
      listRole({}).then((response) => {
        this.roleList = response.rows;
        if (selectNum !== undefined && response.rows[0]) {
          this.nowSelectedRole = response.rows[selectNum].roleId;
        }
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询部门树结构 */
    getDeptTreeselect() {
      if (!this.deptOptions || this.deptOptions.length === 0) {
        deptTreeselect().then((response) => {
          this.deptOptions = response.data;
        });
      }
    },
    // 获取部门权限所有菜单节点数据
    getMenuAllCheckedKeys(ref) {
      // 目前被选中的菜单节点
      const checkedKeys = ref.getHalfCheckedKeys();
      // 半选中的菜单节点
      const halfCheckedKeys = ref.getCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    /**
     * 为菜单树增加父节点信息
     */
    dealTreeData(menus) {
      const newMenus = [];
      menus.map((menuItem) => {
        if (menuItem.children) {
          menuItem.children.map((modelItem) => {
            if (modelItem.children) {
              modelItem.children.map((pointerItem) => {
                pointerItem.parentId = modelItem.id;
              });
            }
            newMenus.push({
              parentLabel: menuItem.label,
              parentId: menuItem.id,
              ...modelItem
            });
          });
        }
      });
      this.tableData = newMenus;
      this.tableData = this.filterMenu(this.tableData);
    },
    /**
     * 多租户版本（第三方应用）屏蔽部分菜单
     */
    filterMenu(treeData) {
      let newTreeData = [...treeData];
      newTreeData = newTreeData.filter((item) => !THIRD_INVISIBLE_MENUS.includes(item.label));
      return newTreeData;
    },
    /**
     * 给树增加子节点id数组
     */
    dealMenuTree(menuList) {
      const menuObj = {};
      const newMenuList = menuList.concat();
      newMenuList.map((menuItem) => {
        const childObj = Object.assign({}, menuItem);
        const childArr = childObj.children ? childObj.children.concat() : [];
        const menuChildIds = [];
        const menuChildObj = {};
        childArr.map((modelItem) => {
          const modelChildIds = [];
          menuChildIds.push(Number(modelItem.id));
          if (modelItem.children) {
            const pointerChildObj = {};
            modelItem.children.map((pointerItem) => {
              modelChildIds.push(Number(pointerItem.id));
              pointerChildObj[pointerItem.id] = pointerItem;
            });
            modelItem['children'] = pointerChildObj;
            modelItem['childIds'] = modelChildIds;
          }
          menuChildObj[modelItem.id] = modelItem;
        });
        childObj['children'] = menuChildObj;
        childObj['childIds'] = menuChildIds;
        menuObj[menuItem.id] = childObj;
      });
      return menuObj;
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      return roleMenuTreeselect(roleId).then((response) => {
        const checkedKeys = [...response.data.checkedKeys];
        this.checkedKeys = checkedKeys;
        const menuList = deepClone(response.data.menus);

        this.menuTree = this.dealMenuTree(menuList);
        this.dealTreeData(response.data.menus);
        return response;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu !== undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.roleForm = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: '0',
        menuIds: [],
        deptIds: [],
        remark: undefined
      };
      this.resetForm('roleForm');
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = '添加角色';
    },
    /**
     * 更新角色详情
     */
    updateRoleInfo() {
      if (this.form.dataScope === '2') this.form.deptIds = this.roleInfoDataScopeIds;
      this.form.menuIds = this.checkedKeys;
      updateRole(this.form).then((response) => {
        changeButtonLoading(this.$store, 'save');
        this.msgSuccess('修改成功');
        this.open = false;
        this.getRoleInfo(this.nowSelectedRole).then((resData) => {
          this.form = resData;
        });
      });
    },
    /** 新增角色 */
    submitForm: function() {
      this.$refs['roleForm'].validate((valid) => {
        if (valid) {
          if (this.roleForm.dataScope === '2') this.roleForm.deptIds = this.getMenuAllCheckedKeys(this.$refs.dept);
          addRole(this.roleForm).then((response) => {
            changeButtonLoading(this.$store, 'submit');
            this.msgSuccess('新增成功');
            this.open = false;
            this.getList();
          });
        } else {
          changeButtonLoading(this.$store, 'submit');
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const roleIds = row.roleId || this.ids;
      this.confirmModal(
        {
          msg: '即将删除角色“' + row.roleName + '”，是否继续？'
        },
        () => {
          return delRole(roleIds)
            .then(() => {
              const num = this.roleList.length;
              // eslint-disable-next-line no-magic-numbers
              this.getList(num - 2);
              this.msgSuccess('删除成功');
            })
            .catch((err) => {
              if (err.code === ROLE_IN_USE_CODE) {
                this.$alert(`有员工使用角色“${row.roleName}”，不可删除`, '操作须知', {
                  confirmButtonText: '我知道了',
                  type: 'warning'
                });
              }
            });
        }
      );
    },
    /**
     * 选中某个角色
     */
    selectRole(roleId) {
      this.nowSelectedRole = roleId;
    },
    /**
     * 获取角色详情
     */
    getRoleInfo(roleId) {
      return getRole(roleId).then((response) => {
        return response.data;
      });
    },
    setTreeMenu(key, data) {
      // 获取子组件值
      this.roleInfoDataScopeIds = key;
    },
    checkData(id) {
      const flag = this.checkedKeys.includes(Number(id));
      return flag;
    },
    /**
     * 选中功能模块下所有功能点
     */
    dealModelChild(checkedKeys, menuObj, checked) {
      let arr = [...checkedKeys];
      for (const modelKey in menuObj) {
        if (menuObj[modelKey].children) {
          if (checked) {
            arr = arr.concat(menuObj[modelKey].childIds);
          } else {
            arr = difference(arr, menuObj[modelKey].childIds);
          }
        }
      }
      return arr;
    },
    /**
     * 处理功能菜单选中状态
     */
    dealMenuCheck(checked, id, menuTree, checkedKeys) {
      let newCheckedKeys = [...checkedKeys];
      const menuObj = menuTree[id];
      let menuChildId = [];
      if (menuObj.childIds && menuObj.childIds.length > 0) {
        menuChildId = [...menuObj.childIds];
      }
      // 勾选
      if (checked) {
        newCheckedKeys.push(id);
        newCheckedKeys = newCheckedKeys.concat(menuChildId);
        newCheckedKeys = this.dealModelChild(newCheckedKeys, menuObj.children, checked);
      } else {
        // 取消勾选
        newCheckedKeys.remove(id);
        newCheckedKeys = difference(newCheckedKeys, menuChildId);
        newCheckedKeys = this.dealModelChild(newCheckedKeys, menuObj.children, checked);
      }
      return newCheckedKeys;
    },
    /**
     * 处理功能模块选中状态
     */
    dealModelCheck(checked, id, parentId, checkedKeys, menuTree) {
      let newCheckedKeys = [...checkedKeys];
      const menuObj = menuTree[parentId];
      // 勾选
      if (checked) {
        // 勾选对应功能模块
        newCheckedKeys.push(id);
        // 勾选上级功能菜单
        newCheckedKeys.push(parentId);
        // 勾选下级所有功能点
        newCheckedKeys = newCheckedKeys.concat(menuObj.children[id].childIds);
      } else {
        // 取消勾选
        newCheckedKeys.remove(id);
        // 勾选下级所有功能点
        newCheckedKeys = difference(newCheckedKeys, menuObj.children[id].childIds);
      }
      return newCheckedKeys;
    },
    /**
     *处理功能点选中状态
     */
    dealPointerCheck(checked, id, parentId, checkedKeys, menuTree) {
      const newCheckedKeys = [...checkedKeys];
      // 勾选
      if (checked) {
        // 勾选对应功能点
        newCheckedKeys.push(id);
        // 勾选对应功能模块
        newCheckedKeys.push(parentId);
        // 勾选上级功能菜单
        for (const menuKey in menuTree) {
          if (menuTree[menuKey].childIds && menuTree[menuKey].childIds.includes(parentId)) {
            newCheckedKeys.push(Number(menuKey));
          }
        }
      } else {
        // 取消勾选
        newCheckedKeys.remove(id);
      }
      return newCheckedKeys;
    },
    /**
     * 勾选/取消勾选选中状态
     * @param checked 勾选状态
     */
    changeCheck(type, item, checked) {
      let id;
      let checkedKeys = [...this.checkedKeys];
      const menuTree = { ...this.menuTree };
      switch (type) {
        // 勾选功能菜单
        case 'menu': {
          id = Number(item.parentId);
          checkedKeys = this.dealMenuCheck(checked, id, menuTree, checkedKeys);
          break;
        }
        // 勾选功能模块
        case 'model': {
          id = Number(item.id);
          const parentId = Number(item.parentId);
          checkedKeys = this.dealModelCheck(checked, id, parentId, checkedKeys, menuTree);
          break;
        }
        // 勾选功能点
        case 'pointer': {
          id = Number(item.id);
          const parentId = Number(item.parentId);
          checkedKeys = this.dealPointerCheck(checked, id, parentId, checkedKeys, menuTree);
          break;
        }
      }
      // 已选菜单id去重
      this.checkedKeys = uniq(checkedKeys);
    }
  }
};
</script>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.app-container {
  padding-left: 0;
  display: inline-block;
  display: -webkit-inline-box;
  .role-left {
    background-color: #fff;
  }
  .role-left {
    width: 250px;
    height: 100%;
    margin-right: 40px;
    .role-list-div {
      height: 100%;
      background-color: #fff;
      .iconfont {
        cursor: pointer;
      }
      h3 {
        margin-bottom: 0px;
        color: #666;
        padding: 20px 30px 20px 20px;
        font-size: 18px;
        -webkit-box-pack: justify;
        justify-content: space-between;
        display: flex;
        -webkit-box-align: center;
        align-items: center;
        border-bottom: 1px solid #d6d6d6;
      }
      .role-list {
        overflow: auto;
        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 30px 14px 20px;
          cursor: pointer;
          span {
            cursor: default;
            color: #333;
          }
          i {
            color: #999;
          }
        }
      }
    }
  }
  .role-right {
    flex: 1;
    /deep/ .el-form {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 10px;
      background-color: #fff;
      margin-bottom: 20px;
      /deep/.el-form-item:nth-of-type(1) {
        .el-input {
          width: 300px;
        }
      }
      .data-scope-div {
        /deep/ .el-form-item__content {
          display: flex;
          align-items: baseline;
          .select-tree-div {
            flex: 1;
            margin-left: 8px;
            .tree-select {
              width: 100%;
            }
          }
        }
      }
    }
    .role-tree {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      .tree-header {
        background-color: #fff;
        padding: 20px;
      }
      .tree-table {
        /deep/ .el-table__body {
          width: 100% !important;
        }
        /deep/.cell {
          padding-left: 20px;
          padding-right: 20px;
        }
        /deep/ .el-table__body-wrapper {
          height: calc(100% - 40px);
        }
      }
      /deep/.el-table__body {
        border-spacing: 0;
        .el-table__row {
          box-shadow: none;
          > td {
            // border-bottom: 0;
            border-bottom: 1px solid #dfe6ec;
          }
        }
      }
    }
    .tool {
      background-color: #fff;
      box-shadow: 0px 0px 4px 0px rgba(198, 198, 198, 0.3);
      display: flex;
      justify-content: center;
      /deep/ .el-form-item__label {
        display: none;
      }
      /deep/ .el-form-item__content {
        margin: 0 !important;
        button {
          width: 68px;
        }
      }
    }
  }
}
</style>
