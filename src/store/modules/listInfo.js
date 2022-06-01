/*
 * @Description: 员工列表与标签列表，用于新增群发页面渲染
 * @Author: turing5467
 * @LastEditors: turing5467
 */
import * as api from '@/api/organization';
import { getGroupTagList } from '@/api/customer/grouptag';
import { getList } from '@/api/customer/tag';
const USER_PAGE_LIMIT = '999';
const listInfo = {
  namespaced: true,
  state: {
    // 客户子标签列表
    tagList: [],
    // 员工列表
    userList: [],
    // 群标签列表
    groupTagList: []
  },

  mutations: {
    SET_TAG_LIST: (state, groupList) => {
      let tagList = [];
      groupList.map(item => {
        tagList = tagList.concat(item.weTags);
      });
      state.tagList = tagList;
    },
    SET_USER_LIST: (state, userList) => {
      state.userList = userList;
    },
    SET_GROUP_TAG_LIST: (state, groupTagList) => {
      state.groupTagList = groupTagList;
    }
  },

  actions: {
    setTagList({ commit }, { list }) {
      commit('SET_TAG_LIST', list);
    },
    setUserList({ commit }, { list }) {
      commit('SET_USER_LIST', list);
    },
    getTagList({ commit }) {
      return new Promise((resolve, reject) => {
        getList().then((res) => {
          try {
            const list = res.rows;
            commit('SET_TAG_LIST', list);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    },
    getUserList({ commit }) {
      api.getTree({
        isActivate: 1
      }).then(({ data }) => {
        const departmentIds = data.filter(ele => ele.enable).map(ele => ele.id).join(',');
        const querys = {
          pageNum: '1',
          pageSize: USER_PAGE_LIMIT,
          departmentStr: departmentIds,
          isActivate: 1
        };
        api.getList(querys).then(({ rows }) => {
          commit('SET_USER_LIST', rows);
        });
      });
    },
    getGroupTagList({ commit }) {
      return new Promise((resolve, reject) => {
        getGroupTagList().then((res) => {
          try {
            const list = res.data.map(tag => ({ ...tag, groupName: tag.name, groupId: tag.id, weTags: tag.tagList.map(tag => ({ ...tag, tagId: tag.id })) }));
            commit('SET_GROUP_TAG_LIST', list);
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

export default listInfo;
