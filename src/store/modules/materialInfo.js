/*
 * @Description: 素材库相关全局变量
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import { getCategoryList, getMaterialTagList } from '@/api/material';

const materialInfo = {

  state: {
    // 类目详情
    categoryInfo: {},
    // 所有素材标签，以素材id为key
    allTagObj: {}
  },

  mutations: {
    SET_CATEGORY: (state, categoryList) => {
      const categoryObj = {};
      categoryList.map(item => {
        categoryObj[item.mediaType] = item;
      });
      state.categoryInfo = categoryObj;
    },
    SET_MATERIAL_TAG: (state, tagList) => {
      const tagObj = {};
      tagList.map(item => {
        tagObj[item.id] = item;
      });
      state.allTagObj = tagObj;
    }
  },

  actions: {
    // 获取素材类目
    GetCategory({ commit, state }) {
      return new Promise((resolve, reject) => {
        getCategoryList().then(res => {
          try {
            commit('SET_CATEGORY', res.data);
            resolve(res);
          } catch (err) {
            throw new Error();
          }
        }).catch(error => {
          reject(error);
        });
      });
    },
    // 获取所有素材标签列表
    GetMaterialTag({ commit, state }) {
      return new Promise((resolve, reject) => {
        getMaterialTagList({}).then(res => {
          try {
            commit('SET_MATERIAL_TAG', res.data);
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

export default materialInfo;
