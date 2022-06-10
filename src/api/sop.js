/*
 * @Description: sop相关接口
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/sop';

/**
 * 添加sop
 * @param {*} data
 * @returns
 */
export function addSop(data) {
  return request({
    url: service,
    method: 'post',
    data
  });
}

/**
 * 修改SOP
 * @param {*} data
 * @returns
 */
export function updateSop(data) {
  return request({
    url: service + '/update',
    method: 'put',
    data
  });
}

/**
 * 查询SOP列表
 * @param {*} params
 * @returns
 */
export const getSopList = (params) => {
  return request({
    url: service + '/list',
    method: 'get',
    params
  });
};

/**
 * SOP批量开关
 * @param {*} data
 * @returns
 */
export function batchSwitchSop(data) {
  return request({
    url: service + '/batchSwitch',
    method: 'put',
    data
  });
}
/**
 * 删除SOP
 * @param {*} data
 * @returns
 */
export function deleteSop(data) {
  return request({
    url: service + '/del',
    method: 'delete',
    data
  });
}

/**
 * 获取sop详情
 * @param {*} params
 * @returns
 */
export const getSopDetail = (params) => {
  return request({
    url: service + '/listOfDetail',
    method: 'get',
    params
  });
};

/**
 * 获取sop统计
 * @param {*} params
 * @returns
 */
export const getSopCount = (params) => {
  return request({
    url: service + '/count',
    method: 'get',
    params
  });
};

/**
 * sop规则执行记录分页
 * @param {*} params
 * @returns
 */
export const getSopRulesRecordList = (params) => {
  return request({
    url: service + '/rules',
    method: 'get',
    params
  });
};

/**
 * sop员工执行记录分页
 * @param {*} params
 * @returns
 */
export const getSopEmployeeRecordList = (params) => {
  return request({
    url: service + '/users',
    method: 'get',
    params
  });
};

/**
 * 查询客户SOP类型的执行详情
 * @param {*} params
 * @returns
 */
export const getCustomerSopRulesDetailList = (params) => {
  return request({
    url: service + '/detail/list/customer',
    method: 'get',
    params
  });
};

/**
 * 查询SOP循环类型的执行详情
 * @param {*} params
 * @returns
 */
export const getCycleSopRulesDetailList = (params) => {
  return request({
    url: service + '/detail/list/cycle',
    method: 'get',
    params
  });
};

/**
 * 查询群SOP定时类型的执行详情
 * @param {*} params
 * @returns
 */
export const getTimingSopRulesDetailList = (params) => {
  return request({
    url: service + '/detail/list/timing',
    method: 'get',
    params
  });
};

/**
 * 修改SOP使用员工
 * @param {*} params
 * @returns
 */
export const editUser = (data) => {
  return request({
    url: service + '/editUser',
    method: 'put',
    data
  });
};
