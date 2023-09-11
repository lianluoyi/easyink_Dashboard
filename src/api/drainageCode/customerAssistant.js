/*
 * @Description: 获客助手相关接口
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */

import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/customerAssistant';
const channelService = service + '/channel';

/**
 * 新增获客链接
 * @param {*} data
 * @returns
 */
export function add(data) {
  return request({
    url: service + '/add',
    method: 'post',
    data
  });
}

/**
 * 修改获客链接
 * @param {*} data
 * @returns
 */
export function update(data) {
  return request({
    url: service + '/edit',
    method: 'put',
    data
  });
}

/**
 * 删除/批量删除获客链接
 * @param {*} id
 * @returns
 */
export function remove(id) {
  return request({
    url: service + '/delete/' + id,
    method: 'delete'
  });
}

/**
 * 查询获客链接列表
 * @param {*} params
 * @returns
 */
export function getList(params) {
  return request({
    url: service + '/list',
    params
  });
}

/**
 * 获取获客链接详细信息
 * @param {*} params
 * @returns
 */
export function getDetail(id) {
  return request({
    url: `${service}/${id}`
  });
}

/**
 * 获客链接告警设置查询
 * @param {*} params
 * @returns
 */
export function getWarnConfig(params) {
  return request({
    url: service + '/warnConfig',
    params
  });
}

/**
 * 获客链接告警设置
 * @param {*} data
 * @returns
 */
export function setWarnConfig(data) {
  return request({
    url: service + '/warnConfig',
    method: 'post',
    data
  });
}

/**
 * 获客情况查询
 * @param {*} params
 * @returns
 */
export function getSituation(params) {
  return request({
    url: service + '/situation',
    params
  });
}

/**
 * 同步获客情况
 * @param {*} params
 * @returns
 */
export function syncSituation() {
  return request({
    url: service + '/situation/sync'
  });
}

/**
 * 获客链接详情-数据总览
 * @param {*} empleCodeId
 * @returns
 */
export function getDetailDataStatistics(empleCodeId) {
  return request({
    url: service + '/detail/total/' + empleCodeId
  });
}

/**
 * 获客链接详情-趋势图查询
 * @param {*} params
 * @returns
 */
export function getNewAndLossCustomerCnt(params) {
  return request({
    url: service + '/detail/getNewAndLossCustomerCnt',
    params
  });
}

/**
 * 获客链接详情-渠道新增客户数排行查询
 * @param {*} params
 * @returns
 */
export function getRangeByChannel(params) {
  return request({
    url: service + '/detail/channel/range',
    params
  });
}

/**
 * 获客链接详情-数据统计-客户维度
 * @param {*} params
 * @returns
 */
export function statisticByCustomer(params) {
  return request({
    url: service + '/detail/statistic/customer',
    params
  });
}

/**
 * 获客链接详情-数据统计-渠道维度
 * @param {*} params
 * @returns
 */
export function statisticByChannel(params) {
  return request({
    url: service + '/detail/statistic/channel',
    params
  });
}

/**
 * 获客链接详情-数据统计-日期维度
 * @param {*} params
 * @returns
 */
export function statisticByDate(params) {
  return request({
    url: service + '/detail/statistic/date',
    params
  });
}

/**
 * 导出获客链接详情-数据统计-客户维度
 * @param {*} params
 * @returns
 */
export function exportStatisticByCustomer(params) {
  return request({
    url: service + '/export/detail/statistic/customer',
    params
  });
}

/**
 * 导出获客链接详情-数据统计-渠道维度
 * @param {*} params
 * @returns
 */
export function exportStatisticByChannel(params) {
  return request({
    url: service + '/export/detail/statistic/channel',
    params
  });
}

/**
 * 导出获客链接详情-数据统计-日期维度
 * @param {*} params
 * @returns
 */
export function exportStatisticByDate(params) {
  return request({
    url: service + '/export/detail/statistic/date',
    params
  });
}

/**
 * 新增自定义渠道
 * @param {*} data
 * @returns
 */
export function addChannel(data) {
  return request({
    url: channelService + '/add',
    method: 'post',
    data
  });
}

/**
 * 编辑自定义渠道
 * @param {*} data
 * @returns
 */
export function updateChannel(data) {
  return request({
    url: channelService + '/edit',
    method: 'put',
    data
  });
}

/**
 * 删除自定义渠道
 * @param {*} id
 * @returns
 */
export function removeChannel(id) {
  return request({
    url: channelService + '/delete/' + id,
    method: 'delete'
  });
}

/**
 * 查询自定义渠道列表
 * @param {*} params
 * @returns
 */
export function getChannelList(params) {
  return request({
    url: channelService + '/list',
    params
  });
}
