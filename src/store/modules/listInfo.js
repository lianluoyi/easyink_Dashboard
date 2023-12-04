/*
 * @Description: 员工列表与标签列表，用于新增群发页面渲染
 * @Author: turing5467
 * @LastEditors: wJiaaa
 */
import { getGroupTagList } from '@/api/customer/grouptag';
import { getList } from '@/api/customer/tag';
import remove from 'lodash/remove';
const listInfo = {
  namespaced: true,
  state: {
    // 客户标签列表
    tagList: [],
    // 员工列表
    userList: [],
    // 群标签列表
    groupTagList: []
  },

  mutations: {
    SET_TAG_LIST: (state, list) => {
      state.tagList = list;
    },
    SET_GROUP_TAG_LIST: (state, groupTagList) => {
      state.groupTagList = groupTagList;
    },
    UPDATE_TAG_LIST: (state, payload) => {
      const index = state.tagList.findIndex(element => element.groupId === payload.groupId);
      if (index !== -1) {
        state.tagList.splice(index, 1, payload);
      } else {
        state.tagList.unshift(payload);
      }
    },
    UPDATE_GROUP_TAG_LIST: (state, payload) => {
      const index = state.groupTagList.findIndex(element => element.groupId === payload.groupId);
      if (index !== -1) {
        state.groupTagList.splice(index, 1, payload);
      } else {
        state.groupTagList.unshift(payload);
      }
    },
    DEL_CUSTOMER_TAG: (state, payload) => {
      remove(state.tagList, n => payload.includes(n.groupId));
    },
    DEL_GROUP_TAG: (state, payload) => {
      remove(state.groupTagList, n => payload.includes(n.id || n.groupId));
    }
  },

  actions: {
    delCustomerTag({ commit, state }, payload) {
      if (!state.tagList.length) {
        this.dispatch('listInfo/getTagList');
      } else {
        commit('DEL_CUSTOMER_TAG', payload);
      }
    },
    delGroupTag({ commit, state }, payload) {
      if (!state.groupTagList.length) {
        this.dispatch('listInfo/getGroupTagList');
      } else {
        commit('DEL_GROUP_TAG', payload);
      }
    },
    getTagList({ commit, state }) {
      if (state.tagList.length) {
        return { rows: state.tagList };
      }
      return new Promise((resolve, reject) => {
        getList().then((res) => {
          try {
            const list = res.rows;
            commit('SET_TAG_LIST', list || []);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    },
    getGroupTagList({ commit, state }) {
      if (state.groupTagList.length) {
        return { data: state.groupTagList };
      }
      return new Promise((resolve, reject) => {
        getGroupTagList().then((res) => {
          try {
            const list = res.data?.map(tag => ({ ...tag, groupName: tag.name, groupId: tag.id, weTags: tag.tagList.map(item => ({ ...item, tagId: item.id })) }));
            commit('SET_GROUP_TAG_LIST', list || []);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    },
    updateTagListById({ commit, state }, payload) {
      if (!state.tagList.length) {
        this.dispatch('listInfo/getTagList');
      } else {
        commit('UPDATE_TAG_LIST', payload);
      }
    },
    updateGroupTagListById({ commit, state }, payload) {
      if (!state.groupTagList.length) {
        this.dispatch('listInfo/getGroupTagList');
      } else {
        commit('UPDATE_GROUP_TAG_LIST', payload);
      }
    }
  }
};

export default listInfo;
