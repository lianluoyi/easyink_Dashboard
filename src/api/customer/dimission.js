import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/user';
const serviceV3 = window.CONFIG.services.wecom + '/user/v3';

/**
 * 获取离职已分配员工列表
 * @param {*} params
 * {
pageNum:
pageSize:
beginTime:
endTime:
userName:
}
 */
export function getList(params) {
  return request({
    url: service + '/leaveUserAllocateList',
    params
  });
}

/**
 * 离职已分配客户群
 * @param {*} params
 {
  "pageNum": 0,
  "pageSize": 0,
  "beginTime": "",
  "endTime": "",
  "oldOwner": "" 原群主ID
}
 */
export function getAllocateGroups(params) {
  return request({
    url: service + '/getAllocateGroups',
    params
  });
}

/**
 * 分配离职员工数据
 * @param {*} data
{
    "handoverUserList: list<WeLeaveUser>": "原跟进成员的userid",
    "takeoverUserid": "接替成员的userid"
}
 */
export function allocateUser(data) {
  return request({
    url: '/wecom/resigned/transfer',
    method: 'post',
    data
  });
}

/**
 * 获取离职未分配员工列表
 * @param {*} params
 * {
  pageNum:
  pageSize:
  beginTime:
  endTime:
  userName:
}
 */
export function getNoAllocateList(params) {
  return request({
    url: serviceV3 + '/leaveUserNoAllocateList',
    params: { ...params, isAllocate: 0 }
  });
}

/**
 * 获取离职已分配员工列表
 * @param {*} params
 * {
  pageNum:
  pageSize:
  beginTime:
  endTime:
  userName:
}
 */
export function getAllocateList(params) {
  return request({
    url: serviceV3 + '/leaveUserAllocateList',
    params: { ...params, isAllocate: 1 }
  });
}

/**
 * 离职已分配客户
 * @param {*} params
 */
export function getAllocateCustomersPlus(params) {
  return request({
    url: '/wecom/resigned/transfer/customerRecord',
    params
  });
}

/**
 * 离职已分配客户群
 * @param {*} params
 */
export function getAllocateGroupsPlus(params) {
  return request({
    url: '/wecom/resigned/transfer/groupRecord',
    params
  });
}
