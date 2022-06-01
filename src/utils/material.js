/*
 * @Description: 素材库公共方法
 * @Author: broccoli
 * @LastEditors: broccoli
 */
/**
 * 若没有获取过素材分组则进行获取
 * @param {*} store
 */
export const getCategoryList = (store) => {
  const categoryInfo = store.state.materialInfo.categoryInfo;
  if (!store.state.materialInfo || (categoryInfo && Object.keys(categoryInfo).length === 0)) {
    store.dispatch('GetCategory');
  }
};

/**
   * 若没有获取过素材标签则进行获取
   * @param {*} store
   */
export const getMaterialTagList = (store) => {
  const allTagObj = store.state.materialInfo.allTagObj;
  if (!store.state.materialInfo || (allTagObj && Object.keys(allTagObj).length === 0)) {
    store.dispatch('GetMaterialTag');
  }
};
