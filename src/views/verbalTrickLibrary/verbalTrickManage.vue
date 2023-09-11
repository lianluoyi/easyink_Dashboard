<!--
 * @Description: 话术管理页面
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="verbal-trick-manage-div">
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="VERBAL_TRICK_TYPE['enterprise']">企业话术</el-radio-button>
        <el-radio-button v-if="showBtn" :label="VERBAL_TRICK_TYPE['department']">部门话术</el-radio-button>
        <el-radio-button v-if="showBtn" :label="VERBAL_TRICK_TYPE['personal']">我的话术</el-radio-button>
      </el-radio-group>
    </div>
    <div class="list-container">
      <VerbalTrickContent v-if="activeName === VERBAL_TRICK_TYPE['enterprise']" :type="activeName" />
      <VerbalTrickContent v-if="activeName === VERBAL_TRICK_TYPE['department']" :type="activeName" />
      <VerbalTrickContent v-if="activeName === VERBAL_TRICK_TYPE['personal']" :type="activeName" />
    </div>
  </div>
</template>
<script>
import { VERBAL_TRICK_TYPE } from '@/utils/constant/index';
import VerbalTrickContent from './verbalTrickContent.vue';
import store from '@/store';
export default {
  name: 'VerbalTrickManage',
  components: { VerbalTrickContent },
  props: {},
  data() {
    return {
      VERBAL_TRICK_TYPE,
      activeName: VERBAL_TRICK_TYPE['enterprise']
    };
  },
  computed: {
    showBtn() {
      const isSuperAdmin = store.getters.isSuperAdmin;
      if (isSuperAdmin) return false;
      return true;
    }
  },
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>员工可在客户端侧边栏【素材库】使用企业话术进行快捷回复</div>
      `
    );
  },
  mounted() {
  },
  methods: {
  }

};
</script>
<style scoped lang="scss">
.verbal-trick-manage-div {
  display: flex;
  flex-direction: column;
  .list-container {
    flex: 1;
    overflow: auto;
  }
}
</style>
