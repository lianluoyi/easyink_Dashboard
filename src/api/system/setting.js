/*
 * @Description: 系统设置
 * @Author: chenchengjie
 * @LastEditors: chenchengji
 */
import request from '@/utils/request';

/**
 * 获取系统设置
 * @param {*} params
 * @returns
 */
export const getSetting = (params) => {
  return request({
    url: '/wecom/setting/get',
    method: 'get',
    params
  });
};
