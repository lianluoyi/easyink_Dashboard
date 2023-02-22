<!--
 * @Description: 雷达库
 * @Author: wJiaaa
 * @LastEditors: xulinbin
-->
<template>
  <div class="radar-page">
    <div class="header-radio-group">
      <el-radio-group v-model="activeRadar" class="radio-group-div" size="medium">
        <el-radio-button :label="RADAR_TYPE['enterprise']">企业雷达</el-radio-button>
        <el-radio-button v-if="!isAdmin" :label="RADAR_TYPE['department']">部门雷达</el-radio-button>
        <el-radio-button v-if="!isAdmin" :label="RADAR_TYPE['personal']">我的雷达</el-radio-button>
      </el-radio-group>
    </div>
    <div class="list-container">
      <radarList :active-radar="activeRadar" :role-key="roleKey" />
    </div>
  </div>
</template>

<script>
import radarList from './radarList.vue';
import { RADAR_TYPE } from '@/utils/constant';
import { checkPermi } from '@/utils/permission';
export default {
  name: 'RadarManage',
  components: { radarList },
  data() {
    return {
      RADAR_TYPE,
      activeRadar: RADAR_TYPE['enterprise'],
      roleKey: true
    };
  },
  computed: {
    isAdmin() {
      return this.$store.state.user.isSuperAdmin;
    }
  },
  watch: {
    // 切换雷达类型
    activeRadar(val) {
      this.roleKey = this.radarManage(val);
    }
  },
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>员工可在客户端侧边栏【素材库】、员工活欢迎语等地方使用雷达链接，统计分析客户的访问情况</div>
      `
    );
    this.roleKey = this.radarManage(this.activeRadar);
    // 页面加载时读取radarActive的值
    this.activeRadar = Number(window.sessionStorage.getItem('radarActive')) || RADAR_TYPE['enterprise'];
    window.sessionStorage.removeItem('radarActive');
  },
  methods: {
    /**
     * 判断雷达管理权限
     */
    radarManage(type) {
      switch (type) {
        case RADAR_TYPE['department']: {
          return checkPermi(['radar:department:manage']);
        }
        case RADAR_TYPE['enterprise']: {
          return checkPermi(['radar:corp:manage']);
        }
      }
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
  .radar-page {
    display: flex;
    flex-direction: column;
    .list-container {
      background-color: #FFFFFF;
      flex: 1;
      overflow: auto;
    }
  }
</style>
