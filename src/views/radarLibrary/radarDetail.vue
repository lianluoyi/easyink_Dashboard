<!--
 * @Description: 雷达详情
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="radar-detail-page">
    <div class="page-card mb10">
      <ReturnPage />
      <div class="page-header">
        <div class="header-left">
          <div><span class="label">雷达标题：</span>{{ radarTitle }}</div>
          <div><span class="label">真实链接：</span>{{ trueLink }}</div>
          <div><span class="label">创建时间：</span>{{ createTime }}</div>
          <div><span class="label">创建人：</span>{{ createName }}</div>
        </div>
        <div class="header-right">
          <div>
            <span class="label">行为通知：</span>
            <el-switch v-model="enableClickNotice" disabled />
          </div>
          <div>
            <span class="label">轨迹记录：</span>
            <el-switch v-model="enableBehaviorRecord" disabled />
          </div>
          <div>
            <span class="label">客户标签：</span>
            <el-tag
              v-for="item in radarTagList"
              :key="item.tagId"
              class="tag ml5"
            >
              {{ item.tagName }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    <Statistics
      :col-list="colList"
      title="数据总览"
    />
    <div class="mt10 page-echart bg-white">
      <div class="echart">
        <div class="echart-header">
          <el-date-picker
            v-model="activeTime"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="left"
            @change="pickData"
          />
          <el-select v-model="channelName" clearable style="width: 240px; margin-left: 5px" placeholder="请选择渠道">
            <el-option
              v-for="item in channelList"
              :key="item.channelName"
              :label="item.channelName"
              :value="item.channelName"
            />
          </el-select>
        </div>
        <div class="echart-body">
          <div id="fatherbox">
            <div id="main" ref="views" />
          </div>
        </div>
      </div>
      <div class="table">
        <span>渠道点击人数排行</span>
        <div class="table-body">
          <empty-default-icon :length="channelList.length" />
          <div
            v-for="(item, index) in channelList"
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
              <div class="table-row-name">{{ item.channelName }}</div>
              <div class="table-row-num">{{ item.clickNum }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt10 page-record bg-white">
      <el-radio-group
        v-model="activeRecord"
        class="radio-group-div mb10"
        size="medium"
        @input="changeActiveRecord"
      >
        <el-radio-button :label="CLICK_RECORD['customer']">客户点击记录</el-radio-button>
        <el-radio-button :label="CLICK_RECORD['channel']">渠道点击记录</el-radio-button>
      </el-radio-group>
      <div v-if="activeRecord === CLICK_RECORD['customer']">
        <CustomerClickRecord :radar-id="radarId" />
      </div>
      <div v-else>
        <ChannelClickRecord :radar-id="radarId" />
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
// 点击记录
const CLICK_RECORD = {
  customer: 1,
  // eslint-disable-next-line no-magic-numbers
  channel: 2
};
import Statistics from '@/components/Statistics';
import CustomerClickRecord from './components/customerClickRecord.vue';
import ChannelClickRecord from './components/channelClickRecord.vue';
import { getRadaDetail, getRadarDetailOverview, getTimeRangeAnalyseCount, getChannelSort } from '@/api/radar';
export default {
  components: { Statistics, CustomerClickRecord, ChannelClickRecord, EmptyDefaultIcon },
  data() {
    return {
      CLICK_RECORD,
      activeRecord: CLICK_RECORD['customer'],
      radarTitle: '',
      createTime: '',
      createName: '',
      enableBehaviorRecord: false,
      enableClickNotice: false,
      trueLink: '', // 真实链接
      // 雷达客户标签
      radarTagList: [],
      // 折线图时间选项
      activeTime: [],
      // 数据总览的属性配置
      colList: [
        {
          title: '总点击人数',
          showPopover: true,
          placement: 'top',
          content: '统计有点击雷达链接的客户，已去重',
          filed: 'sumClickPersonNum'
        },
        { title: '总点击次数', showPopover: false, content: '', filed: 'sumClickNum' },
        {
          title: '今日点击人数',
          showPopover: true,
          placement: 'top',
          content: '统计有点击雷达链接的客户，已去重',
          filed: 'nowadaysClickPersonNum'
        },
        { title: '今日点击次数', showPopover: false, content: '', filed: 'nowadaysClickNum' }
      ],
      channelName: '', // 图表下拉框选择的渠道名
      channelList: [], // 渠道点击人数排行列表
      customerClickRecordList: [], // 客户点击记录列表
      loading: false,
      charts: null,
      // 折线图X轴日期数据
      chartsXData: [],
      // 点击人数
      clickPersonNum: [],
      // 点击次数
      sumClickNum: [],
      radarId: '',
      beginTime: '',
      endTime: ''
    };
  },
  watch: {
    channelName() {
      this.getTimeRangeAnalyseCount();
    }
  },
  created() {
    const routerQuery = this.$route.query;
    this.radarId = routerQuery.id;
    // 当sessionStorage中有clickRecord时，修改默认的activeRecord
    if (window.sessionStorage.getItem('clickRecord')) {
      this.activeRecord = window.sessionStorage.getItem('clickRecord');
    }
    this.getTimeRangeAnalyseCount();
    this.getRadaDetail();
    this.getOverview();
    this.getChannelSort();
  },
  methods: {
    changeActiveRecord() {
      this.$store.commit('SET_SAVE_CONDITION', false);
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
    },
    /**
     * echarts图表
     */
    // TODO 修改折线图选中的颜色
    drawLine() {
      const obj = document.getElementById('main');
      if (obj) {
        obj.style.width = '821px';
        obj.style.height = '400px';
        this.charts = echarts.init(obj);
      }
      this.charts.setOption({
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
          data: ['点击人数', '点击次数']
        },
        series: [
          {
            name: '点击人数',
            type: 'line',
            data: this.clickPersonNum,
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#5087EC'
                }
              }
            }
          },
          {
            name: '点击次数',
            type: 'line',
            data: this.sumClickNum,
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
     * 获取雷达详情
     */
    getRadaDetail() {
      getRadaDetail({ id: this.radarId }).then((res) => {
        const {
          radarTagList,
          radarTitle,
          createTime,
          createName,
          enableClickNotice,
          enableBehaviorRecord,
          weRadarUrl
        } = res.data;
        this.radarTagList = radarTagList;
        this.radarTitle = radarTitle;
        this.createTime = createTime;
        this.createName = createName;
        this.enableBehaviorRecord = enableBehaviorRecord;
        this.enableClickNotice = enableClickNotice;
        this.trueLink = weRadarUrl.url;
      });
    },
    /**
     * 获取雷达数据总览
     */
    getOverview() {
      getRadarDetailOverview({ radarId: this.radarId }).then((res) => {
        this.colList = this.colList.map((item) => {
          return {
            ...item,
            [item.filed]: res.data[item.filed]
          };
        });
      });
    },
    /**
     * 选中日期回调
     * @params val :选中的日期
     */
    pickData(val) {
      this.beginTime = val ? val[0] : '';
      this.endTime = val ? val[1] : '';
      this.getTimeRangeAnalyseCount();
    },
    /**
     * 获取折线图数据
     */
    getTimeRangeAnalyseCount() {
      const params = {
        radarId: this.radarId,
        channelName: this.channelName,
        beginTime: this.beginTime,
        endTime: this.endTime
      };

      getTimeRangeAnalyseCount(params).then((res) => {
        this.chartsXData = res.data.list.map((item) => item.createDate);
        this.clickPersonNum = res.data.list.map((item) => item.clickPersonNum);
        this.sumClickNum = res.data.list.map((item) => item.sumClickNum);
        this.drawLine();
      });
    },
    /**
     * 获取点击人数排行
     */
    getChannelSort() {
      getChannelSort({ radarId: this.radarId }).then((res) => {
        this.channelList = res.data;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
#fatherbox {
  height: 400px;
  overflow-y: scroll;
}
.radar-detail-page {
  .bg-white {
    padding: 15px;
    background-color: #fff;
  }
  display: flex;
  flex-direction: column;
  .page-card {
    .page-header {
      padding: 15px;
      background-color: #fff;
      display: flex;
      .label {
        color: #999999;
      }
      .header-left {
        width: 600px;
        & > div {
          margin-bottom: 15px;
        }
      }
      .header-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 20%;
        & > div {
          margin-bottom: 15px;
        }
      }
    }
  }
  .page-echart {
    display: flex;
    .echart {
      width: 70%;
      .echart-body {
        font-size: 16px;
        margin-left: -55px;
      }
      .echart-header {
        padding: 15px 0px;
        display: flex;
      }
    }
    .table {
      padding: 20px;
      margin-top: 40px;
      width: 400px;
      overflow-x: scroll;
      .table-body {
        height: 330px;
        overflow: hidden;
        width: 350px;
        overflow-y: scroll;
        margin-top: 15px;
      }
      .table-row {
        .table-row-detail {
          padding: 5px 10px;
          display: flex;
          align-items: center;
          height: 36px;
          .table-row-name {
            width: 180px;
          }
          .table-row-num {
            width: 60px;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
