/**
 * 通用js方法封装处理
 */
import {
  MS_TO_SECONDS, WX_TYPE, CORP_TYPE, ICON_LIST, MEDIA_TYPE_POSTER, MEDIA_TYPE_AUDIO, MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_FILE, FILE_EXCEL_TYPE, MEDIA_TYPE_TEXT, MEDIA_TYPE_IMGLINK,
  MEDIA_TYPE_MINIAPP, SCOPELIST_TYPE, MEDIA_TYPE_SMARTFORM, MEDIA_TYPE_RADARLINK
} from '@/utils/constant';
import { getUserInfo } from '@/api/system/staff';
import { groupBy, isEqual } from 'lodash';
import moment from 'moment';
const baseURL = process.env.VUE_APP_BASE_API;
const TIME_LENGTH = 10;

// 昨天
export const YESTERDAY_TIME = moment().subtract(1, 'days').format('YYYY-MM-DD');
// 180天之前
export const ONE_HUNDRED_AND_EIGHTY = 180;
export const FIXED_DAYS_AGO_TIME = moment().subtract(ONE_HUNDRED_AND_EIGHTY, 'days').format('YYYY-MM-DD');
// 一个月之前
export const ONE_MOUNTH_AGO = (time) => {
  return moment(time).subtract(1, 'month').format('YYYY-MM-DD');
};
// 一个月之后
export const ONE_MOUNTH_LATER = (time) => {
  return moment(time).add(1, 'month').format('YYYY-MM-DD');
};
// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time);
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/');
    }
    if ((typeof time === 'number') && (time.toString().length === TIME_LENGTH)) {
      time = time * MS_TO_SECONDS;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    const VAL = 10;
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value]; }
    if (result.length > 0 && value < VAL) {
      value = '0' + value;
    }
    return value || 0;
  });
  return time_str;
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 年月日格式
export function yearMouthDay(data) {
  var time = new Date(data);
  var year = time.getFullYear();
  var month = time.getMonth() + 1;
  var date = time.getDate();
  console.log(year + '-' + add0(month) + '-' + add0(date));
  return year + '-' + add0(month) + '-' + add0(date);
}
function add0(m) {
  const MONTH_LIMIT = 10;
  return m < MONTH_LIMIT ? '0' + m : m;
}

// 添加日期范围
export function addDateRange(params, dateRange) {
  var search = params;
  search.beginTime = '';
  search.endTime = '';
  if (dateRange != null && dateRange !== '') {
    search.beginTime = this.dateRange[0];
    search.endTime = this.dateRange[1];
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  var actions = [];
  Object.keys(datas).some((key) => {
    if (datas[key].dictValue === ('' + value)) {
      actions.push(datas[key].dictLabel);
      return true;
    }
  });
  return actions.join('');
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
  var actions = [];
  var currentSeparator = undefined === separator ? ',' : separator;
  var temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some((val) => {
    Object.keys(datas).some((key) => {
      if (datas[key].dictValue === ('' + temp[val])) {
        actions.push(datas[key].dictLabel + currentSeparator);
      }
    });
  });
  return actions.join('').substring(0, actions.join('').length - 1);
}

// 通用下载方法
export function download(fileName, noStamp = false) {
  const base = baseURL + '/common/download?fileName=' + encodeURI(fileName) + '&delete=' + true;
  if (!noStamp) {
    window.location.href = base;
  } else {
    window.location.href = base + '&needTimeStamp=' + false;
  }
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments; var flag = true; var i = 1;
  str = str.replace(/%s/g, function() {
    var arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return arg;
  });
  return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str === 'undefined' || str === 'null') {
    return '';
  }
  return str;
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  id = id || 'id';
  parentId = parentId || 'parentId';
  children = children || 'children';
  const result = [];
  data = JSON.parse(JSON.stringify(data));
  if (!Array.isArray(data)) {
    return result;
  }
  const map = {};
  data.forEach(item => {
    map[item[id]] = item;
  });
  data.forEach(item => {
    const parent = map[item[parentId]];
    if (parent) {
      parent[children] || (parent[children] = []);
      parent[children].push(item);
    } else {
      result.push(item);
    }
  });
  return result;
}

