/*
 * @Description: api配置
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';

const service = window.CONFIG.services.wecom + '/openapi';

/**
 * 生成开发账号
 * @returns
 */
export function create() {
  return request({
    url: service + '/appInfo/create',
    method: 'post'
  });
}

/**
 * 获取开发账号
 * @returns
 */
export function get() {
  return request({
    url: service + '/appInfo/get',
    method: 'get'
  });
}

/**
 * 刷新开发账号
 * @returns
 */
export function refreshSecret() {
  return request({
    url: service + '/appInfo/refreshSecret',
    method: 'post'
  });
}
/**
 * 获取消息订阅的回调地址
 * @returns
 */
export function list() {
  return request({
    url: service + '/callback/list',
    method: 'get'
  });
}
/**
 * 新增消息订阅的回调地址
 * @returns
 */
export function add(data) {
  return request({
    url: service + '/callback',
    method: 'POST',
    data
  });
}
/**
 * 删除消息订阅的回调地址
 * @returns
 */
export function del(data) {
  return request({
    url: service + '/callback/' + data,
    method: 'DELETE'
  });
}
/**
 * 编辑消息订阅的回调地址
 * @returns
 */
export function edit(data) {
  return request({
    url: service + '/callback',
    method: 'PUT',
    data
  });
}
