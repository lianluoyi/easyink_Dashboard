<!--
 * @Description: 素材库图文链接列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import MaPage from '@/views/material/components/MaPage';
import FileItem from '@/components/MaterialItem/FileItem.vue';
import { MEDIA_TYPE_IMGLINK } from '@/utils/constant/index';

export default {
  name: 'GraphicList',
  components: { MaPage, FileItem },
  data() {
    return {
      MEDIA_TYPE_IMGLINK,
      // 选中素材详情列表
      selectedMaterialList: []
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
    :type="MEDIA_TYPE_IMGLINK"
    :selected.sync="selectedMaterialList"
    :select-material="selectMaterial"
  >
    <template v-for="(item, index) in list">
      <FileItem
        :key="index"
        :item="item"
        :tool-list="['preview', item.showMaterial ? 'published' : 'publish', 'edit', 'remove']"
        desc-field="digest"
        :type="MEDIA_TYPE_IMGLINK"
        :selected-material-list="selectedMaterialList"
        :select-material="selectMaterial"
        @openMaterialDialog="edit"
        @getList="getList"
        @changeList="changeList"
      />
    </template>
  </MaPage>
</template>