/**
 * dataURL转化为File对象
 * @param {*} dataURL 本地数据 base64
 */
export function dataURLtoFile(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n) {
    u8arr[n - 1] = bstr.charCodeAt(n - 1);
    n -= 1; // to make eslint happy
  }
  return new File([u8arr], '', { type: mime });
}

/**
 * 整理echat 数据
 * @param {*} arrData 数据
 */
export function arrData(data) {
  const obj = {
    totalContactCnt: [],
    newContactCnt: [],
    negativeFeedbackCnt: [],
    newContactRetentionRate: [],
    chatTotal: [],
    newChatCnt: [],
    memberTotal: [],
    newMemberCnt: [],
    btm1: []
  };

  data.forEach((a, b) => {
    obj.totalContactCnt.push(+a.totalContactCnt);
    obj.newContactCnt.push(+a.newContactCnt);
    obj.negativeFeedbackCnt.push(+a.negativeFeedbackCnt);
    obj.newContactRetentionRate.push(+a.newContactRetentionRate);
    obj.chatTotal.push(+a.chatTotal);
    obj.newChatCnt.push(+a.newChatCnt);
    obj.memberTotal.push(+a.memberTotal);
    obj.newMemberCnt.push(+a.newMemberCnt);
    obj.btm1.push(a.xtime);
  });
  // console.log(obj)
  return obj;
}

export function downloadFile(url, fileName) {
  // console.log('url, fileName', url, fileName);
  // const xhr = new XMLHttpRequest();
  // xhr.open("post", url);
  // // 设置相应类型为blob
  // xhr.responseType = "blob"; // ""|"text"-字符串 "blob"-Blob对象 "arraybuffer"-ArrayBuffer对象
  // xhr.onload = () => {
  // let blob = xhr.response;
  // const src = URL.createObjectURL(blob);
  // console.log(xhr.response, src);
  // this.setState({src})
  // console.log('url, fileName', src);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName); // 下载文件的名称及文件类型后缀
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // };
}

export function filterSize(size) {
  const FIX = 2;
  const POW_B = 1;
  const POW_KB = 2;
  const POW_MB = 3;
  const POW_GB = 4;
  if (!size) return '';
  if (size < pow1024(POW_B)) return size + ' B';
  if (size < pow1024(POW_KB)) return (size / pow1024(POW_B)).toFixed(FIX) + ' KB';
  if (size < pow1024(POW_MB)) return (size / pow1024(POW_KB)).toFixed(FIX) + ' MB';
  if (size < pow1024(POW_GB)) return (size / pow1024(POW_MB)).toFixed(FIX) + ' GB';
  return (size / pow1024(POW_GB)).toFixed(FIX) + ' TB';
}

export function pow1024(num) {
  const MAX_BYTE = 1024;
  return Math.pow(MAX_BYTE, num);
}

export function downloadAMR(fileUrl) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', fileUrl, true);
  xhr.responseType = 'blob';
  xhr.onload = function() {
    const blob = this.response;
    const file = new File([blob], '语音.amr', { type: 'audio/AMR' });
    downloadFile(window.URL.createObjectURL(file), '语音.amr');
  };
  xhr.send();
}

/**
 * 在部门列表中递归查找到指定部门，将用户列表添加至部门的children
 * @param deptData 循环的部门
 * @param deptId 要找的部门id
 * @param userList 部门下的员工列表
 * @return flag 是否找到部门
 */
