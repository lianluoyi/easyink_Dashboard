/*
 * @Description: 密钥
 * @Author: xulinbin
 * @LastEditors: xulinbin
 */
import { getPublicKey } from '@/api/publicKey';

const secretKey = {
  state: {
    RSAPublicKey: ''
  },

  mutations: {
    SET_PUBLIC_KEY: (state, RSAPublicKey) => {
      state.RSAPublicKey = RSAPublicKey;
    }
  },

  actions: {
    // 获取RSA所需公钥
    GetPublicKey({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        getPublicKey().then(res => {
          try {
            commit('SET_PUBLIC_KEY', res.data);
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

export default secretKey;
