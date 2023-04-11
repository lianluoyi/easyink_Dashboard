<!--
 * @Description: 添加附件按钮组件
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="appendix-box">
      <el-dropdown trigger="click" placement="top" @command="selectMaterial">
        <el-button
          class="btn-reset add-btn"
          @click="checkAppendixList"
        >新增附件</el-button>
        <el-dropdown-menu v-if="checkAppendixList(false)" slot="dropdown">
          <el-dropdown-item>素材库选取</el-dropdown-item>
          <el-dropdown-item :command="MEDIA_TYPE_POSTER">新增海报</el-dropdown-item>
          <el-dropdown-item :command="MEDIA_TYPE_IMGLINK">新增链接</el-dropdown-item>
          <el-dropdown-item :command="MEDIA_TYPE_VIDEO">新增视频</el-dropdown-item>
          <el-dropdown-item :command="MEDIA_TYPE_FILE">新增文件</el-dropdown-item>
          <el-dropdown-item :command="MEDIA_TYPE_MINIAPP">新增小程序</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="appendix-list">
        <div
          v-for="(appendix, index) in appendixList"
          :key="appendix.time"
          class="appendix-item"
        >
          <el-tooltip class="item" effect="dark" content="删除" placement="top">
            <i class="el-icon-remove-outline" @click="handleDeleteAppendix(index, appendix)" />
          </el-tooltip>
          <span class="appendix-type">[{{ MESSAGE_MEDIA_TYPE[appendix.mediaType] }}]</span>
          <!-- 表单 使用的appendix.formName 是从素材库选出来的时候显示。appendix.form.formName 后端传过来的时候显示 雷达也是如此。-->
          <!--TODO 用 == 是由于 从素材库选出来的是 number类型 回显的时候是 string类型 需要修改一下  -->
          <span v-if="appendix.mediaType.toString() === MEDIA_TYPE_SMARTFORM" class="appendix-title inoneline">{{ appendix.formName || appendix.form.formName }}</span>
          <span v-else-if="appendix.mediaType.toString() === MEDIA_TYPE_RADARLINK" class="appendix-title inoneline">{{ appendix.radarTitle || appendix.radar.radarTitle }}</span>
          <span v-else class="appendix-title inoneline">{{ appendix.materialName }}</span>
          <span class="appendix-operate-icon">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top">
              <!-- 雷达/智能表单不允许编辑 使用一个空的i标签 不然会导致拖拽排序位置偏离 -->
              <i v-if="!isOtherMaterialType(appendix.mediaType+'')" class="iconfont icon-tool-edit" @click="() => showEditMaterial(appendix)" />
              <i v-else />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="长按拖拽排序" placement="right">
              <i
                draggable="true"
                class="el-icon-sort"
                @mousedown="mousedown(index)"
                @mousemove.prevent
                @mouseenter="mouseenter(index)"
              />
            </el-tooltip>
          </span>
        </div>
      </div>
    </div>
    <MaterialAddModal
      ref="saveToMaterial"
      :form.sync="materialForm"
      :type="String(appendixType)"
      :show-material-save="isOperatingMaterial ? false : !materialForm.isAdded"
      :show-material-setting="isOperatingMaterial ? true : materialForm.saveToMaterial"
      :modal-title="(materialForm.isAdded ? '编辑' : '添加') + MEDIA_TYPE[appendixType]"
      :visible.sync="showAppendixAddModal"
      :get-list="getMaterialList"
      :is-operating-material="isOperatingMaterial"
      @submit="(appendix) => materialForm.isAdded ? handleEditAppendix(appendix) : handleAddApendix(appendix)"
    />
    <MaterialListDrawer
      v-if="dialogVisibleSelectMaterial"
      ref="materialDrawer"
      drawer-title="选择素材"
      :radar-hidden="radarHidden"
      :visible.sync="dialogVisibleSelectMaterial"
      :list="materialList"
      :get-list="getMaterialList"
      :poster-tool-list="['preview']"
      :imglink-tool-list="['preview']"
      :video-tool-list="['preview']"
      :file-tool-list="['download']"
      :miniapp-tool-list="[]"
      :query.sync="query"
      :radar-query.sync="radarQuery"
      :other-query="otherQuery"
      :sub-title="subTitle"
      :type="'select'"
      :total="total"
      :is-loading="isLoadingMaterial"
      :limit-select-length="limitSelectLength"
      :material-type.sync="materialType"
      :show-expire-time="false"
      @submit="handleAddApendixList"
    >
      <template slot="right-btn">
        <div class="right-btn-div">
          <el-button
            v-hasPermi="['wechat:material:add']"
            type="primary"
            @click="handleAddMaterial(null, ~~materialType)"
          >添加{{ MEDIA_TYPE[materialType] }}</el-button>
        </div>
      </template>
    </MaterialListDrawer>
  </div>
