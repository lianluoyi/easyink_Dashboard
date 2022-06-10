<script>
import Poster from '@/components/MaterialItem/PosterItem.vue';
import MiniAppItem from '@/components/MaterialItem/MiniAppItem.vue';
import VideoItem from '@/components/MaterialItem/VideoItem.vue';
import FileItem from '@/components/MaterialItem/FileItem.vue';
import {
  MEDIA_TYPE_POSTER,
  MEDIA_TYPE_IMGLINK,
  MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_MINIAPP,
  MEDIA_TYPE
} from '@/utils/constant';
import { restoreMaterial, removeMaterial } from '@/api/material';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { getCategoryList } from '@/utils/material';

/**
 * 素材列表抽屉
 */
export default {
  name: 'MaterialListDrawer',
  components: { Poster, MiniAppItem, VideoItem, FileItem, EmptyDefaultIcon },
  props: {
    drawerTitle: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    },
    getList: {
      type: Function,
      default: () => {}
    },
    posterToolList: {
      type: Array,
      default: null
    },
    imgLinkToolList: {
      type: Array,
      default: null
    },
    videoToolList: {
      type: Array,
      default: null
    },
    fileToolList: {
      type: Array,
      default: null
    },
    miniappToolList: {
      type: Array,
      default: null
    },
    query: {
      type: Object,
      default: () => {}
    },
    total: {
      type: Number,
      default: 0
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    subTitle: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'search' // search 查询过期素材 select 筛选素材
    },
    limitSelectLength: {
      type: Number,
      default: null
    },
    materialType: {
      type: String,
      default: MEDIA_TYPE_POSTER
    },
    showExpireTime: {
      type: Boolean,
      default: true
    },
    emptyExpireList: {
      type: Function,
      default: () => {}
    },
    // 判断是否来自朋友圈
    moment: {
      type: Boolean,
      default: false
    },
    // 判断来自朋友圈的素材类型
    momentType: {
      type: String,
      default: MEDIA_TYPE_POSTER
    }
  },
  data() {
    return {
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_MINIAPP,
      activeName: this.materialType,
      MEDIA_TYPE,
      tagIdList: [],
      // 选中素材详情列表
      selectedMaterialList: []
    };
  },
  computed: {
    drawerVisible: {
      get() {
        // this.getTree();
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    /**
     * 获取所有素材标签列表
     */
    allTagList() {
      const allTagObj = this.$store.state.materialInfo && this.$store.state.materialInfo.allTagObj;
      const allTagList = Object.values(allTagObj);
      return allTagList;
    }
  },
  watch: {
    // 监听选择素材类型
    momentType(val) {
      this.query.mediaType = val;
      this.query.pageNum = 1;
      if (val === MEDIA_TYPE_IMGLINK) {
        this.query.mediaType = MEDIA_TYPE_POSTER;
        this.activeName = MEDIA_TYPE_POSTER;
        this.getList({
          mediaType: MEDIA_TYPE_POSTER
        });
      } else {
        this.activeName = val;
        this.getList({
          mediaType: val
        });
      }
    },
    /**
     * 选择素材个数更改监听
     */
    selectedMaterialList(val) {
      this.$emit('changeSelectedMaterialNum', val.length);
    },
    materialType(val) {
      this.activeName = val;
      this.query.pageNum = 1;
      this.getList({
        mediaType: val
      });
    }
  },
  created() {},
  mounted() {
    // 获取素材分类列表
    getCategoryList(this.$store);
  },
  methods: {
    handleClose() {
      this.drawerVisible = false;
      this.tagIdList = [];
      this.query.search = '';
      this.query.pageNum = 1;
    },
    /**
     * 重置查询条件
     */
    resetQuery() {
      this.tagIdList = [];
      this.query.search = '';
      this.query.pageNum = 1;
      this.onSearch();
    },
    /**
     * 切换素材类型
     */
    changeTab() {
      if (this.type === 'search') {
        this.selectedMaterialList = [];
        this.$emit('emptyExpireList');
      }
      this.getList({
        mediaType: this.activeName
      });
      this.$emit('update:materialType', this.activeName);
      this.query.pageNum = 1;
      this.query.mediaType = this.activeName;
    },
    onSearch() {
      this.getList({
        pageNum: 1,
        tagIds: this.tagIdList && this.tagIdList.join(',')
      });
      this.$emit('changeTagIdList', this.tagIdList);
    },
    /**
     * 选中素材
     */
    selectMaterial(selectedMaterialList) {
      this.selectedMaterialList = selectedMaterialList;
    },
    /**
     * 全选
     */
    selectAll(flag) {
      if (flag) {
        this.selectedMaterialList = [];
      } else {
        const nowList = [...this.list];
        this.selectedMaterialList = nowList;
      }
    },
    /**
     * 批量恢复
     */
    batchRestore(callback) {
      if (!this.checkSelectedNum()) return;
      this.confirmModal(
        {
          msg: '即将把过期素材恢复到素材库，如需发布到侧边栏，请在素材库操作，是否继续？'
        },
        async() => {
          const idList = this.dealIdsList();
          const restoreRes = await restoreMaterial({
            ids: idList,
            mediaType: this.activeName
          });
          if (restoreRes) {
            this.msgSuccess('恢复成功');
            this.getAndClearSelected();
            callback();
          }
        }
      );
    },
    /**
     * 彻底删除
     */
    completeDelete(callback) {
      if (!this.checkSelectedNum()) return;
      this.confirmModal(
        {
          msg: '选中素材将被删除，是否继续？'
        },
        async() => {
          const idList = this.dealIdsList();
          const removeRes = await removeMaterial({
            ids: idList.join(','),
            mediaType: this.activeName
          });
          if (removeRes) {
            this.msgSuccess('删除成功');
            this.getAndClearSelected();
            callback();
          }
        }
      );
    },
    dealIdsList() {
      const idList = [];
      this.selectedMaterialList.map((item) => {
        idList.push(item.id);
      });
      return idList;
    },
    checkSelectedNum() {
      if (this.selectedMaterialList.length === 0) {
        this.msgWarn('请至少选择一个素材');
        return false;
      }
      return true;
    },
    /**
     * 翻页
     */
    getAndClearSelected() {
      this.type === 'search' && (this.selectedMaterialList = []);
      this.getList({});
    },
    submit() {
      if (typeof this.limitSelectLength === 'number' && this.selectedMaterialList.length > this.limitSelectLength) {
        this.msgInfo(`最多支持再发送${this.limitSelectLength}个附件，请重新选择`);
        return;
      }
      this.drawerVisible = false;
      this.$emit('submit', this.selectedMaterialList);
      this.selectedMaterialList = [];
    }
  }
};
</script>

<template>
  <el-drawer
    class="material-list-drawer"
    :title="drawerTitle"
    :visible.sync="drawerVisible"
    :before-close="handleClose"
    :append-to-body="true"
  >
    <div class="sub-title">{{ subTitle }}</div>
    <div class="drawer-container">
      <div class="tab-container">
        <el-radio-group v-model="activeName" class="radio-group-div" size="medium" @change="changeTab">
          <el-radio-button
            :label="MEDIA_TYPE_POSTER"
            :disabled="moment && momentType === MEDIA_TYPE_VIDEO"
          >海报</el-radio-button>
          <el-radio-button :label="MEDIA_TYPE_IMGLINK" :disabled="moment">链接</el-radio-button>
          <el-radio-button
            :label="MEDIA_TYPE_VIDEO"
            :disabled="moment && (momentType === MEDIA_TYPE_POSTER || momentType === MEDIA_TYPE_IMGLINK)"
          >视频</el-radio-button>
          <el-radio-button :label="MEDIA_TYPE_FILE" :disabled="moment">文件</el-radio-button>
          <el-radio-button :label="MEDIA_TYPE_MINIAPP" :disabled="moment">小程序</el-radio-button>
        </el-radio-group>
        <div class="tab-right-btn">
          <slot name="tab-right-btn" />
        </div>
      </div>
      <div class="search-container">
        <div class="search-item">
          <el-input v-model="query.search" placeholder="请输入素材标题" clearable style="width: 240px" />
        </div>
        <div class="search-item">
          <el-select
            v-model="tagIdList"
            clearable
            filterable
            multiple
            collapse-tags
            placeholder="请选择标签"
            style="width: 240px"
          >
            <!-- <el-option label="所有标签" value /> -->
            <el-option v-for="(item, index) in allTagList" :key="index" :label="item.tagName" :value="item.id" />
          </el-select>
        </div>
        <el-button type="primary" @click="onSearch()">查询</el-button>
        <el-button class="btn-reset" @click="resetQuery()">重置</el-button>
      </div>
      <div class="content-container">
        <div class="material-content">
          <div class="operate-container">
            <div class="data-stat">
              共 <span class="num theme-text-color">{{ total }}</span> 个{{ type === 'search' ? '过期的' : ''
              }}{{ MEDIA_TYPE[activeName] }}素材
            </div>
            <div class="right-btn">
              <slot name="right-btn" />
            </div>
          </div>
          <empty-default-icon
            :length="list.length"
            :text="`暂无${type === 'search' ? '过期' : ''}素材`"
            class="material-list-div"
          >
            <div v-loading="isLoading" class="material-list">
              <template v-for="(item, index) in list">
                <Poster
                  v-if="activeName === MEDIA_TYPE_POSTER"
                  :key="index"
                  :item="item"
                  :tool-list="posterToolList"
                  :show-expire-time="showExpireTime"
                  :selected-material-list="selectedMaterialList"
                  :select-material="selectMaterial"
                  :hide-status="type === 'search'"
                  @getList="getList"
                />
                <FileItem
                  v-if="activeName === MEDIA_TYPE_IMGLINK"
                  :key="index"
                  :item="item"
                  :tool-list="imgLinkToolList"
                  :type="MEDIA_TYPE_IMGLINK"
                  :show-expire-time="showExpireTime"
                  :selected-material-list="selectedMaterialList"
                  :select-material="selectMaterial"
                  :desc-field="'digest'"
                  :hide-status="type === 'search'"
                  @getList="getList"
                />
                <VideoItem
                  v-if="activeName === MEDIA_TYPE_VIDEO"
                  :key="index"
                  :item="item"
                  :tool-list="videoToolList"
                  :show-expire-time="showExpireTime"
                  :selected-material-list="selectedMaterialList"
                  :select-material="selectMaterial"
                  :hide-status="type === 'search'"
                  @getList="getList"
                />
                <FileItem
                  v-if="activeName === MEDIA_TYPE_FILE"
                  :key="index"
                  :item="item"
                  :tool-list="fileToolList"
                  :show-icon="true"
                  :type="MEDIA_TYPE_FILE"
                  :show-expire-time="showExpireTime"
                  :selected-material-list="selectedMaterialList"
                  :select-material="selectMaterial"
                  :hide-status="type === 'search'"
                  :show-file-size="true"
                  :desc-field="'content'"
                  @getList="getList"
                />
                <MiniAppItem
                  v-if="activeName === MEDIA_TYPE_MINIAPP"
                  :key="index"
                  :item="item"
                  :tool-list="miniappToolList"
                  :show-expire-time="showExpireTime"
                  :selected-material-list="selectedMaterialList"
                  :select-material="selectMaterial"
                  :hide-status="type === 'search'"
                  @getList="getList"
                />
              </template>
            </div>
          </empty-default-icon>
        </div>
        <div
          class="drawer-footer"
          :style="type === 'select' && total > 0 ? { justifyContent: 'space-between' } : { justifyContent: 'end' }"
        >
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="query.pageNum"
            :limit.sync="query.pageSize"
            :layout="type === 'select' ? 'sizes, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
            @pagination="getAndClearSelected"
          />
          <div v-show="type === 'select'" class="dialog-footer">
            <el-button @click="drawerVisible = false">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
/deep/ .el-tag:nth-of-type(1) {
  margin-right: 0px;
}
.sub-title {
  position: absolute;
  font-size: 14px;
  color: #999;
  top: 26px;
  left: 110px;
}
.material-list-drawer {
  /deep/ .el-drawer__container {
    .el-drawer {
      width: 898px !important;
    }
  }
  .drawer-container {
    padding: 0 20px 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    .tab-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .search-container {
      margin-bottom: 15px;
      display: flex;
    }
    .content-container {
      flex: 1;
      overflow: auto;
      flex-direction: column;
      display: flex;
      .material-content {
        display: flex;
        border: 1px solid $borderColor;
        padding: 10px 0 10px 10px;
        // padding-right: 0px;
        flex-direction: column;
        flex: 1;
        border-radius: 3px;
        overflow: auto;
        .operate-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-right: 10px;
          .num {
            font-weight: bold;
          }
        }
        .material-list-div {
          flex: 1;
          overflow: auto;
          .material-list {
            flex-wrap: wrap;
            align-content: flex-start;
            display: flex;
          }
          /deep/ .item-container {
            margin-right: 10px;
          }
        }
      }
    }
  }
  .drawer-footer {
    display: flex;
    .dialog-footer {
      padding-top: 15px;
    }
  }
}
</style>
