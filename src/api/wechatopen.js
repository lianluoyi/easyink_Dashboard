/*
 * @Description: 获取开放平台配置
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wechatopen;

/**
 * 修改开放平台配置
 * @param {*} data
 * @returns
 */
export function updateConfig(data) {
  return request({
    url: service + '/config',
    method: 'post',
    data
  });
}

/**
 * 获取开放平台配置
 * @param {*} params
 * @returns
 */
export function getConfig(params) {
  return request({
    url: service + '/config',
    params
  });
}
