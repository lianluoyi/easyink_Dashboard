<script>
import {
  getTree,
  getList,
  markTags,
  removeTags,
  sidebarSwitch,
  getMaterialCount,
  removeMaterial,
  showMaterialSwitch
} from '@/api/material';
import { PAGE_LIMIT_TWENTY, MEDIA_TYPE, MEDIA_TYPE_POSTER } from '@/utils/constant/index';
import MaterialAddModal from './MaterialAddModal.vue';
import SelectTagModal from './SelectTagModal.vue';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { getCategoryList } from '@/utils/material';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  name: 'MaPage',
  components: { MaterialAddModal, SelectTagModal, EmptyDefaultIcon },
  mixins: [loadingMixin],
  props: {
    // "0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file) 4 文本 5 海报 6 海报字体",
    type: {
      type: String,
      default: MEDIA_TYPE_POSTER
    },
    // 选中的素材列表
    selected: {
      type: Array,
      default: () => []
    },
    // 选择素材方法
    selectMaterial: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      MEDIA_TYPE,
      loading: true, // 遮罩层
      // 查询条件
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT_TWENTY,
        categoryId: '',
        // 素材标题
        search: '',
        // 素材类型
        mediaType: MEDIA_TYPE_POSTER,
        // 是否过期
        isExpire: false,
        // 筛选标签
        tagIds: '',
        // 是否发布
        showMaterial: null
      },
      // 已选标签id列表
      tagIdList: [],
      list: [], // 列表
      total: 0, // 总条数
      treeData: [], // 树
      // 树props
      treeProps: {
        children: 'children',
        label: 'name'
      },
      treeForm: {}, // 树表格
      treeDialogVisible: false, // 树表格对话框显隐
      group: '', // 选择的分组
      groupDialogVisible: false, // 移动分组对话框
      // 分组props
      groupProps: {
        // expandTrigger: 'hover',
        checkStrictly: true,
        children: 'children',
        label: 'name',
        value: 'id',
        emitPath: false
      },

      form: {}, // 素材表单
      dialogVisible: false, // 素材表格对话框显隐
      // 表单校验
      rules: Object.freeze({
        content: [{ required: true, message: '不能为空', trigger: 'blur' }],
        materialUrl: [
          { required: true, message: '不能为空', trigger: 'change' }
        ],
        materialName: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        digest: [{ required: true, message: '不能为空', trigger: 'blur' }],
        coverUrl: [{ required: true, message: '不能为空', trigger: 'blur' }]
      }),
      // 已选素材标签
      selectedTag: [],
      // 批量标签（true:批量移除标签; false:批量打标签）
      batchTag: false,
      // 批量标签弹窗
      batchVisible: false,
      /**
       * 素材统计数据
       */
      statisticalInfo:
      {
        sidebarCount: 0,
        materialCount: 0
      },
      checkAll: false,
      // 取消发布
      CANCEL_PUBLISH: false
    };
  },
  computed: {
    categoryId() {
      return this.$store.state.materialInfo?.categoryInfo[this.type]?.id;
    },
    /**
     * 侧边栏是否展示海报素材
     */
    sidebarUsing() {
      return this.$store.state.materialInfo?.categoryInfo[this.type]?.using;
    },
    /**
     * 获取所有素材标签列表
     */
    allTagList() {
      const allTagObj = this.$store.state.materialInfo && this.$store.state.materialInfo.allTagObj;
      const allTagList = Object.values(allTagObj);
      return allTagList;
    },
    /**
     * 选中素材的id列表
     */
    selectedIdList() {
      const selectedList = [];
      this.selected.map(item => {
        selectedList.push(item.id);
      });
      return selectedList;
    },
    /**
     * 已选素材的标签
     */
    selectMaterialAllTag() {
      const list = [];
      this.selected.map(materialItem => {
        const allTagObj = this.$store.state.materialInfo.allTagObj;
        materialItem.tagList.map(tagItem => {
          const tag = list.find(item => item.id === tagItem.materialTagId);
          if (!tag) {
            list.push({
              relId: tagItem.relId,
              id: tagItem.materialTagId,
              tagName: allTagObj[tagItem.materialTagId]?.tagName
            });
          }
        });
      });
      return list;
    }
  },
  watch: {
  },
  created() {
    this.query.mediaType = this.type;
    this.getList();
  },
  mounted() {},
  methods: {
    // 获取类目树
    getTree() {
      getTree(this.type).then(({ data }) => {
        this.treeData = [
          {
            id: '',
            name: '全部',
            parentId: '0',
            hasParent: false,
            hasChildren: true,
            children: data || []
          }
        ];
      });
    },
    // 获取素材列表
    getList(page_) {
      const page = page_ || this.query.pageNum;
      page && (this.query.pageNum = page);
      this.loading = true;
      const params = {
        ...this.query,
        tagIds: this.tagIdList && this.tagIdList.join(','),
        usingFlag: this.sidebarUsing
      };
      getList(params)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
          this.$emit('listChange', this.list);
        })
        .finally(() => {
          this.modifyButtonStatus();
          this.loading = false;
        });
      this.getMaterialCount();
    },
    // 素材添加/编辑
    edit(data, type) {
      // 获取素材类别列表
      getCategoryList(this.$store);
      // eslint-disable-next-line no-magic-numbers
      this.form = Object.assign(
        {},
        data || { categoryId: this.query.categoryId, showMaterial: true }
      );
      this.dialogVisible = true;
      // 清除之前的校验信息
      this.$nextTick(() => {
        this.$refs['materialAddModal']?.$refs?.form?.clearValidate();
      });
    },

    // 素材批量删除
    batchRemove(id) {
      if (!this.checkSelect()) return;
      this.confirmModal({
        msg: '选中素材将被删除，是否继续？'
      }, () => {
        return removeMaterial({
          ids: this.selectedIdList.join(','),
          mediaType: this.type
        })
          .then(() => {
            this.getList();
            this.clearSelect();
            this.msgSuccess('删除成功');
          });
      });
    },
    // 下载
    download(data) {
      window.open(data.materialUrl);
    },
    // 重置查询条件
    resetQuery() {
      this.tagIdList = [];
      this.query = {
        ...this.query,
        pageNum: 1,
        search: '',
        tagIds: '',
        showMaterial: null
      };
      this.getList(1);
    },
    /**
     * 点击批量发布/取消发布按钮
     * @param 是否发布素材
     */
    handleBatchPublish(showMaterial) {
      if (!this.checkSelect()) return;
      this.confirmModal({
        msg: showMaterial ? '即将发布选中的素材到侧边栏给员工使用，是否继续？' : '将选中的素材从侧边栏【素材库】移除，是否继续？'
      }, async() => {
        const switchRes = await showMaterialSwitch({
          ids: this.selectedIdList.join(','),
          showMaterial: showMaterial,
          mediaType: this.type
        });
        if (switchRes) {
          this.msgSuccess(showMaterial ? '已发布到侧边栏【素材库】' : '已取消发布');
          this.getList();
          this.clearSelect();
          this.$emit('update:selected', []);
        }
      });
    },
    /**
     * 显示批量标签弹窗
     * @param 批量打标签（true）/移除标签（false）
     */
    handleBatchTag(val) {
      if (!this.checkSelect()) return;
      this.batchTag = val;
      this.batchVisible = true;
    },
    /**
     * 确认选择标签
     */
    async submitSelectTags(tagList) {
      const tagIds = [];
      tagList.map(item => {
        tagIds.push(item.id);
      });
      const params = {
        materialIds: this.selectedIdList,
        tagIds: tagIds
      };
      let removeRes;
      let markRes;
      // 批量移除标签
      if (this.batchTag) {
        markRes = await markTags(params);
      } else {
        removeRes = await removeTags(params);
      }
      if (removeRes || markRes) {
        this.getList();
        this.clearSelect();
        this.$emit('update:selected', []);
      }
    },
    /**
     * 点击侧边栏展示素材开关
     */
    async handleSwitchChange(value) {
      const switchRes = await sidebarSwitch({
        id: this.categoryId,
        using: value
      });
      if (switchRes) this.$store.dispatch('GetCategory');
    },
    /**
     * 获取对应素材类型的统计数
     */
    async getMaterialCount() {
      const params = {
        ...this.query,
        tagIds: this.tagIdList && this.tagIdList.join(',')
      };
      const countRes = await getMaterialCount(params);
      const statisticalInfo = {
        sidebarCount: countRes?.data?.materialSideBarNum || 0,
        materialCount: countRes?.data?.materialNum || 0
      };
      this.statisticalInfo = statisticalInfo;
    },
    /**
     * 全选当前页素材
     */
    selectAll() {
      if (this.checkAll) {
        this.selectMaterial([]);
      } else {
        const nowList = [...this.list];
        this.selectMaterial(nowList);
      }
      this.checkAll = !this.checkAll;
    },
    /**
     * 点击查询素材
     */
    onSearch() {
      this.getList(1);
    },
    /**
     * 更新素材列表数据
     * @param {Object} item 需要更新的素材详情
     */
    changeList(item) {
      const nowList = [...this.list];
      const index = nowList.findIndex(materialItem => materialItem.id === item.id);
      if (index > -1) {
        nowList.splice(index, 1, item);
        this.list = nowList;
        // 更新统计数据
        this.getMaterialCount();
      }
    },
    checkSelect() {
      if (this.selected.length === 0) {
        this.msgWarn('请至少选择一个素材');
        return false;
      }
      return true;
    },
    clearSelect() {
      this.selectMaterial([]);
      this.checkAll = false;
    }
  }
};
</script>

