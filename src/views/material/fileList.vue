<!--
 * @Description: 素材库文件列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import MaPage from '@/views/material/components/MaPage';
import FileItem from '@/components/MaterialItem/FileItem.vue';
import { MEDIA_TYPE_FILE } from '@/utils/constant/index';

export default {
  name: 'FileList',
  components: { MaPage, FileItem },
  data() {
    return {
      // 选中素材详情列表
      selectedMaterialList: [],
      MEDIA_TYPE_FILE
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
    :type="MEDIA_TYPE_FILE"
    :selected.sync="selectedMaterialList"
    :select-material="selectMaterial"
  >
    <template v-for="(item, index) in list">
      <FileItem
        :key="index"
        :item="item"
        :show-icon="true"
        :tool-list="['download', item.showMaterial ? 'published' : 'publish', 'edit', 'remove']"
        desc-field="content"
        :show-file-size="true"
        :type="MEDIA_TYPE_FILE"
        :selected-material-list="selectedMaterialList"
        :select-material="selectMaterial"
        @openMaterialDialog="edit"
        @getList="getList"
        @changeList="changeList"
      />
    </template>
  </MaPage>
</template>
