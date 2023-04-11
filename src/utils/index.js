import { parseTime } from './common';
import { MEDIA_TO_WELCOME_TYPE, WELCOME_APPENDIX_TYPE, WELCOME_TO_MEDIA_TYPE } from '@/utils/constant';
import moment from 'moment';
import { Notification } from 'element-ui';
const MS_TO_SECONDS = 1000;
const ONE_HOUR = 3600;
const ONE_DAY = 24;

// 赋值到剪贴板
export function copyText(text) {
  const input = document.createElement('input');
  input.value = text.toLocaleString();
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
  Notification.closeAll();
  Notification({
    title: '成功',
    message: '链接已复制到剪切板，可Ctrl+V粘贴',
    type: 'success'
  });
}

// 聊天记录时间格式化
export function dealTime(time) {
  const timeMoment = moment(parseTime(time));
  const isCurYear = moment().diff(timeMoment, 'year') === 0;
  const isToday = moment().dayOfYear() === timeMoment.dayOfYear();
  const isYesterday = moment().dayOfYear() === timeMoment.dayOfYear() + 1;
  if (isCurYear) {
    if (isToday) {
      return timeMoment.format('HH:mm');
    } else if (isYesterday) {
      return '昨天';
    } else {
      return timeMoment.format('MM-DD');
    }
  } else {
    return timeMoment.format('YYYY-MM-DD');
  }
}
/**
 * 表格时间格式化
 */
export function formatDate(cellValue) {
  const TWO_DIGITS = 10;
  if (cellValue == null || cellValue === '') return '';
  var date = new Date(cellValue);
  var year = date.getFullYear();
  var month =
    date.getMonth() + 1 < TWO_DIGITS ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var day = date.getDate() < TWO_DIGITS ? '0' + date.getDate() : date.getDate();
  var hours = date.getHours() < TWO_DIGITS ? '0' + date.getHours() : date.getHours();
  var minutes =
    date.getMinutes() < TWO_DIGITS ? '0' + date.getMinutes() : date.getMinutes();
  var seconds =
    date.getSeconds() < TWO_DIGITS ? '0' + date.getSeconds() : date.getSeconds();
  return (
    year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
  );
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  const TIME_LENGTH = 10;
  const JUST_NOW_SECONDS = 30;
  const ONE_MINUTE = 60;
  const TWO_DAYS = 2;

  if (('' + time).length === TIME_LENGTH) {
    time = parseInt(time) * MS_TO_SECONDS;
  } else {
    time = +time;
  }
  const d = new Date(time);
  const now = Date.now();

  const diff = (now - d) / MS_TO_SECONDS;

  if (diff < JUST_NOW_SECONDS) {
    return '刚刚';
  } else if (diff < ONE_HOUR) {
    // less 1 hour
    return Math.ceil(diff / ONE_MINUTE) + '分钟前';
  } else if (diff < ONE_HOUR * ONE_DAY) {
    return Math.ceil(diff / ONE_HOUR) + '小时前';
  } else if (diff < ONE_HOUR * ONE_DAY * TWO_DAYS) {
    return '1天前';
  }
  if (option) {
    return parseTime(time, option);
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    );
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url;
  const search = url.substring(url.lastIndexOf('?') + 1);
  const obj = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  const BYTE_7F = 0x7f;
  const BYTE_7FF = 0x7ff;
  const BYTE_FFFF = 0xffff;
  const BYTE_DC00 = 0xdc00;
  const BYTE_DFFF = 0xdfff;
  const ADD_COUNT = 2;
  // returns the byte length of an utf8 string
  let s = str.length;
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > BYTE_7F && code <= BYTE_7FF) s++;
    else if (code > BYTE_7FF && code <= BYTE_FFFF) s += ADD_COUNT;
    if (code >= BYTE_DC00 && code <= BYTE_DFFF) i--;
  }
  return s;
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return '';
  return cleanArray(
    Object.keys(json).map((key) => {
      if (json[key] === undefined) return '';
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
    })
  ).join('&');
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ');
  if (!search) {
    return {};
  }
  const obj = {};
  const searchArr = search.split('&');
  searchArr.forEach((v) => {
    const index = v.indexOf('=');
    if (index !== -1) {
      const name = v.substring(0, index);
      const val = v.substring(index + 1, v.length);
      obj[name] = val;
    }
  });
  return obj;
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div');
  div.innerHTML = val;
  return div.textContent || div.innerText;
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {};
  }
  if (Array.isArray(source)) {
    return source.slice();
  }
  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property];
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty);
    } else {
      target[property] = sourceProperty;
    }
  });
  return target;
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return;
  }
  let classString = element.className;
  const nameIndex = classString.indexOf(className);
  if (nameIndex === -1) {
    classString += '' + className;
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length);
  }
  element.className = classString;
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - ONE_HOUR * MS_TO_SECONDS * ONE_DAY * THREE_MONTH;
  } else {
    return new Date(new Date().toDateString());
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result;

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function(..._args) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, _args);
      context = _args = null;
    }

    return result;
  };
}

