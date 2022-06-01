/*
 * @Description: 欢迎语相关接口
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/tlp';

/**
 * 新增员工欢迎语模板
 * @param {*} data
 * @returns
 */
export function addEmployWelMsg(data) {
  return request({
    url: service + '/employ',
    method: 'post',
    data
  });
}

/**
 * 查询欢迎语模板列表
 * @param {*} params (welcomeMsgTplType:1 好友，2:群聊)
 * @returns
 */
export function getEmployWelList(params) {
  return request({
    url: service + '/list/employ',
    params
  });
}

/**
 * 获取欢迎语模板详细信息
 * @param {*} id
 * @returns
 */
export function getWelcomeDetaiById(id) {
  return request({
    url: `${service}/${id}`
  });
}

/**
 * 修改好友迎语模板
 * @param {*} data
 * @returns
 */
export function editEmployWel(data) {
  return request({
    url: service + '/edit/employ',
    method: 'put',
    data
  });
}

/**
 * 删除好友欢迎语模板
 * @param {*} data
 * @returns
 */
export function delEmployWel(data) {
  return request({
    url: `${service}/employ`,
    method: 'delete',
    data
  });
}

/**
 * 群欢迎语模板统计
 * @param {*} id
 * @returns
 */
export function getGroupWelcomeCount() {
  return request({
    url: `${service}/group/count`
  });
}

/**
 * 新增群欢迎语模板
 * @param {*} data
 * @returns
 */
export function addGroupWelMsg(data) {
  return request({
    url: service + '/group',
    method: 'post',
    data
  });
}

/**
 * 修改群欢迎语模板
 * @param {*} data
 * @returns
 */
export function editGroupWelMsg(data) {
  return request({
    url: service + '/edit/group',
    method: 'put',
    data
  });
}

/**
 * 删除群欢迎语模板
 * @param {*} data
 * @returns
 */
export function delGroupWel(data) {
  return request({
    url: `${service}/group`,
    method: 'delete',
    data
  });
}
