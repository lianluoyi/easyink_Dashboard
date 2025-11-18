/*
 * @Description: 表单推送地址第三方配置接口
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
 */

import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/thirdPartyConfig';

/**
 * 配置表单推送地址
 * @param {*} data
 * @returns
 */
export function editThirdPartyConfig(data) {
  return request({
    url: service + '/edit',
    method: 'post',
    data
  });
}

/**
 * 获取表单推送地址
 * @param {*} data
 * @returns
 */
export function getThirdPartyConfig(data) {
  return request({
    url: service + '/info',
    method: 'get',
    data
  });
}
