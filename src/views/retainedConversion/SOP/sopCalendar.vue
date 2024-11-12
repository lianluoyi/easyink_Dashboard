<!--
 * @Description: 日历形式展示sop
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-calendar v-model="calendarVal" class="calendar-container">
    <template
      slot="dateCell"
      slot-scope="{date, data}"
    >
      <div class="custom-calendar-item" @click="() => handleClickCalendar(date)">
        <p class="mb10">
          {{ data.day.split('-')[2] }}
        </p>
        <div
          v-for="(ruleItem, ruleIndex) in dealCalendar(date)"
          :key="ruleIndex + date.getTime()"
          class="rule-name mb5 toe"
          :title="ruleItem.name"
          @click.stop="() => handleEditCalendarItem(ruleItem)"
        >
          「{{ ruleItem.formatTime }}」{{ ruleItem.name }}
        </div>
      </div>
    </template>
  </el-calendar>
</template>
<script>
import { deepClone } from '@/utils/index';
import moment from 'moment';

export default {
  name: '',
  components: {},
  props: {
    ruleList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      calendarVal: new Date(),
      isFirstWatch: true
    };
  },
  watch: {
    ruleList: {
      handler(val) {
        if (this.isFirstWatch && val && val.length) {
          this.calendarVal = new Date(val[0].alertData2);
          this.isFirstWatch = false;
        }
      },
      immediate: true
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleClickCalendar(date) {
      this.$emit('handleClickCalendar', date);
    },
    handleEditCalendarItem(item) {
      this.$emit('handleEditCalendarItem', item);
    },
    /**
     * 处理日历显示的规则列表
     */
    dealCalendar(date) {
      const ruleList = deepClone(this.ruleList);
      let list = ruleList.filter(item => {
        return moment(item.alertInfo.time).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD');
      });
      list = list.map(item => { return { ...item, formatTime: moment(item.alertInfo.time).format('HH:mm') }; });
      return list;
    }
  }

};
</script>
<style scoped lang='scss'>
.calendar-container {
    /deep/ .el-calendar__header {
        .el-calendar__title {
            font-size: 16px;
            font-weight: bold;
        }
        }
        /deep/ .el-calendar__body {
        .el-calendar-table {
            .el-calendar-day {
            padding: 0px;
            }
        }
    }
    .custom-calendar-item {
      padding: 8px;
      width: 100%;
      height: 100%;
      overflow: auto;
      .rule-name {
        background-color: #E1F0EE;
        font-size: 12px;
        padding: 5px 0;
      }
    }
}
</style>
