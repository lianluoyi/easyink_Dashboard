<!--
 * @Description: 标签管理界面
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <RightContainer :config-keys="['customSecret']" page-title="管理企业标签">
    <template v-slot:search>
      <el-form :inline="true" :model="query" class="demo-form-inline">
        <el-form-item>
          <el-input v-model="query.searchName" placeholder="请输入标签组或标签" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch()">查询</el-button>
          <el-button
            class="btn-reset"
            @click="resetQuery"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:data-stat>
      <div :class="`desc-div${type === 'group' ? ' group-desc-div' : ''}`">
        <div>当前{{ type === 'group' ? '客户群' : '企业' }}标签已创建<span class="data-count-num">{{ tagTotal }}/3000</span></div>
        <div v-if="type === 'group'" class="gray-desc">群标签为系统标签，不可同步到企业微信</div>
      </div>
    </template>
    <template v-slot:operate-btn>
      <el-button
        v-hasPermi="['customerManage:tag:add']"
        type="primary"
        @click="edit()"
      >新建标签组</el-button>
      <el-button
        v-if="type === 'customer'"
        v-hasPermi="['customerManage:tag:sync']"
        @click="syncTag"
      >同步标签组</el-button>
      <el-button
        v-hasPermi="['customerManage:tag:remove']"
        @click="remove()"
      >批量删除</el-button>
    </template>
    <template v-slot:data>
      <el-table
        v-loading="loading"
        :data="list"
        @selection-change="handleSelectionChange"
      >
        <template slot="empty">
          <empty-default-icon
            text="暂无数据"
            :desc="type === 'customer' ? '若首次加载，请耐心等待后台数据同步，稍后回来' : ''"
            :desc-show-condition="{ searchName: query.searchName }"
            :desc-config="['customSecret']"
          />
        </template>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="标签组" align="left" prop="groupName" />
        <el-table-column label="标签" align="left" prop="weTags">
          <template slot-scope="scope">
            <el-tag
              v-for="(item, index) in scope.row.weTags"
              :key="index"
              type="info"
              class="customer-tag-item"
            >{{ item.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="left"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['customerManage:tag:edit']"
              type="text"
              @click="edit(scope.row, scope.index)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['customerManage:tag:remove']"
              type="text"
              @click="remove(scope.row.groupId)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        :select-data-len="ids.length"
        @pagination="getList()"
      />
      <!-- 弹窗 -->
      <AddTag
        :visible.sync="dialogVisible"
        :form="form"
        :tag-type="type"
        @success="()=>{
          getTagTotal()
          getList(!form.groupId && 1)
        }"
      />
    </template>
  </RightContainer>
</template>
<script>
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import AddTag from '@/components/AddTag';
import { PAGE_LIMIT } from '@/utils/constant';
import * as api from '@/api/customer/tag';
import * as groupTagApi from '@/api/customer/grouptag';
import { totalTagCnt } from '@/api/customer/group';
export default {
  name: '',
  components: { AddTag, RightContainer, EmptyDefaultIcon },
  props: {
    type: {
      type: String,
      default: 'customer'
    }
  },
  data() {
    return {
      query: {
        searchName: '',
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      // 遮罩层
      loading: false,
      // 表格数据
      list: [],
      // 总条数
      total: 0,
      dialogVisible: false,
      // 表单参数
      form: {
        groupName: '',
        weTags: []
      },
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      tagTotal: 0
    };
  },
  watch: {
    type() {
      this.getList(1);
      this.getTagTotal();
    }
  },
  created() {
    this.getList();
    this.getTagTotal();
  },
  mounted() {},
  methods: {
    onSearch() {
      // 点击查询将页码设置到第一页
      this.getList(1);
    },
    getTagTotal() {
      const fn = this.type === 'customer' ? totalTagCnt : groupTagApi.groupTotalTagCnt;
      fn().then((res) => {
        this.tagTotal = res.data;
      });
    },
    getList(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      switch (this.type) {
        case 'customer': {
          this.$store.dispatch('listInfo/getTagList');
          api
            .getList(this.query)
            .then(({ rows, total }) => {
              this.list = rows;
              this.total = +total;
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
          break;
        }
        case 'group': {
          // TODO 为什么要调用2次？？？ 若不需要在全局存储 则删除该处调用并将vuex中的模块删除
          this.$store.dispatch('listInfo/getGroupTagList');
          groupTagApi
            .getGroupTagListByPage({ ...this.query })
            .then(({ rows, total }) => {
              this.list = rows;
              this.total = +total;
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
          break;
        }
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.query.searchName = '';
      this.$nextTick(() => {
        this.getList(1);
      });
    },
    /** 删除按钮操作 */
    remove(id) {
      if (!id && !this.ids.length) {
        this.msgWarn('请至少选择一个标签组');
        return;
      }
      const operIds = id || this.ids + '';
      this.confirmModal({
        msg: `删除后，将不可再为${this.type === 'group' ? '客户群' : '客户'}添加该标签，是否继续？`
      }, () => {
        const removeLength = id ? 1 : this.ids.length;
        const page = this.list.length === removeLength && this.query.pageNum > 1 ? this.query.pageNum - 1 : this.query.pageNum;
        switch (this.type) {
          case 'customer': {
            return api.remove(operIds)
              .then(() => {
                this.getList(page);
                this.getTagTotal();
                this.msgSuccess('删除成功');
              });
          }
          case 'group': {
            const delList = id ? [id] : this.ids;
            groupTagApi.deleteGroupTag({
              delList: delList
            }).then(() => {
              this.getList(page);
              this.getTagTotal();
              this.msgSuccess('删除成功');
            });
          }
        }
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.groupId);
      this.multiple = !selection.length;
    },
    syncTag() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      api.syncTag().then(() => {
        loading.close();
        this.msgSuccess('操作成功');
        this.getList();
      });
    },
    edit(data, type) {
      this.form = JSON.parse(
        JSON.stringify(Object.assign({ weTags: [] }, data || {}))
      );
      this.dialogVisible = true;
    }
  }

};
</script>
<style scoped lang='scss'>
.desc-div {
  .gray-desc {
    color: $grayColor;
  }
}
.group-desc-div {
  div {
    line-height: 20px;
  }
}
.customer-tag-item {
  margin-bottom: 2px;
  margin-top: 2px;
}
</style>
