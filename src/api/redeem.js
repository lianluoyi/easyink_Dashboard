/*
 * @Description: 兑换码接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/redeem';
const serviceCode = window.CONFIG.services.wecom + '/redeemcode';
/**
 * 新增兑换码活动
 * @param {*} data
 * @returns
 */
export function addConversionCodeActive(data) {
  return request({
    url: service + '/add',
    method: 'post',
    data
  });
}
/**
 * 获取兑换码活动列表
 * @param {*} params
 * @returns
 */
export function getConversionCodeActiveList(params) {
  return request({
    url: service + '/list',
    method: 'get',
    params
  });
}
/**
 * 获取兑换码活动详情
 * @param {*} params
 * @returns
 */
export function getConversionCodeActiveDetail(params) {
  return request({
    url: service + '/get',
    method: 'get',
    params
  });
}
/**
 * 删除兑换码活动
 * @param {*} data []
 */
export function deleteConversionCodeActive(data) {
  return request({
    url: service + '/remove',
    method: 'delete',
    data
  });
}
/**
 * 编辑修改兑换码活动
 * @param {*} data
 * @returns
 */
export function updateConversionCodeActive(data) {
  return request({
    url: service + '/update',
    method: 'put',
    data
  });
}
/**
 * 新增兑换码
 * @param {*} data
 * @returns
 */
export function addConversionCode(data) {
  return request({
    url: serviceCode + '/add',
    method: 'post',
    data
  });
}
/**
 * 获取兑换码列表
 * @param {*} params
 * @returns
 */
export function getConversionCodeList(params) {
  return request({
    url: serviceCode + '/list',
    method: 'get',
    params
  });
}
/**
 * 删除兑换码
 * @param {*} data []
 */
export function deleteConversionCode(data) {
  return request({
    url: serviceCode + '/remove',
    method: 'delete',
    data
  });
}
/**
 * 编辑修改兑换码
 * @param {*} data
 * @returns
 */
export function updateConversionCode(data) {
  return request({
    url: serviceCode + '/update',
    method: 'put',
    data
  });
}
/**
 * 导入兑换码
 * @param {*} id
 * @returns
 */
export function importRedeemCode(id, data) {
  return request({
    url: serviceCode + '/importRedeemCode/' + id,
    method: 'post',
    data
  });
}
/**
 * 兑换码领取人
 * @param {*} params
 * @returns
 */
export function codeReceivePeople(params) {
  return request({
    url: serviceCode + '/customerList',
    method: 'get',
    params
  });
}
