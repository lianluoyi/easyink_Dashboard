<!--
 * @Description: 单个小程序样式
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<script>
import TagList from './Taglist.vue';
import MaskItem from './ToolMaskItem.vue';
import { MEDIA_TYPE_MINIAPP } from '@/utils/constant';
import { matchDealtagName } from '@/utils/common';
import { onSelectMaterial } from './common';

/**
 * 单个小程序样式
 * @displayName MiniAppItem(单个小程序样式)
 */
export default {
  name: 'MiniAppItem',
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
    /**
     * 工具栏列表
     */
    toolList: {
      type: Array,
      default: null
    },
    /**
     * 已选中的素材id数组
     */
    selectedMaterialList: {
      type: Array,
      default: () => []
    },
    /**
     * 设置选中的素材id数组
     */
    selectMaterial: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      MEDIA_TYPE_MINIAPP
    };
  },
  computed: {
    tagList() {
      return matchDealtagName(this.item.tagList || [], this.$store);
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
    }
  }
};
</script>

<template>
  <div class="material-miniapp-container item-container material-item-scss">
    <div class="cover-img">
      <MaskItem
        :tool-list="toolList"
        :selected-material-list="selectedMaterialList"
        :material-item="item"
        :media-type="MEDIA_TYPE_MINIAPP"
        @selectMaterial="onSelectMaterial"
        @openMaterialDialog="openMaterialDialog"
        @getList="getList"
        @changeList="changeList"
      />
      <el-image
        fit="contain"
        :src="item.coverUrl"
      >
        <div slot="error" class="image-slot">
          <i class="iconfont icon-mini-app" />
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
.material-miniapp-container {
  width: 200px;
  .cover-img {
    width: 200px;
    height: 160px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
  }
  /deep/ .el-image {
      img {
        border-radius: 10px;
        max-width: 200px;
        max-height: 160px;
      }
      .image-slot {
        width: 200px;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid $borderColor;
        border-radius: 10px;
        .iconfont {
          font-size: 40px;
        }
      }
  }
}
</style>
