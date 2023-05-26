import request from '@/utils/request';
const wecom = window.CONFIG.services.wecom;
const service = wecom + '/portrait';

/**
 * 获取轨迹信息
 */
export function findTrajectory(params) {
  return request({
    url: service + '/findTrajectory',
    params
  });
}

