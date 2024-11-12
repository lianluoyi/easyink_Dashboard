<!--
 * @Description: 编辑提醒时间
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="alert-time-edit-item-div">
    <el-radio-group v-if="sopType === SOP_TYPE['newCustomer']" v-model="formData.alertType" class="remind-time-radio">
      <el-radio v-if="!(disableEdit && formData.alertType !== RULE_PERFORM_TYPE['hourMinute'])" :label="RULE_PERFORM_TYPE['hourMinute']">客户添加员工
        <el-input-number
          v-model="formData.alertInfo.hourMinute.hour"
          style="width: 70px;"
          size="mini"
          :min="0"
          :max="23"
          :controls="false"
        /> 小时
        <el-input-number
          v-model="formData.alertInfo.hourMinute.minute"
          style="width: 70px;"
          size="mini"
          :min="0"
          :max="59"
          :controls="false"
        /> 分钟后提醒员工发送内容
      </el-radio>
      <el-radio v-if="!(disableEdit && formData.alertType !== RULE_PERFORM_TYPE['dayTime'])" :label="RULE_PERFORM_TYPE['dayTime']">客户添加员工第
        <el-input-number
          v-model="formData.alertInfo.dayTime.day"
          style="width: 70px;"
          size="mini"
          :min="1"
          :max="999"
          :controls="false"
        /> 天
        <el-time-picker
          v-model="formData.alertInfo.dayTime.time"
          style="width: 100px;"
          class="day-time-picker"
          value-format="HH:mm"
          format="HH:mm"
        /> 提醒员工发送内容<span style="color: #999;">（第1天表示当天，过时不发送） </span>
      </el-radio>
    </el-radio-group>
    <div v-if="[SOP_TYPE['activity'], SOP_TYPE['groupCalendar']].includes(sopType)">
      <el-date-picker
        v-model="formData.alertInfo.time"
        style="width: 225px"
        value-format="yyyy-MM-dd HH:mm"
        format="yyyy-MM-dd HH:mm"
        type="datetime"
        placeholder="选择发送时间"
        :picker-options="pickerOptions"
      /> 提醒员工发送内容
    </div>
    <el-radio-group v-if="sopType === SOP_TYPE['birthday']" v-model="formData.alertType" class="remind-time-radio">
      <el-radio :label="RULE_PERFORM_TYPE['dayTime']">客户生日第
        <el-input-number
          v-model="formData.alertInfo.dayTime.day"
          style="width: 70px;"
          size="mini"
          :min="1"
          :max="999"
          :controls="false"
        /> 天
        <el-time-picker
          v-model="formData.alertInfo.dayTime.time"
          style="width: 100px;"
          class="day-time-picker"
          value-format="HH:mm"
          format="HH:mm"
        /> 提醒员工发送内容<span style="color: #999;">（第1天表示当天，过时不发送） </span>
      </el-radio>
      <el-radio :label="RULE_PERFORM_TYPE['beforeDayTime']">客户生日前
        <el-input-number
          v-model="formData.alertInfo.beforeDayTime.day"
          style="width: 70px;"
          size="mini"
          :min="1"
          :max="999"
          :controls="false"
        /> 天
        <el-time-picker
          v-model="formData.alertInfo.beforeDayTime.time"
          style="width: 100px;"
          class="day-time-picker"
          value-format="HH:mm"
          format="HH:mm"
        /> 提醒员工发送内容
      </el-radio>
    </el-radio-group>
    <el-radio-group v-if="sopType === SOP_TYPE['timing']" v-model="formData.alertType" class="remind-time-radio">
      <el-radio v-if="!(disableEdit && formData.alertType !== RULE_PERFORM_TYPE['hourMinute'])" :label="RULE_PERFORM_TYPE['hourMinute']">群聊加入SOP
        <el-input-number
          v-model="formData.alertInfo.hourMinute.hour"
          style="width: 70px;"
          size="mini"
          :min="0"
          :max="23"
          :controls="false"
        /> 小时
        <el-input-number
          v-model="formData.alertInfo.hourMinute.minute"
          style="width: 70px;"
          size="mini"
          :min="0"
          :max="59"
          :controls="false"
        /> 分钟后提醒员工发送内容
      </el-radio>
      <el-radio v-if="!(disableEdit && formData.alertType !== RULE_PERFORM_TYPE['dayTime'])" :label="RULE_PERFORM_TYPE['dayTime']">群聊加入SOP第
        <el-input-number
          v-model="formData.alertInfo.dayTime.day"
          style="width: 70px;"
          size="mini"
          :min="1"
          :max="999"
          :controls="false"
        /> 天
        <el-time-picker
          v-model="formData.alertInfo.dayTime.time"
          style="width: 100px;"
          class="day-time-picker"
          value-format="HH:mm"
          format="HH:mm"
        /> 提醒员工发送内容<span style="color: #999;">（第1天表示当天，过时不发送）</span>
      </el-radio>
    </el-radio-group>
    <el-radio-group v-if="sopType === SOP_TYPE['cycle']" v-model="formData.alertType" class="remind-time-radio">
      <el-radio :label="RULE_PERFORM_TYPE['everydayTime']">群聊加入SOP后，每天
        <el-time-picker
          v-model="formData.alertInfo.everydayTime"
          style="width: 100px;"
          class="day-time-picker"
          value-format="HH:mm"
          format="HH:mm"
        /> 提醒员工发送内容
      </el-radio>
      <el-radio :label="RULE_PERFORM_TYPE['everyWeekTime']">群聊加入SOP后，每周
        <el-select v-model="formData.alertInfo.everyWeekTime.week" placeholder="请选择" style="width: 80px;margin-right: 10px;">
          <el-option
            v-for="item in weekOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-time-picker
          v-model="formData.alertInfo.everyWeekTime.time"
          style="width: 94px;"
          class="day-time-picker"
          value-format="HH:mm"
          format="HH:mm"
        /> 提醒员工发送内容
      </el-radio>
      <el-radio :label="RULE_PERFORM_TYPE['everyMonthTime']">群聊加入SOP后，每月
        <el-popover v-model="visible" placement="bottom-start" width="315" trigger="click">
          <div class="list">
            <div v-for="num in DAY" :key="num" class="item" @click="numClick(num)">
              {{ num }}
            </div>
          </div>
          <el-button slot="reference" class="button">
            <div style="display:flex;width:20px;position:relative">
              <div style="font-size:14px;margin-top:2px ;color:rgb(99, 97, 97)">{{ value }}号</div>
              <div class="icon-month">
                <i :class="`${visible? 'el-icon-arrow-up':'el-icon-arrow-down'}`" />
              </div>
            </div>
          </el-button>
        </el-popover>
        <el-time-picker
          v-model="formData.alertInfo.everyMonthTime.time"
          style="width: 94px;"
          class="day-time-picker"
          value-format="HH:mm"
          format="HH:mm"
        /> 提醒员工发送内容
      </el-radio>
    </el-radio-group>
  </div>
