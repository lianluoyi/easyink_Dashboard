<!--
* @Description: 素材库小程序列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->

<script>
import MaPage from '@/views/material/components/MaPage';
import MiniAppItem from '@/components/MaterialItem/MiniAppItem.vue';
import { MEDIA_TYPE_MINIAPP } from '@/utils/constant/index';

export default {
  name: 'MiniAppList',
  components: {
    MaPage,
    MiniAppItem
  },
  data() {
    return {
      // 选中素材详情列表
      selectedMaterialList: [],
      MEDIA_TYPE_MINIAPP
    };
  },
  watch: {},
  created() {},
  methods: {
    /**
     * 选中素材
     */
    selectMaterial(selectedMaterialList) {
      this.selectedMaterialList = selectedMaterialList;
    }
  }
};
</script>

<template>
  <MaPage
    ref="page"
    v-slot="{ list, getList, changeList, edit }"
    :type="MEDIA_TYPE_MINIAPP"
    :selected.sync="selectedMaterialList"
    :select-material="selectMaterial"
  >
    <template v-for="(item, index) in list">
      <MiniAppItem
        :key="index"
        :item="item"
        :tool-list="[item.showMaterial ? 'published' : 'publish', 'edit', 'remove']"
        :selected-material-list="selectedMaterialList"
        :select-material="selectMaterial"
        @openMaterialDialog="edit"
        @getList="getList"
        @changeList="changeList"
      />
    </template>
  </MaPage>
</template>

<style lang="scss" scoped>

</style>
