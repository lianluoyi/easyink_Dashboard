import request from '@/utils/request';
import { dataURLtoFile } from '@/utils/common';

const service = window.CONFIG.services.common;
const wecomService = window.CONFIG.services.wecom;
export function upload(data) {
  return request({
    url: service + '/uploadFile2Cos',
    method: 'POST',
    data
  });
}

/**
 * 下载网络连接文件
 * @param {*} params
{
  url=文件路径&
  name=文件名称，带后缀
}
 */
export function download(url, name) {
  return (
    process.env.VUE_APP_BASE_API +
    `/common/download/url?url=${url}&name=${name}`
  );
}

/**
 * 上传文件
 * @param {*} data
{
  "dataURL": 本地文件(base64)
}
 */
export function uploadDataURL(dataURL) {
  const data = new window.FormData();
  const f = dataURLtoFile(dataURL);
  data.append('file', f);

  return request({
    url: process.env.VUE_APP_BASE_API +
    '/common/uploadFile2Cos',
    method: 'post',
    processData: false,
    data
  });
}

export function uploadFile2Cos(data) {
  return request({
    url: service + '/uploadFile2Cos',
    method: 'POST',
    data,
    headers: window.CONFIG.headers
  });
}

/**
 * 获取应用的jsapi_ticket
 * @param {*} url 页面url
 */
export function getAgentTicket(url, agentId) {
  return request({
    url: wecomService + '/ticket/getAgentTicket',
    params: {
      url,
      agentId
    }
  });
}

/**
 * @description 获取第三方SCRM系统侧边栏配置
 */
export function getLockSideBar() {
  return request({
    url: wecomService + '/lockSideBar/list'
  });
}

/**
 * @description 编辑第三方SCRM系统侧边栏配置
 */
export function putLockSideBar(data) {
  return request({
    url: wecomService + '/lockSideBar',
    method: 'PUT',
    data
  });
}
