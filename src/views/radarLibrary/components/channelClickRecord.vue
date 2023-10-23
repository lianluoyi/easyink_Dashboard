<!--
 * @Description: 渠道点击记录
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <!-- 中间表格 -->
  <div class="content">
    <!-- 表格上方输入框 按钮 -->
    <div class="header-container">
      <el-input
        v-model="query.channelName"
        prefix-icon="el-icon-search"
        style="width: 240px"
        placeholder="请输入渠道名称，回车搜索"
        @input="channelNameClear"
        @keyup.enter.native="onSearchChannelName"
      />
    </div>
    <!-- 表格体 -->
    <div class="content-container">
      <RightContainer>
        <template v-slot:data>
          <el-table v-loading="loading" :data="channelList">
            <template slot="empty">
              <empty-default-icon :length="channelList.length" />
            </template>
            <el-table-column prop="channelName" label="渠道" align="center" />
            <el-table-column prop="clickNum" label="点击次数" align="center" />
            <el-table-column prop="clickPersonNum" label="点击人数" align="center" />
            <el-table-column label="操作" align="center" width="140">
              <template slot-scope="{ row }">
                <div>
                  <el-button
                    size="mini"
                    type="text"
                    @click="openChannelVisible(row)"
                  >详情</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="channelList.length > 0"
            :total="total"
            :limit.sync="query.pageSize"
            :page.sync="query.pageNum"
            @pagination="getChannelClickRecord()"
          />
        </template>
      </RightContainer>
    </div>
    <!-- 渠道点击记录详情-->
    <div class="channel-dialog">
      <el-dialog
        :title="`${channelDetailQuery.channelName}的点击详情`"
        :visible.sync="channelVisible"
        width="65%"
      >
        <!-- 表格上方输入框-->
        <div class="header-container">
          <el-input
            v-model="channelDetailQuery.customerName"
            prefix-icon="el-icon-search"
            style="width: 240px"
            placeholder="请输入客户昵称，回车搜索"
            @input="channelDetailCustomerNameClear"
            @keyup.enter.native="onSearchCustomerName"
          />
        </div>
        <div class="content-container">
          <RightContainer>
            <template v-slot:data>
              <el-table v-loading="DetailLoading" :data="channelDetailList">
                <template slot="empty">
                  <empty-default-icon :length="channelDetailList.length" />
                </template>
                <el-table-column label="客户" align="center">
                  <template slot-scope="scope">
                    <div class="user-info">
                      <img :src="scope.row.headImageUrl">
                      <span>{{ scope.row.customerName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="clickNum" label="点击次数" align="center" />
                <el-table-column
                  label="最近点击时间"
                  align="center"
                  prop="clickTime"
                  width="180"
                />
                <el-table-column label="操作" align="center" width="140">
                  <template slot-scope="{ row }">
                    <el-button size="mini" type="text" @click="checkCustomerInfo(row)">客户资料</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <pagination
                v-show="channelDetailList.length > 0"
                :total="detailListTotal"
                :limit.sync="channelDetailQuery.pageSize"
                :page.sync="channelDetailQuery.pageNum"
                @pagination="getChannelClickRecordDetail()"
              />
            </template>
          </RightContainer>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="channelVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="channelVisible = false"
          >确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import RightContainer from '@/components/RightContainer';
import { PAGE_LIMIT, DEFAULT_PAGE_NUM } from '@/utils/constant/index';
import { CUSTOMER_DEATIL_PATH } from '@/utils/constant/routePath';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { goRouteWithQuery } from '@/utils';
import { getChannelClickRecord, getChannelClickRecordDetail } from '@/api/radar';
// 点击记录
const CLICK_RECORD = {
  customer: 1,
  // eslint-disable-next-line no-magic-numbers
  channel: 2
};
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
      query: {
        // 渠道
        channelName: '',
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT,
        radarId: this.radarId
      },
      loading: false,
      // 渠道列表
      channelList: [],
      channelDetailQuery: {
        channelName: '',
        customerName: '',
        radarId: this.radarId,
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT
      },
      total: 0,
      DetailLoading: false,
      // 渠道点击记录详情列表
      channelDetailList: [],
      detailListTotal: 0,
      channelVisible: false
    };
  },
  watch: {
    channelVisible(val) {
      if (!val) {
        // 弹窗关闭的时候清空 点击详情 中的客户昵称 同时将 vuex 中的channelDetailQuery置为空
        this.channelDetailQuery.customerName = '';
        this.$store.commit('SET_SEARCH_QUERY', {
          pageName: this.$route.name,
          query: { channelQuery: this.query, channelDetailQuery: null }
        });
      }
    }
  },
  created() {
    window.sessionStorage.removeItem('clickRecord');
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
      const { channelDetailQuery, channelQuery } = this.$store.getters.searchQuery[this.$route.name];
      this.query = channelQuery;
      if (channelDetailQuery) {
        this.channelDetailQuery = channelDetailQuery;
        this.getChannelClickRecordDetail();
        this.channelVisible = true;
      }
    }
    this.getChannelClickRecord();
  },
  methods: {
    /**
     *  打开渠道记录详情弹窗
     *  @params row  点击的渠道
     */
    openChannelVisible(row) {
      this.channelDetailQuery.channelName = row.channelName;
      this.getChannelClickRecordDetail();
      this.channelVisible = true;
    },
    /**
     * 查看客户资料
     */
    checkCustomerInfo(row) {
      // TODO 改为vuex 存储点击记录，防止返回时默认为客户点击记录
      window.sessionStorage.setItem('clickRecord', CLICK_RECORD['channel']);
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: { channelQuery: this.query, channelDetailQuery: this.channelDetailQuery }
      });
      goRouteWithQuery(this.$router, CUSTOMER_DEATIL_PATH,
        {}, {
          id: row.externalId,
          prePageType: 'channelClickRecord'
        });
    },
    /**
     * 渠道名称输入框回车搜索
     */
    onSearchChannelName() {
      this.getChannelClickRecord(1);
    },
    /**
     * 清空渠道名称输入框触发的条件
     */
    channelNameClear(val) {
      if (!val) {
        this.getChannelClickRecord(1);
      }
    },
    /**
     * 客户昵称输入框回车搜索
     */
    channelDetailCustomerNameClear(val) {
      if (!val) {
        this.getChannelClickRecordDetail(1);
      }
    },
    /**
     * 清空渠道详情客户昵称输入框触发的条件
     */
    onSearchCustomerName() {
      this.getChannelClickRecordDetail(1);
    },
    /**
     * 获取渠道点击记录
     */
    getChannelClickRecord(pageNum) {
      pageNum && (this.query.pageNum = pageNum);
      this.loading = true;
      getChannelClickRecord(this.query).then(({ rows, total }) => {
        this.loading = false;
        this.channelList = rows;
        this.total = total;
      });
    },
    /**
     * 获取渠道点击记录详情
     */
    getChannelClickRecordDetail(pageNum) {
      pageNum && (this.channelDetailQuery.pageNum = pageNum);
      this.DetailLoading = true;
      getChannelClickRecordDetail(this.channelDetailQuery).then(({ rows, total }) => {
        this.DetailLoading = false;
        this.channelDetailList = rows;
        this.detailListTotal = total;
      });
    }
  }
};
</script>

<style scoped lang="scss">
@import '~@/styles/mixin.scss';
.channel-dialog {
  ::v-deep.el-dialog__body {
    padding: 10px 20px;
    max-height: 450px;
  }
  .content-container {
    flex: 1;
    overflow: auto;
    margin: 0 -15px;
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
}
</style>
