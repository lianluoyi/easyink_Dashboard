<!--
 * @Description: 客户点击记录
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <!-- 中间表格 -->
  <div class="content">
    <!-- 表格上方输入框-->
    <div class="header-container">
      <el-input
        v-model="query.customerName"
        prefix-icon="el-icon-search"
        style="width: 240px"
        placeholder="请输入客户昵称，回车搜索"
        @input="clear"
        @keyup.enter.native="onSearch"
      />
    </div>
    <!-- 表格体 -->
    <div class="content-container">
      <RightContainer>
        <template v-slot:data>
          <el-table v-loading="loading" :default-sort="{prop: 'clickNum', order: null}" :data="customerClickRecordList" @sort-change="changeTableSort">
            <template slot="empty">
              <empty-default-icon :length="customerClickRecordList.length" />
            </template>
            <el-table-column label="客户" align="center">
              <template slot-scope="{ row }">
                <div class="user-info">
                  <img :src="row.headImageUrl">
                  <span>{{ row.customerName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="clickNum" label="点击次数" align="center" sortable="custom" />
            <el-table-column
              label="最近点击渠道"
              align="center"
              prop="channelName"
            />
            <el-table-column
              label="最近点击时间"
              align="center"
              prop="clickTime"
            />
            <el-table-column label="操作" align="center" width="140">
              <template slot-scope="{ row }">
                <el-button size="mini" type="text" @click="checkCustomerInfo(row)">客户资料</el-button>
                <el-button
                  size="mini"
                  type="text"
                  @click="openCustomerVisible(row)"
                >点击记录</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="customerClickRecordList.length > 0"
            :total="total"
            :limit.sync="query.pageSize"
            :disabled="loading"
            :page.sync="query.pageNum"
            @pagination="getCustomerClickRecord()"
          />
        </template>
      </RightContainer>
    </div>
    <!-- 客户点击记录弹窗 -->
    <div class="customer-dialog">
      <el-dialog title="点击记录" :visible.sync="customerVisible" width="45%">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.clickTime"
          >
            {{ activity.recordText }}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// 渠道名称最大长度
import RightContainer from '@/components/RightContainer';
import { PAGE_LIMIT, DEFAULT_PAGE_NUM, SORT } from '@/utils/constant/index';
import { CUSTOMER_DEATIL_PATH } from '@/utils/constant/routePath';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { getCustomerClickRecord, getCustomerClickRecordDetail } from '@/api/radar';
import { goRouteWithQuery } from '@/utils';
export default {
  components: { RightContainer, EmptyDefaultIcon },
  props: {
    radarId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      SORT,
      query: {
        // 客户昵称
        customerName: '',
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT,
        radarId: this.radarId,
        enableSort: null
      },
      customerClickRecordList: [],
      loading: false,
      total: 0,
      customerVisible: false,
      activities: []
    };
  },
  created() {
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
      this.query = this.$store.getters.searchQuery[this.$route.name];
    }
    this.getCustomerClickRecord();
  },
  methods: {
    /**
     * 表格排序
     */
    changeTableSort(obj) {
      this.query.enableSort = null;
      this.query.enableSort = SORT[obj.order];
      this.getCustomerClickRecord(1);
    },
    openCustomerVisible(row) {
      this.getCustomerClickRecordDetail(row);
      this.customerVisible = true;
    },
    /**
     * 查看客户资料
     */
    checkCustomerInfo(row) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.query
      });
      goRouteWithQuery(this.$router, CUSTOMER_DEATIL_PATH,
        {}, {
          id: row.externalId,
          prePageType: 'customerClickRecord'
        });
    },
    /**
     * 回车搜索
     */
    onSearch() {
      this.getCustomerClickRecord(1);
    },
    /**
     * 清空客户昵称输入框触发的条件
     */
    clear(val) {
      if (!val) {
        this.getCustomerClickRecord(1);
      }
    },
    /**
     * 获取客户点击记录
     */
    getCustomerClickRecord(pageNum) {
      pageNum && (this.query.pageNum = pageNum);
      this.loading = true;
      getCustomerClickRecord(this.query).then(({ rows, total }) => {
        this.loading = false;
        this.customerClickRecordList = rows;
        this.total = total;
      });
    },
    /**
     * 获取客户点击记录详情
     */
    getCustomerClickRecordDetail(row) {
      const params = {
        externalId: row.externalId,
        radarId: this.radarId
      };
      getCustomerClickRecordDetail(params).then((res) => {
        this.activities = res.data;
      });
    }
  }
};
</script>

<style scoped lang="scss">
@import '~@/styles/mixin.scss';
.customer-dialog {
  ::v-deep.el-dialog__body {
    padding: 10px 20px;
    height: 450px;
  }
}
.content {
  background-color: #fff;
  display: flex;
  flex-direction: column;
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .content-container {
    flex: 1;
    overflow: auto;
    margin: 0 -15px;
  }
  .user-info {
    display: flex;
    align-items: center;
    i {
      font-size: 35px;
      @include text_btn_color($color-theme2-1);
    }
    img {
      width: 35px;
      height: 35px;
    }
    span {
      color: #333;
      padding-left: 5px;
    }
  }
}
</style>
