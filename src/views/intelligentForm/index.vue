<!--
 * @Description: 智能表单管理页面
 * @Author: xulinbin
 * @LastEditors: wJiaaa
-->
<template>
  <div class="intelligent-form-div">
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="INTELLIGENT_FORM_TYPE['enterprise']">企业表单</el-radio-button>
        <el-radio-button v-if="showBtn" :label="INTELLIGENT_FORM_TYPE['department']">部门表单</el-radio-button>
        <el-radio-button v-if="showBtn" :label="INTELLIGENT_FORM_TYPE['personal']">我的表单</el-radio-button>
      </el-radio-group>
      <div v-if="activeName === INTELLIGENT_FORM_TYPE['department']" class="department-select">
        <SelectTree
          :check-strictly="true"
          :data="departmentOptions"
          :default-key="departmentSelect"
          placeholder="请选择部门"
          :obj="treePorps"
          @getValue="setTreeMenu"
        />
      </div>
    </div>
    <div class="list-container">
      <IntelligentFormContent :type="activeName" :department-id="departmentSelect" />
    </div>
  </div>
</template>
<script>
import { INTELLIGENT_FORM_TYPE } from '@/utils/constant';
import IntelligentFormContent from './intelligentFormContent.vue';
import { getUserInfo } from '@/api/system/staff';
import SelectTree from '@/components/SelectTree';
import store from '@/store';
// 树节点配置
const treePorps = {
  id: 'id',
  label: 'name',
  children: 'children',
  path: 'path',
  content: 'content',
  pid: 'parentId'
};
export default {
  name: 'IntelligentForm',
  components: {
    IntelligentFormContent,
    SelectTree
  },
  props: {},
  data() {
    return {
      INTELLIGENT_FORM_TYPE,
      activeName: INTELLIGENT_FORM_TYPE['enterprise'],
      // 部门的选项
      departmentOptions: [],
      // 选择的部门
      departmentSelect: undefined,
      // 用户所属部门名
      userDepartmentName: undefined,
      treePorps
    };
  },
  provide() {
    return {
      getDepartmentId: this.getDepartmentId
    };
  },
  computed: {
    /**
     * @description: 是否展示单选tab (admin 账号只有企业表单)
     * @return {*}
     */
    showBtn() {
      const isSuperAdmin = store.getters.isSuperAdmin;
      if (isSuperAdmin) return false;
      return true;
    }
  },
  watch: {
    activeName(val, oldVal) {
      if (val === INTELLIGENT_FORM_TYPE['department'] && (!this.departmentOptions || this.departmentOptions.length === 0)) {
        this.getDepartmentTree();
      }
    }
  },
  async created() {
    // 页面加载时读取radarActive的值
    this.activeName = Number(window.sessionStorage.getItem('intelligent_form_active')) || INTELLIGENT_FORM_TYPE['enterprise'];
    window.sessionStorage.removeItem('intelligent_form_active');
    await this.getMyDepartmentId();
  },
  methods: {
    /**
     * @description: 获取部门树结构
     * @return {*}
     */
    async getDepartmentTree() {
      const data = await this.$store.dispatch('GetOrUpdateDepartmentList');
      const departmentId = this.getDepartmentId();
      const index = data?.findIndex(item => item.id === departmentId);
      let newData = data;
      // 如果部门树中没有则给树的最上方添加上该部门
      if (index < 0) {
        const selfNode = {
          children: [],
          id: departmentId,
          name: this.userDepartmentName || '所处部门',
          parentId: '0'
        };
        newData = [
          selfNode,
          ...newData
        ];
      }
      const treeData = this.handleTree(newData);
      this.departmentOptions = treeData;
      let intelligentFormDepartmentId = window.sessionStorage.getItem('intelligent_form_department_id');
      // 防止初始化部门id为undefined 缓存取出时为字符串导致接口报错
      intelligentFormDepartmentId = intelligentFormDepartmentId === 'undefined' ? undefined : intelligentFormDepartmentId;
      this.departmentSelect = intelligentFormDepartmentId || this.departmentSelect;
      window.sessionStorage.removeItem('intelligent_form_department_id');
    },
    // 当前账号所属的部门
    async getMyDepartmentId() {
      const userRes = await getUserInfo({ userId: this.$store.getters?.userId });
      if (!userRes?.data || !userRes?.data?.department) return false;
      const { data: { department, departmentName }} = userRes;
      this.departmentSelect = department?.length && department[department.length - 1];
      this.userDepartmentName = departmentName;
    },
    getDepartmentId() {
      return this.departmentSelect;
    },
    /**
     * @description: 部门树的选择
     * @param {*} key
     * @param {*} data
     * @return {*}
     */
    setTreeMenu(key, data) {
      this.departmentSelect = key;
    }
  }
};
</script>
<style scoped lang="scss">
.intelligent-form-div {
  display: flex;
  flex-direction: column;
  .list-container {
    flex: 1;
    overflow: auto;
  }
}
</style>
