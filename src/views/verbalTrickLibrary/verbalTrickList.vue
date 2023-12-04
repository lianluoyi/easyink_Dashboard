<!--
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="verbal-trick-list-page">
    <div class="header-container">
      <el-input
        v-model="query.searchValue"
        prefix-icon="el-icon-search"
        style="width: 240px"
        placeholder="请输入话术标题或内容，回车搜索"
        @keyup.enter.native="onSearch"
      />
      <div v-if="roleKey" class="operate-btn">
        <el-button class="btn-reset" @click="importVerbalTrick">导入话术</el-button>
        <el-button class="btn-reset" @click="batchUpdateGroup">批量修改分组</el-button>
        <el-button class="btn-reset" @click="batchDelete">批量删除</el-button>
        <el-button type="primary" @click="addVerbalTrick">添加话术</el-button>
      </div>
    </div>
    <div class="content-container">
      <RightContainer>
        <template v-slot:data>
          <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
            <template slot="empty">
              <empty-default-icon
                :length="list.length"
              />
            </template>
            <el-table-column
              type="selection"
              width="55"
            />
            <el-table-column
              prop="codeUrl"
              label="话术内容"
              align="center"
              width="300"
            >
              <template slot-scope="scope">
                <div class="verbal-trick-detail">
                  <div v-for="(item, index) in scope.row.weWordsDetailList.slice(0, 2)" :key="index" class="content-div">
                    <VerbalTrickDetailPreview :item="item" />
                  </div>
                  <div
                    v-if="scope.row.weWordsDetailList && scope.row.weWordsDetailList.length > 2"
                    class="check-more theme-text-color"
                    @click="handleCheckMore(scope.row)"
                  >共{{ scope.row.weWordsDetailList.length }}条 查看更多</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="title"
              label="话术标题"
              align="center"
            />
            <el-table-column
              prop="groupId"
              label="所属分组"
              align="center"
            >
              <template slot-scope="scope">
                <div>{{ dealGroupName(scope.row) }}</div>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              class-name="small-padding fixed-width"
              width="180"
            >
              <template slot-scope="scope">
                <el-button
                  v-if="roleKey"
                  size="mini"
                  type="text"
                  @click="handleEdit(scope.row)"
                >编辑</el-button>
                <el-button
                  v-if="roleKey"
                  size="mini"
                  type="text"
                  @click="handleDelete(scope.row, scope.index)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="list.length > 0"
            :total="total"
            :limit.sync="query.pageSize"
            :disabled="loading"
            :page.sync="query.pageNum"
            :select-data-len="multiSelect.length"
            @pagination="() => getAllWordsList()"
          />
        </template>
      </RightContainer>
    </div>
    <AddVerbalTrickDrawer
      ref="addVerbalTrickDrawer"
      :visible.sync="addVerbalTrickDrawerVisible"
      :add-verbal-trick-drawer-visible="addVerbalTrickDrawerVisible"
      :type="type"
      :group-tree-data="selectGroupTreeData"
      :selected-group="selectedGroup"
      @getList="(addFlag) => getAllWordsList({},addFlag)"
    />
    <VerbalTrickDetailDrawer
      title="话术详情"
      :visible.sync="verbalTrickDetailDrawerVisible"
      :item="verbalTrickDetail"
      :deal-group-name="dealGroupName"
      :handle-edit="handleEdit"
      :role-key="roleKey"
    />
    <ImportFile
      :visible.sync="importVisible"
      title="话术"
      href="EasyInk话术导入模版.xlsx"
      alert-title="仅支持导入文字话术"
      :upload-params="{type: type}"
      :loading="importLoading"
      :import-info="importInfo"
      @handleImportFile="handleImportFile"
    />
    <BatchUpdateGroup
      :visible.sync="batchVisible"
      title="批量修改所属分组"
      width="443px"
      :group-tree-data="selectGroupTreeData"
      :multi-select="multiSelect"
      @getList="() => getAllWordsList({})"
    />
  </div>
