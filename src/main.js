/* eslint-disable space-before-function-paren */
import Vue from 'vue';

import Cookies from 'js-cookie';

import 'normalize.css/normalize.css'; // a modern alternative to CSS resets

import Element from 'element-ui';
import './styles/element-variables.scss';
const MSG_DURATION = 2000;

Vue.use(Element, {
  size: Cookies.get('size') || 'small' // set element-ui default size
});
import '@/styles/icon.scss'; // common css
import '@/styles/common.scss'; // common css
import '@/styles/index.scss'; // global css
import 'video.js/dist/video-js.css';

import App from './App';
import store from './store';
import router from './router';
import directive from './directive';

import './assets/icons'; // icon
import './permission'; // permission control
import { getDicts } from '@/api/system/dict/data';
import {
  parseTime,
  resetForm,
  addDateRange,
  selectDictLabel,
  selectDictLabels,
  download,
  handleTree
} from '@/utils/common';

import Pagination from '@/components/Pagination';
// 自定义表格工具扩展
import RightToolbar from '@/components/RightToolbar';
import Upload from '@/components/Upload';
import UploadTxt from '@/components/UploadTxt';
import BorderColor from '@/components/ThemeComponents/BorderColor';
import ReturnPage from '@/components/ReturnPage';
// 全局方法挂载
Vue.prototype.getDicts = getDicts;
Vue.prototype.parseTime = parseTime;
Vue.prototype.resetForm = resetForm;
Vue.prototype.addDateRange = addDateRange;
Vue.prototype.selectDictLabel = selectDictLabel;
Vue.prototype.selectDictLabels = selectDictLabels;
Vue.prototype.download = download;
Vue.prototype.handleTree = handleTree;

Vue.prototype.msgSuccess = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'success', duration: MSG_DURATION });
};

Vue.prototype.msgError = function (msg) {
  this.$message({ showClose: true, message: msg, type: 'error', duration: MSG_DURATION });
};

Vue.prototype.msgInfo = function (msg) {
  this.$message({ type: 'info', message: msg, duration: MSG_DURATION });
};
Vue.prototype.msgWarn = function (msg) {
  this.$message({ type: 'warning', message: msg, duration: MSG_DURATION });
};
// 公共确认弹窗
Vue.prototype.confirmModal = function (options, callback, cancelFun = () => { }) {
  const msg = options.msg;
  const title = options.title || '操作须知';
  const newOptions = {
    type: 'warning',
    ...options
  };
  this.$confirm(msg, title, newOptions).then(() => {
    callback();
  }).catch(() => {
    cancelFun();
  });
};

// eslint-disable-next-line no-extend-native
Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

import { pickerOptions } from '@/utils/index';
Vue.prototype.pickerOptions = pickerOptions;

import VideoPlayer from 'vue-video-player';
Vue.use(VideoPlayer);

// 全局组件挂载
Vue.component('Pagination', Pagination);
Vue.component('RightToolbar', RightToolbar);
Vue.component('Upload', Upload);
Vue.component('UploadTxt', UploadTxt);
Vue.component('BorderColor', BorderColor);
Vue.component('ReturnPage', ReturnPage);
Vue.use(directive);

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  const whitePathName = ['CustomerAssistantAdd', 'CustomerAssistantEdit', 'EditForm', 'ConversionCodeAdd', 'Role', 'AddRule', 'CustomerCenter/customerDetail', 'StaffAdd', 'CustomerGroupDetail', 'NewCustomerAev', 'OldCustomerAev', 'WelcomeAdd', 'GroupWelcomeAdd', 'Add', 'Release', 'AddSOP']; // 拦截需要提示的路由name //所有的编辑页
  if (from.path !== '/' && !whitePathName.includes(from.name)) {
    window.sessionStorage.setItem('from', from.path); // 设置编辑页从哪个路由跳转来 在返回的时候使用push
  }
  // 若当前是通过浏览器返回,则不进行拦截
  if (window.history && window.history.pushState) {
    if (document.URL.split('#')[1] !== from.fullPath) {
      return next();
    }
  }
  if (!whitePathName.includes(from.name)) return next();
  if (window.sessionStorage.getItem('change') === 'true') {
    Vue.prototype.$confirm('离开后，当前页面更改内容不会保存，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      next();
      window.sessionStorage.setItem('change', false);
    }).catch(() => {
      next(false);
    });
  } else {
    next();
  }
});
new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App)
});
