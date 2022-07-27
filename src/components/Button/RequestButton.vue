<!--
 * @Description: 按钮添加 加载状态和防抖功能
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <el-button
    v-preventReClick="preventTime"
    :loading="loading"
    v-bind="$attrs"
    v-on="$listeners"
    @click="handleClick"
  >
    <!-- @slot 这里为传入的按钮名称 -->
    <slot />
  </el-button>
</template>

<script>
/**
 * 按钮 加载状态和防抖
 * @displayName RequestButton(添加加载和防抖 请确保一个页面中没有相同类型地按钮 如下)
 * 使用示例： <RequestButton type="primary" :request-method="editForm" button-type="edit">编辑</RequestButton>
 *           <RequestButton type="primary" :request-method="saveForm" button-type="save">保存</RequestButton>
 */
// 默认按钮防抖时间
const PREVENT_CLICK_TIME = 1000;
export default {
  name: 'RequestButton',
  props: {
    /**
     * 点击按钮触发的父组件方法名
     */
    requestMethod: {
      type: Function,
      default: null
    },
    /**
     *  按钮防抖的时间，默认为1s
     */
    preventTime: {
      type: Number,
      default: PREVENT_CLICK_TIME
    },
    /**
     *  按钮类型,默认为submit,请确保一个页面中没有相同类型地按钮
     */
    buttonType: {
      type: String,
      default: 'submit'
    }
  },
  data() {
    return {};
  },
  computed: {
    loading() {
      return this.$store.state.requestButton[this.buttonType];
    }
  },
  created() {
    // 因为要做到响应式，所以需要用$set来添加属性，否则只有state中初始化地数据才具有响应式
    this.$set(this.$store.state.requestButton, this.buttonType, false);
  },
  methods: {
    /**
     * @description: 子组件触发的点击事件
     *   按钮的状态
     */
    handleClick() {
      // 点击确定的时候会有路由跳转，要设置是否改变（change）为 false 才能跳转的时候不显示弹窗
      window.sessionStorage.setItem('change', false);
      // 点击按钮后 将按钮的加载状态设置为true key值为传入的按钮类型
      this.$store.commit('requestButton/CHANGE_BUTTONLOADING', {
        key: this.buttonType,
        value: true
      });
      // 执行父组件的函数
      this.requestMethod();
    }
  }
};
</script>