</template>
<script>
import {
  SOP_TYPE, RULE_PERFORM_TYPE, ONE_DAY_MSECOND, WEEK_OPTIONS
} from '@/utils/constant/index';
import moment from 'moment';
const MONTH = 31; // 一个月的天数为31
const MINUTE = 30; // 定义一个MINUTE作为延时30分钟
export default {
  name: '',
  components: {},
  props: {
    sopType: {
      type: Number,
      default: null
    },
    formData: {
      type: Object,
      default: () => {}
    },
    disableEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const monthOptions = () => {
      const options = [];
      const monthLength = 31;
      const list = [...new Array(monthLength).keys()];
      list.forEach(item => {
        options.push({ label: `${item + 1}号`, value: item + 1 });
      });
      return options;
    };
    return {
      DAY: [], // 每月天数的数组
      visible: false, // 控制点击每个月具体天数时的icon箭头方向
      value: '1', // 点击具体天在页面上显示的值,默认为每月的1号
      SOP_TYPE,
      RULE_PERFORM_TYPE,
      weekOptions: WEEK_OPTIONS,
      monthDateOptions: monthOptions(),
      pickerOptions: {
        disabledDate(currentTime) {
          return currentTime.getTime() < Date.now() - ONE_DAY_MSECOND;
        }
      }
    };
  },
  created() {},
  mounted() {
    var dayList = []; // 定义一个存放天数的数组在挂载时赋值给DAY
    for (var i = 1; i <= MONTH; i++) {
      dayList.push(i);
    }
    this.DAY = dayList;
    this.GroupCalendarTime();
  },
  beforeUpdate() {
    this.GroupCalendarTime();
  },
  methods: {
    // 默认群日历添加规则的提醒时间为当前时间+30min
    GroupCalendarTime() {
      var curTime = new Date();
      if (this.sopType === SOP_TYPE['groupCalendar'] && this.formData.alertInfo.time === '') {
        this.formData.alertInfo.time = moment(new Date(curTime.setMinutes(curTime.getMinutes() + MINUTE))).format('YYYY-MM-DD HH:mm');
      }
    },
    // 点击弹出框中具体的某一天
    numClick(num) {
      this.visible = false;
      this.value = num;
      this.formData.alertInfo.everyMonthTime.month = this.value;
    }
  }
};
</script>
<style scoped lang='scss'>
@import '~@/styles/mixin.scss';
.alert-time-edit-item-div {
    .remind-time-radio {
        /deep/ .el-radio {
          margin-bottom: 10px;
        }
    }
}
.list {
  display: flex;
  flex-direction: row;
  flex-wrap:wrap;
}
.button {
   padding-top:7px;
   width: 80px;
   height:32px;
   margin-right: 10px;
   display:inline-block;
}
.button:focus{
  @include border_style($width: 1px);
}
.button:hover{
  border:1px solid rgb(207, 203, 203);
  color:rgb(99, 97, 97);
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
.icon-month {
  width:30px;
  text-align:center;
  margin-left:15px;
  position: absolute;
  left:16px;
  font-size:15px;
  color:#c7c7c7ee;
}
</style>
