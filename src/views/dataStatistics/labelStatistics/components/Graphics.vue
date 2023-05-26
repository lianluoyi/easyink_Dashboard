<!--
 * @Description: echarts图表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
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
  mounted() {
    this.initGraphics();
  },
  methods: {
    /**
     * @description 初始化图表
     */
    initGraphics() {
      this.myChart = echarts.init(this.$refs.graphics);
      this.myChart && this.myChart.setOption(this.echarsOptionsData);
    }
  }
};
</script>
<style scoped lang='scss'>
#graphics {
  /* 不需要监听浏览器窗口的改变重新渲染图表 直接写死宽度高度 父元素使用flex布局保持居中 */
  width: 398px;
  height: 253px;
}
</style>
