import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/communityPresTagGroupV2';

/**
 * 获取老客老客进群列表
 * @param {*} params
 *
 */
export function getList(params) {
  return request({
    url: service + '/list',
    method: 'get',
    params
  });
}

/**
 * 获取老客老客进群详情
 * @param {*} params
 * id: 老客老客进群任务ID
 */
export function getDetail(id) {
  return request({
    url: service + '/' + id,
    method: 'get'
  });
}

/**
 * 新增老客老客进群
 * @param {Object} data
{
  "taskName": "string",
  "welcomeMsg": "string",
  "sendType": 0,
  "groupCodeId": "string",
  "weOldGroupTagList": [],
  "weOldGroupUseScopeList": [],
  "sendScope": 0,
  "sendGender": 0,
  "cusBeginTime": "string",
  "cusEndTime": "string",
}
 */
export function add(data) {
  return request({
    url: service + '/',
    method: 'post',
    data
  });
}

/**
   * 修改老客老客进群
   * @param {*} data
{
  "taskName": "string",
  "welcomeMsg": "string",
  "sendType": 0,
  "groupCodeId": "string",
  "weOldGroupTagList": [],
  "weOldGroupUseScopeList": [],
  "sendScope": 0,
  "sendGender": 0,
  "cusBeginTime": "string",
  "cusEndTime": "string",
}
   */
export function update(id, data) {
  return request({
    url: service + '/' + id,
    method: 'put',
    data
  });
}

/**
 * 删除老客老客进群
 * @param {*} ids
 */
export function remove(ids) {
  return request({
    url: service + '/' + ids,
    method: 'DELETE'
  });
}

/**
 * 客户统计
 * @param {*} params
 * id: 老客老客进群任务ID
 */
export function getStat(id, params = {}) {
  return request({
    url: service + '/stat/' + id,
    method: 'get',
    params
  });
}
/**
 * 获取预计发送数据
 * @param {*} data
 * @returns
 */
export function getExpectedReceptionData(data) {
  return request({
    url: service + '/getExpectedReceptionData',
    method: 'post',
    data
  });
}
