<!--
 * @Description: 添加更多素材按钮
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <el-dropdown v-bind="$attrs" @command="handleAddVerbalTrick">
      <el-button
        :type="btnType"
        :class="btnClass"
      >{{ btnText }}<i v-if="showArrow" class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-if="canSelectMaterial" :command="MATERIAL_SELECT">素材库选取</el-dropdown-item>
        <el-dropdown-item :command="MEDIA_TYPE_TEXT">文本</el-dropdown-item>
        <el-dropdown-item :command="MEDIA_TYPE_POSTER">图片</el-dropdown-item>
        <el-dropdown-item :command="MEDIA_TYPE_VIDEO">视频</el-dropdown-item>
        <el-dropdown-item :command="MEDIA_TYPE_FILE">文件</el-dropdown-item>
        <el-dropdown-item :command="MEDIA_TYPE_IMGLINK">链接</el-dropdown-item>
        <el-dropdown-item :command="MEDIA_TYPE_MINIAPP">小程序</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <MaterialListDrawer
      ref="materialDrawer"
      drawer-title="选择素材"
      :visible.sync="dialogVisibleSelectMaterial"
      :list="materialList"
      :get-list="getMaterialList"
      :poster-tool-list="['preview']"
      :imglink-tool-list="['preview']"
      :video-tool-list="['preview']"
      :file-tool-list="['download']"
      :miniapp-tool-list="[]"
      :query.sync="query"
      :other-query="otherQuery"
      :radar-query.sync="radarQuery"
      :type="'select'"
      :total="total"
      :is-loading="isLoadingMaterial"
      :material-type.sync="materialType"
      :show-expire-time="false"
      @submit="handleAddApendixList"
    />
  </div>
</template>
<script>
import {
  MEDIA_TYPE_POSTER, MEDIA_TYPE_RADARLINK, MEDIA_TYPE_VIDEO, MEDIA_TYPE_FILE, MEDIA_TYPE_TEXT, MEDIA_TYPE_IMGLINK, RADAR_TYPE,
  MEDIA_TYPE_MINIAPP, PAGE_LIMIT, MEDIA_TYPE, DEFAULT_LINK, MEDIA_TYPE_SMARTFORM, INTELLIGENT_FORM_TYPE
} from '@/utils/constant';
import MaterialListDrawer from '@/components/MaterialListDrawer';
import { getList } from '@/api/material';
import { getRadaList } from '@/api/radar';
import { getFormPageList } from '@/api/form';
const MATERIAL_SELECT = 'materialSelect';
export default {
  name: '',
  components: { MaterialListDrawer },
  props: {
    formData: {
      type: Object,
      default: () => {}
    },
    btnText: {
      type: String,
      default: '添加话术'
    },
    btnType: {
      type: String,
      default: ''
    },
    btnClass: {
      type: String,
      default: ''
    },
    canSelectMaterial: {
      type: Boolean,
      default: false
    },
    /**
     * 显示向下箭头
     */
    showArrow: {
      type: Boolean,
      default: false
    },
    materialField: {
      type: String,
      default: 'weWordsDetailList'
    }
  },
  data() {
    return {
      MEDIA_TYPE_TEXT,
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_MINIAPP,
      MEDIA_TYPE_RADARLINK,
      MATERIAL_SELECT,
      RADAR_TYPE,
      dialogVisibleSelectMaterial: false,
      isLoadingMaterial: true,
      materialList: [],
      total: 0,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        categoryId: '',
        search: '',
        mediaType: MEDIA_TYPE_POSTER,
        isExpire: false
      },
      materialType: MEDIA_TYPE_POSTER,
      appendixList: [],
      MEDIA_TYPE,
      radarQuery: {
        type: this.$store.state.user.isSuperAdmin ? RADAR_TYPE['enterprise'] : '',
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        searchTitle: ''
      },
      otherQuery: {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      }
    };
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 选择要添加的素材类型
     * @param command 类型
     */
    handleAddVerbalTrick(command) {
      const { materialField } = this;
      const newList = [...this.formData[materialField]];
      switch (command) {
        case MEDIA_TYPE_TEXT: {
          newList.push({
            mediaType: command,
            content: ''
          });
          break;
        }
        case MEDIA_TYPE_POSTER:
        case MEDIA_TYPE_VIDEO:
        case MEDIA_TYPE_FILE: {
          newList.push({
            mediaType: command,
            url: '',
            title: ''
          });
          break;
        }
        case MEDIA_TYPE_IMGLINK:
        case MEDIA_TYPE_MINIAPP: {
          newList.push({
            mediaType: command,
            url: '',
            title: '',
            content: '',
            coverUrl: '',
            isDefined: DEFAULT_LINK,
            appid: '',
            accountOriginalId: ''
          });
          break;
        }
        // 素材库选取附件
        case MATERIAL_SELECT: {
          !this.materialList?.length && this.getMaterialList({ mediaType: this.materialType });
          this.materialType = MEDIA_TYPE_POSTER;
          this.dialogVisibleSelectMaterial = true;
        }
      }
      this.$emit('update:formData', {
        ...this.formData,
        [materialField]: [...newList]
      });
    },
    /**
     * 获取素材列表
     * @param params 额外传参
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
          getList({
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
     * 确认选择素材
     * @param list 从素材列表中选择的素材
     */
    handleAddApendixList(list) {
      const { materialField } = this;
      const newList = [...this.formData[materialField]];
      list.map(item => {
        const mediaType = item.mediaType?.toString();
        switch (mediaType) {
          case MEDIA_TYPE_POSTER:
          case MEDIA_TYPE_VIDEO:
          case MEDIA_TYPE_FILE: {
            newList.push({
              mediaType,
              url: item.materialUrl,
              title: item.materialName,
              content: item.content
            });
            break;
          }
          case MEDIA_TYPE_IMGLINK:
          case MEDIA_TYPE_MINIAPP: {
            newList.push({
              mediaType,
              url: item.materialUrl,
              title: item.materialName,
              content: item.content,
              coverUrl: item.coverUrl,
              isDefined: DEFAULT_LINK,
              appid: '',
              accountOriginalId: ''
            });
            break;
          }
          case MEDIA_TYPE_SMARTFORM:
          case MEDIA_TYPE_RADARLINK: {
            newList.push({
              mediaType,
              ...item
            });
            break;
          }
        }
      });
      this.$emit('update:formData', {
        ...this.formData,
        [materialField]: [...newList]
      });
    }
  }

};
</script>
