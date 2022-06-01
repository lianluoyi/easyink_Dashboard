import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/corp';
// 代开发Url
const scanCode = window.CONFIG.services.wecom + '/3rdapp';
import store from '../store';
// 企业id

/**
 * 获取企业id列表
 */
export function getList(params) {
  return request({
    url: service + '/list',
    params
  });
}
/**
 * 判断企业是否是代开发应用
 */
export function generationApplication() {
  return request({
    url: scanCode + '/checkCorpId'
  });
}
/**
 * 判断管理员是否扫描二维码
 */
export function isScanCode() {
  return request({
    url: scanCode + '/checkDkSuiteAuthStatus'
  });
}
/**
 * 获取代开发应用客服授权码
 */
export function getDkQrCode() {
  return request({
    url: scanCode + '/getDkQrCode'
  });
}
/**
 * 获取当前启用的企微配置
 * @param {*} params
 * @returns
 */
export function getNowConfig(params) {
  return request({
    url: service + '/get',
    params,
    disableErrMsg: true
  });
}

/**
 * 获取企业id相关详情
 * @param {String} id
 */
export function getDetail(id) {
  return request({
    url: service + '/' + id
  });
}

/**
 * 新增企业id
 * @param {Object} data
 */
export function add(data) {
  return request({
    url: service,
    method: 'post',
    data
  });
}
/**
 * 修改企业id
 * @param {Object} data
 * {
  "companyName": "string",
  "corpId": "string",
  "corpSecret": "string",
  "createBy": "string",
  "createTime": "2020-09-08T15:29:14.206Z",
  "delFlag": "string",
  "id": 0,
  "params": {},
  "remark": "string",
  "searchValue": "string",
  "status": "string",
  "updateBy": "string",
  "updateTime": "2020-09-08T15:29:14.206Z"
}
 */
export function update(data) {
  const params = { ...data };
  const enterPriseWechatConfig = store.state.enterPriseWechatConfig;
  if (enterPriseWechatConfig && enterPriseWechatConfig.corpId && !params.corpId) params.corpId = enterPriseWechatConfig.corpId;
  return request({
    url: service,
    method: 'put',
    data: params
  });
}

/**
 * 启用有效企业微信账号
 * @param {*} corpId
 */
export function start(corpId) {
  return request({
    url: service + '/startVailWeCorpAccount/' + corpId,
    method: 'put'
  });
}

/**
 * 获取消息加密公钥
 * @returns
 */
export function getChatPublicKey() {
  return request({
    url: service + '/getChatPublicKey'
  });
}
