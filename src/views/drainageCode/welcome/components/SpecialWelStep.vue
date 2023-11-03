<!--
 * @Description: 特殊时段欢迎语
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="special-step-page">
    <div class="step-row-div time-stamp-div">
      <div class="label">生效时段</div>
      <div style="margin: 0 10px 0 0;">每周</div>
      <el-select
        v-model="ruleItem.weekendList"
        multiple
        placeholder="请选择"
        clearable
        style="width: 184px; margin-right: 8px;"
      >
        <el-option
          v-for="item in weekOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-time-picker
        v-model="timeStamp"
        is-range
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        placeholder="选择时间范围"
        style="width: 172px;margin-right: 10px;padding-left: 6px; padding-right: 0;"
        value-format="HH:mm"
        format="HH:mm"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <div>发送以下欢迎语</div>
    </div>
    <div class="step-row-div" style="align-items: initial;">
      <div class="label">欢迎语</div>
      <div class="welcome-input-div">
        <el-input
          v-model="ruleItem.specialWelcomeMsg"
          type="textarea"
          :maxlength="welMsgMaxlength"
          show-word-limit
          :autosize="{ minRows: 4, maxRows: 10 }"
          placeholder="请输入欢迎语"
        />
        <div class="quick-actions">
          <span @click="handeAddTextClick('#客户昵称#', index)">#客户昵称#</span>
          <span @click="handeAddTextClick('#员工姓名#', index)">#员工姓名#</span>
        </div>
        <AddAppendixBtn
          :sub-title="subTitle"
          :limit-select-length="limitSelectLength"
          :max-appendix-num="MAX_APPENDIX_NUM"
          :appendix-list.sync="specialMaterialList"
          :msg-tip="`时段欢迎语${index}最多支持设置9个欢迎语`"
          :remove-appendix-list.sync="removeAppendixList"
        />
      </div>
      <div class="tool-div theme-text-color">
        <div style="margin-right: 10px;" @click="onPreview">预览效果</div>
        <div @click="handleDelWel(index)">删除</div>
      </div>
    </div>
    <el-dialog
      class="preview-dialog"
      title="预览效果"
      :visible.sync="previewVisible"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="preview-phone">
        <PhoneDialog
          :message="ruleItem.specialWelcomeMsg"
          :msg-list="specialMaterialList"
          :un-show-video-cover="true"
        />
      </div>
    </el-dialog>
  </div>
</template>
<script>
import AddAppendixBtn from '@/components/AddAppendixBtn.vue';
import { weekNum, MAX_APPENDIX_NUM } from '@/utils/constant/index';
import PhoneDialog from '@/components/PhoneDialog';

export default {
  name: '',
  components: { AddAppendixBtn, PhoneDialog },
  props: {
    ruleItem: {
      type: Object,
      default: () => {}
    },
    handeAddTextClick: {
      type: Function,
      default: () => {}
    },
    subTitle: {
      type: String,
      default: ''
    },
    /**
     * 欢迎语文字长度上限
     */
    welMsgMaxlength: {
      type: Number,
      default: 0
    },
    weMsgTlpSpecialRules: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: 0
    },
    /**
     * 判断时间段区间是否重复
     */
    checkRepeatTime: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    const weekList = () => {
      const num = weekNum;
      const list = [];
      for (let index = 0; index < num.length; index++) {
        list.push({ label: `周${num[index]}`, value: index + 1 });
      }
      return list;
    };
    return {
      weekOptions: weekList(),
      specialMaterialList: [],
      timeStamp: [],
      previewVisible: false,
      // 要移除的附件列表
      removeAppendixList: [],
      MAX_APPENDIX_NUM,
      limitSelectLength: MAX_APPENDIX_NUM
    };
  },
  watch: {
    specialMaterialList(val) {
      const list = [...this.weMsgTlpSpecialRules];
      list[this.index].specialMaterialList = val;
      this.$emit('update:weMsgTlpSpecialRules', list);
      this.limitSelectLength = MAX_APPENDIX_NUM - val.length;
    },
    timeStamp(val) {
      if (val) {
        const list = [...this.weMsgTlpSpecialRules];
        list[this.index].weekendBeginTime = val[0];
        list[this.index].weekendEndTime = val[1];
        this.$emit('update:weMsgTlpSpecialRules', list);
      }
    },
    removeAppendixList(val) {
      if (val && val.length) {
        const list = [...this.weMsgTlpSpecialRules];
        list[this.index].removeAppendixList = val;
        this.$emit('update:weMsgTlpSpecialRules', list);
      }
    }
  },
  created() {},
  mounted() {
    this.specialMaterialList = [...this.ruleItem.specialMaterialList];
    this.timeStamp = [this.ruleItem.weekendBeginTime || '00:00:00', this.ruleItem.weekendEndTime || '23:59:59'];
  },
  methods: {
    /**
     * 删除欢迎语
     */
    handleDelWel(index) {
      this.confirmModal({
        msg: '该时段欢迎语将被删除，是否继续？'
      }, async() => {
        const list = [...this.weMsgTlpSpecialRules];
        list.splice(index, 1);
        this.$emit('update:weMsgTlpSpecialRules', list);
        this.$emit('removeSpecialRule', this.ruleItem);
      });
    },
    onPreview() {
      this.previewVisible = true;
    },
    /**
     * 时间选择组件失焦判断时间是否重复
     */
    handleBlur() {
      let allWeekList = [];
      this.weMsgTlpSpecialRules.map(item => {
        allWeekList = allWeekList.concat(item.weekendList);
      });
      this.checkRepeatTime(allWeekList);
    },
    /**
     * 当聚焦时间选择器时设置默认值
     */
    handleFocus() {
      if (!this.timeStamp[0] && !this.timeStamp[1]) {
        this.timeStamp = ['00:00:00', '23:59:59'];
      }
    }
  }

};
</script>
<style scoped lang='scss'>
.special-step-page {
    .step-row-div {
      display: flex;
      align-items: center;
      font-size: 14px;
      margin-bottom: 15px;
      position: relative;
      .label {
        width: 56px;
        text-align: right;
        margin-right: 10px;
      }
      .welcome-input-div {
        width: 455px;
        margin-right: 10px;
      }
      .tool-div {
        position: relative;
        align-items: flex-end;
        display: flex;
        div {
          cursor: pointer;
        }
      }
    }
}
/deep/ .preview-phone {
  .preview {
    margin: 0 auto;
  }
}
</style>