<template>
  <div class="material-main-page">
    <div class="search-container">
      <div class="search-item">
        <el-input
          v-model="query.search"
          placeholder="请输入素材标题"
          clearable
          style="width: 240px;"
        />
      </div>
      <div class="search-item">
        <el-select v-model="tagIdList" clearable filterable multiple collapse-tags placeholder="请选择标签" style="width: 240px;">
          <!-- <el-option label="所有标签" value /> -->
          <el-option
            v-for="(item, index) in allTagList"
            :key="index"
            :label="item.tagName"
            :value="item.id"
          />
        </el-select>
      </div>
      <div class="search-item">
        <el-select v-model="query.showMaterial" clearable placeholder="所有素材" style="width: 240px;">
          <el-option
            :key="1"
            label="已发布"
            :value="1"
          />
          <el-option
            :key="0"
            label="未发布"
            :value="0"
          />
        </el-select>
      </div>
      <el-button
        v-preventReClick="200"
        type="primary"
        :loading="searchButtonLoading"
        @click="()=>{
          searchButtonLoading = true;
          onSearch()
        }"
      >查询</el-button>
      <el-button
        v-preventReClick="200"
        class="btn-reset"
        :loading="resetButtonLoading"
        @click="()=>{
          resetButtonLoading = true;
          resetQuery()
        }"
      >重置</el-button>
    </div>
    <div class="content-container mt10">
      <div class="operate-container">
        <div class="left-operate">
          <div v-hasPermi="['wechat:material:sidebar']" class="tip-div">
            <div>侧边栏展示{{ MEDIA_TYPE[type] }}素材</div>
            <el-popover
              placement="top-start"
              content="开启后，员工可在企业微信客户端侧边栏【素材库】查看已发布的素材，并发送给客户"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i slot="reference" class="iconfont icon-question" />
            </el-popover>
            <el-switch :value="sidebarUsing" @change="handleSwitchChange" />
          </div>
          <div>
            共 <span class="theme-text-color">{{ statisticalInfo.materialCount }}</span> 个{{ MEDIA_TYPE[type] }}素材，
            已发布 <span class="theme-text-color">{{ statisticalInfo.sidebarCount }}</span> 个到侧边栏
          </div>
        </div>
        <div v-show="list.length > 0" class="right-operate">
          已选择{{ selected.length }}项
          <el-button class="btn-reset" @click="selectAll">{{ checkAll ? '取消全选' : '全选' }}</el-button>
          <el-dropdown
            v-hasPermi="['wechat:material:publish']"
            class="dropdown-reset"
            split-button
            @click="() => handleBatchPublish(true)"
            @command="(e) => handleBatchPublish(e)"
          >
            批量发布
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item style="width: 108px" :command="CANCEL_PUBLISH">取消发布</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown
            v-hasPermi="['wechat:material:edit']"
            class="dropdown-reset"
            split-button
            @click="() => handleBatchTag(true)"
            @command="(e) => handleBatchTag(e)"
          >
            批量打标签
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item style="width: 120px" :command="false">批量移除标签</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            v-hasPermi="['wechat:material:remove']"
            class="btn-reset ml10"
            @click="batchRemove()"
          >批量删除</el-button>
          <el-button
            v-hasPermi="['wechat:material:add']"
            type="primary"
            @click="edit(null, ~~type)"
          >添加{{ MEDIA_TYPE[type] }}</el-button>
        </div>
      </div>
      <empty-default-icon
        class="mt10 material-list-div"
        :length="list.length"
        text="暂无素材"
        :btn-text="`${total === 0 && query.showMaterial !== null ? '' : '添加' + MEDIA_TYPE[type]}`"
        :btn-click="() => edit(null, ~~type)"
        :btn-show-condition="{ search: query.search, tagIds: query.tagIds, tagIdList }"
        :btn-permi-key="['wechat:material:add']"
      >
        <div v-loading="loading" class="material-list">
          <slot :list="list" :getList="getList" :changeList="changeList" :edit="edit" />
        </div>
      </empty-default-icon>
      <pagination
        v-show="total > 0"
        :total="total"
        :disabled="loading"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        @pagination="getList()"
      />
    </div>
    <MaterialAddModal
      ref="materialAddModal"
      :form.sync="form"
      :type="type"
      :show-material-setting="true"
      :modal-title="(form.id ? '编辑' : '添加') + MEDIA_TYPE[type]"
      :visible.sync="dialogVisible"
      :get-list="form.id ? getList : resetQuery"
    />
    <SelectTagModal
      :visible.sync="batchVisible"
      :modal-title="batchTag ? '选择素材标签' : '批量移除标签'"
      :alert-title="batchTag ? '请选择要为素材打上的标签' : '以下选中的标签，将从已勾选素材下移除'"
      :show-add-tag="batchTag"
      :tag-list="!batchTag ? selectMaterialAllTag : this.$store.state.materialInfo.allTagObj && Object.values(this.$store.state.materialInfo.allTagObj)"
      :check-select-num="true"
      @submitSelectTags="submitSelectTags"
    />
  </div>
</template>

<style lang="scss" scoped>
/deep/ .el-tag:nth-of-type(1) {
  margin-right: 0px;
}
.material-main-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  .search-container {
    padding: 0 15px 15px;
  }
  .content-container {
    padding: 15px 0px 15px 15px;
    background-color: #fff;
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    /deep/ .pagination-container {
      padding-right: 15px;
    }
    .operate-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 15px;
      .left-operate {
        color: #606266;
        span {
          font-weight: bold;
        }
        .tip-div {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          .icon-question {
            margin-right: 5px;
            color: $grayColor;
            font-size: 14px;
          }
        }
      }
      .right-operate {
        color: $grayColor;
        .el-dropdown {
          margin-left: 10px;
        }
        .el-button {
          margin-left: 10px;
        }
      }
    }
    .material-list-div {
      flex: 1;
      overflow: auto;
      .material-list {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
      }
    }
  }
}
</style>
