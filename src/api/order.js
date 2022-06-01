import request from '@/utils/request';

const service = window.CONFIG.services.wecom + '/order';

/**
 * 校验网点ID
 * @returns
 */
export function verifyNetwork(params) {
  return request({
    url: service + '/verifyNetwork',
    method: 'get',
    params,
    disableErrMsg: true
  });
}

/**
 * 获取绑定数量
 * @param {*} params
 * @returns
 */
export function getBindTotal(params) {
  return request({
    url: service + '/getBindTotal',
    method: 'get',
    params
  });
}

/**
 * 获取绑定详情
 * @param {*} params
 * @returns
 */
export function listOfBindDetail(params) {
  return request({
    url: service + '/listOfBindDetail',
    method: 'get',
    params
  });
}

/**
 * 获取工单账号列表接口
 * @param {*} params
 * @returns
 */
export function networkUser(params) {
  return request({
    url: service + '/networkUser',
    method: 'get',
    params
  });
}

/**
 * 解绑员工工单
 * @param {*} params
 * @returns
 */
export function unbindUser(data) {
  return request({
    url: service + '/unbindUser',
    method: 'post',
    data
  });
}

/**
 * 绑定员工工单账号
 * @param {*} data
 * @returns
 */
export function bindUser(data) {
  return request({
    url: service + '/bindUser',
    method: 'post',
    data
  });
}
