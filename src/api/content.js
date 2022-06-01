import request from '@/utils/request';
const CONTACT_TYPE_GROUP = '2';
const ROOM_FLAG = {
  'personal': 0,
  'room': 1
};

const getTree = (params) => {
  const obj = {
    isRoom: CONTACT_TYPE_GROUP === params.searchType ? ROOM_FLAG['room'] : ROOM_FLAG['personal'],
    ...params
  };
  return request({
    url: '/chat/mapping/list',
    method: 'get',
    params: obj
  });
};

const chatList = (params) => {
  return request({
    url: '/wecom/finance/getChatContactList',
    method: 'get',
    params
  });
};
const indexTable = () => {
  return request({
    url: '/wecom/page/getCorpBasicData',
    method: 'get'
  });
};
const indexEchart = () => {
  return request({
    url: '/wecom/page/getCorpRealTimeData',
    method: 'get'
  });
};
//
const chatGrounpList = (params) => {
  return request({
    url: '/wecom/finance/getChatRoomContactList',
    method: 'get',
    params
  });
};
const listByCustomer = (params) => {
  return request({
    url: '/wecom/customer/listV2',
    method: 'get',
    params
  });
};
const getChatAllList = (params) => {
  return request({
    url: '/wecom/finance/getChatAllList',
    method: 'get',
    params
  });
};
//
const reloadredis = () => {
  return request({
    url: '/wecom/pagehome/reloadredis',
    method: 'get'
  });
};
export const content = {
  indexEchart,
  indexTable,
  getTree,
  chatList,
  listByCustomer,
  getChatAllList,
  chatGrounpList,
  reloadredis
};
