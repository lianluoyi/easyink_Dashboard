<!--
 * @Description: 显示条件组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="show-condition" @click="openConditionDialog">
      <span>显示条件</span>
      <div class="fcc">
        <span v-if="getSetRules().index" class="condition-nums">
          {{ getSetRules().index }}个条件
        </span>
        <i class="el-icon-arrow-right ml5" />
      </div>
    </div>
    <el-dialog
      title="设置显示条件"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="cancelCondition"
    >
      <div class="mb20">当填写者的选择满足以下任一条件时，显示当前题目</div>
      <div v-for="item in ruleList" :key="item.id" class="mb10">
        <!-- 问题下拉框 -->
        <el-select v-model="item.questionId" placeholder="请选择" style="width:300px" @change="changeRuleQuestion(item)">
          <el-option
            v-for="question in questionOptions"
            :key="question.id"
            :label="question.title"
            :value="question.id"
          />
        </el-select>
        <span class="ml10 mr10">
          选中
        </span>
        <!-- 答案下拉框 -->
        <el-select v-model="item.answer" multiple placeholder="请选择" style="width:300px">
          <el-option
            v-for="answer in item.answerOptions"
            :key="answer.id"
            :label="answer.label"
            :value="answer.id"
          />
        </el-select>
        <i class="el-icon-remove-outline ml10" style="cursor: pointer;" @click="removeRule(item)" />
      </div>
      <el-button style="padding:9px;" icon="el-icon-plus" @click="addCondition">添加条件</el-button>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelCondition">取 消</el-button>
        <el-button type="primary" @click="confimAddCondition">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
import { v4 as uuidv4 } from 'uuid';
// TODO 有bug需要修改
import { EventBus } from '@/event-bus.js';
import { find, cloneDeep } from 'lodash';
export default {
  props: {
    component: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogVisible: false,
      value: '',
      // 当前控件设置显示的规则的列表
      ruleList: [],
      // 当前可以选择的所有的控件
      componentList: [],
      // 使用该值是为了保证在删除控件的时候 添加的时候能够找到
      original: []
    };
  },
  computed: {
    questionOptions() {
      return this.componentList;
    }
  },
  watch: {
    component: {
      deep: true,
      handler: function(val) {
        this.ruleList = cloneDeep(val?.ruleList?.length ? val.ruleList : [{ id: uuidv4() }]);
      }
    }
  },
  mounted() {
    EventBus.$on('allComponents', arg => {
      this.componentList = arg;
      this.original = arg;
      // 这里将ruleList和传过来的组件对比是因为编辑的时候可能会出现修改选项答案的情况
      this.ruleList = this.ruleList.map((item) => {
        const newRuleItem = find(arg, { id: item.questionId });
        if (newRuleItem) {
          return {
            ...item,
            answerOptions: newRuleItem.options,
            // 需要过滤掉答案中被删除的选项 不然会找不到答案选项从而显示id
            answer: item.answer.filter((answerArg) => find(newRuleItem.options, { id: answerArg }))
          };
        }
        return item;
      });
    });
  },
  beforeDestroy() {
    EventBus.$off('allComponents');
  },
  // 这个组件需要获取到除了当前题目之外所有的单选 多选 下拉框 NPS 这4类控件
  methods: {
    /**
     * @description 确认添加显示条件
     */
    confimAddCondition() {
      // 去除空的规则
      this.ruleList = this.ruleList.filter((item) => item.questionId && item.answer);
      this.dialogVisible = false;
      EventBus.$emit('changeFiledSettingValue', { ruleList: this.ruleList, id: this.component.id });
      // 更新父组件的ruleList,避免点击取消的时候ruleList全部都重置为空
      this.$emit('updateComponentItem', this.ruleList);
    },
    /**
     * @description 删除显示条件
     */
    removeRule(item) {
      // 删除显示条件的同时需要根据当前删除的显示条件选择的控件id在original（所有控件）中找到并添加到可选择的控件列表中
      this.ruleList = this.ruleList.filter(arg => item.id !== arg.id);
    },
    /**
     * @description 新增显示条件
     */
    addCondition() {
      this.componentList = [];
      // 可选择的控件需要是在所有控件中过滤掉已经选择的控件
      this.original.forEach(item => {
        const newItem = find(this.ruleList, { questionId: item.id });
        if (!newItem) {
          this.componentList.push(item);
        }
      });
      this.ruleList.push({ id: uuidv4() });
    },
    /**
     * @description 取消
     */
    cancelCondition() {
      this.dialogVisible = false;
      this.ruleList = cloneDeep(this.component?.ruleList?.length ? this.component.ruleList : [{ id: uuidv4() }]);
    },
    openConditionDialog() {
      if (!this.ruleList.length) {
        this.ruleList.push({ id: uuidv4() });
      }
      this.dialogVisible = true;
    },
    /**
     * @description 获取已经设置的显示条件个数和
     */
    getSetRules() {
      let index = 0;
      const newArr = [];
      this?.ruleList?.forEach((item) => {
        if (item.answer && item.questionId) {
          newArr.push(item);
          index++;
        }
      });
      return { index, newArr };
    },
    /**
     * @description 获取答案的列表
     * @param  ruleItem 当前规则
     */
    changeRuleQuestion(ruleItem) {
      ruleItem.answer = undefined;
      // 当规则的questionId改变时，在所有控件中根据questionId设置当前条件下的answerOptions
      ruleItem.answerOptions = find(this.original, { id: ruleItem.questionId })?.options || [];
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.show-condition {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  .condition-nums {
    color: $green
  }
  .el-icon-arrow-right {
    font-size: 16px;
  }
}
</style>
