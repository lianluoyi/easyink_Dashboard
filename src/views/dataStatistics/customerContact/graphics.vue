<!--
 * @Description: echarts图表
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div id="graphics" ref="graphics" />
</template>
<script>
import * as echarts from 'echarts';
export default {
  name: '',
  components: { },
  props: {
    // echars图表需要的options数据
    echarsOptionsData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // echars实例
      myChart: null
    };
  },
  computed: {},
  watch: {
    // 数据改变重新渲染
    echarsOptionsData: {
      handler: function(val, oldVal) {
        this.myChart && this.myChart.setOption(this.getOptions());
      },
      deep: true
    }
  },
  mounted() {
    this.initGraphics();
  },
  methods: {
    /**
     * @description 初始化图表
     */
    initGraphics() {
      this.myChart = echarts.init(this.$refs.graphics);
      this.myChart && this.myChart.setOption(this.getOptions());
    },
    // 获取echars图表所需配置
    getOptions() {
      return {
        legend: {
          data: ['客户发送消息数', '员工发送消息数']
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: true, // x轴范围(文字居中)
          data: this?.echarsOptionsData?.xAxisData || []
        },
        yAxis: {
          type: 'value'
        },
        color: ['#578CED', '#6BBCC5'],
        series: [
          {
            name: '客户发送消息数',
            data: this?.echarsOptionsData?.clientSendMessageList || [],
            type: 'line',
            areaStyle: {
              color: '#DCE7FB'
            }
          },
          {
            name: '员工发送消息数',
            data: this?.echarsOptionsData?.userSendMessageList || [],
            type: 'line',
            areaStyle: {
              color: '#E1F1F3'
            }
          }
        ]
      };
    }
  }
};
</script>
<style scoped lang='scss'>
#graphics {
  width: 100%;
  height: 350px;
}
</style>
