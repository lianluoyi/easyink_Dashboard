import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/application';

/**
 * 我的应用列表
 * @param {*} params
 */
export function getMyApplicationList() {
  return request({
    url: service + '/getMyApplicationList'
  });
}
/**
 * 应用中心列表
 * @returns
 */
export function getApplicationList(params) {
  return request({
    url: service + '/getApplicationList',
    params
  });
}

/**
 * 获取应用中心应用详情
 */
export function getApplicationDetail(params) {
  return request({
    url: service + '/getApplicationDetail',
    params
  });
}
/**
 * 移除我的应用
 *
 */
export function deleteMyApplication(data) {
  return request({
    url: service + '/deleteMyApplication',
    method: 'POST',
    data
  });
}
/**
 * 安装应用
 */
export function installApplication(data) {
  return request({
    url: service + '/installApplication',
    method: 'POST',
    data
  });
}
/**
 * 更新我的应用配置
 */
export function updateMyApplicationConfig(data) {
  return request({
    url: service + '/updateMyApplicationConfig',
    method: 'POST',
    data
  });
}
/**
 * 检测Url
 */
export function checkUrl(url, params) {
  return request({
    url: url + '/common/randomCaptcha?r=' + Date.now(),
    method: 'get',
    params
  });
}

/**
 * 我的应用使用范围
 * @param {*} data
 * @returns
 */
export function setMyApplicationUseScope(data) {
  return request({
    url: service + '/setMyApplicationUseScope',
    method: 'POST',
    data
  });
}
