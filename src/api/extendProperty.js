/*
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/extendProperty';

/**
 * 获取客户扩展属性列表
 * @param {*} params
 * @returns
 */
export function getExtendPropertyList(params) {
  return request({
    url: service + '/list',
    params
  });
}

/**
 * 保存客户扩展属性
 * @param {*} params
 * @returns
 */
export function addExtendProperty(data) {
  return request({
    url: service + '/add',
    data,
    method: 'POST'
  });
}

/**
 * 编辑客户扩展字段
 * @param {*} data
 * @returns
 */
export function editBatchExtendProperty(data) {
  return request({
    url: service + '/editBatch',
    data,
    method: 'PUT'
  });
}

/**
 * 删除客户扩展属性
 * @param {*} data
 * @returns
 */
export function deleteExtendProperty(id) {
  return request({
    url: service + '/del/' + id,
    method: 'DELETE'
  });
}
