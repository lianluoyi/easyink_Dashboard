import axios from 'axios';
import { Notification, MessageBox, Message } from 'element-ui';
import store from '@/store';
import { changeButtonLoading } from '@/utils/common';
import { getToken } from '@/utils/auth';
import { errorCode, successCode, otherCode } from '@/utils/httpCode';
const ERR_MSG_DURATION = 2000;
const SUCCESS_MSG_DURATION = 2000;
const AXIOS_TIMEOUT = 60000;

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例
const request = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL:
    process.env.NODE_ENV === 'development'
      ? '/api'
      : process.env.VUE_APP_BASE_API,
  // 超时
  timeout: AXIOS_TIMEOUT
});
// request拦截器
request.interceptors.request.use(
  (config) => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    if (getToken() && !isToken) {
      config.headers = window.CONFIG.headers; // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || successCode;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default'];
    const disableErrMsg = res.config.disableErrMsg;
    // 三方登录接口特殊处理
    if (res.config.url === '/api/qrCodeLogin3rd') {
      if (code === successCode) {
        return res.data;
      } else {
        return Promise.reject(res.data);
      }
    }
    switch (code) {
      case successCode: {
        return res.data;
      }
      case otherCode['loginOverdue']: {
        dealLoginModal('登录状态已过期，您可以继续留在该页面，或者重新登录');
        break;
      }
      case otherCode['corpChangedExit']: {
        dealLoginModal('当前系统所属企业已修改，为保证您的正常使用，请登录新的企业');
        break;
      }
      case otherCode['forcedExit']: {
        dealLoginModal('您的账号已被踢下线，您可以继续留在该页面，或者重新登录');
        break;
      }
      case otherCode['serverCode']: {
        if (!disableErrMsg) {
          Message({
            message: msg,
            type: 'error',
            duration: SUCCESS_MSG_DURATION
          });
        }
        changeButtonLoading(store);
        return Promise.reject(res.data);
      }
      case otherCode['wecomConfigErr']: {
        changeButtonLoading(store);
        return Promise.reject(res.data);
      }
      default: {
        if (!disableErrMsg) {
          Notification.error({
            title: msg
          });
        }
        changeButtonLoading(store);
        return Promise.reject(res.data);
      }
    }
  },
  (error) => {
    changeButtonLoading(store);
    console.log('err' + error);
    let { message } = error;
    const { response, config } = error;
    if (message === 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Invalid URL')) {
      message = 'URL访问失败，请重新检查';
      MessageBox.confirm(
        message,
        '系统提示',
        {
          type: 'warning',
          confirmButtonText: '知道了',
          showCancelButton: false

        }
      );
    } else if (response) {
      const status = response.status;
      message = '系统接口:' + status + '异常';
    }
    Message({
      message: `${message}:${config.url}`,
      type: 'error',
      duration: ERR_MSG_DURATION
    });
    return Promise.reject();
  }
);

function dealLoginModal(msg) {
  if (!window.location.href.includes('/login')) {
    MessageBox.confirm(
      msg,
      '系统提示',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      store.dispatch('LogOut').then(() => {
        location.href = '/';
      });
    });
  }
}

export default request;
