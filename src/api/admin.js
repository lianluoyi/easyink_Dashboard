/*
 * @Description: 企微后台接口
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
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

/**
 * 扫码登录企微后台验证手机短信验证码
 * @param {*} params
 * @returns
 */
export function confirmMobileCaptcha(params) {
  return request({
    url: service + '/confirmMobileCaptcha',
    method: 'get',
    params
  });
}
/**
 * 重新发送手机验证码
 * @param {*} params
 * @returns
 */
export function sendCaptcha(params) {
  return request({
    url: service + '/sendCaptcha',
    method: 'get',
    params
  });
}

/**
 * 获取员工隐私信息
 * @param {*} params
 * @returns
 */
export function getDepartMemberInfo(params) {
  return request({
    url: service + '/getDepartMemberInfo',
    method: 'get',
    params
  });
}
