/*
 * @Description: 自动标签
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';
// 新客规则
const customerService = window.CONFIG.services.wecom + '/auto/tag/rule/customer';
// 入群规则
const groupService = window.CONFIG.services.wecom + '/auto/tag/rule/group';
// 关键词规则
const keywordService = window.CONFIG.services.wecom + '/auto/tag/rule/keyword';

const service = window.CONFIG.services.wecom + '/auto/tag/rule';
const customerRecord = window.CONFIG.services.wecom + '/auto/tag/hit/record';

/**
 * 获取关键词触发详情
 * @param {*} data
 * @returns
 */
export function getTriggerDetail(data) {
  return request({
    url: customerRecord + '/keyword/detail',
    method: 'post',
    data
  });
}
/**
 * 获取关键词客户记录统计
 * @param {*} id
 * @returns
 */
export function getKeyWordCount(id) {
  return request({
    url: customerRecord + `/keyword/count/${id}`,
    method: 'get'
  });
}

/**
 * 获取群客户记录统计
 * @param {*} id
 * @returns
 */
export function getGroupCount(id) {
  return request({
    url: customerRecord + `/group/count/${id}`,
    method: 'get'
  });
}

/**
 * 获取新客客户记录统计
 * @param {*} id
 * @returns
 */
export function getCustomerCount(id) {
  return request({
    url: customerRecord + `/customer/count/${id}`,
    method: 'get'
  });
}
/**
 * 获取关键词客户记录列表
 * @param {*} data
 * @returns
 */
export function getKeyWordRecordList(data) {
  return request({
    url: customerRecord + '/keyword/list',
    method: 'post',
    data
  });
}

/**
 * 获取入群客户记录列表
 * @param {*} data
 * @returns
 */
export function getGroupRecordList(data) {
  return request({
    url: customerRecord + '/group/list',
    method: 'post',
    data
  });
}

/**
 * 获取新客 客户记录列表
 * @param {*} data
 * @returns
 */
export function getCustomerRecordList(data) {
  return request({
    url: customerRecord + '/customer/list',
    method: 'post',
    data
  });
}
/**
 * 更新规则启用状态
 * @param {*} data
 */
export function updateStatus(data) {
  return request({
    url: service + '/batch/status',
    method: 'post',
    data
  });
}
/**
 * 删除新客规则
 * @param {*} data
 */
export function deleteCustomerRule(data) {
  return request({
    url: customerService + '/remove',
    method: 'delete',
    data
  });
}
/**
 * 删除入群规则
 * @param {*} data
 */
export function deleteGroupRule(data) {
  return request({
    url: groupService + '/remove',
    method: 'delete',
    data
  });
}
/**
 * 删除关键词规则
 * @param {*} data
 */
export function deleteKeyWordRule(data) {
  return request({
    url: keywordService + '/remove',
    method: 'delete',
    data
  });
}
/**
 * 获取新客规则列表
 * @param {*} data
 * @returns
 */
export function getCustomerList(data) {
  return request({
    url: customerService + '/list',
    method: 'post',
    data
  });
}
/**
 * 获取入群规则列表
 * @param {*} data
 * @returns
 */
export function getGroupList(data) {
  return request({
    url: groupService + '/list',
    method: 'post',
    data
  });
}
/**
 * 获取关键词标签规则列表
 * @param {*} data
 * @returns
 */
export function getKeyWordList(data) {
  return request({
    url: keywordService + '/list',
    method: 'post',
    data
  });
}

/**
 * 新客规则新增
 * @param {*} data
 * @returns
 */
export function addNewCustomerRule(data) {
  return request({
    url: customerService + '/add',
    method: 'post',
    data
  });
}

/**
 * 入群规则新增
 */
export function addIntoGroupRule(data) {
  return request({
    url: groupService + '/add',
    method: 'post',
    data
  });
}

/**
 * 关键词规则新增
 * @param {*} data
 * @returns
 */
export function addKeywordRule(data) {
  return request({
    url: keywordService + '/add',
    method: 'post',
    data
  });
}

/**
 * 关键词规则详情
 * @param {*} params
 * @returns
 */
export function getKeywordRuleInfo(params) {
  return request({
    url: keywordService + '/info',
    params
  });
}

/**
 * 入群规则详情
 * @param {*} params
 * @returns
 */
export function getIntoGroupRuleInfo(params) {
  return request({
    url: groupService + '/info',
    params
  });
}

/**
   * 新客规则详情
   * @param {*} params
   * @returns
   */
export function getNewCustomerRuleInfo(params) {
  return request({
    url: customerService + '/info',
    params
  });
}

/**
 * 关键词规则修改
 */
export function updateKeywordRule(data) {
  return request({
    url: keywordService + '/edit',
    method: 'put',
    data
  });
}

/**
 * 入群规则修改
 * @param {*} data
 * @returns
 */
export function updateIntoGroupRule(data) {
  return request({
    url: groupService + '/edit',
    method: 'put',
    data
  });
}

/**
 * 新客规则修改
 * @param {*} data
 * @returns
 */
export function updateNewCustomerRule(data) {
  return request({
    url: customerService + '/edit',
    method: 'put',
    data
  });
}

