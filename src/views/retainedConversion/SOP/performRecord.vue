<!--
 * @Description: 执行记录
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="perform-record-page flex">
    <div class="data-statistical">
      <div style="text-align:left">
        <el-row type="flex" class="row-bg" justify="space-between">
          <el-col :span="24" class="title_name">任务统计</el-col>
        </el-row>
        <el-row type="flex" class="row-bg" justify="space-between" style="margin-top:35px; text-align: center;">
          <el-col :span="6" class="col_style">
            任务总数
            <el-popover
              placement="top-start"
              :content="totalText"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i slot="reference" class="iconfont icon-question" style="font-size: 12px;" />
            </el-popover>
          </el-col>
          <el-col :span="6" class="col_style">
            已执行任务数
            <el-popover
              placement="top-start"
              :content="taskExecuteText"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i slot="reference" class="iconfont icon-question" style="font-size: 12px;" />
            </el-popover>
          </el-col>
          <el-col :span="6" class="col_style">
            未执行任务数
            <el-popover
              placement="top-start"
              :content="taskUnExecuteText"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
            </el-popover>
          </el-col>
          <el-col :span="6" class="col_style">
            执行率
            <el-popover
              placement="top-start"
              content="已执行任务数 / 任务总数 * 100%"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
            </el-popover>
          </el-col>
        </el-row>
        <el-row type="flex" class="row-bg data-count theme-text-color" justify="space-between">
          <el-col :span="6">{{ countInfo.taskCount }}</el-col>
          <el-col :span="6">{{ countInfo.taskExecuteCount }}</el-col>
          <el-col :span="6">{{ countInfo.taskUnExecuteCount }}</el-col>
          <el-col :span="6">{{ countInfo.executeRate }}</el-col>
        </el-row>
      </div>
    </div>
    <div class="record-div">
      <div class="header-radio-group">
        <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
          <el-radio-button :label="RULE_RECORD">规则执行记录</el-radio-button>
          <el-radio-button :label="EMPLOYEES_RECORD">员工执行记录</el-radio-button>
        </el-radio-group>
      </div>
      <RuleRecord :type="activeName === RULE_RECORD ? 'rule': 'employee'" :sop-id="sopId" />
    </div>
  </div>
</template>
<script>
const RULE_RECORD = 0;
const EMPLOYEES_RECORD = 1;
import { getSopCount } from '@/api/sop';
import RuleRecord from './ruleRecord.vue';
import { SOP_TYPE } from '@/utils/constant/index';

export default {
  name: '',
  components: { RuleRecord },
  props: {
    sopId: {
      type: String,
      default: null
    },
    sopType: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      activeName: RULE_RECORD,
      RULE_RECORD,
      EMPLOYEES_RECORD,
      countInfo: {
        taskExecuteCount: 0,
        taskUnExecuteCount: 0,
        executeRate: '0%',
        taskCount: 0
      }
    };
  },
  computed: {
    totalText() {
      let tip = '';
      switch (this.sopType) {
        case SOP_TYPE['newCustomer']: {
          tip = '员工要对新增客户执行任务的总数';
          break;
        }
        case SOP_TYPE['activity']: {
          tip = '员工要对指定客户执行任务的总次数，规则数 * 客户数';
          break;
        }
        case SOP_TYPE['birthday']: {
          tip = '客户生日时，员工要执行的任务总数';
          break;
        }
        case SOP_TYPE['cycle']: {
          tip = '员工要对客户群执行任务的总数，规则数 * 群聊数 * 循环数';
          break;
        }
        case SOP_TYPE['timing']:
        case SOP_TYPE['groupCalendar']: {
          tip = '员工要对客户群执行任务的总数，规则数 * 群聊数';
          break;
        }
      }
      return tip;
    },
    taskExecuteText() {
      let tip = '';
      switch (this.sopType) {
        case SOP_TYPE['newCustomer']: {
          tip = '员工已向新客户发送指定内容的任务总数';
          break;
        }
        case SOP_TYPE['activity']: {
          tip = '员工已向客户发送指定内容的任务总数';
          break;
        }
        case SOP_TYPE['birthday']: {
          tip = '员工已向客户发送指定内容的任务总数';
          break;
        }
        case SOP_TYPE['cycle']:
        case SOP_TYPE['timing']:
        case SOP_TYPE['groupCalendar']: {
          tip = '员工已向客户群发送指定内容的任务总数';
          break;
        }
      }
      return tip;
    },
    taskUnExecuteText() {
      let tip = '';
      switch (this.sopType) {
        case SOP_TYPE['newCustomer']: {
          tip = '员工未向新客户发送指定内容的任务总数';
          break;
        }
        case SOP_TYPE['activity']:
        case SOP_TYPE['birthday']: {
          tip = '员工未向客户发送指定内容的任务总数';
          break;
        }
        case SOP_TYPE['timing']:
        case SOP_TYPE['cycle']:
        case SOP_TYPE['groupCalendar']: {
          tip = '员工未向客户群发送指定内容的任务总数';
          break;
        }
      }
      return tip;
    }
  },
  watch: {
  },
  created() {},
  mounted() {
    this.getSopCount();
  },
  methods: {
    getSopCount() {
      getSopCount({
        sopId: this.sopId
      }).then(res => {
        if (res) {
          this.countInfo = { ...res.data };
        }
      });
    }
  }

};
</script>
<style scoped lang='scss'>
.perform-record-page {
    height: 100%;
    flex-direction: column;
    .data-statistical {
        width: 100%;
        height: 200px;
        background: #fff;
        border-radius: 5px;
        padding: 15px;
        font-size: 16px;
        margin-bottom: 14px;
        .title_name {
            font-size: 24px;
            font-weight: bold;
            color: #000000;
            padding-top: 15px;
        }
        .data-count {
            margin-top: 10px;
            font-size: 35px;
            font-weight: bold;
            text-align: center;
          }
      }
      .record-div {
          background-color: #fff;
          padding: 15px;
          flex: 1;
          .header-radio-group {
              margin-bottom: 15px;
          }
      }
}
</style>
