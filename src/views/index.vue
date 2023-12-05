<template>
  <div class="index">
    <NoConfigInfo style="margin-bottom: 15px;" :config-keys="['contactSecret']" page-title="统计数据" />
    <Statistics
      :col-list="colList"
      title="数据总览"
      color="#333333"
      border-radius="5px"
      class="data-overview"
    >
      <template slot="operate">
        <el-popover
          placement="left-start"
          trigger="hover"
          :offset="10"
        >
          <div class="popover-content">
            <div class="info">
              <p>企业成员总数：截至当前，企业下已激活且未离职的员工总数</p>
              <p>客户总数：截至当前，企业下在职员工没有删除的客户数以及离职员工未分配的客户数，未去重</p>
              <p>留存客户总数：截至当前，企业下员工未删除且未将员工删除/拉黑的客户数，已去重</p>
              <p>客户群总数：截至当前，企业下未离职员工的客户群数量</p>
              <p>昨日群成员总数：截至昨天，企业下未离职员工的客户群群成员总数，未去重</p>
            </div>
          </div>
          <div slot="reference" class="statistic theme-text-color">统计说明</div>
        </el-popover>
      </template>
    </Statistics>
    <div class="index_l whitebg">
      <!-- <div class="box titlebox">
        <p>{{ parseTime(nowTime) }}</p>
      </div> -->
      <div class="dataall" style="margin-top:10px">
        <div style="text-align:left">
          <el-row type="flex" class="row-bg" justify="space-between">
            <el-col :span="10" class="title_name">实时数据
              <span class=" fontgay">更新于{{ uptime }}</span>
              <el-tooltip v-model="toolTipVisible" class="item" effect="dark" content="更新统计" placement="top" :manual="true">
                <i class="el-icon-refresh theme-text-color" @click="handleReset" />
              </el-tooltip>
            </el-col>
            <el-col :span="10" style="text-align:right" class="tool-right">
              <el-popover
                placement="left-start"
                :width="444"
                trigger="hover"
              >
                <template #reference>
                  <div class="theme-text-color cp f14 statistical-statement">统计说明</div>
                </template>
                <template #default>
                  <div class="popover-content" style="line-height: 30px">
                    新增客户数：查询时间内，员工添加的客户数量<br>
                    流失客户数：查询时间内，把员工删除/拉黑的数量<br>
                    新客留存率：查询时间内，未将员工删除、拉黑的新增客户/新增客户<br>
                    新增客户群：查询时间内，员工新创建的客户群数量<br>
                    客户群新增人数：查询时间内，客户群新增的群成员数量<br>
                  </div>
                </template>
              </el-popover>
              <el-radio-group v-model="timeType" style="margin-top: 20px;" @change="timeTypeCheck">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>

          <el-row type="flex" class="row-bg" justify="space-between" style="margin-top:30px; text-align: center;">
            <!-- <el-col :span="6">发起申请数</el-col> -->
            <el-col :span="8">新增客户数</el-col>
            <el-col :span="8">流失客户数</el-col>
            <el-col :span="8">新客留存率</el-col>
            <el-col :span="8">新增客户群</el-col>
            <el-col :span="8">客户群新增人数</el-col>
            <!-- <el-col :span="8">流失客户数</el-col> -->
          </el-row>
          <el-row type="flex" class="row-bg data-count theme-text-color" justify="space-between">
            <CntItem
              v-for="(item,index) of ['newContactCnt', 'negativeFeedbackCnt', 'newContactRetentionRate', 'newChatCnt', 'newMemberCnt']"
              :key="index"
              :erchats-table="erchatsTable"
              :field="item"
              :unit="item === 'newContactRetentionRate' ? '%' : ''"
            />
          </el-row>
          <el-row type="flex" class="row-bg" justify="space-between" style="margin-top:10px; text-align: center;">
            <DiffItem
              v-for="(item,index) of ['newContactCntDiff', 'negativeFeedbackCntDiff', 'newContactRetentionRateDiff', 'newChatCntDiff', 'newMemberCntDiff']"
              :key="index"
              :erchats-table="erchatsTable"
              :field="item"
              :time="time"
              :unit="item === 'newContactRetentionRateDiff' ? '%' : ''"
            />
          </el-row>

        </div>
      </div>
      <div class="erchatsdiv" style="margin-top:10px">
        <el-row :gutter="20">
          <!-- <el-col :span="12" class="erchats">
            <el-row type="flex" class="row-bg" justify="space-between">
              <div id="fatherbox">
                <div id="main" ref="views"></div>
              </div>
            </el-row>
          </el-col> -->
          <el-col :span="12" class="erchats">
            <el-row type="flex" class="row-bg" justify="space-between">
              <div id="fatherbox">
                <div id="main2" ref="views" />
              </div>
            </el-row>
          </el-col>
          <el-col :span="12" class="erchats">
            <el-row type="flex" class="row-bg" justify="space-between">
              <div id="fatherbox">
                <div id="main3" ref="views" />
              </div>
            </el-row>
          </el-col>
          <el-col :span="12" class="erchats">
            <el-row type="flex" class="row-bg" justify="space-between">
              <div id="fatherbox">
                <div id="main4" ref="views" />
              </div>
            </el-row>
          </el-col>
          <el-col :span="12" class="erchats">
            <el-row type="flex" class="row-bg" justify="space-between">
              <div id="fatherbox">
                <div id="main5" ref="views" />
              </div>
            </el-row>
          </el-col>
        </el-row>
      </div>
      <!-- -->
    </div>
  </div>
