/*
 * @Description: 请求按钮的状态控制
 * @Author: wJiaaa
 * @LastEditors: xulinbin
 */
const state = {
  // 用来存放不同按钮的状态值
};

const mutations = {
  // 修改按钮的状态
  CHANGE_BUTTONLOADING: (_state, { key, value }) => {
    _state[key] = value;
  }
};

export default {
  namespaced: true,
  state,
  mutations
};