/**
 * 深拷贝
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone');
  }
  const targetObj = source && source.constructor === Array ? [] : {};
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr));
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + '';
  const RANDOM_NUM = 65536;
  const STRING_RADIX = 32;
  const randomNum = parseInt((1 + Math.random()) * RANDOM_NUM) + '';
  return (+(randomNum + timestamp)).toString(STRING_RADIX);
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls;
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
    ele.className = ele.className.replace(reg, ' ');
  }
}

export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null);
  const list = str.split(',');
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => map[val.toLowerCase()] : (val) => map[val];
}

export const exportDefault = 'export default ';

export const beautifierConf = {
  html: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'separate',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  },
  js: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: true,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  }
};

// 首字母大小
export function titleCase(str) {
  return str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

// 下划转驼峰
export function camelCase(str) {
  return str.replace(/-[a-z]/g, (str1) => str1.substr(-1).toUpperCase());
}

export function isNumberStr(str) {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str);
}

const ONE_MONTH = 30;
const ONE_WEEK = 7;
const THREE_MONTH = 90;
// 日期快捷选项
export const pickerOptions = {

  disabledDate(time) {
    return time.getTime() > Date.now();
  },
  shortcuts: [
    {
      text: '最近一周',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - ONE_HOUR * MS_TO_SECONDS * ONE_DAY * ONE_WEEK);
        picker.$emit('pick', [start, end]);
      }
    },
    {
      text: '最近一个月',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - ONE_HOUR * MS_TO_SECONDS * ONE_DAY * ONE_MONTH);
        picker.$emit('pick', [start, end]);
      }
    },
    {
      text: '最近三个月',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - ONE_HOUR * MS_TO_SECONDS * ONE_DAY * THREE_MONTH);
        picker.$emit('pick', [start, end]);
      }
    }
  ]
};

export const goRouteWithQuery = (router, path, query, otherQuery) => {
  const apiQuery = {};
  Object.keys(query).forEach(key => {
    apiQuery[key + '_'] = query[key];
  });
  router.push({
    path,
    query: { ...otherQuery, ...apiQuery }
  });
};

/**
 * 获取数组中重复的数据
 * @param {*} list
 * @returns
 */
export const getRepeatItem = (list) => {
  var tmp = [];
  list.sort().sort(function(a, b) {
    if (a === b && tmp.indexOf(a) === -1) {
      tmp.push(a);
    }
  });
  return tmp;
};

/**
     * 将素材库的素材类型转换为欢迎语的素材类型
     */
export const dealAppendixType = (list) => {
  if (!list || !list.length) return [];
  return list.map(item => {
    let materialObj = {};
    switch (MEDIA_TO_WELCOME_TYPE[item.mediaType]) {
      case WELCOME_APPENDIX_TYPE['img']:
      case WELCOME_APPENDIX_TYPE['file']:
      case WELCOME_APPENDIX_TYPE['video']: {
        materialObj = {
          ...item,
          picUrl: item.materialUrl,
          content: item.materialName,
          description: item.content,
          url: item.materialUrl,
          // 由于从素材库选择的带有id，所以需要做区分传参
          id: item.materialId || undefined
        };
        break;
      }
      case WELCOME_APPENDIX_TYPE['imgLink']: {
        materialObj = {
          ...item,
          url: item.materialUrl,
          picUrl: item.coverUrl,
          id: item.materialId || undefined,
          description: item.digest,
          content: item.materialName
        };
        break;
      }
      case WELCOME_APPENDIX_TYPE['miniApp']: {
        materialObj = { ...item,
          description: item.content,
          picUrl: item.coverUrl,
          url: item.materialUrl,
          id: item.materialId || undefined,
          content: item.materialName
        };
        break;
      }
      case WELCOME_APPENDIX_TYPE['radarLink']: {
        materialObj = { ...item,
          description: item.content,
          picUrl: item.coverUrl,
          url: item.materialUrl,
          content: item.materialName
        };
        break;
      }
      case WELCOME_APPENDIX_TYPE['smartForm']: {
        materialObj = { ...item };
        break;
      }
    }
    return { ...materialObj, type: MEDIA_TO_WELCOME_TYPE[item.mediaType] };
  });
};

/**
* 将附件类型转换为可展示的素材库素材类型
*/
export const dealAppendixTypeToMaterial = (list) => {
  if (!list || !list.length) return [];
  return list.map(item => {
    let materialObj = {};
    switch (item.type) {
      case WELCOME_APPENDIX_TYPE['img']:
      case WELCOME_APPENDIX_TYPE['file']:
      case WELCOME_APPENDIX_TYPE['video']: {
        materialObj = {
          materialUrl: item.picUrl,
          materialName: item.content,
          content: item.description,
          materialId: item.id
        };
        break;
      }
      case WELCOME_APPENDIX_TYPE['imgLink']: {
        materialObj = { materialUrl: item.url,
          coverUrl: item.picUrl,
          materialId: item.id,
          digest: item.description,
          materialName: item.content
        };
        break;
      }
      case WELCOME_APPENDIX_TYPE['miniApp']: {
        materialObj = {
          content: item.description,
          coverUrl: item.picUrl,
          materialUrl: item.url,
          materialId: item.id,
          digest: item.description,
          materialName: item.content
        };
        break;
      }
    }
    return { ...item, ...materialObj, mediaType: WELCOME_TO_MEDIA_TYPE[item.type], isAdded: true };
  });
};

// 更新URL上的某个参数值，并且页面不跳转
export function changeURLParams(key, value) {
  const url = window.location.href;
  const queryObj = getQueryObject(url); // 获取查询参数 (hash不可使用window.location.search)
  const params = new URLSearchParams(queryObj);
  // 更新特定参数值
  params.set(key, value);
  // 更新后的查询字符串
  const updateQueryString = params.toString();
  // 更新后的url
  const updateUrl = url.split('?')[0] + '?' + updateQueryString;
  window.history.pushState({}, 0, updateUrl);
}
