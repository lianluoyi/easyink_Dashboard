<script>
import { getTree, getList } from '@/api/material';
import { PAGE_LIMIT } from '@/utils/constant';
const DEFAULT_PAGE_NUM = 1;
// 文本类型
const TEXT_MEDIATYPE = '4';
/**
 * 素材列表
 * @displayName SelectMaterialList(素材列表)
 */
export default {
  components: {},
  props: {
    type: {
      type: String,
      default: '4'
    }
  },
  data() {
    return {
      loading: true, // 遮罩层
      // 查询条件
      query: {
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT,
        categoryId: '',
        search: '',
        mediaType: TEXT_MEDIATYPE,
        isExpire: false

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
      radio: ''
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
    this.getList();
  },
  mounted() {},
  methods: {
    // 获取类目树
    getTree() {
      getTree(this.type).then(({ data }) => {
        this.treeData = data;
      });
    },
    // 获取素材列表
    getList(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      getList(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
          this.loading = false;
          this.$emit('listChange', this.list);
        })
        .catch(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<template>
  <div>
    <el-form ref="form" :model="query" label-width="68px">
      <el-form-item label="选择分组">
        <el-cascader
          v-model="query.categoryId"
          :options="treeData"
          :props="groupProps"
        />
        <el-input
          v-model="query.search"
          class="ml10 mr10"
          style="width: 150px;"
          @keydown.enter="getList(1)"
        />
        <el-button type="primary" @click="getList(1)">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- <slot :list="list"></slot> -->
    <!-- 文本 -->
    <el-table
      v-if="type == 4"
      v-loading="loading"
      class="table-list"
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
        <div class="ma-img ac mb20">
          <el-card shadow="hover" body-style="padding: 0px;">
            <img class="img-li" :src="item.materialUrl" alt>
          </el-card>
          <div class="mt10 toe">{{ item.materialName }}</div>
        </div>
      </el-radio>
    </el-radio-group>
    <el-pagination
      class="fr"
      :current-page="query.pageNum"
      :page-size="query.pageSize"
      layout="prev, pager, next"
      :total="total"
      @current-change="getList"
    />
  </div>
</template>

<style lang="scss" scoped>
.img-wrap {
  height: 489px;
  overflow: auto;
  /deep/.el-radio {
    position: relative;
    .el-radio__input {
      position: absolute;
      display: block;
      top: 7px;
      left: 7px;
      z-index: 999;
    }
    .el-radio__label {
      display: block;
      padding-left: 0;
      .ma-img {
        width: 160px;
        .el-card {
          border-radius: 10px;
          .el-card__body {
            padding: 0px;
            position: relative;
            height: 158px;
          }
        }
      }
    }
  }
}
.fr {
  padding-top: 6px;
}

.img-li {
  max-width: 100%;
  height: 160px;
  border-radius: 8px;
  border: 1px solid #e6ebf5;
}
.table-list {
  height: 489px;
  overflow: auto;
}
/deep/ .el-table::before {
  height: 0;
}
</style>
