/*
 * @Description: 话术接口
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */
import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/wordsGroup';

/**
 * 获取话术列表
 * @param {*} data
 * @returns
 */
export function getWordsList(data) {
  return request({
    url: service + '/listOfWords',
    method: 'post',
    data
  });
}

/**
 * 话术获取链接信息
 * @param {*} params
 * @returns
 */
export function getWordsUrlContent(params) {
  return request({
    url: service + '/getUrlContent',
    method: 'get',
    params
  });
}
/**
 * 添加话术
 * @param {*} data
 * @returns
 */
export function addWords(data) {
  return request({
    url: service + '/add',
    method: 'post',
    data
  });
}

/**
 * 修改话术
 * @param {*} data
 * @returns
 */
export function updateWords(data) {
  return request({
    url: service + '/update',
    method: 'post',
    data
  });
}

/**
 * 删除话术
 * @param {*} data
 * @returns
 */
export function deleteWords(data) {
  return request({
    url: service + '/delete',
    method: 'delete',
    data
  });
}

/**
 * 批量修改所属分组
 * @param {*} data
 * @returns
 */
export function updateCategory(data) {
  return request({
    url: service + '/updateCategory',
    method: 'post',
    data
  });
}

/**
 * 导入话术
 * @param {*} data
 * @returns
 */
export function importWords(data) {
  return request({
    url: service + '/importWords',
    method: 'post',
    data
  });
}
