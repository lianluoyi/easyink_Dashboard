/*
 * @Description: 企微配置
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */
import { getNowConfig } from '@/api/enterpriseId';
import Vue from 'vue';
const enterPriseWechatConfig = {
  // 通讯录secret: contactSecret
  // 客户联系Secret: customSecret
  // 会话存档Secret: chatSecret
  state: {
    // 公司名
    companyName: ''
  },

  mutations: {
    SET_CONFIG: (state, newConfig) => {
      for (const key in newConfig) {
        Vue.set(state, key, newConfig[key]);
      }
    }
  },

  actions: {
    // 获取企微配置（调用接口获取）
    GetConfig({ commit, state }) {
      return new Promise((resolve, reject) => {
        getNowConfig(state.token).then(res => {
          try {
            commit('SET_CONFIG', res.data);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    },
    // 更新企微配置
    UpdateConfig({ commit, state }, payload) {
      commit('SET_CONFIG', payload);
    }
  }
};

export default enterPriseWechatConfig;
