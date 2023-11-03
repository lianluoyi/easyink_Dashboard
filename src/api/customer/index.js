import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/customer';

/**
 * 客户列表
 * @param {*} data
 * {
    "pageNum": "当前页",
    "pageSize": "每页显示条数",
    "name": "客户名称",
    "userId": "添加人id",
    "tagIds": "标签id,多个标签，id使用逗号隔开",
    "beginTime": "开始时间",
    "endTime": "结束时间"
    status: 0 客户状态 0正常 1删除
}
 */
export function getList(data) {
  return request({
    url: service + '/listV2',
    method: 'POST',
    data
  });
}

/**
 * 客户同步接口
 */
export function sync() {
  return request({
    url: service + '/synchWeCustomer'
  });
}

export function makeLabelbatch(data) {
  return request({
    url: service + '/makeLabelbatch',
    method: 'post',
    data
  });
}

/**
 * 移除客户标签
 * @param {*} data
 * {
    "externalUserid": "外部联系人userid",
    "addTag": [{
        "id": "标签id",
        "groupId": "标签组id",
        "name": "标签名"
    }]
}
 */
export function removeLabel(data) {
  return request({
    url: service + '/removeLabel',
    method: 'DELETE',
    data
  });
}

/**
 * 客户资料编辑
 * @param {*} data
 * {
  "externalUserid": "",
  "birthday": ""
}
 */
export function updateCustomerDetail(data) {
  return request({
    url: service,
    method: 'PUT',
    data
  });
}

// 导出用户
export function exportCustomer(query) {
  const TIMEOUT = 180000;
  return request({
    url: service + '/export',
    method: 'post',
    data: query,
    timeout: TIMEOUT
  });
}

/**
 *客户详情
 * @param {*} externalUserid
 */
export function getDetail(externalUserid, userId, query = {}) {
  return request({
    url: service + '/getCustomersByUserIdV2/' + externalUserid + '/' + userId,
    params: query
  });
}

/**
 * 客户流失通知开关
 * @param {*} status [string]	是	客户流失通知开关 0:关闭 1:开启
 */
export function lossRemind(status) {
  return request({
    url:
      window.CONFIG.services.wecom +
      '/corp/startCustomerChurnNoticeSwitch/' +
      status,
    method: 'PUT'
  });
}

/**
 * 客户流失状态
 */
export function getCustomerLossSwitch() {
  return request({
    url: window.CONFIG.services.wecom + '/corp/getCustomerLossSwitch'
  });
}
/**
 * 查询企业客户统计数据
 * @param {*} data
 * @returns
 */
export function getCustomerSum(data) {
  return request({
    url: service + '/sum',
    method: 'POST',
    data
  });
}

/**
 * 客户对应所属的员工列表
 * @param {*} id
 * @returns
 */
export function getEmployeesList(id) {
  return request({
    url: service + '/listUserByCustomerId/' + id,
    method: 'get'
  });
}

/**
 * 会话存档客户检索获取客户列表
 * @param {*} params
 * @returns
 */
export function listDistinct(params) {
  return request({
    url: service + '/listDistinct',
    method: 'get',
    params
  });
}

/**
 * 会话存档客户检索获取客户列表总数
 * @param {*} params
 * @returns
 */
export function listDistinctCount(params) {
  return request({
    url: service + '/listDistinct/count',
    method: 'get',
    params
  });
}

// 导出客户结果
export function exportCustomerResult(params) {
  return request({
    url: service + '/export/result',
    method: 'GET',
    params
  });
}
