/*
 * @Description: 雷达库接口
 * @Author: wJiaaa
 * @LastEditors: xulinbin
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/radar';
/**
 * 新增雷达
 * @param {*} data
 * @returns
 */
export function addRadar(data) {
  return request({
    url: service + '/add',
    method: 'post',
    data
  });
}
/**
 * 获取雷达列表
 * @param {*} params
 * @returns
 */
export function getRadaList(params) {
  return request({
    url: service + '/list',
    method: 'get',
    params
  });
}
/**
 * 删除雷达
 * @param {*} data []
 */
export function deleteRadar(data) {
  return request({
    url: service + '/remove',
    method: 'delete',
    data
  });
}
/**
 * 获取雷达详情
 * @param {*} params
 * @returns
 */
export function getRadaDetail(params) {
  return request({
    url: service + '/get',
    method: 'get',
    params
  });
}
/**
 * 编辑修改雷达
 * @param {*} data
 * @returns
 */
export function updateRadar(data) {
  return request({
    url: service + '/update',
    method: 'put',
    data
  });
}
/**
 * 获取雷达详情的数据总览
 * @param {*} params
 * @returns
 */
export function getRadarDetailOverview(params) {
  return request({
    url: service + '/record/getTotal',
    method: 'get',
    params
  });
}
/**
 * 获取雷达渠道列表
 * @param {*} params
 * @returns
 */
export function getRadarChannelList(params) {
  return request({
    url: service + '/channel/list',
    method: 'get',
    params
  });
}
/**
 * 新增自定义渠道
 * @param {*} data
 * @returns
 */
export function addCustomChannel(data) {
  return request({
    url: service + '/channel/add',
    method: 'post',
    data
  });
}
/**
 * 删除自定义渠道
 * @param {*} data
 */
export function deleteCustomChannel(data) {
  return request({
    url: service + '/channel/remove',
    method: 'delete',
    data
  });
}
/**
 * 编辑修改渠道
 * @param {*} data
 * @returns
 */
export function updateChannel(data) {
  return request({
    url: service + '/channel/update',
    method: 'put',
    data
  });
}
/**
 * 时间段内雷达点击数据统计(折线图)
 * @param {*} params
 * @returns
 */
export function getTimeRangeAnalyseCount(params) {
  return request({
    url: service + '/record/getTimeRangeAnalyseCount',
    method: 'get',
    params
  });
}
/**
 * 渠道点击人数排行
 * @param {*} params
 * @returns
 */
export function getChannelSort(params) {
  return request({
    url: service + '/record/getChannelSort',
    method: 'get',
    params
  });
}
/**
 * 获取客户点击记录
 * @param {*} params
 * @returns
 */
export function getCustomerClickRecord(params) {
  return request({
    url: service + '/record/getCustomerClickRecord',
    method: 'get',
    params
  });
}
/**
 * 获取渠道点击记录
 * @param {*} params
 * @returns
 */
export function getChannelClickRecord(params) {
  return request({
    url: service + '/record/getChannelClickRecord',
    method: 'get',
    params
  });
}
/**
 * 获取渠道点击记录详情
 * @param {*} params
 * @returns
 */
export function getChannelClickRecordDetail(params) {
  return request({
    url: service + '/record/getChannelClickRecordDetail',
    method: 'get',
    params
  });
}
/**
 * 获取渠道点击记录详情
 * @param {*} params
 * @returns
 */
export function getCustomerClickRecordDetail(params) {
  return request({
    url: service + '/record/getCustomerClickRecordDetail',
    method: 'get',
    params
  });
}

/**
 * 获取雷达公众号配置
 * @param {*} params
 * @returns
 */
export function getRadarConfig(params) {
  return request({
    url: service + '/config',
    method: 'get',
    params
  });
}

/**
 * 设置雷达公众号配置
 * @param {*} data
 * @returns
 */
export function setRadarConfig(data) {
  return request({
    url: service + '/config',
    method: 'post',
    data
  });
}
