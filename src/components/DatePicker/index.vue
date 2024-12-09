<!--
 * @Description: 时间选择器
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import { ONE_MOUNTH_AGO, ONE_MOUNTH_LATER } from '@/utils/common';
import { DATE_DISABLED_TYPE } from '@/utils/constant/index';
export default {
  name: 'AddTag',
  props: {
    time: {
      type: Array,
      default: () => []
    },
    disabledType: {
      type: Number,
      default: DATE_DISABLED_TYPE.acrossMonth
    }
  },
  data() {
    return {
      chooseDate: [],
      pickerMinDate: '',
      // 发送时间 日期选择器第一次选中的时间
      pickerOptions: {
        disabledDate: v => {
          const disabledTypeObj = {
            [DATE_DISABLED_TYPE.acrossMonth]: () => this.acrossMonth(v),
            [DATE_DISABLED_TYPE.acrossMonthAndAfter]: () => this.acrossMonthAndAfter(v)
          };
          const fn = disabledTypeObj[this.disabledType];
          return fn() || false;
        },
        onPick: (e) => {
          this.pickerMinDate = new Date(e.minDate).getTime();
          if (e.minDate && e.maxDate) {
            this.chooseDate = [];
          } else {
            this.chooseDate = [e.minDate, e.maxDate];
          }
        }
      }
    };
  },
  computed: {
    timeComputed: {
      get() {
        return this.time;
      },
      set(newValue) {
        this.$emit('update:time', newValue);
      }
    }
  },
  watch: {
    timeComputed: {
      handler(newValue, oldValue) {
        if (newValue && newValue[0] && newValue[1]) {
          this.pickerMinDate = new Date(newValue[0]).getTime();
        } else {
          this.pickerMinDate = '';
        }
      },
      deep: true
    }
  },
  methods: {
    /** 开始日期和结束日期不能超过1个月 */
    acrossMonth(v) {
      if (this.pickerMinDate) {
        const minTime = new Date(ONE_MOUNTH_AGO(this.pickerMinDate)).getTime();
        const maxTime = new Date(ONE_MOUNTH_LATER(this.pickerMinDate)).getTime();
        return v.getTime() > maxTime || v.getTime() < minTime;
      } else {
        return false;
      }
    },
    /** 开始日期和结束日期不能超过1个月 且不能在当天之后 */
    acrossMonthAndAfter(v) {
      if (this.pickerMinDate) {
        const minTime = new Date(ONE_MOUNTH_AGO(this.pickerMinDate)).getTime();
        const maxTime = new Date(ONE_MOUNTH_LATER(this.pickerMinDate)).getTime();
        return v.getTime() > maxTime || v.getTime() < minTime || v.getTime() > new Date().getTime();
      } else {
        return v.getTime() > new Date().getTime();
      }
    },
    change(e) {
      if (e) {
        const selectedMonth = new Date(this.chooseDate[0]).getMonth();
        const targetMonth = new Date(e[0]).getMonth();
        if (selectedMonth && selectedMonth !== targetMonth) {
          this.chooseDate = [e[0], null];
        }
      }
      this.$emit('change');
    }
  }
};
</script>

<template>
  <el-date-picker
    v-model="timeComputed"
    :picker-options="pickerOptions"
    v-bind="$attrs"
    range-separator="-"
    popper-class="date-picker"
    :clearable="false"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    @change="change"
  />
</template>

<style lang="scss">
.date-picker {
  .el-picker-panel__footer .el-picker-panel__link-btn.el-button--text  {
    display: none;
  }
}
</style>
