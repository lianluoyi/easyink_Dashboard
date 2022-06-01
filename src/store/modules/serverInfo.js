/*
 * @Description: 系统类型
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import { getServerType } from '@/api/login';
import { generationApplication } from '@/api/enterpriseId';

const serverInfo = {
  state: {
    serverType: '',
    dkCorp: false
  },

  mutations: {
    SET_SERVER_TYPE: (state, serverType) => {
      state.serverType = serverType;
    },
    SET_DK_CORP: (state, dkCorp) => {
      state.dkCorp = dkCorp;
    }
  },

  actions: {
    // 获取系统类型
    GetServerType({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        getServerType().then(res => {
          try {
            commit('SET_SERVER_TYPE', res.data.serverType);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    },
    // 设置系统类型
    SetServerType({ commit, state }, payload) {
      commit('SET_SERVER_TYPE', payload);
    },
    // 获取是否为代开发应用
    SET_DK_CORP({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        generationApplication().then(res => {
          try {
            commit('SET_DK_CORP', res.data.dkCorp);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    }
  }
};

export default serverInfo;
