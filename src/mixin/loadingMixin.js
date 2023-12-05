/*
 * @Description: 按钮状态mixin
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
export default {
  data() {
    return {
      searchButtonLoading: false,
      resetButtonLoading: false
    };
  },
  methods: {
    modifyButtonStatus() {
      this.searchButtonLoading = false;
      this.resetButtonLoading = false;
    }
  }
};