</template>
<script>
import Statistics from '@/components/Statistics';
import {
  arrData
} from '@/utils/common.js';
import {
  content
} from '@/api/content.js';
import echarts from 'echarts';
import NoConfigInfo from '@/components/NoConfigInfo';
import DiffItem from './dataStatistics/diffItem.vue';
import CntItem from './dataStatistics/cntItem.vue';
import { DATA_STATISTICS_DEFAULT_SHOW } from '@/utils/constant/index';

const DEFAULT_TIMEOUT = 100;
export default {
  name: 'Index',
  components: { NoConfigInfo, DiffItem, CntItem, Statistics },
  data() {
    return {
      nowTime: new Date(),
      bossImg: require('@/assets/index/boss.png'),
      erchatsTable: {},
      xAxis: ['1', '2', '3', '4', '5'],
      allData: {},
      time: '昨天',
      uptime: '',
      timeType: 'today',
      opinionData: {
        opinionData1: [],
        opinionData2: [],
        opinionData3: [],
        opinionData4: []
      },
      charts: null,
      toolTipVisible: true,
      // 数据总览的属性配置
      colList: [
        {
          title: '企业成员总数',
          filed: 'userCount',
          showPopover: false
        },
        { title: '客户总数', filed: 'totalAllContactCnt', showPopover: false },
        { title: '留存客户总数', filed: 'customerCount', showPopover: false },
        {
          title: '客户群总数',
          filed: 'groupCount',
          showPopover: false
        },
        { title: '昨日群成员总数', filed: 'groupMemberCount', showPopover: false }
      ],
      DATA_STATISTICS_DEFAULT_SHOW
    };
  },
  watch: {
    uptime() {
      this.toolTipVisible = false;
      setTimeout(() => {
        this.toolTipVisible = true;
      }, DEFAULT_TIMEOUT);
    }
  },
  // 调用
  mounted() {
    this.erchatInfo();
    this.tableInfo();
  },
  methods: {
    alerts(message) {
      this.msgSuccess(message);
    },
    carLink(e) {
      this.$router.push(e);
    },
    /**
     * @param id 图的id
     * @param name 对比项列表
     * @param fieldArr 对比项对应的字段名
     * @param btmarr
     * @param colorArr 对比项对应的颜色
     * @param unit 对比项对应的单位
     * @param subtext 副标题
     */
    canvansData(id, name, fieldArr, btmarr, colorArr, unit, subtext) {
      const bkdata = arrData(this.erchatsTable.dataList);
      const data = [];
      fieldArr.forEach(nameField => {
        data.push({ name: nameField, data: bkdata[nameField] });
      });
      this.xAxis = bkdata[btmarr];
      this.drawLine(id, name, data, colorArr, unit, subtext);
    },
    timeTypeCheck() {
      if (this.timeType === 'today') {
        this.time = '昨天';
        this.erchatsTable = this.allData.today;
        this.serErchat();
      } else if (this.timeType === 'week') {
        this.time = '上周';
        this.erchatsTable = this.allData.week;
        this.serErchat();
      } else if (this.timeType === 'month') {
        this.time = '上月';
        this.erchatsTable = this.allData.month;
        this.serErchat();
      }
    },
    handleReset() {
      this.timeType = { '昨天': 'today', '上周': 'week', '上月': 'month' }[this.time];
      this.reloadRedis();
    },
    tableInfo() {
      content.indexTable().then((res) => {
        this.colList = this.colList.map((item) => {
          return {
            ...item,
            [item.filed]: res.data[item.filed]
          };
        });
      });
    },
    reloadRedis() {
      content.reloadredis().then(res => {
        window.location.reload();
      });
    },
    erchatInfo() {
      content.indexEchart().then((res) => {
        this.allData = res.data;
        this.uptime = res.data.updateTime;
        this.erchatsTable = this.allData[this.timeType];
        this.serErchat();
      });
    },
    serErchat() {
      // this.canvansData('main', ['发起申请数'], 'arr1', 'btm1', '#088AEE')
      this.canvansData('main2', ['留存客户总数', '新增客户数', '流失客户数'], ['totalContactCnt', 'newContactCnt', 'negativeFeedbackCnt'], 'btm1', ['#5088EC', '#12BF49', '#EA656F']);
      this.canvansData('main3', ['新客留存率'], ['newContactRetentionRate'], 'btm1', ['#5088EC'], '%');
      this.canvansData('main4', ['客户群总数', '新增客户群'], ['chatTotal', 'newChatCnt'], 'btm1', ['#5088EC', '#12BF49']);
      this.canvansData('main5', ['客户群总人数', '客户群新增人数'], ['memberTotal', 'newMemberCnt'], 'btm1', ['#5088EC', '#12BF49'], '', '客户群总人数不包含今日的数据');
    },
    drawLine(id, _arrData, dataArr, colorArr, unit = '', subtext = '') {
      const obj = document.getElementById(id);
      if (obj) {
        obj.style.width = '100%';
        obj.style.height = '370px';
        this.charts = echarts.init(obj);
      }
      const seriesArr = dataArr.map((item, index) => {
        return {
          name: _arrData[index],
          type: 'line',
          smooth: true,
          connectNulls: true,
          data: item.data,
          textStyle: {
            color: '#fff' // 主标题文字的颜色。
          }
        };
      });
      const option = {
        color: colorArr,
        title: {
          subtext: subtext
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let str = '';
            params.forEach((item, idx) => {
              const showData = item.data === DATA_STATISTICS_DEFAULT_SHOW ? `${item.data}&nbsp;` : `${item.data}${unit}`;
              str += `${item.axisValue}<br/>${item.marker}${item.seriesName} &nbsp;&nbsp;&nbsp;&nbsp;${showData}`;
              str += idx === params.length - 1 ? '' : '<br/>';
            });
            return str;
          }
        },
        legend: {
          data: _arrData
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.xAxis,
          axisLine: {
            lineStyle: {
              color: '#ccc'

            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#ccc'

            }
          },
          axisLabel: {
            formatter: `{value}${unit}`
          }
        },
        series: seriesArr
      };
      this.charts.setOption(option);
    }
  }
};

