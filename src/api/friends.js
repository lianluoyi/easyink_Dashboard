/*
 * @Description: 朋友圈接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/moment';

/**
 * 创建朋友圈
 * @param {*} data
 * @returns
 */
export function createFriendsCircle(data) {
  return request({
    url: service + '/create',
    method: 'post',
    data
  });
}
/**
 * 获取发布记录列表
 * @param {*} params
 * @returns
 */
export function getFriendsList(params) {
  return request({
    url: service + '/listOfMomentTask',
    method: 'get',
    params
  });
}
/**
 * 获取详情统计接口
 * @param {*} params
 * @returns
 */
export function getTotal(params) {
  return request({
    url: service + '/getTotal',
    method: 'get',
    params
  });
}
/**
 * 获取朋友圈任务基础信息
 * @param {*} params
 * @returns
 */
export function getMomentTaskBasicInfo(params) {
  return request({
    url: service + '/getMomentTaskBasicInfo',
    method: 'get',
    params
  });
}
/**
 * 获取朋友圈发布记录详情
 * @param {*} params
 * @returns
 */
export function listOfMomentPublishDetail(params) {
  return request({
    url: service + '/listOfMomentPublishDetail',
    method: 'get',
    params
  });
}
/**
 * 发送提醒信息
 * @param {*} data
 * @returns
 */
export function sendToUser(data) {
  return request({
    url: service + '/sendToUser',
    method: 'post',
    data
  });
}
/**
 * 编辑朋友圈
 * @param {*} data
 * @returns
 */
export function updateMoment(data) {
  return request({
    url: service + '/updateMoment',
    method: 'post',
    data
  });
}
/**
 * 刷新朋友圈执行
 * @param {*} data
 */
export function refreshMomentTask(data) {
  return request({
    url: service + '/refreshMomentTask',
    method: 'put',
    params: data
  });
}
/**
 * 删除朋友圈
 * @param {*} data
 */
export function deleteMoment(data) {
  return request({
    url: service + '/deleteMoment',
    method: 'delete',
    params: data
  });
}

