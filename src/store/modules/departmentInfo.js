/*
 * @Description: 部门列表/其他员工全局变量
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import { getDeparmentAndOtherList } from '@/api/organization';
import uniqBy from 'lodash/uniqBy';
const USER_PAGE_LIMIT = '1000';
const departmentInfo = {

  state: {
    // 部门列表
    departmentList: [],
    // 其他员工列表
    otherUserList: [],
    // 其他员工列表总数(用来判断是否需要下一页)
    otherUserListTotal: 0
  },

  mutations: {
    SET_DEPARTMENT_LIST: (state, list) => {
      state.departmentList = list;
    },
    SET_OTHER_LIST: (state, list) => {
      state.otherUserList = uniqBy([...state.otherUserList, ...list], 'userId');
    },
    SET_OTHER_LIST_LENGTH: (state, total) => {
      state.otherUserListTotal = total;
    }
  },

  actions: {
    // 获取部门列表
    GetDepartmentList({ commit, state }, data = {}) {
      return new Promise((resolve, reject) => {
        if (state.departmentList.length || state.otherUserList.length) {
          resolve(state.departmentList);
        } else {
          getDeparmentAndOtherList({
            isActivate: 1,
            pageNum: 1,
            pageSize: USER_PAGE_LIMIT
          }).then(res => {
            try {
              commit('SET_DEPARTMENT_LIST', res?.data?.departmentList || []);
              commit('SET_OTHER_LIST', res?.data?.otherUserList.rows || []);
              commit('SET_OTHER_LIST_LENGTH', res?.data?.otherUserList.total);
              resolve(res?.data?.departmentList);
            } catch (err) {
              throw new Error();
            }
          }).catch(error => {
            reject(error);
          });
        }
      });
    },
    // 获取其他员工列表
    // INFO 在 会话存档和全局检索中使用到了其他员工的列表而不是单一的部门列表 若数据量过大 可能需要为会话存档的列表添加 获取更多员工列表的按钮
    GetOtherUserList({ commit, state }, data = {}) {
      return new Promise((resolve, reject) => {
        getDeparmentAndOtherList(data).then(res => {
          try {
            commit('SET_OTHER_LIST', res?.data?.otherUserList.rows || []);
            resolve(state.otherUserList);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    },
    // 刷新部门列表
    // INFO 添加更新部门的是因为 有些地方会操作到部门删除\编辑的情况
    GetOrUpdateDepartmentList({ commit, state }, data = {}) {
      return new Promise((resolve, reject) => {
        getDeparmentAndOtherList({
          isActivate: 1,
          pageNum: 1,
          pageSize: USER_PAGE_LIMIT
        }).then(res => {
          try {
            commit('SET_DEPARTMENT_LIST', res?.data?.departmentList || []);
            resolve(res?.data?.departmentList);
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

export default departmentInfo;
