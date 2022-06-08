<!--
 * @Description: 添加规则抽屉
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <el-drawer
    v-bind="$attrs"
    :before-close="handleClose"
    :append-to-body="true"
    class="add-rule-drawer"
    size="780px"
    v-on="$listeners"
  >
    <div class="drawer-div">
      <el-alert
        v-if="hasExpired"
        class="ml20 mr20"
        title="该规则提醒时间已过，不可修改"
        type="warning"
        show-icon
        :closable="false"
      />
      <el-form ref="form" :model="formData" label-width="100px" class="form" :rules="rules" :disabled="hasExpired || disableEdit">
        <el-form-item label="任务名称" prop="name">
          <el-input
            v-model="formData.name"
            maxlength="32"
            show-word-limit
            :placeholder="`${sopType === SOP_TYPE['groupCalendar'] ? '设置任务名称，方便记录日历执行情况':'设置任务名称，方便记录SOP执行情况'}`"
            clearable
            style="width: 432px;"
          />
        </el-form-item>
        <el-form-item label="提醒时间" prop="alertInfo">
          <AlertTimeEditItem :form-data.sync="formData" :sop-type="sopType" />
        </el-form-item>
        <el-form-item label="发送内容" prop="materialList">
          <template v-for="(item, contentIndex) in formData.materialList">
            <VerbalTrickItem
              ref="verbalTrickItemRef"
              :key="contentIndex"
              :content-index="contentIndex"
              :item.sync="item"
              :media-type="item.mediaType.toString()"
              :form-data="formData"
              :content-list.sync="formData.materialList"
              :show-tool="(hasExpired || disableEdit) ? [] : ['remove']"
              :disabled="(hasExpired || disableEdit)"
              @getRemoveList="getRemoveList"
            />
          </template>
        </el-form-item>
        <div v-if="!(hasExpired || disableEdit)" class="operate-btn-div">
          <AddVerbalTrickButton
            btn-text="新增内容"
            :form-data.sync="formData"
            :can-select-material="true"
            trigger="click"
            placement="top"
            btn-class="btn-reset"
            material-field="materialList"
          />
        </div>
      </el-form>
      <div class="confirm-div">
        <div v-show="ruleIndex > -1" @click="handleDelRule">
          删除当前规则
        </div>
        <div v-if="!(hasExpired || disableEdit)">
          <el-button class="btn-reset" @click="handleClose">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script>
import {
  MEDIA_TYPE_TEXT, RULE_PERFORM_TYPE, SOP_TYPE, DEFAULT_ALERTINFO
} from '@/utils/constant';
import VerbalTrickItem from '@/views/verbalTrickLibrary/component/verbalTrickItem.vue';
import AddVerbalTrickButton from '@/components/AddVerbalTrickButton.vue';
import { checkContent } from '@/utils/common';
import AlertTimeEditItem from './AlertTimeEditItem.vue';
import moment from 'moment';
import { deepClone } from '@/utils/index';

/** 规则提醒类型对应的自定义字段名 */
const RULE_PERFORM_FIELD_TYPE = {
  [RULE_PERFORM_TYPE['hourMinute']]: 'hourMinute',
  [RULE_PERFORM_TYPE['dayTime']]: 'dayTime',
  [RULE_PERFORM_TYPE['beforeDayTime']]: 'beforeDayTime',
  [RULE_PERFORM_TYPE['everydayTime']]: 'everydayTime',
  [RULE_PERFORM_TYPE['everyWeekTime']]: 'everyWeekTime',
  [RULE_PERFORM_TYPE['everyMonthTime']]: 'everyMonthTime',
  [RULE_PERFORM_TYPE['time']]: 'time'
};

