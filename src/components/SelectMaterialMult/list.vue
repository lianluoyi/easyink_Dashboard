<script>
import { getTree, getList, getMaterialIds } from '@/api/material';
import uniq from 'lodash/uniq';
import difference from 'lodash/difference';
import { MEDIA_TYPE_TEXT, MEDIA_TYPE_AUDIO, MEDIA_TYPE_FILE } from '@/utils/constant/index';
const PAGE_SIZE = 12;
/**
 * 侧边栏素材列表
 * @displayName SelectMaterialMultList(侧边栏素材列表)
 */
export default {
  components: {},
  props: {
    // 0: '图片', 1: '语音', 2: '视频', 3: '普通文件', 4: '文本', 5: '海报',
    type: {
      type: String,
      default: MEDIA_TYPE_TEXT
    },
    multiple: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Array,
      default: () => []
    },
    sideId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true, // 遮罩层
      // 查询条件
      query: {
        pageNum: 1,
        pageSize: PAGE_SIZE,
        categoryId: '',
        search: '',
        mediaType: MEDIA_TYPE_TEXT
      },
      list: [], // 列表
      total: 0, // 总条数
      treeData: [], // 树
      // 树props
      treeProps: {
        children: 'children',
        label: 'name'
      },
      // 分组props
      groupProps: {
        // expandTrigger: 'hover',
        checkStrictly: true,
        children: 'children',
        label: 'name',
        value: 'id',
        emitPath: false
      },
      radio: '',
      selectedx: [],
      showSelectedx: []
    };
  },
  computed: {},
  watch: {
    radio(val) {
      this.$emit('change', val);
    }
  },
  created() {
    this.query.mediaType = this.type;
    this.getTree();
    this.firstGetList();
  },
  mounted() {},
  methods: {
    /**
     * 首次获取素材列表
     */
    async firstGetList() {
      await this.getList();
      this.getAllMaterialIds(this.sideId);
    },
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
    /**
     * 获取所有已发布的素材id
     */
    getAllMaterialIds(sideId) {
      getMaterialIds(sideId).then(res => {
        this.selectedx = res.data;
        this.selectGridList(this.list);
        this.$emit('update:selected', res.data);
      });
    },
    selectGridList(list) {
      if (
        [MEDIA_TYPE_AUDIO, MEDIA_TYPE_FILE, MEDIA_TYPE_TEXT].includes(
          this.query.mediaType.toString()
        )
      ) {
        setTimeout(() => {
          list.forEach(item => {
            if (this.selectedx.includes(item.id)) {
              this.$refs.tableText.toggleRowSelection(item, true); // 点击选中
            }
          });
        });
      } else {
        // 当先获取到素材列表再获取到所有已发布素材id时
        if (list.length !== 0) {
          const selectList = [];
          list.forEach(item => {
            if (this.selectedx.includes(item.id)) selectList.push(item);
          });
          this.showSelectedx = selectList;
        }
      }
    },
    // 获取素材列表
    async getList(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      await getList(this.query)
        .then(({ rows, total }) => {
          this.list = [].concat(rows);
          this.total = +total;
          this.loading = false;
          this.$emit('listChange', this.list);
          this.selectGridList(rows);
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.query.categoryId = data.id;
      this.getList(1);
    },
    // 点击全选
    handleSelectAll(selection) {
      const materialIdList = this.list.map(item => item.id);
      let list = selection.map(item => item.id);
      // 取消全选
      if (selection.length === 0) {
        this.selectedx = difference(this.selectedx, materialIdList);
      } else {
        list = this.selectedx.concat(list);
        this.selectedx = uniq(list);
      }
      this.$emit('update:selected', this.selectedx);
    },
    // 单选
    handleSelectSingle(selection, row) {
      this.onCheck(row);
    },
    /**
     * 选择单个
     */
    onCheck(item) {
      const list = [...this.selectedx];
      const index = list.findIndex(listItem => listItem === item.id);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(item.id);
      }
      this.selectedx = list;
      this.$emit('update:selected', this.selectedx);
    }
  }
};
</script>

