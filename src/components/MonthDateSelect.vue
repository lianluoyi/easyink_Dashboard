<!--
 * @Description: 月日历下拉选择器样式
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div :class="disable?'disable month-date-div ml5':' month-date-div ml5'">
    <el-popover
      v-model="visible"
      placement="bottom-start"
      width="315"
      trigger="click"
      popper-class="month-date-popover"
    >
      <div class="list">
        <div v-for="num in DAY" :key="num" class="item" @click="numClick(num)">
          {{ num }}
        </div>
      </div>
      <el-button slot="reference" class="month-button" :disabled="disable">
        <div style="display: flex; width: 20px; position: relative">
          <div :style="disable?'color:#C0C4CC font-size: 14px; margin-top: 2px; ':'font-size: 14px; margin-top: 2px; color: rgb(99, 97, 97)'">
            {{ value }}号
          </div>
          <div class="icon-month">
            <i
              :class="`${visible ? 'el-icon-arrow-up' : 'el-icon-arrow-down'}`"
            />
          </div>
        </div>
      </el-button>
    </el-popover>
  </div>
</template>
<script>
const MONTH = 31; // 一个月的天数为31
export default {
  name: '',
  components: {},
  props: {
    /**
     * 一个月中的几号
     */
    monthDateVal: {
      type: Number,
      default: 1
    },
    // 控制样式 是否可以编辑默认为可编辑
    disable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false, // 控制点击每个月具体天数时的icon箭头方向
      value: '1', // 点击具体天在页面上显示的值,默认为每月的1号
      DAY: [] // 每月天数的数组
    };
  },
  created() {},
  mounted() {
    var dayList = []; // 定义一个存放天数的数组在挂载时赋值给DAY
    for (var i = 1; i <= MONTH; i++) {
      dayList.push(i);
    }
    this.DAY = dayList;
  },
  methods: {
    // 点击弹出框中具体的某一天
    numClick(num) {
      this.visible = false;
      this.value = num;
      this.$emit('update:monthDateVal', this.value);
    }
  }
};
</script>
<style scoped lang="scss">
@import '~@/styles/mixin.scss';
.month-date-div {
    .month-button {
        padding-top:7px;
        width: 80px;
        height:32px;
        // margin-right: 10px;
        display:inline-block;
        line-height: 12px;
    }
    .month-button:focus{
      @include border_style($width: 1px);
    }
    .month-button:hover{
      border:1px solid rgb(207, 203, 203);
      color:rgb(99, 97, 97);
    }
    .icon-month {
      width:30px;
      text-align:center;
      margin-left:15px;
      position: absolute;
      left:16px;
      font-size:15px;
      color:#c7c7c7ee;
    }
}
.month-date-popover {
  .list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .item {
    margin: 5px;
    text-align: center;
    line-height: 30px;
    width: 30px;
    height: 30px;
  }
  .item:hover{
    @include bg_color($color-theme2-1);
    border-radius: 50%;
    color:white;
    cursor:pointer;
  }
}
  .disable {
    /deep/.el-button.is-disabled,
    .el-button.is-disabled:hover,
    .el-button.is-disabled:focus {
      background-color: #f5f7fa;
      cursor: not-allowed;
      border-color: #dfe4ed;
    }
    .month-button:hover {
      border: 1px solid rgb(207, 203, 203);
      color: #C0C4CC;
    }
  }
</style>