</template>
<script>
import MaterialAddModal from '@/views/material/components/MaterialAddModal';
import moment from 'moment';
import {
  MEDIA_TYPE_POSTER,
  MEDIA_TYPE_IMGLINK,
  MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_MINIAPP,
  MEDIA_TYPE,
  MESSAGE_MEDIA_TYPE,
  MAX_APPENDIX_NUM,
  MEDIA_TYPE_RADARLINK,
  PAGE_LIMIT,
  RADAR_TYPE,
  MEDIA_TYPE_SMARTFORM,
  INTELLIGENT_FORM_TYPE
} from '@/utils/constant';
import { getList as getMaterialListApi } from '@/api/material';
import MaterialListDrawer from '@/components/MaterialListDrawer';
import { getCategoryList, getMaterialTagList } from '@/utils/material';
import { getRadaList } from '@/api/radar';
import { getFormPageList } from '@/api/form';
import { isOtherMaterialType } from '@/utils/common';
export default {
  name: 'AddAppendixBtn',
  components: { MaterialAddModal, MaterialListDrawer },
  props: {
    subTitle: {
      type: String,
      default: ''
    },
    limitSelectLength: {
      type: Number,
      default: MAX_APPENDIX_NUM
    },
    maxAppendixNum: {
      type: Number,
      default: MAX_APPENDIX_NUM
    },
    appendixList: {
      type: Array,
      default: () => []
    },
    msgTip: {
      type: String,
      default: ''
    },
    /**
     * 要移除的附件列表
     */
    removeAppendixList: {
      type: Array,
      default: () => []
    },
    // 是否隐藏雷达选项
    radarHidden: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      materialForm: {}, // 素材表单
      appendixType: MEDIA_TYPE_POSTER,
      dialogVisibleSelectMaterial: false,
      MEDIA_TYPE,
      RADAR_TYPE,
      MESSAGE_MEDIA_TYPE,
      dragSource: undefined,
      dragTarget: undefined,
      materialType: MEDIA_TYPE_POSTER,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        categoryId: '',
        search: '',
        mediaType: MEDIA_TYPE_POSTER,
        isExpire: false
      },
      // 雷达查询条件
      radarQuery: {
        type: this.$store.state.user.isSuperAdmin ? RADAR_TYPE['enterprise'] : '',
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        searchTitle: ''
      },
      // 素材库其他类型的查询条件
      otherQuery: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        belongGroup: []
      },
      isLoadingMaterial: true,
      total: 0,
      materialList: [],
      isOperatingMaterial: false,
      showAppendixAddModal: false,
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_MINIAPP,
      MEDIA_TYPE_RADARLINK,
      MAX_APPENDIX_NUM,
      INTELLIGENT_FORM_TYPE,
      MEDIA_TYPE_SMARTFORM,
      isOtherMaterialType
    };
  },
  watch: {
    materialType(val) {
      this.query.mediaType = val;
    }
  },
  created() {
    // 获取素材分类列表
    getCategoryList(this.$store);
    // 获取素材标签列表
    getMaterialTagList(this.$store);
  },
  methods: {
    selectMaterial(type) {
      // 新增附件
      if (type !== undefined) {
        this.isOperatingMaterial = false;
        this.showAppendixAddModal = true;
        this.appendixType = type;
        this.materialForm = {};
      } else {
        this.materialType = MEDIA_TYPE_POSTER;
        // 素材库选取附件
        this.getMaterialList({ mediaType: MEDIA_TYPE_POSTER });
        this.dialogVisibleSelectMaterial = true;
      }
    },
    /**
     * 校验附件个数
     */
    checkAppendixList(showMsg = true) {
      if (this.appendixList.length >= this.maxAppendixNum) {
        showMsg && this.msgInfo(`${this.msgTip || `最多支持发送${this.maxAppendixNum}个附件`}`);
        return false;
      }
      return true;
    },
    /**
     * 删除附件
     */
    handleDeleteAppendix(index, item) {
      const list = [...this.appendixList];
      const removeList = [...this.removeAppendixList];
      removeList.push(item);
      list.splice(index, 1);
      this.$emit('update:appendixList', list);
      this.$emit('update:removeAppendixList', removeList);
    },
    /**
     * 编辑附件
     */
    showEditMaterial(appendix) {
      this.isOperatingMaterial = false;
      this.showAppendixAddModal = true;
      this.appendixType = appendix.mediaType;
      this.materialForm = { ...appendix };
    },
    mousedown(index) {
      this.dragSource = index;
    },
    /**
     * 鼠标移入
     */
    mouseenter(index) {
      this.dragTarget = index;
      this.handleDragAppendix(this.dragSource, index);
    },
    /**
     * 拖拽附件
     */
    handleDragAppendix() {
      const source = this.dragSource;
      const target = this.dragTarget;
      if (!isNaN(source) && !isNaN(target) && source !== target) {
        const list = [...this.appendixList];
        // 交换元素
        list[source] = list.splice(target, 1, list[source])[0];
        this.$emit('update:appendixList', list);
      }
      this.dragSource = undefined;
      this.dragTarget = undefined;
    },
    /**
     * 确认选择素材
     */
    handleAddApendixList(list) {
      list.forEach(appendix => {
        // 设置1ms延时，以免time值重复
        setTimeout(() => {
          this.handleAddApendix(appendix);
        }, 1);
      });
    },
    /**
     * 添加附件
     */
    handleAddApendix(appendix) {
      const time = moment.now();
      const list = [...this.appendixList];
      list.push({ ...appendix, isAdded: true, time, saveToMaterial: false });
      this.$emit('update:appendixList', list);
      if (appendix.saveToMaterial) {
        this.query.mediaType = appendix.mediaType;
        this.getMaterialList();
      }
    },
    /**
     * 添加素材
     */
    handleAddMaterial(data, type) {
      this.isOperatingMaterial = true;
      this.showAppendixAddModal = true;
      this.appendixType = type;
      this.materialForm = Object.assign(
        {},
        data || { categoryId: this.categoryId }
      );
      // 清除之前的校验信息
      this.$nextTick(() => {
        // this.$refs['materialAddModal']?.$refs?.form?.clearValidate();
        this.$refs['saveToMaterial']?.$refs?.form?.clearValidate();
      });
    },
    /**
     * 获取素材列表
     */
    getMaterialList(params) {
      this.isLoadingMaterial = true;

      switch (params.mediaType) {
        case MEDIA_TYPE_SMARTFORM: {
          // 表单sourceType 对应的值
          const FORM_GROUP = {
            'corpFormGroup': INTELLIGENT_FORM_TYPE['enterprise'],
            'departmentFormGroup': INTELLIGENT_FORM_TYPE['department'],
            'selfFormGroup': INTELLIGENT_FORM_TYPE['personal']
          };
          let groupId = '';
          const { pageNum, pageSize, formName, belongGroup, departmentId } = this.otherQuery;
          if (belongGroup.length !== 1) {
            groupId = belongGroup[belongGroup.length - 1];
          }
          const sourceType = FORM_GROUP[belongGroup && belongGroup[0]];
          // 需要素材库自行组装数据传递 sourceType formName groupId pageNum pageSize departmentId
          const payload = {
            pageNum,
            pageSize,
            sourceType,
            formName,
            groupId,
            ...(sourceType === INTELLIGENT_FORM_TYPE['department'] && { departmentId }),
            enableFlag: true
          };
          getFormPageList(payload).then((res) => {
            this.total = res.total;
            this.isLoadingMaterial = false;
            const newArr = res.rows.map((item) => {
              const payload = {
                ...item,
                extraId: item.id,
                mediaType: +MEDIA_TYPE_SMARTFORM,
                categoryId: this.$store.state.materialInfo?.categoryInfo[+MEDIA_TYPE_SMARTFORM]?.id || ''
              };
              // 删除id 后端传递id会报错
              delete payload.id;
              return payload;
            });
            this.materialList = newArr;
          });
          break;
        }
        case MEDIA_TYPE_RADARLINK:
          // 雷达不从素材库获取 从雷达列表中获取
          getRadaList(this.radarQuery).then(res => {
            const newArr = res.rows.map((item) => {
              return {
              // 链接标题
                title: item.weRadarUrl.title,
                // 链接摘要
                content: item.weRadarUrl.content,
                // 链接封面
                coverUrl: item.weRadarUrl.coverUrl,
                // 链接URL
                url: item.weRadarUrl.url,
                // 雷达标题
                radarTitle: item.radarTitle,
                extraId: item.radarId,
                materialUrl: item.weRadarUrl.url,
                materialName: item.weRadarUrl.title,
                radarTagList: item.radarTagList,
                mediaType: +MEDIA_TYPE_RADARLINK,
                categoryId: this.$store.state.materialInfo?.categoryInfo[+MEDIA_TYPE_RADARLINK]?.id || ''
              };
            });
            this.materialList = newArr;
            this.total = Number(res.total);
            this.isLoadingMaterial = false;
          });
          break;
        default:
          getMaterialListApi({
            ...this.query,
            ...params
          }).then(res => {
            this.materialList = res.rows;
            this.total = Number(res.total);
            this.isLoadingMaterial = false;
          });
          break;
      }
    },
    /**
     * 编辑附件（点击的对应附件内容）
     */
    handleEditAppendix(appendix) {
      const list = [...this.appendixList];
      const index = list.findIndex(appendix_ => appendix.time === appendix_.time);
      list.splice(index, 1, appendix);
      this.$emit('update:appendixList', list);
    }
  }

};
</script>
<style scoped lang='scss'>
.appendix-box {
  border-radius: 0 0 4px 4px;
  border: 1px solid #dcdfe6;
  border-top: 0;
  padding: 10px;
  width: 100%;
  .add-btn {
    padding: 7px 12px;
  }
  .appendix-item {
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 15px;
    font-size: 14px;
    line-height: 16px;
    color: #666;
    i {
      color: #888;
      font-size: 16px;
      cursor: pointer;
      &:first-child {
        margin-right: 5px;
      }
    }
    .appendix-title {
      flex: 1;
      padding-left: 5px;
    }
  }
}
</style>
