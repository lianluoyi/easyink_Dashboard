<template>
  <div v-loading="pageLoading" class="chart-show">
    <EmptyDefaultIcon
      :length="Number(!showEmptyIcon)"
      text="暂无数据"
    >
      <div class="show-card">
        <div v-for="item in list" :key="item.tagGroupId" class="card-item">
          <div class="header">
            <div class="header-left">
              {{ item.groupTagName }}{{ ` (${item.tagGroupCustomerCnt}${tagType() === TAG_LABEL_TYPE['customer'] ? '人)' : '个)'}` }}
            </div>
            <div class="header-right fcc">
              <span v-show="item.showType === SHOW_TYPE['chart']">
                <el-popover
                  placement="top-start"
                  trigger="hover"
                  popper-class="tip-popover"
                >
                  <div>{{ SHOW_LABEL[tagType()] }}</div>
                  <i slot="reference" class="iconfont icon-question" style="font-size: 14px; color:#999;" />
                </el-popover>
              </span>
              <span class="ml10">{{ item.showType }}</span>
              <el-dropdown @command="(e)=> handleChangeShowType(e,item)">
                <span>
                  <i class="el-icon-arrow-down  el-icon--right" style="font-size: 14px;cursor: pointer;" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="SHOW_TYPE['chart']">{{ SHOW_TYPE['chart'] }}</el-dropdown-item>
                  <el-dropdown-item :command="SHOW_TYPE['list']">{{ SHOW_TYPE['list'] }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <div class="chart-body fcc">
            <Graphics v-if="item.showType === SHOW_TYPE['chart']" :echars-options-data="item.echartOptions" />
            <el-table
              v-else
              v-loading="item.loading"
              height="250"
              :data="item.list"
            >
              <el-table-column
                type="index"
                label="排序"
                width="50"
              />
              <el-table-column prop="tagName" label="标签" min-width="180" />
              <el-table-column prop="customerCnt" :label="tagType() === TAG_LABEL_TYPE['customer'] ? '客户数(人)' : '客户群(个)'" min-width="80" />
            </el-table>
          </div>
        </div>
        <!--
        处理flex布局的最后一行元素宽度 否则最后一行若个数不能填满整行 会导致宽度不一致
        card-item定义了最小宽度 一行最多可以放下四个
        由于最后一行列表的最少个数1个，所以同其他行差距为，单行铺满的个数-1
        因此我们只需要让空列表个数为最多放下的个数 -1
      -->
        <div class="card-item empty-item" />
        <div class="card-item empty-item" />
        <div class="card-item empty-item" />
      </div>
      <div v-if="list.length !== total" v-loading="loading" element-loading-spinner="el-icon-loading" class="customClass" />
      <div v-if="noMore" class="no-more">
        没有更多了
      </div>
      <!-- 空元素判断是否达到底部 -->
      <div id="emptyDiv" />
    </EmptyDefaultIcon>
  </div>
</template>

<script>
import { getCustomerTagChartView, getCustomerTagTableView, getGroupTagChartView, getGroupTagTableView } from '@/api/statistics';
import { PAGE_LIMIT, DEFAULT_PAGE_NUM, TAG_LABEL_TYPE } from '@/utils/constant/index';
import Graphics from './Graphics.vue';
import { uniqBy, findIndex } from 'lodash';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
const SHOW_TYPE = {
  'chart': '饼图',
  'list': '列表'
};
const SHOW_LABEL = {
  [TAG_LABEL_TYPE['customer']]: '为更好的展示数据，只显示前10个客户数最多的标签，如需查看更多，请切换到列表',
  [TAG_LABEL_TYPE['group']]: '为更好的展示数据，只显示前10个客户群最多的标签，如需查看更多，请切换到列表'
};
export default {
  components: { Graphics, EmptyDefaultIcon },
  props: {
    getSearchPayload: {
      type: Function,
      default: null
    }
  },
  inject: ['tagType'],
  data() {
    return {
      query: {
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT,
        // 排序不变
        sortName: 'customerCntSort', // 默认降序
        sortType: 'DESC'
      },
      list: [],
      total: 0, // 总数
      SHOW_TYPE,
      pageLoading: true,
      loading: true,
      noMore: false,
      showEmptyIcon: false,
      SHOW_LABEL,
      TAG_LABEL_TYPE,
      ob: null // 监听元素是否可见的IntersectionObserver实例
    };
  },
  watch: {
    list(val) {
      if (val.length) {
        this.ob.observe(document.getElementById('emptyDiv'));
      }
    }
  },
  mounted() {
    this.ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (this.list.length < this.total) {
            this.loading = true;
            this.query.pageNum++;
            this.getList();
          } else {
            this.loading = false;
            this.ob.unobserve(document.getElementById('emptyDiv'));
          }
        }
      },
      {}
    );
  },
  methods: {
    handleChangeShowType(e, item) {
      item.showType = e;
      if (e === SHOW_TYPE['list'] && !item.list) {
        const index = findIndex(this.list, (o) => o.tagGroupId === item.tagGroupId);
        item.loading = true;
        const { userIds, departmentIds, beginTime, endTime } = this.getPayload();
        const payload = {
          sortName: 'customerCntSort',
          sortType: 'DESC',
          tagGroupIds: [item.tagGroupId],
          userIds,
          departmentIds,
          beginTime,
          endTime
        };
        const fn = this.tagType() === TAG_LABEL_TYPE['customer'] ? getCustomerTagTableView : getGroupTagTableView;
        fn(payload).then((res) => {
          item.list = res.rows;
          // 直接修改item无法触发视图更新 采用splice替换 vue对该方法拦截 自动更新视图
          this.list.splice(index, 1, { ...item, list: res.rows });
        }).finally(() => {
          this.list.splice(index, 1, { ...item, loading: false });
        });
      }
    },
    /**
     * @description 获取饼图信息
     */
    getTagEchatsData(item) {
      // 后端只返回10条数据 需要去计算10条数据的总和是否超过数总和 totalCustomerCnt 超过添加 其他选择
      const customerNums = item.groupTagList.reduce((sum, e) => sum + Number(e.customerCnt || 0), 0);
      let payload = item.groupTagList.map((groupTag) => {
        return {
          value: groupTag.customerCnt,
          name: groupTag.tagName
        };
      });
      if (customerNums < item.totalCustomerCnt) {
        payload = [...payload, { value: item.totalCustomerCnt - customerNums, name: '其他' }];
      }
      return payload;
    },
    getList(initPage) {
      initPage && (this.query.pageNum = DEFAULT_PAGE_NUM);
      const fn = this.tagType() === TAG_LABEL_TYPE['customer'] ? getCustomerTagChartView : getGroupTagChartView;
      fn(this.getPayload()).then((res) => {
        this.list = uniqBy([...this.list, ...res.rows.map((item) => {
          return {
            ...item,
            showType: SHOW_TYPE['chart'],
            echartOptions: {
              tooltip: {
                trigger: 'item'
              },
              color: ['#5087ec', '#68bbc4', '#58a55c', '#f2bd42', '#91cc75', '#ee6665', '#fc8452', '#9a60B4', '#ea7acc', '#596ebc', '#f2bd42'],
              series: [
                {
                  type: 'pie',
                  radius: '70%',
                  data: this.getTagEchatsData(item),
                  label: {
                    formatter(v) {
                      const MAX_LABEL_LENGTH = 6;
                      if (v.name.length <= MAX_LABEL_LENGTH) {
                        return `${v.name}\n${v.percent}%`;
                      } else {
                        return `${v.name.slice(0, MAX_LABEL_LENGTH)}\n${v.name.slice(MAX_LABEL_LENGTH, v.name.length)}\n${v.percent}%`;
                      }
                    },
                    color: 'black'
                  }
                }
              ]
            }
          };
        })]);
        this.total = res.total;
      }).catch(() => {
        this.list = [];
        this.total = 0;
        this.msgError('服务异常，请联系管理员');
      }).finally(() => {
        this.loading = false;
        this.pageLoading = false;
        // 当没有加载过下一页的时候不显示没有更多
        if (this.query.pageNum !== DEFAULT_PAGE_NUM) {
          this.noMore = this.list.length === this.total;
        }
        this.showEmptyIcon = Boolean(!this.list.length);
      });
    },
    reset() {
      this.ob.unobserve(document.getElementById('emptyDiv'));
      this.noMore = false;
      this.loading = false;
      this.list = [];
      this.pageLoading = true;
      this.getList(true);
    },
    getPayload() {
      const searchValue = this.getSearchPayload();
      const payload = { ...this.query, ...searchValue };
      return payload;
    }
  }
};
</script>

<style lang="scss" scoped>
  .chart-show {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    height: 100%;
    overflow: auto;
  }
  .show-card {
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .customClass {
    font-size: 18px;
    margin-top: 10px;
    height: 20px;
    top: 5px;
  }
  .no-more {
    font-size: 14px;
    margin-bottom: 15px;
    color: rgb(0, 0, 0);
    text-align: center;
  }
  .card-item.empty-item{
    cursor: default;
    height: 0;
    border: 1px solid #fff;
    padding: 0 15px;
    margin: 0 10px 0 0;
  }
  .card-item {
    flex: 1;
    padding: 15px;
    min-width: 418px;
    height: 330px;
    border: 1px solid #DCDFE6;
    margin: 0 10px 10px 0;
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .header-left {
        padding-left: 10px;
        border-left: 3px solid #6BB4AB;
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }
      .header-right {
        color: #415058;
        font-size: 14px;
      }
    }
    .chart-body {
      margin-top: 22px;
      height: 253px;
    }
  }
</style>
