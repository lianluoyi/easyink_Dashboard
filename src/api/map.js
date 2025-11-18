import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/map';

/**
 * 获取地址列表
 * @returns
 */
export const getDistrictList = (data) => {
  return request({
    url: service + '/req/district/list',
    method: 'get',
    params: data
  });
};

/**
 * 获取下级行政区划
 */
export const getSubDistrictList = (data) => {
  return request({
    url: service + '/req/district/children',
    method: 'get',
    params: data,
    disableErrMsg: true
  });
};

/**
 * @description 关键词输入提示
 */
export const getAddressByKeyword = (data) => {
  return request({
    url: service + '/req/suggestion',
    method: 'get',
    params: data
  });
};

/**
 * @description 逆地址解析（坐标转地址）
 */
export const getRegeocode = (data) => {
  return request({
    url: service + '/req/regeocode',
    method: 'get',
    params: data
  });
};
