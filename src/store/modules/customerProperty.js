/*
 * @Description: 客户自定义字段列表全局变量
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import { getExtendPropertyList } from '@/api/extendProperty';

const customerPropertyList = {

  state: {
    // 客户自定义字段列表
    customerProperList: [],
    customPropertyObj: {}
  },

  mutations: {
    SET_PROPERTY_LIST: (state, list) => {
      state.customerProperList = list;
    },
    SET_PROPERTY_OBJ: (state, object) => {
      state.customPropertyObj = object;
    }
  },

  actions: {
    // 获取客户自定义字段列表
    GetCustomerProperty({ commit, state }, data = {}) {
      return new Promise((resolve, reject) => {
        getExtendPropertyList(data).then(res => {
          try {
            let resData = [...res.data];
            resData = resData.filter(item => !!item.status);
            commit('SET_PROPERTY_LIST', resData);
            const list = resData || [];
            const obj = {};
            list.map(item => {
              obj[item.id] = item;
            });
            commit('SET_PROPERTY_OBJ', obj);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    },

    // 更新客户自定义字段
    UpdateCustomerProperty({ commit, state }, row) {
      const newList = [...state.customerProperList];

      const editIndex = newList.findIndex(e => e.id === row.id);
      const delNum = editIndex !== -1 ? 1 : 0;
      const targetIndex = editIndex !== -1
        ? editIndex
        : newList.findIndex(e => row.propertySort < e.propertySort);
      newList.splice(targetIndex, delNum, row);

      commit('SET_PROPERTY_LIST', newList);
    }
  }
};

export default customerPropertyList;
