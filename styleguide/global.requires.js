/*
 * @Description: 公共组件文档样式导入第三方插件
 * @Author: zhengshilan
 * @LastEditors: zhengshilan
 */
import Vue from 'vue';
import Element from 'element-ui';
import '@/styles/element-variables.scss';
import '@/styles/common.scss'; // common css
import '@/styles/icon.scss'; // common css
import '@/styles/index.scss'; // global css
import Cookies from 'js-cookie';

Vue.use(Element, {
  size: Cookies.get('size') || 'small' // set element-ui default size
});
