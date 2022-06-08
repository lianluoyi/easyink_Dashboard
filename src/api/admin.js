import request from '@/utils/request';

const service = window.CONFIG.services.wecom + '/admin';

/**
 * 获取登录企业微信后台的二维码
 * @returns data.status: 二维码状态:未扫码(QRCODE_SCAN_NEVER),二维码过期(QRCODE_EXPIRE),扫码成功(QRCODE_SCAN_SUCC)
 */
export function getAdminLoginQrcode() {
  return request({
    url: service + '/getAdminLoginQrcode'
  });
}

/**
 * 检测登录企业微信后台的二维码
 * @returns 二维码
 */
export function checkAdminLoginQrcode(params) {
  return request({
    url: service + '/checkAdminLoginQrcode',
    method: 'get',
    params
  });
}

/**
 * 启动自动配置
 * @param {*} data
 * @returns
 */
export function autoConfig(data) {
  return request({
    url: service + '/autoConfig',
    method: 'POST',
    data,
    disableErrMsg: true
  });
}

/**
 * 获取默认应用域名配置
 * @returns
 */
export function getDefaultDomainConfig() {
  return request({
    url: service + '/getDefaultDomainConfig'
  });
}
