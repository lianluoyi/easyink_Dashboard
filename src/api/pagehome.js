/*
 * @Description: 首页数据接口
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import request from '@/utils/request';

/**
 * 获取当前版本
 * @param {*} params
 * @returns
 */
export const getCurrVersion = (params) => {
  return request({
    url: 'wecom/pagehome/getCurrVersion',
    method: 'get',
    params
  });
};