</template>
<script>
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { getWordsList, deleteWords, importWords } from '@/api/wordsGroup';
import AddVerbalTrickDrawer from './component/addVerbalTrickDrawer.vue';
import ImportFile from '@/components/ImportFile.vue';
import { VERBAL_TRICK_TYPE, MEDIA_TYPE_TEXT, MEDIA_TYPE_POSTER, PAGE_LIMIT } from '@/utils/constant/index';
import VerbalTrickDetailPreview from './component/verbalTrickDetailPreview.vue';
import VerbalTrickDetailDrawer from './component/verbalTrickDetailDrawer.vue';
import BatchUpdateGroup from './component/batchUpdateGroup.vue';
import { deepClone } from '@/utils/index';
export default {
  name: 'VerbalTrickList',
  components: { RightContainer, EmptyDefaultIcon, AddVerbalTrickDrawer, ImportFile, VerbalTrickDetailPreview, VerbalTrickDetailDrawer,
    BatchUpdateGroup },
  props: {
    // 话术类型
    type: {
      type: Number,
      default: VERBAL_TRICK_TYPE['enterprise']
    },
    // 话术分组
    allGroupData: {
      type: Array,
      default: () => []
    },
    // 话术分组树结构
    groupTreeData: {
      type: Array,
      default: () => []
    },
    // 分组id列表
    categoryIds: {
      type: Array,
      default: () => []
    },
    // 话术操作权限
    roleKey: {
      type: Boolean,
      default: true
    },
    selectedGroup: {
      type: String,
      default: ''
    },
    handleGetGroup: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      MEDIA_TYPE_TEXT,
      MEDIA_TYPE_POSTER,
      // 搜索内容
      query: { searchValue: '', pageSize: PAGE_LIMIT, pageNum: 1 },
      total: 0,
      list: [],
      loading: false,
      // 添加/编辑话术抽屉显示
      addVerbalTrickDrawerVisible: false,
      // 话术详情抽屉显示
      verbalTrickDetailDrawerVisible: false,
      // 话术详情抽屉显示信息
      verbalTrickDetail: {},
      // 导入话术弹窗显示
      importVisible: false,
      // 已选中的话术
      multiSelect: [],
      batchVisible: false,
      // 导入话术loading状态
      importLoading: false,
      // 导入话术结果
      importInfo: {}
    };
  },
  computed: {
    // 修改分组时不显示“全部”节点
    selectGroupTreeData() {
      const list = [...this.groupTreeData];
      if (list[0] && list[0].id === '0') {
        return list[0].children;
      } else {
        return list;
      }
    }
  },
  created() {
  },
  mounted() {},
  methods: {
    /**
     * 删除话术
     */
    handleDelete(data) {
      this.confirmModal({
        msg: '话术删除后，员工不可在客户端侧边栏使用，是否继续？'
      }, () => {
        this.deleteWords({
          ids: [data.id]
        });
      });
    },
    /**
     * 编辑话术
     */
    handleEdit(data) {
      this.addVerbalTrickDrawerVisible = true;
      if (this.$refs.addVerbalTrickDrawer) {
        this.$refs.addVerbalTrickDrawer.formData = deepClone(data);
        // 清除错误提示
        this.$refs.addVerbalTrickDrawer.$refs?.verbalForm?.resetFields();
      }
    },
    /**
     * @description 获取话术列表
     * @param addFlag 是否新增话术
     */
    getAllWordsList(params, addFlag) {
      if (addFlag) {
        this.query = this.$options.data().query;
      }
      const newParams = {
        pageSize: this.query.pageSize,
        pageNum: this.query.pageNum,
        content: this.query.searchValue,
        categoryIds: this.categoryIds,
        ...params
      };
      if (!newParams.categoryIds || !newParams.categoryIds.length) {
        return false;
      }
      this.getWordsList(newParams);
    },
    async getWordsList(params) {
      this.loading = true;
      const wordRes = await getWordsList(params);
      if (wordRes) {
        this.list = wordRes.rows;
        this.total = wordRes.total ? Number(wordRes.total) : 0;
        this.loading = false;
      }
    },
    /**
     * 添加话术
     */
    addVerbalTrick() {
      if (!this.allGroupData.length) {
        this.msgWarn('请先添加分组');
        return false;
      }
      this.$refs.addVerbalTrickDrawer.formData = {
        categoryId: undefined,
        title: undefined,
        // 话术内容列表
        weWordsDetailList: [{
          mediaType: MEDIA_TYPE_TEXT,
          content: ''
        }],
        isPush: [VERBAL_TRICK_TYPE['enterprise'], VERBAL_TRICK_TYPE['enterprise']].includes(this.type)
      };
      // 清除错误提示
      this.$refs.addVerbalTrickDrawer.$refs?.verbalForm?.resetFields();
      this.addVerbalTrickDrawerVisible = true;
    },
    /**
     * 查看更多话术详情
     */
    handleCheckMore(detail) {
      this.verbalTrickDetailDrawerVisible = true;
      this.verbalTrickDetail = detail;
    },
    dealGroupName(detail) {
      const index = this.allGroupData.findIndex(item => item.id === detail.categoryId);
      let groupName;
      if (index > -1) {
        groupName = this.allGroupData[index].name;
      }
      return groupName;
    },
    onSearch() {
      this.query.pageNum = 1;
      this.getAllWordsList({ content: this.query.searchValue });
    },
    /**
     * 导入话术
     */
    importVerbalTrick() {
      this.importVisible = true;
    },
    /**
     * 处理多选
     */
    handleSelectionChange(val) {
      this.multiSelect = val;
    },
    async deleteWords(params = {}) {
      const delRes = await deleteWords(params);
      if (delRes) {
        this.msgSuccess('操作成功');
        this.getAllWordsList({});
      }
    },
    /**
     * 批量删除
     */
    batchDelete() {
      if (this.multiSelect.length === 0) {
        this.msgWarn('请勾选要操作的话术');
        return;
      }
      const delIds = [];
      this.multiSelect.map(item => {
        delIds.push(item.id);
      });
      this.confirmModal({
        msg: '话术删除后，员工不可在客户端侧边栏使用，是否继续？'
      }, () => {
        this.deleteWords({
          ids: delIds
        }).then(res => {
          this.msgSuccess('删除成功');
        });
      });
    },
    /**
     * 批量修改分组
     */
    batchUpdateGroup() {
      if (this.multiSelect.length === 0) {
        this.msgWarn('请勾选要操作的话术');
        return;
      }
      this.batchVisible = true;
    },
    /**
     * 导入话术
     */
    handleImportFile(formData) {
      this.importLoading = true;
      importWords(formData).then(res => {
        this.handleGetGroup();
        const resData = res.data;
        this.importInfo = {
          successNum: resData.successNum,
          failNum: resData.failNum,
          url: resData.url
        };
      })
        .finally(() => {
          this.importLoading = false;
        });
    }
  }

};
</script>
<style scoped lang='scss'>
.verbal-trick-list-page {
    width: calc(100% - 310px);
    margin-left: 10px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    .header-container {
        padding: 15px 15px 0px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .content-container {
      flex: 1;
      overflow: auto;
    }
    .verbal-trick-detail {
      .check-more {
        cursor: pointer;
      }
    }
}
</style>
