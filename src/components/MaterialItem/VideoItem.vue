<!--
 * @Description: 单个视频样式
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<script>
import TagList from './Taglist.vue';
import MaskItem from './ToolMaskItem.vue';
import { MEDIA_TYPE_VIDEO } from '@/utils/constant';
import { matchDealtagName } from '@/utils/common';
import VideoModal from '@/views/conversation/component/videoModal.vue';
import { onSelectMaterial } from './common';

/**
 * 单个视频样式
 * @displayName Video(单个视频样式)
 */
export default {
  name: 'VideoItem',
  components: { TagList, MaskItem, VideoModal },
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
      MEDIA_TYPE_VIDEO,
      visible: false
    };
  },
  computed: {
    tagList() {
      return matchDealtagName(this.item.tagList || [], this.$store);
    }
  },
  watch: {},
  created() {

  },
  mounted() {},
  methods: {
    onErrorVideo(e) {
      console.log('---视频播放失败', e);
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
      this.visible = true;
      this.$refs.videoModal.play(this.item.materialUrl);
    },
    getList() {
      this.$emit('getList');
    },
    /**
     * 打开素材编辑弹窗
     */
    openMaterialDialog(form) {
      this.$emit('openMaterialDialog', form);
    },
    /**
     * 选择素材
     */
    onSelectMaterial() {
      onSelectMaterial(this.selectedMaterialList, this.item, this.selectMaterial);
    },
    closeModal() {
      this.visible = false;
    }
  }
};
</script>

<template>
  <div class="material-video-container item-container material-item-scss">
    <div class="cover-img">
      <MaskItem
        :tool-list="toolList"
        :selected-material-list="selectedMaterialList"
        :material-item="item"
        :media-type="MEDIA_TYPE_VIDEO"
        @selectMaterial="onSelectMaterial"
        @openMaterialDialog="openMaterialDialog"
        @getList="getList"
        @changeList="changeList"
        @onPreview="onPreview"
      />
      <el-image
        v-if="item.coverUrl"
        :src="item.coverUrl"
      >
        <div slot="error" class="image-slot">
          <svg class="icon-default-video" :width="30" :height="30">
            <use href="#icon-default-video" />
          </svg>
        </div>
      </el-image>
      <video
        v-else
        id="video"
        webkit-playsinline="true"
        playsinline="true"
        :autoplay="false"
        preload="auto"
        :poster="item.coverUrl"
        :src="item.materialUrl"
        @onError="onErrorVideo"
      >
        <!-- <source :src="item.materialUrl" type="video/mp4"> -->
      </video>
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
    <VideoModal v-show="visible" ref="videoModal" @closeModal="closeModal" />
  </div>
</template>

<style lang="scss" src="./common.scss" scoped>
</style>
<style lang="scss" scoped>
.material-video-container {
  width: 200px;
    .cover-img {
        width: 200px;
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        position: relative;
        /deep/ .image-slot {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid $borderColor;
          border-radius: 10px;
        }
        video {
          object-fit: cover;
          height: 100%;
          width: 100%;
          border-radius: 10px;
        }
    }
    /deep/ .el-image {
        img {
            border-radius: 10px;
            max-width: 200px;
            max-height: 200px;
        }
    }
}
</style>

