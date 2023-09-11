import { login, logout, getInfo, qrCodeLogin, qrCodeLogin3rd } from '@/api/login';
import { getToken, setToken, removeToken } from '@/utils/auth';
import { getUserProfile } from '@/api/system/user';
import { GET_INFO_ERROR } from '@/utils/constant/index';
import { RSAECBEncrypt } from '@/utils/jsencrypt';
const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions;
    },
    SET_ISSUPERADMIN: (state, isSuperAdmin) => {
      state.isSuperAdmin = isSuperAdmin;
    },
    SET_USERID: (state, userId) => {
      state.userId = userId;
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      if (userInfo.type === 'qrcode') {
        const code = userInfo.code;
        const state = userInfo.state;
        return new Promise((resolve, reject) => {
          qrCodeLogin({ code, state }).then(res => {
            setToken(res.data.token);
            commit('SET_TOKEN', res.data.token);
            resolve();
          }).catch(error => {
            reject(error);
          });
        });
      } else if (userInfo.type === 'third') {
        const authCode = userInfo.authCode;
        return new Promise((resolve, reject) => {
          qrCodeLogin3rd({ authCode }).then(res => {
            setToken(res.data.token);
            commit('SET_TOKEN', res.data.token);
            resolve();
          }).catch(error => {
            reject(error);
          });
        });
      } else {
        const username = userInfo.username.trim();
        const password = RSAECBEncrypt(userInfo.password, userInfo.publicKey);
        const code = userInfo.code;
        const uuid = userInfo.uuid;
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid).then(res => {
            setToken(res.data.token);
            commit('SET_TOKEN', res.data.token);
            resolve();
          }).catch(error => {
            reject(error);
          });
        });
      }
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then(res => {
          try {
            const resUser = res.data;
            const avatar = resUser.avatar;
            if (resUser.roles && resUser.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              commit('SET_ROLES', resUser.roles);
              commit('SET_PERMISSIONS', resUser.permissions);
            } else {
              commit('SET_ROLES', ['ROLE_DEFAULT']);
            }
            commit('SET_NAME', resUser.userName);
            commit('SET_AVATAR', avatar);
            commit('SET_ISSUPERADMIN', resUser.isSuperAdmin);
            commit('SET_USERID', resUser.userId);
            resolve(res);
            if (resUser.isSuperAdmin) {
              getUserProfile().then(response => {
                commit('SET_NAME', response.data.nickName || response.data.userName);
              });
            }
          } catch (err) {
            throw new Error(GET_INFO_ERROR);
          }
        }).catch(error => {
          reject(error);
        });
      });
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '');
          commit('SET_ROLES', []);
          commit('SET_PERMISSIONS', []);
          removeToken();
          resolve();
        }).catch(error => {
          reject(error);
        });
      });
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '');
        removeToken();
        resolve();
      });
    }
  }
};

export default user;