<template>
  <div>
    <template v-if="false">
      <el-form ref="form" :model="query" label-width="80px">
        <el-form-item label="选择分组">
          <el-cascader
            v-model="query.categoryId"
            :options="treeData"
            :props="groupProps"
          />
          <el-input
            v-model="query.search"
            class="ml10 mr10"
            style="width: 150px"
            @keydown.enter="getList(1)"
          />
          <el-button icon="el-icon-search" circle @click="getList(1)" />

          <el-pagination
            class="fr"
            :current-page="query.pageNum"
            :page-size="query.pageSize"
            layout="prev, pager, next"
            :total="total"
            @current-change="getList"
          />
        </el-form-item>
      </el-form>

      <!-- 文本 -->
      <el-table
        v-if="type == 4"
        v-loading="loading"
        :data="list"
        :show-header="false"
      >
        <el-table-column width="30">
          <template slot-scope="scope">
            <el-radio v-model="radio" :label="scope.row">'</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="content" />
      </el-table>

      <!-- 图片 -->
      <el-radio-group
        v-if="type == 0"
        v-model="radio"
        v-loading="loading"
        class="img-wrap"
      >
        <el-radio v-for="(item, index) in list" :key="index" :label="item">
          <img class="img-li" :src="item.materialUrl" alt>
          <div class="ac mt5">{{ item.materialName }}</div>
        </el-radio>
      </el-radio-group>
    </template>

    <el-row :gutter="10">
      <el-col :span="6" class="material-group">
        <el-tree
          ref="tree"
          class="bfc-o"
          :data="treeData"
          :props="treeProps"
          :expand-on-click-node="false"
          highlight-current
          default-expand-all
          @node-click="handleNodeClick"
        />
      </el-col>
      <el-col :span="18" class="material-content">
        <div class="fxbw">
          素材库更新本分类素材后，自动同步到聊天工具栏
          <el-pagination
            class="fr"
            :current-page="query.pageNum"
            :page-size="query.pageSize"
            layout="prev, pager, next"
            :total="total"
            @current-change="getList"
          />
        </div>
        <el-table
          v-if="[1, 3, 4].includes(+type)"
          ref="tableText"
          class="material-list-table"
          :data="list"
          @select="handleSelectSingle"
          @select-all="handleSelectAll"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column v-if="type == 4" prop="content" label="文本内容" />
          <el-table-column v-else prop="materialName" label="素材名称" />
          <!-- <el-table-column prop="createTime" label="时间"></el-table-column> -->
        </el-table>

        <el-row v-else :gutter="20">
          <el-checkbox-group v-model="showSelectedx">
            <el-col
              v-for="(item, index) in list"
              :key="index"
              :span="6"
              style="margin-bottom: 24px; min-width: 211px"
            >
              <el-card shadow="hover" body-style="padding: 0px;">
                <div class="img-wrap">
                  <el-image
                    v-if="type == 0"
                    :src="item.materialUrl"
                    fit="contain"
                  />
                  <el-image
                    v-else-if="type == 2"
                    :src="item.coverUrl"
                    fit="contain"
                  />
                </div>
                <div class="material-item-name">
                  <el-checkbox :label="item" @change="() => onCheck(item)">
                    <span class="label" :title="item.materialName">
                      {{ item.materialName }}
                    </span>
                  </el-checkbox>
                </div>
              </el-card>
            </el-col>
          </el-checkbox-group>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
// .img-wrap {
//   /deep/.el-radio__input {
//     position: absolute;
//     left: 50%;
//     top: 50%;
//     transform: translate(-50%, -50%);
//   }
// }
.img-li {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  border: 1px solid #e6ebf5;
}

.img-wrap {
  position: relative;
  height: 0;
  padding: 70% 0 0 0;
  border-bottom: 1px solid #e6ebf5;
  .el-image {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
  }
}
/deep/ .el-checkbox__label {
  vertical-align: text-top;
}
.label {
  white-space: normal;
}
.material-group {
  max-height: 600px;
  overflow: auto;
}
.material-list-table {
  height: 600px;
  overflow: auto;
}
.material-content {
  /deep/ .el-row {
    max-height: 600px;
    overflow: auto;
    .el-col {
      .el-card {
        .el-card__body {
          .material-item-name {
            height: 54px;
            padding: 6px;
            .el-checkbox {
              position: relative;
              width: 100%;
              .el-checkbox__label {
                width: calc(100% - 16px);
                .label {
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
