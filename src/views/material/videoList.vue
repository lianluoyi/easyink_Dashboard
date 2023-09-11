<script>
import MaPage from '@/views/material/components/MaPage';
import VideoItem from '@/components/MaterialItem/VideoItem.vue';
import { MEDIA_TYPE_VIDEO } from '@/utils/constant/index';

/**
 * 素材库视频列表
 */
export default {
  name: 'VideoList',
  components: {
    MaPage,
    VideoItem
  },
  data() {
    return {
      // 选中素材详情列表
      selectedMaterialList: [],
      MEDIA_TYPE_VIDEO
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
    :type="MEDIA_TYPE_VIDEO"
    :selected.sync="selectedMaterialList"
    :select-material="selectMaterial"
  >
    <template v-for="(item, index) in list">
      <VideoItem
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
.img-wrap {
  position: relative;
  height: 200px;
  &:hover .actions {
    opacity: 1;
  }
}
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
      display: block;
      width: 100%;
      overflow: hidden;
      div {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
.actions {
  position: absolute;
  width: 100%;
  height: 40px;
  left: 0;
  top: 0;
  cursor: default;
  text-align: center;
  color: #fff;
  opacity: 0;
  font-size: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
  .el-icon-edit {
    margin: 0 20px;
  }
}
#video {
  width: 100%;
  height: 100%;
}
</style>
