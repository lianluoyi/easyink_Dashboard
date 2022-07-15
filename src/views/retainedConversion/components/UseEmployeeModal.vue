<!--
 * @Description: 使用员工弹窗
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<template>
  <el-dialog v-bind="$attrs" width="500px" class="use-employee-modal" v-on="$listeners" @close="onClose">
    <RightContainer v-if="isGroup">
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          class="top-search"
          size="small"
          @submit.native.prevent
        >
          <el-form-item prop="name">
            <el-input
              v-model="query.name"
              placeholder="请输入群聊名称，回车搜索"
              clearable
              @keyup.enter.native="onSearch"
            />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:data>
        <el-table
          ref="table"
          :data="list.slice((query.pageNum-1) * query.pageSize, query.pageNum * query.pageSize)"
          tooltip-effect="dark"
          height="300px"
          highlight-current-row
        >
          <template slot="empty">
            <empty-default-icon
              text="暂无数据"
            />
          </template>
          <el-table-column key="row-1" label="群昵称" prop="groupName" align="left" />
          <el-table-column key="row-2" label="群主" prop="userName" align="left" />
          <el-table-column key="row-3" label="创建时间" prop="createTime" align="left" />
          <el-table-column key="row-4" label="加入SOP时间" prop="addTime" align="left" />
        </el-table>
      </template>
    </RightContainer>
    <RightContainer v-else>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          class="top-search"
          size="small"
          @submit.native.prevent
        >
          <el-form-item prop="name">
            <el-input
              v-model="query.name"
              :placeholder="isActivity? '请输入客户名称，回车搜索' : '请输入员工名称，回车搜索'"
              clearable
              @keyup.enter.native="onSearch"
              @submit.native.prevent
            />
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:data>
        <el-table
          ref="table"
          :data="list.slice((query.pageNum-1) * query.pageSize, query.pageNum * query.pageSize)"
          tooltip-effect="dark"
          height="300px"
          highlight-current-row
        >
          <template slot="empty">
            <empty-default-icon
              text="暂无数据"
            />
          </template>
          <el-table-column v-if="!isActivity" key="row-1" label="员工" prop="userName,departmentName" align="left">
            <template slot-scope="{ row }">
              <TagUserShow :name="row.userName ? row.userName : row.departmentName" :show-icon="row.departmentName ? true : false" :margin-right="2" />
            </template>
          </el-table-column>
          <el-table-column v-if="!isActivity" key="row-2" label="所属部门" prop="mainDepartmentName" align="left" />
          <el-table-column v-if="isActivity" key="row-3" label="客户" prop="name" align="left">
            <template #default="{ row }">
              <div class="flex user-info">
                <el-image :src="row.headImageUrl" style="width: 35px; height: 35px;" class="mr5" />
                <span class="inoneline" style="display: inline-block;">{{ row.name }}</span>
                <span :class="`type-info intwoline ${row.type === wxType ? 'wx-type-flag' : 'corp-type-name'}`">{{ renderUserInfo(row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="isActivity" key="row-4" label="所属员工" prop="userName" align="left">
            <template #default="{ row }">
              <div style="font-size: 14px;">
                <div>{{ row.userName }}</div>
                <div style="font-size: 12px;">{{ row.mainDepartmentName }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </RightContainer>
    <pagination
      layout="prev, pager, next"
      :total="list.length"
      :limit.sync="query.pageSize"
      :page.sync="query.pageNum"
      small
    />
  </el-dialog>
</template>
<script>
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import TagUserShow from '@/components/TagUserShow';
import { PAGE_LIMIT, SOP_TYPE, WX_TYPE } from '@/utils/constant';
import { dealAtInfo } from '@/utils/common';

export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon, TagUserShow },
  props: {
    userList: {
      type: Array,
      default: () => []
    },
    departmentList: {
      type: Array,
      default: () => []
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    sopType: {
      type: Number,
      default: null
    },
    isActivity: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      query: {
        name: '',
        list: [],
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      list: [],
      SOP_TYPE,
      wxType: WX_TYPE
    };
  },
  watch: {
    userList(val) {
      this.list = [...this.list, ...val];
      this.total = this.total ? this.total + this.list.length : this.list.length;
    },
    departmentList(val) {
      this.list = [...this.list, ...val];
      this.total = this.total ? this.total + this.list.length : this.list.length;
    }
  },
  created() {
    this.list = [...this.userList, ...this.departmentList];
  },
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    },
    /**
     * 查询
     */
    onSearch() {
      let field = this.isGroup ? 'groupName' : 'userName';
      if (this.isActivity) field = 'name';

      const list = this.userList.filter(item => item[field].includes(this.query.name));
      const dlist = this.departmentList.filter(item => item['departmentName'].includes(this.query.name));
      this.query.pageNum = 1;
      this.list = [...list, ...dlist];
    },
    renderUserInfo(item) {
      return dealAtInfo(item);
    }
  }

};
</script>
<style scoped lang='scss'>
.use-employee-modal {
    /deep/ .el-dialog__body {
        padding-top: 0;
    }
    /deep/ .top-search {
        margin-bottom: 0;
        padding-top: 0;
        padding-left: 0;
    }
    /deep/ .show-data-wrapper {
        padding: 0;
    }
    .user-info {
      align-items: center;
      font-size: 14px;
      .type-info {
        flex: 1;
      }
    }
}
</style>