export function changeDeptTreeData(deptData, deptId, userList = [], loadKey = 'loaded', deptIdKey = 'id') {
  let flag = false;
  // 找到该部门
  const dept = deptData.find(ele => ele[deptIdKey] === deptId);
  if (dept) {
    // 有子部门则children为员工列表+子部门，否则为员工列表
    dept.children = dept.children ? [...dept.children, ...userList] : userList;
    if (loadKey) dept[loadKey] = true;
    return true;
  }
  // 没找到则遍历当前部门列表中各部门的子部门
  for (let i = 0; i < deptData.length; i++) {
    const dept = deptData[i];
    if (dept.children) {
      flag = changeDeptTreeData(dept.children, deptId, userList, loadKey, deptIdKey);
      // flag为true，则说明找到了，结束循环
      if (flag) break;
    }
  }
  return flag;
}

// 处理客户类型（@后面的显示内容）
// todo 将其他处理统一为调用该方法
export function dealAtInfo(item, typeKey = 'type') {
  return { [WX_TYPE]: '@微信', [CORP_TYPE]: '@' + (item.corpFullName || item.corpName || '') }[item[typeKey]] || '';
}

// 清除地址栏中的参数但页面不跳转
export function clearSearchWithoutReload() {
  var url = window.location.href; // 获取当前页面的url
  if (url.indexOf('?') !== -1) { // 判断是否存在参数
    url = url.replace(/(\?|#)[^'"]*/, ''); // 去除参数
    window.history.pushState({}, 0, url);
  }
}

export function removeUrlParams(url) {
  if (url.indexOf('?') !== -1) { // 判断是否存在参数
    const index = url.indexOf('?');
    url = url.substring(0, index);
  }
  return url;
}
/**
 * 替换掉http/https的前缀
 * @param {*} url 需要替换的url
 * @returns
 */
export function replaceUrlProtocol(url) {
  var urlNoProtocol = url.replace(/^https?\:\/\//i, '');
  return urlNoProtocol;
}

/**
 * 获取文件后缀名
 * @param {*} url 文件链接
 * @returns 后缀名
 */
export function getSuffix(url) {
  const index = url.lastIndexOf('.');
  const suffix = url.substr(index + 1);
  return suffix;
}

/**
 * 获取文件类型图标class
 */
export function getFileIcon(url) {
  const suffix = getSuffix(url);
  if (ICON_LIST.includes(suffix)) {
    return suffix;
  }
  return dealExtraIcon(suffix);
}

/**
 * 处理后缀与图标名不同的文件类型
 */
export function dealExtraIcon(suffix) {
  const fileObj = {
    'mp2': 'audio',
    'mp3': 'audio',
    'qy2': 'audio',
    'ra': 'audio',
    'ram': 'audio',
    'xlsx': 'excel',
    'xls': 'excel',
    'xlsb': 'excel',
    'xlt': 'excel',
    'xlk': 'excel',
    'xll': 'excel',
    'xlv': 'excel',
    'xlw': 'excel',
    'pptx': 'ppt',
    'mov': 'video',
    'png': 'image',
    'gif': 'image',
    'jpg': 'image',
    'jpeg': 'image',
    'img': 'image',
    'svg': 'image',
    'docx': 'doc',
    'rar': 'zip',
    'tz': 'zip',
    'jsp': 'html',
    'js': 'html',
    'json': 'html',
    'php': 'html',
    'phtml': 'html',
    'py': 'html',
    'pyw': 'html',
    'pyc': 'html',
    'pyd': 'html',
    'shtml': 'html',
    'rm': 'mov',
    'vob': 'mov'
  };
  const suffixName = fileObj[suffix] || 'unknown';
  return suffixName;
}

/**
 * 根据标签id匹配出标签名
 * @param {*} tagList 标签泪奔
 * @param {*} store
 * @returns
 */
export function matchDealtagName(tagList, store) {
  const allTagObj = store.state.materialInfo && store.state.materialInfo.allTagObj;
  const newList = [];
  tagList.map(item => {
    newList.push({ ...item, tagName: allTagObj[item.materialTagId]?.tagName });
  });
  return newList;
}

/**
 * @description: 截取掉文件名超出限制的部分
 * @param {*} oldFileName 原有文件名
 * @return {*} 截取后文件名
 */
export function dealImgName(oldFileName, limitFileName) {
  if (!oldFileName) return;
  const index = oldFileName.lastIndexOf('.');
  const ext = oldFileName.substring(index);
  const fileName = oldFileName.substring(0, index);
  let newFileName = fileName + ext;
  if (limitFileName) newFileName = fileName.slice(0, limitFileName - ext.length) + ext;
  return newFileName;
}

export function dealFormat(type, file, _this) {
  let isFormat = true;
  switch (type) {
    case MEDIA_TYPE_POSTER: {
      isFormat = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      if (!isFormat) _this.msgError('不支持上传该类型文件，请重新选择');
      return isFormat;
    }
    case MEDIA_TYPE_AUDIO: {
      isFormat = /.amr$/gi.test(file.name);
      if (!isFormat) _this.msgError('上传文件只能是 amr 格式!');

      return isFormat;
    }
    case MEDIA_TYPE_VIDEO: {
      isFormat = file.type === 'video/mp4';
      if (!isFormat) _this.msgError('上传文件只能是 mp4 格式!');
      return isFormat;
    }
    case FILE_EXCEL_TYPE: {
      isFormat = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isFormat) _this.msgError('上传文件只能是 xlsx 格式!');
      return isFormat;
    }
    default:
      return isFormat;
  }
}
/**
 * 校验上传文件大小
 */
export function dealUploadSize(type, file, _this, videoLimit) {
  const MAX_BYTE = 1024;
  const IMG_BYTE = 2;
  const VIDEO_BYTE = 50;
  const FILE_BYTE = 20;
  let isSize = true;
  const videoLimitSize = videoLimit || VIDEO_BYTE;
  const imgLimitSize = videoLimit || IMG_BYTE;
  switch (type) {
    case MEDIA_TYPE_POSTER:
    case MEDIA_TYPE_AUDIO: {
      isSize = file.size / MAX_BYTE / MAX_BYTE < (imgLimitSize);
      if (!isSize) _this.msgError(`上传文件大小不能超过${imgLimitSize}MB!`);
      return isSize;
    }
    case MEDIA_TYPE_VIDEO: {
      isSize = file.size / MAX_BYTE / MAX_BYTE < (videoLimitSize);
      if (!isSize) _this.msgError(`视频大小不能超过${videoLimitSize}M，请重新选择!`);
      return isSize;
    }
    case MEDIA_TYPE_FILE: {
      isSize = file.size / MAX_BYTE / MAX_BYTE < FILE_BYTE;
      if (!isSize) _this.msgError('上传文件大小不能超过 20MB!');
      return isSize;
    }
    default:
      return isSize;
  }
}
/**
 * @param {*} number
 * @param {*} separator
 * @returns
 */
export function getFMdate(number) {
  const n = parseInt(number);
  const nd = new Date();
  const day = nd.getDate();
  const setd = new Date(nd.setDate(day + n));
  const rmonth = setd.getMonth() + 1;
  const rday = setd.getDate();
  let frmonth, frday;
  // month day + '0'
  if (rmonth < '10' * 1) {
    frmonth = '0' + rmonth;
  } else {
    frmonth = rmonth;
  }
  if (rday < '10' * 1) {
    frday = '0' + rday;
  } else {
    frday = rday;
  }
  // separator
  return frmonth + '月' + frday + '日';
}
/**
 * 处理话术/话术分组排序后的列表
 * @param {*} list
 * @param {*} hasNameFlag
 * @returns
 */
export function dealChildIdList(list, hasNameFlag) {
  const idList = [];
  let sortList = [...list];
  sortList = sortList.reverse();
  sortList.map((item, index) => {
    // 编辑分组时需要带上名字
    if (hasNameFlag) {
      idList.push({
        childId: item.id,
        name: item.name,
        sort: index + 1
      });
    } else {
      idList.push({
        id: item.id,
        sort: index + 1
      });
    }
  });
  return idList;
}

/**
 * 通过url获取文件名
 * @param {*} url 文件路径
 * @returns 文件名
 */
export function getFileName(url) {
  if (!url) return '';
  const index = url.lastIndexOf('/');
  const endIndex = url.indexOf('?');
  const fileName = url.slice(index + 1, endIndex !== -1 ? endIndex : undefined);
  return fileName;
}
export function listTransToObj(list) {
  const obj = {};
  list.map(item => {
    obj[item.id] = item;
  });
  return obj;
}

/**
 * 处理各种类型自定义字段的显示
 * @param {*} colunmItem
 * @param {*} row
 * @param {*} type
 * @returns
 */
export function dealShowText(colunmItem, row, type) {
  const optionList = colunmItem.optionList;
  if (!row.extendProperties) return;
  switch (type) {
    // 单选类型
    case 'singleType': {
      const proIndex = row.extendProperties.findIndex(item => item.extendPropertyId.toString() === colunmItem.id);
      if (proIndex < 0) return;
      const index = optionList.findIndex(item => item.id === row.extendProperties[proIndex].propertyValue);
      if (index > -1) {
        return { value: optionList[index].multipleValue, optionValue: row.extendProperties[proIndex].propertyValue };
      }
      return { optionValue: null };
    }
    // 多选类型
    case 'mulType': {
      const valueList = filterValueList(row, colunmItem);
      const propertyValueList = [...valueList] || [];
      const propertyNameList = [];
      propertyValueList.map(valItem => {
        const index = optionList.findIndex(optionItem => optionItem.id === valItem);
        if (index > -1) {
          propertyNameList.push(optionList[index].multipleValue);
        }
      });
      return { value: propertyNameList, optionValue: propertyValueList };
    }
    // 图片/文件（以逗号隔开存储在value）
    case 'imgFile': {
      const valueList = filterValueList(row, colunmItem);
      return { value: valueList };
    }
    case 'fileType': {
      const valueList = filterValueList(row, colunmItem);
      const newList = [];
      try {
        valueList.map(item => {
          newList.push(JSON.parse(item));
        });
      } catch (e) { console.error('文件信息解析失败', e); }
      return { value: newList };
    }
    // 只存储文字的类型
    case 'textType': {
      const proIndex = row.extendProperties.findIndex(item => item.extendPropertyId.toString() === colunmItem.id);
      if (proIndex < 0) return;
      return { value: row.extendProperties[proIndex].propertyValue };
    }
  }
}

function filterValueList(row, colunmItem) {
  const propertyList = row.extendProperties.filter(item => item.extendPropertyId.toString() === colunmItem.id);
  const valueList = propertyList.map(item => item.propertyValue);
  return valueList;
}

/**
 * 校验素材必填项
 */
export const checkContent = (rule, value, callback) => {
  const flag = value.some(item => {
    switch (item.mediaType) {
      case MEDIA_TYPE_TEXT: {
        if (!item.content) {
          return callback(new Error('请填写话术内容'));
        }
        return false;
      }
      case MEDIA_TYPE_IMGLINK: {
        if (!item.url) {
          return callback(new Error('请填写链接访问地址'));
        }
        if (!item.title) {
          return callback(new Error('请填写链接标题'));
        }
        return false;
      }
      case MEDIA_TYPE_MINIAPP: {
        if (!item.accountOriginalId) {
          return callback(new Error('请填写小程序帐号原始ID'));
        }
        if (!item.appid) {
          return callback(new Error('请填写小程序appid'));
        }
        if (!item.url) {
          return callback(new Error('请填写小程序访问地址'));
        }
        if (!item.title) {
          return callback(new Error('请填写小程序标题'));
        }
        return false;
      }
      case MEDIA_TYPE_POSTER:
      case MEDIA_TYPE_VIDEO:
      case MEDIA_TYPE_FILE: {
        if (!item.title) {
          return callback(new Error('请填写标题'));
        }
        return false;
      }
    }
  });
  if (!flag) {
    callback();
  } else {
    return callback(new Error('请填写必填项'));
  }
};

/**
 * 若没有获取过客户字段则进行获取
 * @param {*} store
 */
export const initGetCustomerProper = (store) => {
  if (!store.state.customerProperty.customerProperList || store.state.customerProperty.customerProperList.length === 0) {
    store.dispatch('GetCustomerProperty');
  }
};

export const removeObjEmptyVal = (object) => {
  const newObject = { ...object };
  for (var key in newObject) {
    if (newObject[key] === '') {
      delete newObject[key];
    }
  }
  return newObject;
};
/**
 * 获取并设置当前主题
 */
export const getNowTheme = () => {
  const themeType = localStorage.getItem('themeType');
  window.document.documentElement.setAttribute('data-theme', themeType);
};

/**
 *  接口响应后修改确认按钮的状态值
 *  @param {*} store
 *  @param {*} type  按钮类型
 */
export const changeButtonLoading = (store, type) => {
  // 根据对象value返回key
  function findKey(obj, value, compare = (a, b) => a === b) {
    return Object.keys(obj).find(k => compare(obj[k], value));
  }
  store.commit('requestButton/CHANGE_BUTTONLOADING', {
    key: type || findKey(store.state.requestButton, true),
    value: false
  });
};

/**
 * @description: 获取头像链接
 * @param {*} url
 * @return {*}
 */
export const getHeadImgUrl = (url) => {
  return url || require('@/assets/image/card-avatar.svg');
};

/**
 * 通过传入符号分割字符串
 * @param {*} str
 * @param {*} sign 通过某符号进行分割，默认采用空格
 */

export const splitBySign = (str, sign = ' ') => {
  return str ? str.split(sign).filter((item) => item && item.trim()) : [];
};

export const groupByScopeType = (users) => {
  const groupObj = groupBy(users, (item) => {
    if (item.userId) return SCOPELIST_TYPE.USER;
    if (item.id) return SCOPELIST_TYPE.DEPARTMENT;
  });
  const useEmployeesList = groupObj[SCOPELIST_TYPE.USER] || [];
  const useDepartmentList = groupObj[SCOPELIST_TYPE.DEPARTMENT] || [];
  return { useEmployeesList, useDepartmentList };
};

/**
 * @description: 属性改变监听
 * @param {object} newVal - 原始值
 * @param {object} oldVal - 改变的
 * @使用方法: 首先导入  import {checkChange} from '@/utils/common';   在组件的beforeUpdate生命周期中使用
 * @example : beforeUpdate{ checkChange(newVal, oldVal) }
 * @attention newVal 是 this.$options.data()中你需要监听是否改变的值 oldVal是改变的值 详细使用方法可以查看 朋友圈 beforeUpdate的使用 也可查看自动标签中自定义oldval newval的使用
 */
export const checkChange = (oldVal, newVal) => {
  window.sessionStorage.setItem('change', !isEqual(newVal, oldVal));
};

/**
 * @description 判断当前素材库类型是否是其他类型 (智能表单、雷达)
 * @param {int} type 当前需要判断的素材素类型
 * @return {Boolean} 当前是其他类型 (智能表单、雷达)
 */
export const isOtherMaterialType = (type) => {
  return [MEDIA_TYPE_RADARLINK, MEDIA_TYPE_SMARTFORM].includes(type);
};

/**
 * @description 当前账号所属的部门
 * @param store 当前vuex实例 传进来是由于该处无法使用this
 */
export const getUserDepartmentInfo = async(store) => {
  const userRes = await getUserInfo({ userId: store.getters?.userId });
  if (!userRes?.data || !userRes?.data?.department) return false;
  const { data: { department, departmentName }} = userRes;
  return {
    department,
    departmentName
  };
};
