/*
 * @Description: 话术库接口
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/wordscategory';

/**
 * 获取话术库分组列表
 * @param {*} params
 * @returns
 */
export function getWordScategoryList(params) {
  return request({
    url: service + '/list',
    params
  });
}

/**
 * 删除话术库分组
 * @param {*} ids
 * @returns
 */
export function removeGroup(params) {
  return request({
    url: service + '/delete',
    method: 'DELETE',
    data: params
  });
}

/**
 * 添加话术库分组
 * @param {*} params
 * @returns
 */
export function addGroup(params) {
  return request({
    url: service + '/add',
    method: 'post',
    data: params
  });
}

/**
 * 更新话术分组
 * @param {*} params
 * @returns
 */
export function updateGroup(params) {
  return request({
    url: service + '/update',
    method: 'put',
    data: params
  });
}

/**
 * 更改分组顺序
 * @param {*} params
 * @returns
 */
export function changeGroupSort(params) {
  return request({
    url: service + '/changeSort',
    method: 'put',
    data: params
  });
}
