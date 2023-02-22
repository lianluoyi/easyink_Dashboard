<!--
 * @Description: 表单选择控件组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div
      v-for="(item,index) in options"
      :key="index"
      class="item"
    >
      <div class="item-name">{{ item.label }}</div>
      <div class="item-components">
        <div v-for="component in item.components" :key="component.type" class="item-components-detail" @click="addComponents(component)">
          <div class="item-components-name">
            <svg :class="'icon-' + component.iconName" :width="14" :height="14" style="margin-right:5px">
              <use :href="'#icon-' + component.iconName" />
            </svg>
            {{ component.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
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
export default {
  data() {
    return {
      options: Object.freeze([
        {
          label: '选项',
          components: [
            { title: '单选', type: RADIO_COMPONENT, iconName: 'danxuan' },
            { title: '多选', type: CHECKBOX_COMPONENT, iconName: 'duoxuan' },
            { title: '下拉框', type: SELECT_COMPONENT, iconName: 'xialakuang' }
          ]
        }, {
          label: '填空',
          components: [
            { title: '单行文本', type: ONE_LINE_TEXT_COMPONENT, iconName: 'danhangwenben' },
            { title: '多行文本', type: MANY_LINE_TEXT_COMPONENT, iconName: 'duohangwenben' },
            { title: '日期时间', type: DATE_TIME_COMPONENT, iconName: 'riqi' }
          ]
        }, {
          label: '满意度',
          components: [
            { title: '评分', type: SCORE_COMPONENT, iconName: 'pingfen' },
            { title: 'NPS', type: NPS_COMPONENT, iconName: 'NPS' }
          ]
        }, {
          label: '展示',
          components: [
            { title: '文字', type: TEXT_COMPONENT, iconName: 'a-wenzi' },
            { title: '图片', type: IMAGE_COMPONENT, iconName: 'tupian' },
            { title: '轮播图', type: CAROUSEL_COMPONENT, iconName: 'lunbotuguanli' }
          ]
        }
      ])
    };
  },
  methods: {
    addComponents(component) {
      EventBus.$emit('chooseComponents', { ...component, id: uuidv4() });
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  width: 282px;
  margin-bottom: 15px;
  .item-name {
    color:#606266;
    font-size: 14px;
    margin-bottom: 15px;
    font-weight: 700;
  }

  .item-components {
    display: flex;
    flex-wrap: wrap;
    .item-components-detail:not(:last-child) {
       margin-right: 10px;
    }
    .item-components-detail {
      margin-bottom: 5px;
      cursor: pointer;
      border: 1px solid #D9D9D9;
      width: 87px;
      height: 34px;
      line-height: 34px;
      text-align: center;
    }
    .item-components-detail:hover {
      background-color: rgb(234, 233, 233);
    }
    .item-components-name {
      color:#606266;
      font-size: 12px;
      display: flex;
      align-items: center;
      margin-left: 10px;
    }
  }
}
</style>
