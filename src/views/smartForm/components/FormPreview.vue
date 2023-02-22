<!--
 * @Description: 表单预览组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="preview">
    <!-- 预览的头图 -->
    <div v-if="formSetValue.headImageOpenFlag" class="header-img fcc" @click="changeToFormSetting">
      <el-image
        v-if="formSetValue.headImageUrl"
        :src="formSetValue.headImageUrl"
        fit="cover"
        style="width:375px;height:150px"
      />
      <svg-icon v-else icon-class="fa-image" class-name="fa-image" />
    </div>
    <!-- 表单名称 -->
    <div class="form-name fcc" @click="changeToFormSetting">
      {{ formSetValue.formName }}
    </div>
    <!-- 表单说明 -->
    <div v-if="formSetValue.descriptionFlag" class="form-description" @click="changeToFormSetting">
      {{ formSetValue.description }}
    </div>
    <!-- 表单预览 -->
    <el-form label-position="top" label-width="80px" style="min-height:225px;background-color: #fff;">
      <div
        v-for="(item, index) in prewievForm"
        :key="item.id"
        :style="!isImageOrCarousel(item.type) ? 'padding : 5px 10px' : 'margin-top:10px'"
        :class="['form-preview-item', item.id === isActiveId ? ' checked' : '']"
        @click="clickComponent(item)"
      >
        <el-form-item style="pointer-events: none;">
          <!-- 标题 -->
          <div v-if="showTitle(item.type)" slot="label" class="form-label">
            <span v-if="item.type === ONE_LINE_TEXT_COMPONENT || item.type === MANY_LINE_TEXT_COMPONENT">
              <span :class="item.required ? 'required' : ''">{{ formSetValue.showSortFlag ? `${getSortIndex(item,index)}. ${item.title}` : item.title }}</span>
              <span v-if="item.valueLimitType === TEXT_LENGTH_TYPE && item.max" class="label-limit">{{ `(0/${item.max})` }}</span>
            </span>
            <span v-else :class="item.required ? 'required' : ''">{{ formSetValue.showSortFlag ? `${getSortIndex(item,index)}. ${item.title}` : item.title }}</span>
          </div>
          <!-- 单选 -->
          <div v-if="item.type === RADIO_COMPONENT" class="radio-component">
            <el-radio-group v-model="item.radio">
              <el-radio v-for="radio in item.options" :key="radio.id" :label="radio.id">
                {{ radio.label }}
              </el-radio>
            </el-radio-group>
          </div>
          <!-- 多选 -->
          <div v-if="item.type === CHECKBOX_COMPONENT" class="checkBox-component">
            <el-checkbox-group v-model="item.answer">
              <el-checkbox v-for="checkBox in item.options" :key="checkBox.id" :label="checkBox.id">
                {{ checkBox.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- 下拉框 -->
          <div v-if="item.type === SELECT_COMPONENT">
            <el-select v-model="item.answer" style="width:100%" placeholder="请选择">
              <el-option
                v-for="select in item.options"
                :key="select.id"
                :label="select.label"
                :value="select.id"
              />
            </el-select>
          </div>
          <!-- 单行文本 -->
          <div v-if="item.type === ONE_LINE_TEXT_COMPONENT">
            <el-input
              :placeholder="item.info"
              resize="none"
            />
          </div>
          <!-- 多行文本 -->
          <div v-if="item.type === MANY_LINE_TEXT_COMPONENT">
            <el-input
              resize="none"
              :placeholder="item.info"
              type="textarea"
              :rows="5"
            />
          </div>
          <!-- 日期时间 -->
          <div v-if="item.type === DATE_TIME_COMPONENT">
            <el-input
              :placeholder="item.info"
            />
          </div>
          <!-- 评分 -->
          <div v-if="item.type === SCORE_COMPONENT" class="score-component">
            <el-rate />
            <span>辅助文字</span>
          </div>
          <!-- NPS -->
          <div v-if="item.type === NPS_COMPONENT" class="nps-component">
            <div class="nps-score">
              <span v-for="(npsItem) in NPS_LENGTH" :key="npsItem">
                {{ npsItem }}
              </span>
            </div>
            <div class="nps-text">
              <span>{{ item.leftAuxiliaryText }}</span>
              <span>{{ item.righAuxiliarytText }}</span>
            </div>
          </div>
          <!-- 文字 -->
          <div v-if="item.type === TEXT_COMPONENT" :style="`color:${item.textColor};line-height:20px;`">
            {{ item.content }}
          </div>
          <!-- 图片和轮播图 -->
          <!-- 图片和轮播图 -->
          <div v-if="item.type === IMAGE_COMPONENT" style="width:100%;height:150px">
            <div v-if="!item.imageUrl" class="header-img fcc">
              <svg-icon icon-class="fa-image" class-name="fa-image" />
            </div>
            <el-image
              v-else
              :src="item.imageUrl"
              fit="cover"
              style="width:100%;height:150px"
            />
          </div>
          <div v-if="item.type === CAROUSEL_COMPONENT">
            <div v-if="item.imageUrlList&&!item.imageUrlList.length" class="header-img fcc">
              <svg-icon icon-class="fa-image" class-name="fa-image" />
            </div>
            <el-carousel v-else height="150px" indicator-position="none">
              <el-carousel-item v-for="itemImageUrl in item.imageUrlList" :key="itemImageUrl.uid">
                <el-image
                  :src="itemImageUrl.url"
                  fit="cover"
                  style="width:375px;height:150px"
                />
              </el-carousel-item>
            </el-carousel>
          </div>
        </el-form-item>
        <Sort v-if="item.id===isActiveId" :index="index" :last-index="lastIndex" class="sort" @changeSort=" (type) => changeSort(item, index, type)" @click.native.stop />
      </div>
    </el-form>
    <!-- 提交按钮 -->
    <div class="submit-button">
      <el-button type="primary" :style="`background-color: ${formSetValue.submitColor};border-color:${formSetValue.submitColor}`" @click="changeToFormSetting">{{ formSetValue.submitText }}</el-button>
    </div>
  </div>
</template>

<script>
// NPS评分项
// eslint-disable-next-line no-magic-numbers
const NPS_LENGTH = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
  CAROUSEL_COMPONENT,
  TEXT_LENGTH_TYPE
} from '@/utils/constant';
import { EventBus } from '@/event-bus.js';
import Sort from './Sort.vue';
import { indexOf } from 'lodash';
import { checkChange } from '@/utils/common';
export default {
  components: { Sort },
  props: {
    // 是否显示表单字段编辑组件
    showEditFormFiled: {
      type: Boolean,
      default: false
    },
    // 编辑时回显的表单字段设置数组
    previewFormFiled: {
      type: Array,
      default: () => []
    },
    // 当前显示的是字段设置还是表单设置
    activeName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
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
      CAROUSEL_COMPONENT,
      NPS_LENGTH,
      TEXT_LENGTH_TYPE,
      formSetValue: {},
      prewievForm: [],
      isActiveId: undefined,
      lastIndex: false
    };
  },
  watch: {
    // 当监听到点击下一步到表单设置的时候将表单字段传递过去
    showEditFormFiled(val) {
      if (!val) {
        EventBus.$emit('formFieldListJson', JSON.stringify(this.prewievForm));
      }
    },
    previewFormFiled(val) {
      this.prewievForm = val;
    },
    activeName(val) {
      if (val === 'formSetting') {
        this.isActiveId = undefined;
      }
    }
  },
  beforeUpdate() {
    checkChange(this.$options.data().prewievForm, this.prewievForm);
  },
  mounted() {
    EventBus.$on('formSettingValue', arg => {
      console.log('表单预览组件接收到表单设置事件', arg);
      this.formSetValue = arg;
    });
    EventBus.$on('chooseComponents', arg => {
      console.log('表单预览组件接收到选择组件事件', arg);
      this.isActiveId = arg.id;
      const payload = { ...arg };
      switch (arg.type) {
        case RADIO_COMPONENT: {
          break;
        }
        case CHECKBOX_COMPONENT: {
          payload.answer = [];
          break;
        }
        case SELECT_COMPONENT: {
          payload.answer = [];
          break;
        }
        case NPS_COMPONENT: {
          // NPS 控件需要自己生成options给显示条件的组件使用
          payload.options = NPS_LENGTH.map(item => {
            return {
              id: item,
              label: item
            };
          });
        }
      }
      this.lastIndex = true;
      this.prewievForm.push(payload);
      EventBus.$emit('allComponents', this.prewievForm.filter((previewItem) => [RADIO_COMPONENT, CHECKBOX_COMPONENT, SELECT_COMPONENT, NPS_COMPONENT].includes(previewItem.type)));
    });
    EventBus.$on('changeFiledSettingValue', arg => {
      // 在这个设置change字段是为了显示页面内容不会保存的提示
      // window.sessionStorage.setItem('change', true);
      console.log('表单预览组件接收到修改字段的事件');
      this.prewievForm = this.prewievForm.map((item) => {
        if (item.id === arg.id) {
          return { ...item, ...arg };
        }
        return item;
      });
      EventBus.$emit('allComponents', this.prewievForm.filter((previewItem) => previewItem.id !== this.isActiveId && [RADIO_COMPONENT, CHECKBOX_COMPONENT, SELECT_COMPONENT, NPS_COMPONENT].includes(previewItem.type)));
    });
  },
  beforeDestroy() {
    // 组件卸载时移除事件的监听
    EventBus.$off('chooseComponents');
    EventBus.$off('formSettingValue');
    EventBus.$off('changeFiledSettingValue');
  },
  methods: {
    showTitle(type) {
      return ![TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(type);
    },
    /**
   * @description 切换到表单设置
   */
    changeToFormSetting() {
      EventBus.$emit('formSetting');
    },
    // 是否是图片或者轮播图
    isImageOrCarousel(type) {
      return [IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(type);
    },
    clickComponent(item) {
      EventBus.$emit('clickComponents', item);
      // 点击控件的时候把控件传给显示条件组件
      EventBus.$emit('allComponents', this.prewievForm.filter((previewItem) => previewItem.id !== this.isActiveId && ![RADIO_COMPONENT, CHECKBOX_COMPONENT, SELECT_COMPONENT, NPS_COMPONENT].includes(previewItem.type)));
      this.isActiveId = item.id;
      this.lastIndex = this.checkLastIndex();
    },
    changeSort(item, index, type) {
      if (type === 'delete') {
        this.prewievForm = this.prewievForm.filter((previewItem) => previewItem.id !== item.id);
        this.changeToFormSetting();
        return;
      }
      this.swapArray(index, type);
      this.lastIndex = this.checkLastIndex();
    },
    /**
     * @description 判断是否是最后一个 根据isActiveId是否等于prewievForm最后一个对象的id
     */
    checkLastIndex() {
      return this.isActiveId === this.prewievForm[this.prewievForm.length - 1].id;
    },
    /**
     1. type 为moveTop 上移， moveBottom 为下移 delete为删除
     2. index 为需要移动的 数组的下标
    **/
    swapArray(index, type) {
      // 是否是下移的标志
      const bottomFlag = type === 'moveBottom';
      const fItem = this.prewievForm[ bottomFlag ? index : index - 1];
      const data = this.prewievForm.splice(bottomFlag ? index + 1 : index, 1, fItem);
      this.prewievForm.splice(bottomFlag ? index : index - 1, 1, ...data);
    },
    /**
     * @description 获取序号
     */
    getSortIndex(item) {
      // 过滤掉当前不需要显示序号的控件  TEXT_COMPONENT,IMAGE_COMPONENT, CAROUSEL_COMPONENT,
      const newArr = this.prewievForm.filter((item) => ![TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(item.type));
      // +1是因为从0开始的
      return indexOf(newArr, item) + 1;
    }
  }
};
</script>
<style lang="scss" scoped>
  .preview {
    max-height: 502px;
    width: 375px;
    border: 1px solid #eee;
    background-color: #fff;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
    .header-img {
      width: auto;
      height: 150px;
      background-color: #eee;
      .fa-image {
        width: 50px;
        height: 50px;
      }
    }
    .form-name {
      height: 40px;
      font-size: 16px;
      color: #101010;
      font-weight: 800;
    }
    .form-description {
      min-height: 40px;
      padding: 0 10px;
      color: #606266;
      line-height: 20px;
    }
    .form-label {
      color: #101010;
      font-size: 14px;
      font-weight: bold;
      .label-limit {
        color: #999;
        font-size: 14px;
        font-weight: 100;
        margin-left: 10px;
      }
    }
    .required {
      @extend .form-label
    }
    .required::after {
     content:'  *';
     color:red;
    }
    /deep/ .el-divider {
      margin: 5px 0;
    }
    /deep/ .el-form-item:hover  {
      background: none;
    }
    /deep/ .el-form-item {
      padding: 0;
    }

    .form-preview-item {
      /deep/ .el-form-item__label {
       line-height: 23px;
      }
      position: relative;
      /deep/ .el-input__suffix-inner {
        pointer-events: none;
      }
      /deep/ .el-textarea {
        textarea {
          overflow: hidden;
        }
      }
      .radio-component {
        .el-form-item__content {
          min-height: 75px;
        }
        .el-radio-group {
          .el-radio {
            white-space: pre-line;
            display: block;
            margin-bottom: 10px;
           /deep/ .el-radio__label {
              margin-left: -28px;
              right: -26px;
              position: relative;
            }
          }
          .el-radio:last-child {
            margin-right: 30px;
          }
        }
      }
      .checkBox-component {
        .el-checkbox {
          margin-bottom: 10px;
          white-space: pre-line;
          display: flex;
          align-items: flex-start;
          /deep/ .el-checkbox__input {
            margin-top: 2px;
          }
        }
      }
      .score-component {
        display: flex;
        align-items: center;
        span {
          color:#EE0A24;
          margin-left: 5px;
        }
      }
      .nps-component {
        padding-right: 10px;
        .nps-score {
          display: flex;
          justify-content: space-around;
          span {
            display: inline-block;
            width: 25px;
            height: 25px;
            line-height: 25px;
            color:#626266;
            background-color: #F5F6F7;
            text-align: center;
          }
        }
        .nps-text {
          display:flex;
          justify-content: space-between;
          font-size: 12px;
          font-family: Arial-regular;
        }
      }
    }
    .checked {
      box-shadow: 0px 0px 5px 0px rgba(24, 2, 2, 0.1);
      box-sizing: border-box;
      z-index: 999;
    }
    .sort {
      position: absolute;
      right: -35px;
      bottom: 0;
    }
    .submit-button {
      background-color: #fff;
      padding: 30px 10px 20px 10px;
      bottom: 10px;
      width: 100%;
      .el-button {
        width: 100%;
      }
    }
  }
</style>
