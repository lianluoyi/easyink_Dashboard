<template>
  <div class="index">
    <div class="index_l whitebg">
      <!-- <div class="box titlebox">
        <p>{{ parseTime(nowTime) }}</p>
      </div> -->
      <div style="margin-bottom: 15px;">
        <NoConfigInfo :config-keys="['contactSecret', 'customSecret']" page-title="统计数据" />
      </div>
      <div class="tables">
        <div style="text-align:left">
          <el-row type="flex" class="row-bg" justify="space-between">
            <el-col :span="24" class="title_name">数据总览</el-col>
          </el-row>
          <el-row type="flex" class="row-bg" justify="space-between" style="margin-top:35px; text-align: center;">
            <el-col :span="6" class="col_style">企业成员总数</el-col>
            <el-col :span="6" class="col_style">客户总人数</el-col>
            <el-col :span="6" class="col_style">客户群总数</el-col>
            <el-col :span="6" class="col_style">群成员总数</el-col>
          </el-row>
          <el-row type="flex" class="row-bg data-count theme-text-color" justify="space-between">
            <el-col :span="6">{{ table.userCount || 0 }}</el-col>
            <el-col :span="6">{{ table.customerCount || 0 }}</el-col>
            <el-col :span="6">{{ table.groupCount || 0 }}</el-col>
            <el-col :span="6">{{ table.groupMemberCount || 0 }}</el-col>
          </el-row>
        </div>
      </div>
      <div class="dataall" style="margin-top:10px">
        <div style="text-align:left">
          <el-row type="flex" class="row-bg" justify="space-between">
            <el-col :span="10" class="title_name">实时数据
              <span class=" fontgay">更新于{{ uptime }}</span>
              <el-tooltip v-model="toolTipVisible" class="item" effect="dark" content="更新统计" placement="top" :manual="true">
                <i class="el-icon-refresh theme-text-color" @click="handleReset" />
              </el-tooltip>
            </el-col>
            <el-col :span="10" style="text-align:right">
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
            <el-col :span="8">群新增人数</el-col>
            <el-col :span="8">流失客户数</el-col>
          </el-row>
          <el-row type="flex" class="row-bg data-count theme-text-color" justify="space-between">
            <!-- <el-col :span="6">{{ erchatsTable.newApplyCnt }}</el-col> -->
            <el-col :span="8">{{ erchatsTable.newContactCnt || 0 }}</el-col>
            <el-col :span="8">{{
              erchatsTable.newMemberCnt ? erchatsTable.newMemberCnt : 0
            }}</el-col>
            <el-col :span="8">{{ erchatsTable.negativeFeedbackCnt || 0 }}</el-col>
          </el-row>
          <el-row type="flex" class="row-bg" justify="space-between" style="margin-top:10px; text-align: center;">
            <!-- <el-col :span="6" :class="{
                  greenicon: Number(erchatsTable.newApplyCntDiff) >= 1,
                  redicon: Number(erchatsTable.newApplyCntDiff) < 0,
                }">较{{ time }}
              <span>{{ erchatsTable.newApplyCntDiff }}</span>
            </el-col> -->
            <el-col
              :span="8"
              :class="{
                greenicon: Number(erchatsTable.newContactCntDiff) >= 1,
                redicon: Number(erchatsTable.newContactCntDiff) < 0,
              }"
            >较{{ time }}
              <span>{{ erchatsTable.newContactCntDiff ? (erchatsTable.newContactCntDiff > 0 ? '+' + erchatsTable.newContactCntDiff : erchatsTable.newContactCntDiff) : 0 }}</span>
            </el-col>
            <el-col
              :span="8"
              :class="{
                greenicon: Number(erchatsTable.newMemberCntDiff) >= 1,
                redicon: Number(erchatsTable.newMemberCntDiff) < 0,
              }"
            >较{{ time }}
              <span>{{
                erchatsTable.newMemberCntDiff ?
                  (erchatsTable.newMemberCntDiff > 0 ? '+' + erchatsTable.newMemberCntDiff : erchatsTable.newMemberCntDiff)
                  : 0
              }}</span>
            </el-col>
            <el-col
              :span="8"
              :class="{
                greenicon: Number(erchatsTable.negativeFeedbackCntDiff) >= 1,
                redicon: Number(erchatsTable.negativeFeedbackCntDiff) < 0,
              }"
            >较{{ time }}
              <span>{{ erchatsTable.negativeFeedbackCntDiff ?
                (erchatsTable.negativeFeedbackCntDiff > 0 ? '+' + erchatsTable.negativeFeedbackCntDiff : erchatsTable.negativeFeedbackCntDiff)
                : 0 }}</span>
            </el-col>
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
        </el-row>
      </div>

      <!-- -->
    </div>
  </div>
</template>
<script>
import {
  arrData
} from '@/utils/common.js';
import {
  content
} from '@/api/content.js';
import echarts from 'echarts';
import NoConfigInfo from '@/components/NoConfigInfo';
const DEFAULT_TIMEOUT = 100;
export default {
  name: 'Index',
  components: { NoConfigInfo },
  data() {
    return {
      nowTime: new Date(),
      bossImg: require('@/assets/index/boss.png'),
      table: {},
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
      toolTipVisible: true
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
    canvansData(obj, name, arr, btmarr, color) {
      const bkdata = arrData(this.erchatsTable.dataList);
      const data = bkdata[arr];
      this.xAxis = bkdata[btmarr];
      this.drawLine(obj, name, data, color);
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
        this.table = res.data;
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
      this.canvansData('main2', ['新增客户数'], 'arr2', 'btm1', '#E74E59');
      this.canvansData('main3', ['群新增人数'], 'arr3', 'btm1', '#14BF48');
      this.canvansData('main4', ['流失客户数'], 'arr4', 'btm1', '#FA7216');
    },
    drawLine(id, arrData, data, color) {
      const obj = document.getElementById(id);
      if (obj) {
        obj.style.width = '100%';
        obj.style.height = '380px';
        this.charts = echarts.init(obj);
      }
      this.charts.setOption({
        color: [color],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: arrData
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
          }

        },
        series: [{
          name: arrData,
          type: 'line',
          stack: '总量',
          smooth: true,
          data: data,
          itemStyle: {
            normal: {
              lineStyle: {
                color: color
              }
            }
          },
          textStyle: {
            color: '#fff' // 主标题文字的颜色。

          }
        }]
      });
    }
  }
};

</script>
<style lang="scss" scoped>
  .el-icon-refresh{
    font-size: 16px;
    margin-left: 5px;
  }
  .index {
    margin: 0;
    padding: 0.5% 1%;
    width: 100%;
    background: #f1f1f1;

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
    }

    #main {
      width: 100%;
      height: 380px;
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
