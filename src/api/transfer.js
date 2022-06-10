import request from '@/utils/request';

/**
 * 在职继承客户列表
 */
export const getCustomerList = (params) => {
  return request({
    url: '/wecom/transfer/customerList',
    method: 'get',
    params
  });
};

/**
 * 在职继承记录列表
 */
export const getRecordList = (params) => {
  return request({
    url: '/wecom/transfer/recordList',
    method: 'get',
    params
  });
};

/**
 * 在职继承
 */
export const transfer = (data) => {
  return request({
    url: '/wecom/transfer',
    method: 'post',
    data
  });
};

/**
 * 获取继承设置
 */
export const getTransferConfig = () => {
  return request({
    url: '/wecom/transfer/config',
    method: 'get'
  });
};

/**
 * 修改继承设置
 */
export function editConfig(data) {
  return request({
    url: '/wecom/transfer/editConfig',
    method: 'put',
    data
  });
}
