<!--
 * @Description: 字段设置组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <!-- TODO 不拆分组件 或者可以把必填 和 标题拿出来 通过v-if渲染不同的字段设置项 -->
    <RadioComponent v-if="item.type === RADIO_COMPONENT" :key="item.id" :component="item" />
    <CheckBoxComponent v-if="item.type === CHECKBOX_COMPONENT" :key="item.id" :component="item" />
    <SelectComponent v-if="item.type === SELECT_COMPONENT" :key="item.id" :component="item" />
    <OneLineTextComponent v-if="item.type === ONE_LINE_TEXT_COMPONENT || item.type === MANY_LINE_TEXT_COMPONENT" :key="item.id" :component="item" />
    <DataTimeComponent v-if="item.type === DATE_TIME_COMPONENT" :key="item.id" :component="item" />
    <ScoreComponent v-if="item.type === SCORE_COMPONENT" :key="item.id" :component="item" />
    <NpsComponent v-if="item.type === NPS_COMPONENT" :key="item.id" :component="item" />
    <!-- 下面这个组件用来展示文字 图片 轮播图的字段设置 -->
    <ShowComponent v-if="item.type === TEXT_COMPONENT || item.type === IMAGE_COMPONENT || item.type === CAROUSEL_COMPONENT" :key="item.id" :component="item" />
    <DisplayCondition :component="item" @updateComponentItem="updateComponentItem" />
  </div>
</template>

<script>
import {
  RADIO_COMPONENT,
  CHECKBOX_COMPONENT,
  SELECT_COMPONENT,
  ONE_LINE_TEXT_COMPONENT,
  MANY_LINE_TEXT_COMPONENT,
  DATE_TIME_COMPONENT,
  SCORE_COMPONENT,
  NPS_COMPONENT,
  TEXT_COMPONENT,
  IMAGE_COMPONENT,
  CAROUSEL_COMPONENT
} from '@/utils/constant';
import { EventBus } from '@/event-bus.js';
import RadioComponent from '../filedComponents/RadioComponent.vue';
import CheckBoxComponent from '../filedComponents/CheckBoxComponent.vue';
import SelectComponent from '../filedComponents/SelectComponent.vue';
import OneLineTextComponent from '../filedComponents/LineTextComponent.vue';
import DataTimeComponent from '../filedComponents/DataTimeComponent.vue';
import ScoreComponent from '../filedComponents/ScoreComponent.vue';
import NpsComponent from '../filedComponents/NpsComponent.vue';
import ShowComponent from '../filedComponents/ShowComponent.vue';
import DisplayCondition from '../filedComponents/components/DisplayCondition.vue';
export default {
  components: { DisplayCondition, RadioComponent, CheckBoxComponent, SelectComponent, OneLineTextComponent, DataTimeComponent, ScoreComponent, NpsComponent, ShowComponent },
  data() {
    return {
      item: {},
      RADIO_COMPONENT,
      CHECKBOX_COMPONENT,
      SELECT_COMPONENT,
      ONE_LINE_TEXT_COMPONENT,
      MANY_LINE_TEXT_COMPONENT,
      DATE_TIME_COMPONENT,
      SCORE_COMPONENT,
      NPS_COMPONENT,
      TEXT_COMPONENT,
      IMAGE_COMPONENT,
      CAROUSEL_COMPONENT
    };
  },
  mounted() {
    EventBus.$on('clickComponents', arg => {
      this.item = { ...arg };
      console.log('字段设置组件接收到的点击的控件', this.item);
    });
    EventBus.$on('chooseComponents', arg => {
      this.item = { ...arg };
      console.log('字段设置组件接收到的选择的控件', this.item);
    });
  },
  beforeDestroy() {
    EventBus.$off('clickComponents');
    EventBus.$off('chooseComponents');
  },
  methods: {
    updateComponentItem(payload) {
      this.item = { ...this.item, ruleList: payload };
    }
  }
};
</script>

<style  lang="scss" scoped>
.form-setting {
  /deep/ .el-form-item__label {
    width: 100%;
  }
  /deep/ .el-input__count {
      height: 20px;
      line-height: 20px;
  }
  /deep/ .el-form-item  {
    border-bottom: 1px solid #eee;
    .el-form-item__label {
      padding: 0;
    }
  }
  /deep/ .el-form-item:hover  {
    background: none;
    border-radius: 0;
  }
  /deep/ .el-color-picker__trigger {
    width: 50px;
    height: 50px;
  }
  .form-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .label-name {
      font-size: 14px;
      color: #606266;
      font-weight: 700;
    }
    .required {
      @extend .label-name
    }
    .required::after {
     content:'  *';
     color:red;
    }
  }
}
</style>

