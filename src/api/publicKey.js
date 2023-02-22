/*
 * @Description: 获取RSA密钥
 * @Author: xulinbin
 * @LastEditors: xulinbin
 */
import request from '@/utils/request';

/**
 * 获取RSA秘钥公钥
 * @param {*} params
 * @returns
 */
export const getPublicKey = (params) => {
  return request({
    url: 'getPublicKey',
    method: 'get',
    params
  });
};
