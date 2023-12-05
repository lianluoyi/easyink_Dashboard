<script>
// Load Style Code
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';
import PosterPage from '@/views/material/posterList.vue';
import VideoTab from '@/views/material/videoList.vue';
import FileTab from '@/views/material/fileList.vue';
import ImgLink from '@/views/material/graphicList.vue';
import MiniAppPage from './miniAppList.vue';
import MaterialListDrawer from '@/components/MaterialListDrawer';
import { getList, getMaterialConfig, updateMaterialConfig } from '@/api/material';
import { MEDIA_TYPE_POSTER, PAGE_LIMIT, MEDIA_TYPE_IMGLINK, RADAR_TYPE, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE, MEDIA_TYPE_MINIAPP, PAGE_LIMIT_TWENTY } from '@/utils/constant/index';
import SelectTagModal from './components/SelectTagModal.vue';
import { getMaterialTagList } from '@/utils/material';
const DEFAULT_EXPIRE_DAYS = 7;

export default {
  name: 'MaterialManage',
  components: {
    PosterPage,
    VideoTab,
    FileTab,
    ImgLink,
    MiniAppPage,
    MaterialListDrawer,
    SelectTagModal
  },
  data() {
    return {
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_MINIAPP,
      activeName: MEDIA_TYPE_POSTER,
      dialogVisible: false,
      drawerVisible: false,
      RADAR_TYPE,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT_TWENTY,
        categoryId: '',
        search: '',
        mediaType: MEDIA_TYPE_POSTER,
        isExpire: true
      },
      // 过期素材
      expireList: [],
      // 是否全选
      checkAll: false,
      // 过期设置弹窗
      expireVisible: false,
      expireRadio: 0,
      // 过期几天后删除
      expireDays: DEFAULT_EXPIRE_DAYS,
      // 素材总数
      total: 0,
      // 被选择的素材数量
      selectedMaterialNum: 0,
      // 列表加载状态
      isLoading: true,
      // 需要写radarQuery 避免为null报错
      radarQuery: {
        type: '',
        searchTitle: '',
        pageNum: 1,
        pageSize: PAGE_LIMIT
      }
    };
  },
  computed: {
    // 所有素材标签列表
    allTagList() {
      const allTagObj = this.$store.state.materialInfo && this.$store.state.materialInfo.allTagObj;
      const allTagList = Object.values(allTagObj);
      return allTagList;
    }
  },
  watch: {},
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>
          支持上传多种类型素材，管理员或员工可在日常运营中便捷使用
        </div>
      `
    );
    // 获取素材标签列表
    getMaterialTagList(this.$store);
  },
  mounted() {
  },
  methods: {
    /**
     * 置空expireList
     */
    emptyExpireList() {
      this.expireList = [];
    },
    openTagManage() {
      this.dialogVisible = true;
    },
    submitSelectTags() {
      // console.log('-')
    },
    /**
     * 打开过期素材抽屉
     */
    openExpireList() {
      this.drawerVisible = true;
      this.getExpireMaterialList({});
    },
    /**
     * 获取过期素材列表
     */
    getExpireMaterialList(params, callback) {
      this.isLoading = true;
      getList({
        ...this.query,
        ...params
      }).then(res => {
        this.isLoading = false;
        this.expireList = res.rows;
        this.total = res.total && Number(res.total);
      }).finally(() => {
        callback && callback();
      });
    },
    /**
     * 全选
     */
    selectAll() {
      this.$refs.materialDrawer.selectAll(this.checkAll);
      this.checkAll = !this.checkAll;
    },
    clearSelect() {
      this.$refs.materialDrawer.selectAll([]);
      this.checkAll = false;
    },
    /**
     * 批量恢复
     */
    batchRestore() {
      this.$refs.materialDrawer.batchRestore(this.clearSelect);
    },
    /**
     * 彻底删除
     */
    completeDelete() {
      this.$refs.materialDrawer.completeDelete(this.clearSelect);
    },
    /**
     * 打开过期设置
     */
    async openConfig() {
      const configRes = await getMaterialConfig();
      if (configRes) {
        const resData = configRes.data;
        this.expireRadio = resData.isDel ? 1 : 0;
        if (resData.isDel) this.expireDays = resData.delDays;
      }
    },
    /**
     * 确认修改过期设置
     */
    async onConfirmConfig() {
      this.expireVisible = false;
      const updateRes = await updateMaterialConfig({
        delDays: this.expireDays,
        isDel: this.expireRadio
      });
      if (updateRes) {
        this.msgSuccess('保存成功');
      }
    },
    changeSelectedMaterialNum(num) {
      this.selectedMaterialNum = num;
    }
  }
};
</script>

<template>
  <div class="material-manage-div">
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="MEDIA_TYPE_POSTER">海报</el-radio-button>
        <el-radio-button :label="MEDIA_TYPE_IMGLINK">链接</el-radio-button>
        <el-radio-button :label="MEDIA_TYPE_VIDEO">视频</el-radio-button>
        <el-radio-button :label="MEDIA_TYPE_FILE">文件</el-radio-button>
        <el-radio-button :label="MEDIA_TYPE_MINIAPP">小程序</el-radio-button>
      </el-radio-group>
      <div class="manage-btn">
        <el-button v-hasPermi="['wechat:material:expireManage']" class="btn-reset" @click="openExpireList">过期素材</el-button>
        <el-button v-hasPermi="['wechat:material:tagManage']" class="btn-reset" @click="openTagManage">素材标签管理</el-button>
      </div>
    </div>
    <PosterPage v-if="activeName == MEDIA_TYPE_POSTER" />
    <ImgLink v-if="activeName == MEDIA_TYPE_IMGLINK" />
    <VideoTab v-if="activeName == MEDIA_TYPE_VIDEO" />
    <FileTab v-if="activeName == MEDIA_TYPE_FILE" />
    <MiniAppPage v-if="activeName == MEDIA_TYPE_MINIAPP" />
    <MaterialListDrawer
      ref="materialDrawer"
      drawer-title="过期素材"
      :visible.sync="drawerVisible"
      :list="expireList"
      :get-list="getExpireMaterialList"
      :poster-tool-list="['preview', 'restore', 'remove']"
      :img-link-tool-list="['preview', 'restore', 'remove']"
      :video-tool-list="['preview', 'restore', 'remove']"
      :file-tool-list="['download', 'restore', 'remove']"
      :miniapp-tool-list="['restore', 'remove']"
      :query.sync="query"
      :radar-hidden="true"
      :radar-query.sync="radarQuery"
      :total="total"
      :is-loading="isLoading"
      :material-type.sync="query.materialType"
      @emptyExpireList="emptyExpireList"
      @changeSelectedMaterialNum="changeSelectedMaterialNum"
    >
      <template slot="tab-right-btn">
        <el-popover
          v-model="expireVisible"
          placement="bottom-end"
          width="330"
        >
          <div class="radio-div">
            <el-radio-group v-model="expireRadio">
              <el-radio :label="0">素材过期后不自动删除</el-radio>
              <el-radio :label="1">素材过期
                <el-input-number v-model="expireDays" class="expire-days" :min="0" :max="999" />
                天后自动删除</el-radio>
            </el-radio-group>
          </div>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="expireVisible = false">取消</el-button>
            <el-button type="primary" size="mini" @click="onConfirmConfig">确定</el-button>
          </div>
          <el-button slot="reference" class="btn-reset" @click="openConfig">过期设置</el-button>
        </el-popover>
      </template>
      <template slot="right-btn">
        <div class="right-btn-div">
          <div class="selected-num">已选择{{ selectedMaterialNum }}项</div>
          <el-button class="btn-reset" @click="selectAll">{{ checkAll ? '取消全选' : '全选' }}</el-button>
          <el-button class="btn-reset" @click="batchRestore">批量恢复</el-button>
          <el-button v-hasPermi="['wechat:material:remove']" class="btn-reset" @click="completeDelete">彻底删除</el-button>
        </div>
      </template>
    </MaterialListDrawer>
    <SelectTagModal
      :visible.sync="dialogVisible"
      modal-title="素材标签管理"
      alert-title="创建素材标签，通过标签对素材进行分类管理"
      :can-remove-tag="true"
      :show-add-tag="true"
      :tag-list="allTagList"
      @submitSelectTags="submitSelectTags"
    />
  </div>
</template>

<style lang="scss" scoped>
.material-manage-div {
  display: flex;
  flex-direction: column;
}
.radio-div {
  padding: 20px 10px 0;
  /deep/ .el-radio {
    margin-bottom: 10px;
  }
  .expire-days {
    width: 110px;
  }
}
.right-btn-div {
  display: flex;
  align-items: center;
  .selected-num {
    color: $grayColor;
    margin-right: 10px;
  }
}
</style>
