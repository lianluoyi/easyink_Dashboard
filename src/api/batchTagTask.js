import request from '@/utils/request';

const service = window.CONFIG.services.wecom + '/batchTagTask';
/**
 * @description 导入打标签任务
 */
export function importBatchTagTask(data) {
  return request({
    url: service + '/import',
    method: 'POST',
    data
  });
}

/**
 * @description 获取打标签任务列表
 */
export function selectBatchTaskList(params) {
  return request({
    url: service + '/list',
    method: 'GET',
    params
  });
}

/**
 * @description 删除打标签任务
 */
export function deleteTask(params) {
  return request({
    url: service + '/delete',
    method: 'DELETE',
    params
  });
}

/**
 * @description 打标签任务详情
 */
export function selectBatchTaskDetailList(params) {
  return request({
    url: service + '/detail',
    method: 'GET',
    params
  });
}

/**
 * @description 导出标签任务详情
 */
export function exportBatchTaskDetailList(data) {
  return request({
    url: service + '/export',
    method: 'POST',
    data
  });
}
