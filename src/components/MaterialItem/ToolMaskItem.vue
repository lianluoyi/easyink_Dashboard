<!--
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<script>
import { showMaterialSwitch, removeMaterial, restoreMaterial } from '@/api/material';
import { download } from '@/utils/download';

/**
 * 素材工具蒙版
 */
export default {
  name: 'MaskItem',
  components: {},
  props: {
    /**
     * 是否显示文件类型样式的工具图标
     */
    filemask: {
      type: Boolean,
      default: false
    },
    /**
     * 显示的图标列表
     */
    toolList: {
      type: Array,
      default: () => ['download', 'publish', 'edit', 'remove']
    },
    /**
     * 被选中的素材列表
     */
    selectedMaterialList: {
      type: Array,
      default: () => []
    },
    /**
     * 素材数据详情
     */
    materialItem: {
      type: Object,
      default: () => {}
    },
    /**
     * 素材类型
     */
    mediaType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fileObj: {
        'download': '下载',
        'publish': '发布',
        'published': '已发布',
        'edit': '编辑',
        'remove': '删除',
        'preview': '预览',
        'restore': '恢复'
      }
    };
  },
  computed: {
    /**
     * 处理素材选中状态
     */
    onChecked() {
      return this.selectedMaterialList && this.selectedMaterialList.some(selectedItem => {
        return this.materialItem.id === selectedItem.id;
      });
    }
  },
  watch: {},
  mounted() {},
  methods: {
    /**
     * 处理对应的按钮显示权限
     */
    dealPermission(type) {
      const permissionObj = {
        'edit': 'edit',
        'remove': 'remove',
        'publish': 'publish',
        'published': 'publish'
      };
      const permissionType = permissionObj[type];
      if (permissionType && ['edit', 'remove', 'publish'].includes(permissionType)) {
        const permissionKey = 'wechat:material:' + permissionType;
        return [permissionKey];
      } else {
        return [];
      }
    },
    /**
     * 选中素材
     */
    onSelect() {
      this.$emit('selectMaterial');
    },
    /**
     * 点击图标
     */
    onClickTool(item) {
      switch (item) {
        /**
         * 发布/取消发布
         */
        case 'published':
        case 'publish': {
          this.onPublish();
          break;
        }
        /**
         * 编辑
         */
        case 'edit': {
          this.$emit('openMaterialDialog', this.materialItem);
          break;
        }
        /**
         * 删除
         */
        case 'remove': {
          this.onDelete();
          break;
        }
        /**
         * 预览
         */
        case 'preview': {
          this.$emit('onPreview');
          break;
        }
        /**
         * 下载
         */
        case 'download': {
          download(this.materialItem.materialUrl);
          break;
        }
        /**
         * 恢复
         */
        case 'restore': {
          this.onRestore();
          break;
        }
      }
    },
    /**
     * 发布/取消发布
     */
    onPublish() {
      const showMaterialStatus = !this.materialItem.showMaterial;
      this.confirmModal({
        msg: showMaterialStatus ? '即将发布选中的素材到侧边栏给员工使用，是否继续？' : '将选中的素材从侧边栏【素材库】移除，是否继续？'
      }, async() => {
        const switchRes = await showMaterialSwitch({
          ids: this.materialItem.id,
          showMaterial: showMaterialStatus,
          mediaType: this.mediaType
        });
        if (switchRes) {
          this.msgSuccess(showMaterialStatus ? '已发布到侧边栏【素材库】' : '已取消发布');
          this.$emit('changeList', {
            ...this.materialItem,
            showMaterial: showMaterialStatus
          });
        }
      });
    },
    /**
     * 删除素材
     */
    async onDelete() {
      this.confirmModal({
        msg: '选中素材将被删除，是否继续？'
      }, async() => {
        removeMaterial({
          ids: this.materialItem.id,
          mediaType: this.mediaType
        }).then(res => {
          this.msgSuccess('删除成功');
          this.$emit('getList');
        });
      });
    },
    /**
     * 恢复过期素材
     */
    onRestore() {
      this.confirmModal({
        msg: '即将把过期素材恢复到素材库，如需发布到侧边栏，请在素材库操作，是否继续？'
      }, async() => {
        const restoreRes = await restoreMaterial({
          ids: this.materialItem.id && this.materialItem.id.split(','),
          mediaType: this.mediaType
        });
        if (restoreRes) {
          this.msgSuccess('恢复成功');
          this.$emit('getList');
        }
      });
    }
  }
};
</script>

<template>
  <div class="mask-div" @click="onSelect">
    <div v-if="!filemask" :class="'check-container' + (onChecked ? ' checked-tool' : '')">
      <div class="left-tool">
        <el-checkbox :value="onChecked" @change="onSelect" />
      </div>
    </div>
    <div v-if="filemask" class="file-mask-content">
      <div class="operate-right">
        <template v-for="(item, index) in toolList">
          <i
            v-if="fileObj[item]"
            :key="index"
            v-hasPermi="dealPermission(item)"
            :class="'iconfont icon-' + item"
            :title="fileObj[item]"
            @click.stop="onClickTool(item)"
          />
        </template>
      </div>
    </div>
    <div v-else class="mask-content">
      <div class="right-tool">
        <template v-for="(item, index) in toolList">
          <div :key="index" v-hasPermi="dealPermission(item)" class="tool-item" @click.stop="onClickTool(item)">
            <i v-if="fileObj[item]" :class="'iconfont icon-' + item" :title="fileObj[item]" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.mask-div {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 997;
    top: 0;

    .checked-tool {
      visibility: visible !important;
    }
    .mask-content {
        visibility: hidden;
        display: flex;
        padding: 10px;
        justify-content: flex-end;
        height: 100%;
        width: 100%;
        background-color: rgba(170, 170, 170, 0.25);
        border-radius: 10px;
        .tool-item {
            background-color: #fff;
            border-radius: 5px;
            height: 30px;
            width: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 5px;
            .iconfont {
                cursor: pointer;
                margin: 0;
            }
        }
    }
    .check-container {
        height: 32px;
        position: absolute;
        padding: 10px;
        visibility: hidden;
        .left-tool {
          /deep/ .el-checkbox {
              .el-checkbox__inner {
                  width: 16px;
                  height: 16px;
              }
          }
        }
    }
    .file-mask-content {
        visibility: hidden;
        width: calc(100% - 10px);
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .iconfont {
            margin: 0 10px 0 0;
            cursor: pointer;
        }
    }
    .icon-published {
      @include text_btn_color($color-theme2-1);
    }
    &:hover .mask-content {
        visibility: visible;
    }
    &:hover .file-mask-content {
        visibility: visible;
    }
    &:hover .check-container {
        visibility: visible;
    }
}
</style>