</script>
<style lang="scss" scoped>
  .el-icon-refresh{
    font-size: 16px;
    margin-left: 5px;
  }
  .statistic {
    font-size: 14px;
    cursor: default;
  }
  .popover-content {
    width: 370px;
    font-size: 12px;
    line-height: 20px;
  }
  .index {
    margin: 0;
    padding: 0.5% 1%;
    width: 100%;
    background: #f1f1f1;
    .data-overview {
      /deep/ .tables {
        height: 200px;
        .title_name {
          padding-top: 15px;
        }
      }
    }
    // overflow: hidden;
    .title_name {
      font-size: 24px;
      font-weight: bold;
      color: #000000;
      padding-top: 15px;
    }

    .col_style {
      font-size: 18px;
      font-weight: 500;
      color: #666;
    }

    .fontgay {
      text-indent: 4em;
      color: #999;
      font-size: 14px;
      font-weight: 200;
    }

    #fatherbox {
      width: 100%;
      height: 380px;
      overflow-y: scroll;
      padding-top: 10px;
    }

    #main {
      width: 100%;
      height: 370px;
    }

    .fr {
      float: right;
    }

    .redicon {
      color: #ff0000;
    }

    .greenicon {
      color: green;
    }

    .tables {
      width: 100%;
      height: 200px;
      background: #fff;
      border-radius: 5px;
      padding: 15px;
      font-size: 16px;
    }

    .whitebg {
      min-height: 1000px;
      float: left;
      border-radius: 5px;
      .data-count {
        margin-top: 10px;
        font-size: 35px;
        font-weight: bold;
        text-align: center;
      }
    }

    .index_l {
      width: 100%;
    }

    .circle {
      width: 80px;
      height: 80px;
      background: #999;
      border-radius: 50%;
      margin: 0 auto;

      img {
        border-radius: 50%;
        width: 80px;
        height: 80px;
      }
    }

    // .index_r {
    //   width: 23%;
    //   margin-left: 2%;

    //   .qy_R {
    //     background: #fff;
    //     min-height: 1267px;
    //     border-radius: 5px;

    //     .inedx_r_top_t {
    //       border-radius: 5px;
    //       height: 270px;
    //       background-size:100% 100%;
    //      background:url('../assets/index/yd.png' ) no-repeat ;
    //      background-size: cover;
    //       padding: 20px 10px 10px 10px;
    //       color: #fff;

    //       .flexspan {
    //         height: 40px;
    //         line-height: 40px;
    //         background: #fff;
    //         color: #0079DE;
    //         border-radius: 4px;
    //         margin-top: 30px;
    //       }

    //       .margint20 {
    //         margin-top: 31px;
    //       }

    //       p {
    //         padding-top: 9px;
    //       }

    //       .p1 {
    //         font-size: 16px;
    //         font-weight: 500;
    //         color: #FFFFFF;
    //       }

    //       .p2 {
    //         font-size: 14px;
    //         font-weight: 400;
    //         color: #D3E8FF;
    //       }

    //       .p3 {
    //         font-size: 18px;
    //       }

    //       .p4 {
    //         color: #FFFFFF;
    //         padding-top: 10px;
    //       }
    //     }

    //     .img {
    //       margin: 30px;
    //       width: 175px;
    //       height: 175px;
    //     }

    //     .inedx_r_top_bottom {
    //       padding: 10px 30px;
    //       margin-top: 29px;

    //       .inedx_r_top_bottomp1 {
    //         font-size: 16px;
    //         color: #333333;

    //       }

    //       ul {
    //         margin-top: 20px;
    //       }

    //       ul li {
    //         font-size: 14px;
    //         line-height: 35px;
    //         font-weight: 500;
    //         color: #666;

    //         span {
    //           color: #999999;
    //         }
    //       }
    //     }
    //   }

    // }

    .box {
      width: 100%;
    }

    .titlebox {
      height: 80px;
      padding: 10px 0;
      background: #f1f1f1;

      p {
        line-height: 30px;
        margin: 0;
        padding: 0;
      }
    }

    .adminname {
      font-size: 20px;
      font-weight: bold;
    }

    .dataall {
      width: 100%;
      height: 238px;
      background: #fff;
      border-radius: 5px;
      padding: 20px;
      font-size: 16px;
      .tool-right {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        .statistical-statement {
          margin: 20px 10px 0 0;
        }
      }
    }

    .erchatsdiv {
      width: 100%;
      height: auto;
      overflow: hidden;
      border-radius: 5px;
      font-size: 16px;

      /deep/ .el-col-12 {
        width: 49%;
      }

      .erchats {
        margin: 0 5px;
        height: 400px;
        border-radius: 4px;
        margin-bottom: 10px;
        background: #fff;
      }
    }
    // .car {
    //   height: 200px;
    //   margin-top: 40px;
    //   width: 100%;
    //   overflow: hidden;
    //   line-height: 70px;

    //   .grid-content {
    //     overflow: hidden;
    //     height: 70px;
    //     background: #fff;
    //     border-radius: 5px;
    //     padding: 10px 30px;

    //     .craname {
    //       height: 50px;
    //       line-height: 50px;
    //       font-size: 16px;
    //       display: block;
    //       text-indent: 1em;
    //     }

    //     img {
    //       width: 30px;
    //       height: 30px;
    //     }
    //   }
    // }
  }

</style>
