/*
 * @Description: 获取开放平台配置
 * @Author: broccoli
 * @LastEditors: xulinbin
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

/**
 * 获取微信三方平台授权页url
 * @param {*} params
 * @returns
 */
export function getWechatOpenAuthUrl(params) {
  return request({
    url: service + '/getWechatOpen3rdAuthUrl',
    params
  });
}

/**
 * 获取公众号域名接口
 * @param {*} params
 * @returns
 */
export function getWechatOpenDomain(params) {
  return request({
    url: service + '/getDomain',
    params
  });
}
