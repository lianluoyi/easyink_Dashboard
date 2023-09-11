<!--
* @Description: 素材库海报列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import MaPage from '@/views/material/components/MaPage';
import Poster from '@/components/MaterialItem/PosterItem.vue';
import { MEDIA_TYPE_POSTER } from '@/utils/constant/index';

export default {
  name: 'PosterList',
  components: { MaPage, Poster },
  data() {
    return {
      // 选中素材详情列表
      selectedMaterialList: [],
      MEDIA_TYPE_POSTER
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
    :type="MEDIA_TYPE_POSTER"
    :selected.sync="selectedMaterialList"
    :select-material="selectMaterial"
  >
    <template v-for="(item, index) in list">
      <Poster
        :key="index"
        :item="item"
        :tool-list="['preview', item.showMaterial ? 'published' : 'publish', 'edit', 'remove']"
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
.img-file-name {
  height: 48px;
  position: relative;
  /deep/ .el-checkbox {
    display: flex;
    width: 100%;
    align-items: center;
    .el-checkbox__input {
      height: 14px;
    }
    .el-checkbox__label {
      flex: 1;
      overflow: hidden;
      display: block;
      div {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
.img-wrap {
  position: relative;
  height: 0;
  padding: 70% 0 0 0;
  border-bottom: 1px solid #e6ebf5;
  &:hover .actions {
    opacity: 1;
  }
}
.actions {
  position: absolute;
  width: 100%;
  height: 50px;
  left: 0;
  top: 0;
  text-align: center;
  color: #fff;
  opacity: 0;
  font-size: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
  .el-icon-edit {
    margin-right: 20px;
  }
}
.el-image {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
}
</style>
