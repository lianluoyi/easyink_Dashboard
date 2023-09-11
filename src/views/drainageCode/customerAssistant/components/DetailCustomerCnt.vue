<!--
 * @Description: 获客链接详情-渠道新增客户趋势图、排行榜
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="mt10 mb10 page-echart bg-white">
    <div class="echart">
      <div class="echart-header">
        <el-date-picker
          v-model="query.dateRange"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="left"
          :clearable="false"
          @change="pickData"
        />
        <el-select
          v-model="query.channelId"
          clearable
          filterable
          style="width: 240px; margin-left: 5px"
          placeholder="请选择渠道"
        >
          <el-option
            v-for="item in channelList"
            :key="item.channelId"
            :label="item.name"
            :value="item.channelId"
          />
        </el-select>
      </div>
      <div class="echart-body">
        <div id="fatherbox">
          <div id="main" />
        </div>
      </div>
    </div>
    <div class="table">
      <span>渠道新增客户数排行</span>
      <div class="table-body">
        <empty-default-icon :length="channelRangeList.length" />
        <div
          v-for="(item, index) in channelRangeList"
          :key="index"
          class="table-row"
        >
          <div
            :style="`${
              index % 2 === 0 ? 'background-color:rgb(237, 236, 236)' : ''
            }`"
            class="table-row-detail"
          >
            <div class="table-row-num" :style="rowIndexStyle(index + 1)">
              {{ index + 1 }}
            </div>
            <div class="table-row-name">{{ item.name }}</div>
            <div class="table-row-num">{{ item.newCustomerCnt }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import echarts from 'echarts';
import { getNewAndLossCustomerCnt, getRangeByChannel } from '@/api/drainageCode/customerAssistant';
import { WEEK_TIME, TODAY_TIME } from '@/utils/common';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
export default {
  name: '',
  components: { EmptyDefaultIcon },
  props: {
    channelList: {
      type: Array,
      default: () => []
    },
    empleCodeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      beginTime: '',
      endTime: '',
      channelName: '', // 图表下拉框选择的渠道名
      charts: null,
      // 折线图X轴日期数据
      chartsXData: [],
      // 新增客户数
      newCustomerCnt: [],
      // 流失客户数
      lossCustomerCnt: [],
      query: {
        channelId: void 0,
        // 折线图时间选项
        dateRange: [WEEK_TIME, TODAY_TIME]
      },
      channelRangeList: []
    };
  },
  watch: {
    'query.channelId'(val) {
      this.getAnalyseCountByTimeRange();
    }
  },
  mounted() {
    this.getAnalyseCountByTimeRange();
    this.getRangeByChannel();
  },
  methods: {
    /**
     * 选中日期回调
     * @params val :选中的日期
     */
    pickData(val) {
      this.beginTime = val ? val[0] : '';
      this.endTime = val ? val[1] : '';
      this.getAnalyseCountByTimeRange();
      this.getRangeByChannel();
    },
    /**
     * 获取折线图数据
     */
    getAnalyseCountByTimeRange() {
      getNewAndLossCustomerCnt({
        empleCodeId: this.empleCodeId,
        beginTime: this.query.dateRange[0],
        endTime: this.query.dateRange[1],
        channelId: this.query.channelId
      }).then(res => {
        this.chartsXData = res?.data?.map((item) => item.time);
        this.newCustomerCnt = res?.data?.map((item) => item.newCustomerCnt);
        this.lossCustomerCnt = res?.data?.map((item) => item.lossCustomerCnt);
        this.drawLine();
      });
    },
    /**
     * 获取各个渠道新增客户排行榜
     */
    getRangeByChannel() {
      this.loading = true;
      getRangeByChannel({
        empleCodeId: this.empleCodeId,
        beginTime: this.query.dateRange[0],
        endTime: this.query.dateRange[1]
      }).then(({ data }) => {
        this.channelRangeList = [...data];
      }).catch(() => {
        this.channelRangeList = [];
      }).finally(() => {
        this.loading = false;
      });
    },
    /**
     * echarts图表
     */
    drawLine() {
      const obj = document.getElementById('main');
      if (obj) {
        obj.style.width = '970px';
        obj.style.height = '330px';
        this.charts = echarts.init(obj);
      }
      this.charts?.setOption({
        color: ['#5087EC', '#68BBC4'],
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.chartsXData
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false // 不显示坐标轴线
          },
          axisTick: {
            show: false // 不显示坐标轴刻度线
          }
        },
        legend: {
          data: ['新增客户', '流失客户']
        },
        series: [
          {
            name: '新增客户',
            type: 'line',
            data: this.newCustomerCnt,
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#5087EC'
                }
              }
            }
          },
          {
            name: '流失客户',
            type: 'line',
            data: this.lossCustomerCnt,
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#68BBC4'
                }
              }
            }
          }
        ]
      });
    },
    /**
     * 排行榜样式
     * @params index 排行
     */
    rowIndexStyle(index) {
      // 表格行索引的颜色
      // 1-3 名数字颜色#F59A23
      // 4-6 名数字颜色#37adff
      // 7之后 排名数字颜色#666666
      // eslint-disable-next-line no-magic-numbers
      const colorOne = [1, 2, 3];
      // eslint-disable-next-line no-magic-numbers
      const colorTwo = [4, 5, 6];
      if (colorOne.includes(index)) {
        return 'color:#F59A23';
      }
      if (colorTwo.includes(index)) {
        return 'color:#37adff';
      }
      return 'color:#666666';
    }
  }

};
</script>
<style scoped lang='scss'>
#fatherbox {
  height: 340px;
  overflow-y: scroll;
}
.page-echart {
    display: flex;
    .echart {
      width: 70%;
      .echart-body {
        font-size: 16px;
        margin-left: -68px;
      }
      .echart-header {
        padding-bottom: 15px;
        display: flex;
      }
    }
    .table {
      padding: 20px;
      margin-top: 25px;
      max-width: 355px;
      overflow-x: scroll;
      .table-body {
        height: 270px;
        overflow: hidden;
        max-width: 355px;
        overflow-y: scroll;
        margin-top: 15px;
      }
      .table-row {
        .table-row-detail {
          padding: 5px;
          display: flex;
          align-items: center;
          height: 36px;
          .table-row-name {
            width: 210px;
            margin-left: 5px;
          }
          .table-row-num {
            width: 60px;
            text-align: center;
          }
        }
      }
    }
  }
</style>
