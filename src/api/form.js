/*
 * @Description: 智能表单接口
 * @Author: xulinbin
 * @LastEditors: wJiaaa
 */

import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/form';

/**
 * 添加表单分组
 * @param {*} data
 * @returns
 */
export function addGroupTreeLeaf(data) {
  return request({
    url: service + '/group/add',
    method: 'post',
    data
  });
}
/**
 * 表单分组树
 * @param {*} params
 * @returns
 */
export function getGroupTree(params) {
  return request({
    url: service + '/group/tree',
    method: 'get',
    params
  });
}
/**
 * 删除分组
 * @param {*} params
 * @returns
 */
export function removeGroupTreeLeaf(params) {
  return request({
    url: service + '/group/remove',
    method: 'delete',
    params
  });
}

/**
 * 更新分组
 * @param {*} data
 * @returns
 */
export function editGroupTree(data) {
  return request({
    url: service + '/group/edit',
    method: 'post',
    data
  });
}

/**
 * 更改分组排序
 * @param {*} data
 * @returns
 */
export function changeGroupTreeSort(data) {
  return request({
    url: service + '/group/changeSort',
    method: 'post',
    data
  });
}

/**
 * 获取表单数据
 * @param {*} params
 * @returns
 */
export function getFormPageList(params) {
  return request({
    url: service + '/page',
    method: 'get',
    params
  });
}

/**
 * 改变启用表单状态
 * @param {*} params
 * @returns
 */
export function changeEnableState(params) {
  return request({
    url: service + '/enableForm',
    method: 'post',
    params
  });
}

/**
 * 删除表单
 * @param {*} data
 * @returns
 */
export function removeFormList(data) {
  return request({
    url: service + '/remove',
    method: 'post',
    data
  });
}

/**
 * 批量修改分组
 * @param {*} params
 * @returns
 */
export function batchChangeGroup(data) {
  return request({
    url: service + '/updateBatch/group',
    method: 'post',
    data
  });
}

/**
 * 获取推广数据
 * @param {*} params
 * @returns
 */
export function getSpreadData(params) {
  return request({
    url: service + '/promotional',
    method: 'get',
    params
  });
}

/**
 * 新增表单
 * @param {*} params
 * @returns
 */
export function addForm(data) {
  return request({
    url: service + '/add',
    method: 'post',
    data
  });
}

/**
 * 表单详情
 * @param {*} params
 * @returns
 */
export function formDetail(params) {
  return request({
    url: service + '/detail',
    method: 'get',
    params
  });
}

/**
 * 表单详情数据总览
 * @param {*} params
 * @returns
 */
export function formDetailTotalView(params) {
  return request({
    url: service + '/total/view',
    method: 'get',
    params
  });
}

/**
 * 表单编辑详情
 * @param {*} params
 * @returns
 */
export function editFormDetail(params) {
  return request({
    url: service + '/edit/detail',
    method: 'get',
    params
  });
}

/**
 * 表单编辑
 * @param {*} params
 * @returns
 */
export function editForm(data) {
  return request({
    url: service + '/edit',
    method: 'post',
    data
  });
}
/**
 * 获取客户操作记录
 * @param {*} params
 * @returns
 */
export function getCustomerRecord(params) {
  return request({
    url: service + '/record/getCustomerOperRecord',
    method: 'get',
    params
  });
}
/**
 * 获取员工发送记录
 * @param {*} params
 * @returns
 */
export function getStaffRecord(params) {
  return request({
    url: service + '/record/getUserSendRecord',
    method: 'get',
    params
  });
}
/**
 * 获取表单详情
 * @param {*} params
 * @returns
 */
export function getFormResult(params) {
  return request({
    url: service + '/record/getFormResult',
    method: 'get',
    params
  });
}
// 导出客户操作记录
export function exportCustomerRecord(params) {
  return request({
    url: service + '/record/exportCustomerOperRecord',
    method: 'get',
    params
  });
}
// 导出员工发送记录
export function exportUserSendRecord(params) {
  return request({
    url: service + '/record/exportUserSendRecord',
    method: 'get',
    params
  });
}
/**
 * @description 获取所有表单分组
 * @param  params 部门id
 */
export function getAllFormGroup(params) {
  return request({
    url: service + '/group/trees',
    method: 'get',
    params
  });
}
