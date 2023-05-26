/*
 * @Description: 群标签相关接口
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/grouptag';

// 客户标签

/**
 * 标签列表获取
 * {
    "pageNum": "当前页",
    "pageSize": "每页显示条数",
    "groupName": "标签组名"
}
 */
export function getGroupTagList(params) {
  return request({
    url: service + '/list',
    params
  });
}

/**
 * 分页查询标签组列表
 * @param {*} params
 * @returns
 */
export function getGroupTagListByPage(params) {
  return request({
    url: service + '/page',
    params
  });
}

/**
 * 删除群标签组
 * @param {*} data
 * @returns
 */
export function deleteGroupTag(data) {
  return request({
    url: service,
    data,
    method: 'DELETE'
  });
}

/**
 * 新增客户标签
 * @param {Object} data
{
    "name": "标签组名称",
    "tagList": [{
        "name": "标签名"
    }]
}
 */
export function add(data) {
  return request({
    url: service,
    method: 'post',
    data
  });
}

/**
 * 客户标签编辑
 * @param {*} data
  {
      "id": "主键",
      "groupName": "标签分组名",
      "weTags": [{
          "id": "标签id",
          "groupId": "标签组id",
          "name": "标签名",
          "status": "标签状态，如果编辑的时候删除标签，只需要把该字段设置为1"
      }]
    }
    */
export function update(data) {
  return request({
    url: service,
    method: 'put',
    data
  });
}

/**
 * 批量打标签
 * @param {*} data
 */
export function batchAddTagRel(data) {
  return request({
    url: service + '/batchAddTagRel',
    method: 'post',
    data
  });
}
/**
 * 批量移除标签
 * @param {*} data
 */
export function batchDelTagRel(data) {
  return request({
    url: service + '/batchDelTagRel',
    method: 'post',
    data
  });
}

/** 获取群标签组 */
export function groupTagList() {
  return request({
    url: service + '/getGroupTagList'
  });
}
