import request from '@/utils/request';
// 此处无法读取到window.CONFIG，需在main.js中额外引入，但可能影响其他逻辑，因此直接写/wecom
const thirdAppService = '/wecom/3rdapp';
const corpService = '/wecom/corp';
// 登录方法
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  };
  return request({
    url: '/login',
    method: 'post',
    data: data
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  });
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  });
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    method: 'get'
  });
}

/**
 * 企业微信扫码回调接口
 * @param {*} auth_code
 */
export function wxQrLogin(auth_code) {
  return request({
    url: '/wxQrLogin',
    method: 'get',
    params: {
      auth_code
    }
  });
}

/**
 * 获取扫码登陆相关参数
 */
export function findWxQrLoginInfo() {
  return request({
    url: '/findWxQrLoginInfo',
    method: 'get'
  });
}

/**
 * 获取企微后台配置
 */
export function getWecomConfig() {
  return request({
    url: corpService + '/get',
    method: 'get'
  });
}
/**
 * 扫码登录
 */
export function qrCodeLogin(params) {
  return request({
    url: '/qrCodeLogin',
    method: 'get',
    params
  });
}

/**
 * 获取当前服务器类型：是否三方
 */
export function getServerType() {
  return request({
    url: thirdAppService + '/getServerType',
    method: 'get'
  });
}
/**
 * 获取预授权码：企业授权的二维码连接构造的相关参数获取
 */
export function getPreAuthCode() {
  return request({
    url: thirdAppService + '/getPreAuthCode',
    method: 'get'
  });
}
/**
 * 获取预登录参数：三方应用扫码登录的二维码连接构造的相关参数获取
 */
export function getPreLoginParam() {
  return request({
    url: thirdAppService + '/getPreLoginParam',
    method: 'get'
  });
}
/**
 * 获取永久授权码：企业授权完成后，会返回临时授权码给前端，前端需要使用临时授权码调用该接口
 */
export function getPermanentCode(params) {
  return request({
    url: thirdAppService + '/getPermanentCode',
    method: 'get',
    params
  });
}
/**
 * 三方登录
 */
export function qrCodeLogin3rd(params) {
  return request({
    url: '/qrCodeLogin3rd',
    method: 'get',
    params
  });
}
/**
 * 网页登录
 */
export function webLogin(params) {
  return request({
    url: '/webLogin',
    method: 'get',
    params
  });
}
