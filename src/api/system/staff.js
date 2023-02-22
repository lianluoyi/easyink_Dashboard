import request from '@/utils/request';

// 查询员工列表
export function listStaff(query) {
  return request({
    url: '/wecom/user/listOfUser',
    method: 'get',
    params: query
  });
}

export function editUser(data) {
  return request({
    url: '/wecom/user/editUserAccount',
    method: 'post',
    data
  });
}

export function getUser(query) {
  return request({
    url: '/wecom/user/getUser',
    method: 'get',
    params: query
  });
}

export function addUser(data) {
  return request({
    url: '/wecom/user',
    method: 'post',
    data
  });
}

// 查询用户详细
export function getUserInfo(params) {
  return request({
    url: '/wecom/user/' + params?.userId,
    method: 'get'
  });
}

export function getJoinQrCode(params) {
  return request({
    url: '/wecom/user/getJoinQrCode',
    method: 'get',
    params
  });
}
export function download(url) {
  return request({
    url: '/common/download/url',
    params: {
      url
    },
    responseType: 'blob'
  });
}

/**
 * 批量修改员工信息
 */
export function batchUpdateUser(data) {
  return request({
    url: '/wecom/user/batchUpdateUserInfo',
    method: 'post',
    data
  });
}
