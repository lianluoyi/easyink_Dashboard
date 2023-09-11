import request from '@/utils/request';
const service = window.CONFIG.services.wecom + '/material';
const serviceCategory = window.CONFIG.services.wecom + '/category';
const configService = window.CONFIG.services.wecom + '/materialConfig';

/**
 * 查询素材列表
 * @param {*} params
 * { categoryId:类目id
    search:搜索的值
    mediaType: '' 0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file), 4 文本
 }
 */
export function getList(params) {
  return request({ url: service + '/list', params });
}

/**
 * 获取已经发布的素材id列表
 * @param {*} params
 * @returns
 */
export function getMaterialIds(sideId) {
  return request({
    url: service + '/listOfMaterialId',
    method: 'get',
    params: {
      sideId
    }
  });
}

/**
 *查询素材详细信息
 * @param {*} id 素材id
 */
export function getDetail(id) {
  return request({ url: service + '/' + id });
}
/**
 * 添加素材信息
 * @param {*} data
 * {
categoryId:分类id
materialUrl:本地资源文件地址
content:文本内容、图片文案
materialName:图片名称
digest:摘要
coverUrl:封面本地资源文件
}
 */
export function add(data) {
  return request({ url: service, method: 'post', data });
}

/**
 * 更新素材信息
 * @param {*} data
 * {
 * id:素材id
categoryId:分类id
materialUrl:本地资源文件地址
content:文本内容、图片文案
materialName:图片名称
digest:摘要
coverUrl:封面本地资源文件
}
 */
export function update(data) {
  return request({ url: service, method: 'put', data });
}

/**
 * 删除素材信息
 * @param {*} id
 */
export function remove(id) {
  return request({ url: service + '/' + id, method: 'DELETE' });
}

/**
 * 素材移动分组
 * @param {*} data
 * {
 * categoryId 选择移动的分组类目id
 * materials // 移动的素材ids，逗号分隔
 * }
 */
export function moveGroup(categoryId, materials) {
  return request({
    url: service + '/resetCategory',
    method: 'put',
    data: {
      categoryId,
      materials
    }
  });
}

/**
 * 类目树
 * @param {*} mediaType 0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file), 4 文本 5 海报
 */
export function getTree(mediaType) {
  return request({ url: serviceCategory + '/list', params: { mediaType }});
}

/**
 *通过id查询类目详细信息
 * @param {*} id
 */
export function getTreeDetail(id) {
  return request({ url: serviceCategory + '/' + id });
}

/**
 * 添加类目
 * @param {*} data
 * {
    "mediaType": "0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file) 4 文本",
    "name": "名称",
    "parentId": "父id"
}
 */
export function addTree(data) {
  return request({ url: serviceCategory, method: 'post', data });
}

/**
 * 修改类目
 * @param {*} data
 * {
    "mediaType": "0 图片（image）、1 语音（voice）、2 视频（video），3 普通文件(file) 4 文本",
    "name": "名称",
    "parentId": "父id"
}
 */
export function updateTree(data) {
  return request({ url: serviceCategory, method: 'put', data });
}

/**
 * 删除类目
 * @param {*} data
 */
export function removeTree(ids) {
  return request({
    url: serviceCategory + '/' + ids,
    method: 'DELETE'
  });
}

/**
 * 获取素材media_id
 * @param {*} data
 * url [string] 是	素材路径
type [string] 是	素材类型
name [string] 是	文件名称
 */
// 以下无用
export function getMaterialMediaId(data) {
  return request({
    url: service + '/temporaryMaterialMediaIdForWeb',
    method: 'POST',
    data
  });
}

/**
 * 获取素材类目列表
 * @returns
 */
export function getCategoryList() {
  return request({ url: serviceCategory + '/getList' });
}

/**
 * 获取素材标签列表
 * @param {*} params { tagName(标签名) }
 * @returns
 */
export function getMaterialTagList(params) {
  return request({ url: service + '/listTagByName', params });
}

/**
 * 添加素材标签
 * @param {*} tagName 标签名
 * @returns
 */
export function addMaterialTag(tagName) {
  return request({
    url: service + '/saveTag',
    method: 'POST',
    data: {
      tagName
    }
  });
}

/**
 * 删除素材标签
 * @param {*} tagId 标签id
 * @returns
 */
export function delMaterialTag(tagId) {
  return request({
    url: service + '/delTag/' + tagId,
    method: 'DELETE'
  });
}

/**
 * 侧边栏展示素材开关
 * @param {*} params
 * @returns
 */
export function sidebarSwitch(params) {
  return request({
    url: serviceCategory + '/sidebarSwitch',
    method: 'PUT',
    data: params
  });
}

/**
 * 查询素材-侧边栏数量接口
 * @param {*} params
 * @returns
 */
export function getMaterialCount(params) {
  return request({
    url: service + '/getMaterialCount',
    method: 'POST',
    data: params
  });
}

/**
 * 素材发布
 * @param {*} params
 * @returns
 */
export function showMaterialSwitch(params) {
  return request({
    url: service + '/showMaterialSwitch',
    method: 'PUT',
    data: params
  });
}

/**
 * 删除素材
 * @param {*} params
 * @returns
 */
export function removeMaterial(params) {
  return request({
    url: service + '/remove',
    method: 'DELETE',
    data: params
  });
}

/**
 * 批量打标签
 * @param {*} params
 * @returns
 */
export function markTags(params) {
  return request({
    url: service + '/markTags',
    method: 'POST',
    data: params
  });
}

/**
 * 批量移除标签
 * @param {*} params
 * @returns
 */
export function removeTags(params) {
  return request({
    url: service + '/removeTags',
    method: 'POST',
    data: params
  });
}

/**
 * 过期素材恢复
 * @param {*} params
 * @returns
 */
export function restoreMaterial(params) {
  return request({
    url: service + '/restore',
    method: 'PUT',
    data: params
  });
}

/**
 * 获取素材配置信息
 * @returns
 */
export function getMaterialConfig() {
  return request({ url: configService + '/get' });
}

/**
 * 更新素材配置
 * @param {*} params
 * @returns
 */
export function updateMaterialConfig(params) {
  return request({
    url: configService + '/update',
    method: 'PUT',
    data: params
  });
}
