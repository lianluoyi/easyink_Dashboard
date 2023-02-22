<!--
 * @Description: 表单手机样式
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="operate">
      <span @click="showResultPage = false">x</span>
      <span>...</span>
    </div>
    <div v-if="!showResultPage" class="form-preview">
      <!-- 预览的头图 -->
      <div v-if="formSetValue.headImageOpenFlag" class="header-img fcc">
        <el-image
          v-if="formSetValue.headImageUrl"
          :src="formSetValue.headImageUrl"
          style="width:210px;height:84px"
          fit="cover"
        />
        <svg-icon v-else icon-class="fa-image" class-name="fa-image" />
      </div>
      <!-- 表单名称 -->
      <div class="form-name fcc">
        {{ formSetValue.formName }}
      </div>
      <!-- 表单说明 -->
      <div v-if="formSetValue.descriptionFlag" class="form-description">
        {{ formSetValue.description }}
      </div>
      <!-- 表单预览 -->
      <el-form label-position="top" label-width="80px" style="min-height:240px">
        <div
          v-for="(item, index) in prewievForm"
          :key="item.id"
          class="form-preview-item"
          :style="!isImageOrCarousel(item.type) ? 'padding : 5px 10px' : 'margin-top:10px'"
        >
          <el-form-item v-show="isShowComponent(item)">
            <!-- 标题 -->
            <div v-if="showTitle(item.type)" slot="label" class="form-label">
              <span v-if="item.type === ONE_LINE_TEXT_COMPONENT || item.type === MANY_LINE_TEXT_COMPONENT">
                <span :class="item.required ? 'required' : ''">{{ formSetValue.showSortFlag ? `${getSortIndex(item,index)}. ${item.title}` : item.title }}</span>
                <span v-if="item.valueLimitType === TEXT_LENGTH_TYPE && item.max" class="label-limit">{{ `(${(item.answer && item.answer.length) || 0}/${item.max})` }}</span>
              </span>
              <span v-else :class="item.required ? 'required' : ''">{{ formSetValue.showSortFlag ? `${getSortIndex(item,index)}. ${item.title}` : item.title }}</span>
            </div>
            <!-- 单选 -->
            <div v-if="item.type === RADIO_COMPONENT" :key="item.id" class="radio-component">
              <el-radio-group v-model="item.answer">
                <el-radio v-for="radio in item.options" :key="radio.id" :label="radio.id">
                  {{ radio.label }}
                </el-radio>
              </el-radio-group>
            </div>
            <!-- 多选 -->
            <div v-if="item.type === CHECKBOX_COMPONENT" :key="item.id" class="checkBox-component">
              <el-checkbox-group v-model="item.answer">
                <el-checkbox v-for="checkBox in item.options" :key="checkBox.id" :label="checkBox">
                  {{ checkBox.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <!-- 下拉框 -->
            <div v-if="item.type === SELECT_COMPONENT" :key="item.id">
              <el-select v-model="item.answer" multiple style="width:100%" placeholder="请选择">
                <el-option
                  v-for="select in item.options"
                  :key="JSON.stringify(select)"
                  :label="select.label"
                  :value="JSON.stringify(select)"
                />
              </el-select>
            </div>
            <!-- 单行文本 -->
            <div v-if="item.type === ONE_LINE_TEXT_COMPONENT">
              <el-input
                v-model="item.answer"
                :placeholder="item.info"
                resize="none"
                :maxlength="item.max || -1"
              />
            </div>
            <!-- 多行文本 -->
            <div v-if="item.type === MANY_LINE_TEXT_COMPONENT">
              <el-input
                v-model="item.answer"
                resize="none"
                :placeholder="item.info"
                type="textarea"
                :maxlength="item.max || -1"
                :rows="6"
              />
            </div>
            <!-- 日期时间 -->
            <div v-if="item.type === DATE_TIME_COMPONENT">
              <el-date-picker
                v-model="item.answer"
                style="width:200px"
                :format="item.dataType === HOURS_MINUTE_TYPE ? YEAR_MONTH_DATE_TIME : YEAR_MONTH_DATE"
                :type="item.dataType === HOURS_MINUTE_TYPE ? 'datetime' : 'date'"
                :placeholder="item.info"
                :value-format="item.dataType === HOURS_MINUTE_TYPE ? YEAR_MONTH_DATE_TIME : YEAR_MONTH_DATE"
              />
            </div>
            <!-- 评分 -->
            <div v-if="item.type === SCORE_COMPONENT" class="score-component">
              <el-rate v-model="item.answer" void-icon-class="el-icon-star-on" />
              <span>{{ getAuxiliaryText(item.auxiliaryTextOptions, item.answer) }}</span>
            </div>
            <!-- NPS -->
            <div
              v-if="item.type === NPS_COMPONENT"
              class="nps-component"
            >
              <div class="nps-score">
                <span
                  v-for="(npsItem) in NPS_LENGTH"
                  :key="npsItem"
                  :style="
                    item.answer === npsItem
                      ? 'background-color:#1989FA;color:white;'
                      : ''
                  "
                  @click="chooseNpsScore(item, npsItem)"
                >
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
            <div v-if="item.type === IMAGE_COMPONENT">
              <el-image
                :src="item.imageUrl"
                fit="cover"
                style="width:210px;height:84px"
              />
            </div>
            <div v-if="item.type === CAROUSEL_COMPONENT">
              <el-carousel height="84px" indicator-position="none">
                <el-carousel-item v-for="itemImageUrl in item.imageUrlList" :key="itemImageUrl.uid">
                  <el-image
                    :src="itemImageUrl.url"
                    fit="cover"
                    style="width:210px;height:84px"
                  />
                </el-carousel-item>
              </el-carousel>
            </div>
            <div class="required-info">
              {{ item.message }}
            </div>
          </el-form-item>
        </div>
      </el-form>
      <!-- 提交按钮 -->
      <div class="submit-button">
        <el-button type="primary" :disabled="submitButtonDisabled" :style="`background-color: ${formSetValue.submitColor};border-color:${formSetValue.submitColor}`" @click="submit">{{ submitText }}</el-button>
      </div>
    </div>
    <div v-else class="result-page">
      <el-image
        :src="resultPageOptions.iconUrl"
        style="width:100px;height:100px"
      />
      <span class="result-page-text">
        {{ resultPageOptions.text }}
      </span>
    </div>
  </div>

</template>

<script>
import { indexOf, findIndex, find, cloneDeep } from 'lodash';
const YEAR_MONTH_DATE_TIME = 'yyyy-MM-dd HH:mm';
const YEAR_MONTH_DATE = 'yyyy-MM-dd';
/** 数值 */
const NUMS_TYPE = 1;
/** 字数 */
const TEXT_LENGTH_TYPE = 2;
/** 网址 */
const WEBSITE_TYPE = 3;
/** 邮箱类型*/
const EMAIL_TYPE = 4;
// 选择的日期格式
/** 年月日 */
const YEAR_MONTH_TYPE = 1;
/** 年月日时分 */
const HOURS_MINUTE_TYPE = 2;
/**  网址校验*/
const WEB_REG =
  /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/;
/** 邮箱校验 */
const EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/** 数字校验 */
const NUMS = /^\d+$/;
// 提交结果
/** 跳转结果页面  */
const JUMP_RESULT_PAGE = 2;
/** 跳转链接 */
const JUMP_LINK = 3;
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
  CAROUSEL_COMPONENT
} from '@/utils/constant';
export default {
  props: {
    formSetting: {
      type: Object,
      default: () => {}
    },
    form: {
      type: Object,
      default: () => {}
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
      YEAR_MONTH_DATE_TIME,
      YEAR_MONTH_DATE,
      YEAR_MONTH_TYPE,
      HOURS_MINUTE_TYPE,
      JUMP_RESULT_PAGE,
      JUMP_LINK,
      TEXT_LENGTH_TYPE,
      prewievForm: [],
      formSetValue: {},
      showResultPage: false,
      submitText: '',
      submitButtonDisabled: false,
      resultPageOptions: {
        iconUrl: '',
        text: ''
      }
    };
  },
  watch: {
    formSetting: {
      deep: true,
      handler: function() {
        this.submitText = this.formSetValue.submitText;
        this.submitButtonDisabled = false;
      }
    },
    form: {
      deep: true,
      handler: function(val) {
        this.prewievForm = JSON.parse(val.formFieldListJson);
        this.formSetValue = cloneDeep(val);
        this.submitText = this.formSetValue.submitText;
      }
    }
  },
  mounted() {
    if (this.form.isFormDetail) {
      this.prewievForm = JSON.parse(this.form.formFieldListJson);
      this.formSetValue = cloneDeep(this.form);
      this.submitText = this.formSetValue.submitText;
    }
  },
  methods: {
    showTitle(type) {
      return ![TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(type);
    },
    // 是否是图片或者轮播图
    isImageOrCarousel(type) {
      return [IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(type);
    },
    /**
     * @description 选择NPS分数
     * @param 当前的控件
     * @param 当前选择的分数
     */
    chooseNpsScore(item, scoreItem) {
      this.$set(this.prewievForm, findIndex(this.prewievForm, item), {
        ...item,
        answer: scoreItem
      });
    },
    /**
     * @description 校验当前题目设置的条件
     * @param arr 当前题目详情
     * @return 校验失败的题目数组
     */
    checkRule(arr) {
      const balidationFailedArr = [];
      // eslint-disable-next-line complexity
      arr.forEach((item) => {
        if (item.showFlag !== false) {
          switch (item.type) {
            case ONE_LINE_TEXT_COMPONENT:
            case MANY_LINE_TEXT_COMPONENT: {
              const { max, min, required, hasFillIn, answer } = item;
              switch (item.valueLimitType) {
                case NUMS_TYPE: {
                // 数字，没有设置上下限：请填写数字
                // 数字，有设置下限：提示“请填写大于N的数字”
                // 数字，有设置上限：提示“请填写小于N的数字”
                // 数字，设置上下限：提示“请填写大于N1，小于N2的数字”
                  if (required && !hasFillIn && !max && !min || (hasFillIn && !NUMS.test(answer || ''))) {
                    balidationFailedArr.push({
                      message: '请填写数字',
                      id: item.id
                    });
                  }
                  if (
                    (required && !hasFillIn && max && min) ||
                  (hasFillIn && max && min && (answer > +max || answer < +min))
                  ) {
                    balidationFailedArr.push({
                      message: `请填写大于${min}，小于${max}的数字`,
                      id: item.id
                    });
                  }
                  if (
                    (required && !hasFillIn && max && !min) ||
                  (hasFillIn && max && !min && answer > +max)
                  ) {
                    balidationFailedArr.push({
                      message: `请填写小于${max}的数字`,
                      id: item.id
                    });
                  }
                  if (
                    (required && !hasFillIn && min && !max) ||
                  (hasFillIn && min && !max && answer < +min)
                  ) {
                    balidationFailedArr.push({
                      message: `请填写大于${min}的数字`,
                      id: item.id
                    });
                  }
                  break;
                }
                case TEXT_LENGTH_TYPE: {
                // 字数，有设置下限：提示“请填写至少N个字”
                // 字数，有设置上限：超出部分不显示
                  if (required && !hasFillIn) {
                    balidationFailedArr.push({
                      message: `请填写该项`,
                      id: item.id
                    });
                  }
                  if (
                    hasFillIn &&
                  min &&
                  ((item.answer && item.answer.length) || 0) < min
                  ) {
                    balidationFailedArr.push({
                      message: `请填写至少${min}个字`,
                      id: item.id
                    });
                  }
                  break;
                }
                // 网址，若不符合网址格式：提示“请填写正确的网址”
                // 邮箱，若不符合邮箱格式：提示“请填写正确的电子邮箱”
                case WEBSITE_TYPE:
                case EMAIL_TYPE: {
                  const checkRegRule =
                  item.valueLimitType === WEBSITE_TYPE ? WEB_REG : EMAIL;
                  if (
                    (required && !hasFillIn) ||
                  (hasFillIn && !checkRegRule.test(answer || ''))
                  ) {
                    balidationFailedArr.push({
                      message: `请填写${
                        item.valueLimitType === WEBSITE_TYPE
                          ? '正确的网址'
                          : '正确的电子邮箱'
                      }`,
                      id: item.id
                    });
                  }
                  break;
                }
                default:
                  if (item.required && !item.hasFillIn) {
                    balidationFailedArr.push({
                      message: '请填写该项',
                      id: item.id
                    });
                  }
                  break;
              }
              break;
            }
            case CHECKBOX_COMPONENT: {
              const { minSelectNums, selectNums, required, hasFillIn } = item;
              if (required && !hasFillIn) {
                balidationFailedArr.push({
                  message: '请填写该项',
                  id: item.id
                });
              }
              if (hasFillIn && selectNums < minSelectNums) {
                balidationFailedArr.push({
                  message: `最少选择${minSelectNums}项`,
                  id: item.id
                });
              }
              break;
            }
            default: {
            // 设置必填但是没填
              if (item.required && !item.hasFillIn) {
                balidationFailedArr.push({
                  message: '请填写该项',
                  id: item.id
                });
              }
            }
          }
        }
      });
      return balidationFailedArr;
    },
    /**
     * @description 获取评分组件辅助文字
     * @param 评分组件辅助文字数组
     * @param answer 当前选择的星星数量
     */
    getAuxiliaryText(auxiliaryTextOptions = [], answer) {
      const textObj = find(auxiliaryTextOptions, { scoreType: answer });
      return textObj?.text;
    },
    /**
     * @description 获取序号
     */
    getSortIndex(item) {
      // 过滤掉当前不需要显示序号的控件  TEXT_COMPONENT,IMAGE_COMPONENT, CAROUSEL_COMPONENT,
      const newArr = this.prewievForm.filter((item) => ![TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(item.type) && this.isShowComponent(item));
      // +1是因为从0开始的
      return indexOf(newArr, item) + 1;
    },
    /**
     * @description 获取当前题目详情
     * @return {formResult} 根据不同类型的控件的数据转换成后续校验和提交表单的数据
     */
    getTopicInfo() {
      const newArr = this.prewievForm
        .filter(
          (item) =>
            ![TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT].includes(
              item.type
            )
        )
        // eslint-disable-next-line complexity
        .map((con) => {
          const baseInfo = {
            id: con.id,
            type: con.type,
            question: con.title,
            answer: con.answer,
            required: con.required,
            // 是否已经填写该问题
            hasFillIn: Boolean(
              Array.isArray(con.answer) ? con.answer.length : con.answer
            ),
            showFlag: con.showFlag
          };
          switch (con.type) {
            case CHECKBOX_COMPONENT: {
              return {
                ...baseInfo,
                hasFillIn: con.answer.length !== 0,
                maxSelectNums: con.maxSelectNums,
                minSelectNums: con.minSelectNums,
                selectNums: con.answer.length
              };
            }
            case SELECT_COMPONENT: {
              return {
                ...baseInfo,
                hasFillIn: con.answer.length !== 0
              };
            }
            case ONE_LINE_TEXT_COMPONENT:
            case MANY_LINE_TEXT_COMPONENT: {
              return {
                ...baseInfo,
                valueLimitType: con.valueLimitType,
                min: con.min,
                max: con.max
              };
            }
            case SCORE_COMPONENT: {
              return {
                ...baseInfo,
                text: this.getAuxiliaryText(
                  con.auxiliaryTextOptions,
                  con.answer
                )
              };
            }
            case NPS_COMPONENT: {
              return {
                ...baseInfo,
                // 单独处理NPS 因为NPS有个数值是0 转换成布尔值的时候会是false
                hasFillIn: Boolean(con.answer !== undefined)
              };
            }
            default: {
              return baseInfo;
            }
          }
        });
      return newArr;
    },
    /**
     * @description 多选框修改的回调
     * @param argItem 回调值，当前已经选择的项
     * @param item 当前选择的控件
     */
    checkBoxChange(argItem, item) {
      // 根据设置的最多选择选项设置选项是否禁用
      const { maxSelectNums, options } = item;
      // 当前选择的数量大于设置的maxSelectNums值时，在options过滤掉当前选择的选项，其他禁用
      const selectArr = argItem.map((selectItem) => {
        return JSON.parse(selectItem).id;
      });
      options.forEach((item) => {
        item.disabled =
          typeof maxSelectNums === 'number' &&
          argItem.length >= maxSelectNums &&
          selectArr.indexOf(item.id) === -1;
      });
    },
    /**
     * @description 根据当前组件设置的显示条件判断是否显示
     * @param item 当前控件
     * @return 是否需要显示当前控件
     */
    isShowComponent(item) {
      /** 实现方法
       1. 从当前控件拿到设置的显示规则 ruleList
       2. 遍历ruleList 根据ruleList中的questionId找到 设置的对应控件问题
       3. 在遍历ruleList中ruleItem设置的answer列表 将每一个answerItem与 ruleQuestion(当前具体的问题)的答案对比
       4. 将对比的答案返回给 ruleItemAnswer 结束遍历的时候判断ruleItemAnswer中是否全部满足单个规则的所有条件(meetCondition都为true) 是的话canShow为true
       5. 判断 ruleItem 中 canShow 是否有为 true的 有则代表满足单个条件 显示该组件
       */
      const { ruleList = [] } = item;
      if (!ruleList.length) return true;
      ruleList.forEach((ruleItem) => {
        // 根据questionId找到具体的问题
        const ruleQuestion = find(this.prewievForm, {
          id: ruleItem.questionId
        });
        if (ruleQuestion) {
          const ruleItemAnswer = ruleItem.answer.map((ruleAnswerId) => {
            switch (ruleQuestion.type) {
              case CHECKBOX_COMPONENT: {
                const newRuleQuestionAnswer = (ruleQuestion.answer || []).map(
                  (ruleQuestionAnswerItem) => {
                    return ruleQuestionAnswerItem.id;
                  }
                );
                return {
                  ruleAnswerId,
                  meetCondition: newRuleQuestionAnswer.includes(ruleAnswerId)
                };
              }
              case SELECT_COMPONENT: {
                const newRuleQuestionAnswer = (ruleQuestion.answer || []).map(
                  (ruleQuestionAnswerItem) => {
                    return JSON.parse(ruleQuestionAnswerItem).id;
                  }
                );
                return {
                  ruleAnswerId,
                  meetCondition: newRuleQuestionAnswer.includes(ruleAnswerId)
                };
              }
              case RADIO_COMPONENT:
              case NPS_COMPONENT: {
                return {
                  ruleAnswerId,
                  meetCondition: ruleQuestion.answer === ruleAnswerId
                };
              }
            }
          });
          ruleItem.canShow = !ruleItemAnswer.filter(
            (arg) => arg.meetCondition === false
          ).length;
        }
      });
      const showFlag = findIndex(ruleList, (o) => o.canShow) !== -1;
      item.showFlag = showFlag;
      return showFlag;
    },
    submit() {
      const { actionInfoParam, submitActionType } = this.formSetting;
      const checkRuleResultList = this.checkRule(this.getTopicInfo());
      this.prewievForm = this.prewievForm.map((item) => {
        const checkRuleResultItem = find(checkRuleResultList, {
          id: item.id
        });
        return {
          ...item,
          message: checkRuleResultItem?.message
        };
      });
      if (!checkRuleResultList.length) {
        switch (submitActionType) {
          case JUMP_RESULT_PAGE: {
            const { document, iconUrl } = actionInfoParam;
            this.showResultPage = true;
            this.resultPageOptions = {
              text: document,
              iconUrl
            };
            break;
          }
          case JUMP_LINK: {
            const { url } = actionInfoParam;
            // eslint-disable-next-line no-magic-numbers
            if (url.slice(0, 4) !== 'http') {
              window.open(`http://${url}`);
            } else {
              window.open(`${url}`);
            }
            break;
          }
          default:
            this.submitText = '已提交';
            this.submitButtonDisabled = true;
            break;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  .form-preview {
    overflow: auto;
    min-width: 223px;
    height: 95%;
    width: 223px;
    border: 1px solid #eee;
    background-color: #fff;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
  }
  .header-img {
    width: auto;
    height: 84px;
    background-color: #eee;
    .fa-image {
      width: 50px;
      height: 50px;
    }
  }
  .form-name {
    margin-top: 5px;
    height: 40px;
    font-size: 16px;
    color: #101010;
    font-weight: 800;
  }
  .form-description {
    padding:0 10px;
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
  /deep/ .el-form-item:hover  {
    background: none;
  }
  /deep/ .el-form-item {
    padding: 0;
  }
  .form-preview-item {
    background-color: #fff;
    position: relative;
    /deep/ .el-form-item__label {
      line-height: 23px;
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
      height: 30px;
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
  .submit-button {
    background-color: #fff;
    padding: 20px 10px 10px 10px;
    bottom: 10px;
    width: 100%;
    .el-button {
      width: 100%;
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
  .required-info {
    color: red;
    font-size: 12px;
    margin-top: -5px;
  }
  .operate {
    width: 99%;
    padding: 10px;
    background-color: #EEEEEE;
    height: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    span {
      margin-bottom: 10px;
      color:#101010;
      cursor: pointer;
    }
  }
  .result-page {
    height: 95%;
    width: 99%;
    display: flex;
    padding-top: 20%;
    flex-direction: column;
    align-items: center;
    .image-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    background-color: white;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    .result-page-text {
      margin-top: 10px;
    }
  }
</style>
