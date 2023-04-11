<!--
 * @Description: 单个文件/链接/雷达链接/智能表单样式
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<script>
import TagList from './Taglist.vue';
import { getFileIcon, filterSize, matchDealtagName } from '@/utils/common';
import { ICON_LIST, MEDIA_TYPE_RADARLINK, MEDIA_TYPE_SMARTFORM } from '@/utils/constant';
import MaskItem from './ToolMaskItem.vue';

/**
 * 单个文件/链接/雷达链接样式
 * @displayName FileItem(单个文件/链接样式/雷达链接)
 */
export default {
  name: 'FileItem',
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
     * 摘要显示的字段
     */
    descField: {
      type: String,
      default: ''
    },
    /**
     * 是否显示文件图标
     */
    showIcon: {
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
     * 摘要为显示文件大小
     */
    showFileSize: {
      type: Boolean,
      default: false
    },
    /**
     * 素材类型
     */
    type: {
      type: String,
      default: ''
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
      srcList: [],
      checked: false,
      ICON_LIST,
      MEDIA_TYPE_RADARLINK,
      MEDIA_TYPE_SMARTFORM
    };
  },
  computed: {
    /**
     * 获取文件类型图标class
     */
    getFileIconClass() {
      return getFileIcon(this.item.materialUrl);
    },
    /**
     * 处理摘要显示内容
     */
    descText() {
      if (this.showFileSize) {
        return filterSize(this.item[this.descField]);
      } else {
        return this.item[this.descField];
      }
    },
    /**
     * 显示的标签列表
     */
    tagList() {
      if (this.item.mediaType === Number(MEDIA_TYPE_RADARLINK)) {
        return this.item.radarTagList;
      }
      return matchDealtagName(this.item.tagList || [], this.$store);
    },
    /**
     * 选中素材
     */
    onChecked() {
      return this.selectedMaterialList.some(selectedItem => {
        return this.item.id ? this.item.id === selectedItem.id : this.item.extraId === selectedItem.extraId;
      });
    }
  },
  methods: {
    onCheck() {
      const newIds = [...this.selectedMaterialList];
      const index = this.selectedMaterialList.findIndex(materialItem => this.item.id ? this.item.id === materialItem.id : this.item.extraId === materialItem.extraId);
      if (index > -1) {
        newIds.splice(index, 1);
      } else {
        newIds.push(this.item);
      }
      this.selectMaterial(newIds);
    },
    /**
     * 预览文件
     */
    onPreview() {
      window.open(this.item.materialUrl);
    },
    /**
     * 打开素材编辑弹窗
     */
    openMaterialDialog(form) {
      this.$emit('openMaterialDialog', form);
    },
    /**
     * 获取素材列表
     */
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
  <div :class="'item-container material-file-container material-item-scss' + (onChecked ? ' selected' : '')" @click="() => onCheck()">
    <div class="operate">
      <div class="operate-left">
        <el-checkbox :value="onChecked" @change="() => onCheck()" />
        <!-- 雷达类型 -->
        <div v-if="type === MEDIA_TYPE_RADARLINK" class="inoneline title">
          {{ item.radarTitle }}
        </div>
      </div>
      <MaskItem
        :tool-list="toolList"
        :filemask="true"
        :media-type="type"
        :material-item="item"
        @onPreview="onPreview"
        @openMaterialDialog="openMaterialDialog"
        @getList="getList"
        @changeList="changeList"
      />
    </div>
    <div class="content">
      <div class="desc">
        <div class="left">
          <span class="file-title intwoline" :title="item.materialName">
            <span v-if="item.showMaterial && !hideStatus" class="publish-status">发布</span>
            <span v-if="type !== MEDIA_TYPE_RADARLINK" class="file-name">{{ item.materialName }}</span>
          </span>
          <!-- 雷达类型 -->
          <div v-if="type === MEDIA_TYPE_RADARLINK" class="inoneline title">
            <div class="inoneline title">
              <!-- 链接 标题 -->
              {{ item.title }}
            </div>
            <!-- 链接 摘要 -->
            <div class="desc-text inoneline" :title="descText">{{ item.content }}</div>
          </div>
          <!-- 智能表单类型 -->
          <div v-if="type === MEDIA_TYPE_SMARTFORM" class="title">
            <div class="inoneline title">
              <!-- 链接 标题 -->
              {{ item.formName }}
            </div>
            <!-- 链接 摘要 -->
            <div class="desc-text intwoline" :title="descText">{{ item.description }}</div>
          </div>
          <!-- 普通链接 -->
          <div class="desc-text inoneline" :title="descText">{{ descText }}</div>
        </div>
        <div class="right">
          <!-- 智能表单 -->
          <svg-icon v-if="type === MEDIA_TYPE_SMARTFORM" icon-class="form-preview" class-name="form-preview" />
          <template v-else>
            <svg v-if="showIcon" class="icon" aria-hidden="true" width="50" height="50">
              <use :xlink:href="'#icon-' + getFileIconClass" />
            </svg>
            <el-image v-else :src="item.coverUrl" fit="cover">
              <div slot="error" class="image-slot">
                <svg class="icon-img-link" :width="25" :height="25">
                  <use href="#icon-img-link" />
                </svg>
              </div>
            </el-image>
          </template>

        </div>
      </div>
      <div class="bottom-div">
        <TagList :tag-list="tagList" />
        <div v-if="showExpireTime" class="expire-time-common">
          {{ item.expireTime }} 过期
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./common.scss" scoped>
</style>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.material-file-container {
  width: 228px;
  border: 1px solid $borderColor;
  border-radius: 5px;
  position: relative;
  .operate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    height: 32px;
    border-bottom: 1px solid $borderColor;
    .operate-left {
      display: flex;
      z-index: 998;
      overflow: hidden;
      .title {
        margin-left: 10px;
        width: 200px;
      }
      /deep/ .el-checkbox {
        .el-checkbox__inner {
          height: 16px;
          width: 16px;
        }
      }
    }
  }
  .content {
    padding: 0 10px 10px;
    position: relative;
    height: calc(100% - 32px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .desc {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      .right {
        margin-left: 3px;
        .iconfont {
          font-size: 40px;
        }
        /deep/ .el-image {
          img {
            width: 45px;
            height: 45px;
            border-radius: 3px;
          }
          .image-slot {
            width: 45px;
            height: 45px;
            border: 1px solid $borderColor;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 3px;
          }
        }
      }
      .left {
        flex: 1;
        overflow: hidden;
      }
      .file-title {
        font-size: 14px;
        color: $black;
        word-break: break-all;
        .file-name {
          word-break: break-all;
        }
      }
    }
    .tag-list {
      width: calc(100% - 20px);
    }
  }
  .expire-time-common {
    font-size: 12px;
    color: $grayColor;
    margin-top: 3px;
  }
}
.selected {
  @include border_style(1px);
  .operate {
    @include border_style($direction: bottom);
  }
}
.form-preview {
  width: 45px;
  height: 45px;
  border-radius: 3px;
}
</style>

