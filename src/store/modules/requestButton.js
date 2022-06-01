/*
 * @Description: 请求按钮的状态控制
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
const state = {
  // 用来存放不同按钮的状态值
};

const mutations = {
  // 修改按钮的状态
  CHANGE_BUTTONLOADING: (state, { key, value }) => {
    state[key] = value;
  }
};

export default {
  namespaced: true,
  state,
  mutations
};

