<!--
 * @Description: 单个海报样式
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import TagList from './Taglist.vue';
import MaskItem from './ToolMaskItem.vue';
import { MEDIA_TYPE_POSTER } from '@/utils/constant';
import { matchDealtagName } from '@/utils/common';
import { onSelectMaterial } from './common';
/**
 * 单个海报样式
 * @displayName Poster(单个海报样式)
 */
export default {
  name: 'PosterItem',
  components: { TagList, MaskItem },
  props: {
    /**
     * 素材数据
     */
    item: {
      type: Object,
      default: () => {}
    },
    /**
     * 是否隐藏发布状态
     */
    hideStatus: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示过期时间
     */
    showExpireTime: {
      type: Boolean,
      default: false
    },
    toolList: {
      type: Array,
      default: null
    },
    /**
     * 设置选中的素材id数组
     */
    selectMaterial: {
      type: Function,
      default: () => {}
    },
    /**
     * 已选中的素材id数组
     */
    selectedMaterialList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      MEDIA_TYPE_POSTER
    };
  },
  computed: {
    tagList() {
      return matchDealtagName(this.item.tagList, this.$store);
    }
  },
  methods: {
    /**
     * 选择素材
     */
    onSelectMaterial() {
      onSelectMaterial(this.selectedMaterialList, this.item, this.selectMaterial);
    },
    /**
     * 打开素材编辑弹窗
     */
    openMaterialDialog(form) {
      this.$emit('openMaterialDialog', form);
    },
    getList() {
      this.$emit('getList');
    },
    /**
     * 修改素材列表数据
     */
    changeList(item) {
      this.$emit('changeList', item);
    },
    /**
     * 预览素材大图
     */
    onPreview() {
      this.$refs['poster-cover'].showViewer = true;
    }
  }
};
</script>

<template>
  <div class="material-poster-container item-container material-item-scss">
    <div class="cover-img">
      <MaskItem
        :tool-list="toolList"
        :selected-material-list="selectedMaterialList"
        :material-item="item"
        :media-type="MEDIA_TYPE_POSTER"
        @selectMaterial="onSelectMaterial"
        @openMaterialDialog="openMaterialDialog"
        @getList="getList"
        @changeList="changeList"
        @onPreview="onPreview"
      />
      <el-image
        ref="poster-cover"
        :key="item.materialUrl"
        :src="item.materialUrl"
        :preview-src-list="[item.materialUrl]"
      >
        <div slot="error" class="image-slot">
          <i class="iconfont icon-default-img" />
        </div>
      </el-image>

      <div class="bottom-desc">
        <TagList :tag-list="tagList" />
        <div v-if="showExpireTime" class="expire-time">
          {{ item.expireTime }} 过期
        </div>
      </div>
    </div>
    <div class="desc">
      <div v-if="item.showMaterial && !hideStatus" class="publish-status">发布</div>
      <div class="file-title inoneline" :title="item.materialName">{{ item.materialName }}</div>
    </div>
  </div>
</template>

<style lang="scss" src="./common.scss" scoped>
</style>
<style lang="scss" scoped>
.material-poster-container {
  width: 200px;
  .cover-img {
    position: relative;
    border-radius: 10px;
    background-color: rgba(240,240,240,0.5);
    width: 200px;
    height: 347px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    .bottom-desc {
      padding: 0 5px;
      bottom: 5px;
    }
    /deep/ .el-image {
      .image-slot {
        height: 347px;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon-default-img {
          font-size: 50px;
        }
      }
    }
  }
  /deep/ .el-image {
      img {
          border-radius: 10px;
          max-width: 200px;
          max-height: 347px;
      }
  }
}
</style>

