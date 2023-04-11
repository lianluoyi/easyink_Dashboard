import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/lossTag';
/**
 * 客户流失设置保存
 * @param {*} data
 */
export function addLossTag(data) {
  return request({
    url: service + '/addLossTag',
    method: 'post',
    data
  });
}
/**
 * 获取已选择流失客户标签
 * @param {*} data
 */
export function selectLossTag() {
  return request({
    url: service + '/selectLossTag',
    method: 'get'
  });
}
