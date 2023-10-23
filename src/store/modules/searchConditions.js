/*
 * @Description: 各个页面搜索条件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */

const searchConditions = {

  state: {
    // 搜索条件
    searchQuery: {},
    // 是否保存搜索条件
    saveCondition: false,
    // 是否新增的标识
    addFlag: false
  },

  mutations: {
    SET_SEARCH_QUERY: (state, { pageName, query }) => {
      if (pageName) {
        state.searchQuery[pageName] = query;
      } else {
        state.searchQuery = {};
      }
    },
    SET_SAVE_CONDITION: (state, payload) => {
      state.saveCondition = payload;
    },
    SET_ADD_FLAG: (state, payload) => {
      state.addFlag = payload;
    }
  },

  actions: {
  }
};

export default searchConditions;