export default {
  name: '',
  components: { VerbalTrickItem, AddVerbalTrickButton, AlertTimeEditItem },
  props: {
    sopForm: {
      type: Object,
      default: () => {}
    },
    /**
     * 禁止编辑
     */
    disableEdit: {
      type: Boolean,
      default: false
    }
  },
  inject: ['sopInfo'],
  data() {
    // 校验提醒时间
    const checkAlertInfo = (rule, value, callback) => {
      const { alertType, alertInfo } = this.formData;
      if (alertInfo[RULE_PERFORM_FIELD_TYPE[alertType]]) {
        const flag = Object.values(alertInfo[RULE_PERFORM_FIELD_TYPE[alertType]])?.some(item => {
          return !item && item !== 0;
        });
        if (flag) return callback(new Error('请设置提醒时间'));
        return callback();
      }
      return callback(new Error('请设置提醒时间'));
    };
    return {
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: 'blur' }
        ],
        alertInfo: [
          { required: true,
            trigger: 'blur',
            validator: checkAlertInfo
          }
        ],
        materialList: [{
          required: true,
          trigger: 'blur',
          validator: checkContent
        }]
      },
      formData: {
        name: '',
        // 规则附件列表
        materialList: [{
          mediaType: MEDIA_TYPE_TEXT,
          content: ''
        }],
        alertType: this.dealDefaultAlertType(),
        alertInfo: deepClone(DEFAULT_ALERTINFO)
      },
      RULE_PERFORM_TYPE,
      SOP_TYPE,
      ruleIndex: -1,
      hasExpired: false
    };
  },
  computed: {
    sopType() {
      return this.sopInfo.sopType;
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    },
    /**
     * 确认添加规则
     */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const newFormData = this.dealRuleInfo();
          if (!newFormData) {
            return;
          }
          if (!newFormData.materialList.length) {
            this.msgWarn('请设置发送内容');
            return;
          }
          const newSopForm = { ...this.sopForm };
          let newRuleList = [...newSopForm?.ruleList] || [];
          const ruleIndex = this.ruleIndex;
          if (ruleIndex > -1) {
            newRuleList.splice(ruleIndex, 1, newFormData);
          } else {
            newRuleList.push(newFormData);
          }
          // 群日历的规则需按照时间正序排序
          if (this.sopType === SOP_TYPE['groupCalendar']) {
            newRuleList = newRuleList.sort((a, b) => {
              const aTime = moment(a.alertData2).valueOf();
              const bTime = moment(b.alertData2).valueOf();
              return aTime - bTime;
            });
          }
          newSopForm.ruleList = newRuleList;
          this.$emit('update:sopForm', newSopForm);
          this.resetForm();
          this.handleClose();
        }
      });
    },
    dealDefaultAlertType() {
      switch (this.sopType) {
        case SOP_TYPE['timing']:
        case SOP_TYPE['newCustomer']: {
          return RULE_PERFORM_TYPE['hourMinute'];
        }
        case SOP_TYPE['activity']:
        case SOP_TYPE['groupCalendar']: {
          return RULE_PERFORM_TYPE['time'];
        }
        case SOP_TYPE['birthday']: {
          return RULE_PERFORM_TYPE['dayTime'];
        }
        case SOP_TYPE['cycle']: {
          return RULE_PERFORM_TYPE['everydayTime'];
        }
        default: {
          return RULE_PERFORM_TYPE['hourMinute'];
        }
      }
    },
    resetForm() {
      this.formData = {
        name: '',
        // 规则附件列表
        materialList: [{
          mediaType: MEDIA_TYPE_TEXT,
          content: ''
        }],
        alertType: this.dealDefaultAlertType(),
        alertInfo: deepClone(DEFAULT_ALERTINFO),
        alertData1: undefined,
        alertData2: undefined
      };
      this.hasExpired = false;
      this.ruleIndex = -1;
    },
    /**
     * 处理提醒时间的格式
     */
    dealRuleInfo() {
      const formData = this.formData;
      const newFormData = { ...formData };
      const alertInfoObj = formData.alertInfo[RULE_PERFORM_FIELD_TYPE[formData.alertType]];
      switch (formData.alertType) {
        case RULE_PERFORM_TYPE['hourMinute']: {
          newFormData.alertData1 = alertInfoObj?.hour;
          newFormData.alertData2 = alertInfoObj?.minute;
          break;
        }
        case RULE_PERFORM_TYPE['dayTime']: {
          newFormData.alertData1 = alertInfoObj?.day;
          newFormData.alertData2 = alertInfoObj?.time;
          break;
        }
        case RULE_PERFORM_TYPE['everydayTime']: {
          newFormData.alertData2 = alertInfoObj;
          break;
        }
        case RULE_PERFORM_TYPE['everyWeekTime']: {
          newFormData.alertData1 = alertInfoObj?.week;
          newFormData.alertData2 = alertInfoObj?.time;
          break;
        }
        case RULE_PERFORM_TYPE['everyMonthTime']: {
          newFormData.alertData1 = alertInfoObj?.month;
          newFormData.alertData2 = alertInfoObj?.time;
          break;
        }
        case RULE_PERFORM_TYPE['time']: {
          if (new Date(alertInfoObj).getTime() < Date.now()) {
            this.$message({
              showClose: true,
              message: '提醒时间不能早于当前时间',
              type: 'warning'
            });
            return null;
          }
          newFormData.alertData2 = alertInfoObj;
          break;
        }
        case RULE_PERFORM_TYPE['beforeDayTime']: {
          newFormData.alertData1 = alertInfoObj?.day;
          newFormData.alertData2 = alertInfoObj?.time;
          break;
        }
      }
      return newFormData;
    },
    getRemoveList(list) {
      const newFormData = { ...this.formData };
      newFormData.delMaterialList = list.map(item => item.id);
      this.formData = newFormData;
    },
    handleDelRule() {
      this.$emit('handleDelRule', this.ruleIndex, this.formData, () => {
        this.handleClose();
      });
    }
  }

};
</script>
<style scoped lang='scss'>
@import '~@/styles/mixin.scss';
.add-rule-drawer {
  .operate-btn-div {
      padding-left: 110px;
  }
}
.drawer-div {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  /deep/ .el-form {
    flex: 1;
    overflow: auto;
  }
  .confirm-div {
    padding: 20px 30px;
    position: relative;
    div:last-child {
      float: right;
    }
    div:first-child {
      @include text_btn_color($color-theme2-1);;
      float: left;
      height: 32px;
      line-height: 32px;
      cursor: pointer;
    }
  }
  /deep/ .el-form-item__error {
    position: relative;
  }
  .day-time-picker {
    /deep/ .el-input__inner {
      padding-right: 0px;
    }
  }
}
</style>
