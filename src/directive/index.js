import hasRole from './permission/hasRole';
import hasPermi from './permission/hasPermi';
import preventReClick from './preventReClick';
import copy from './copy';
const install = function(Vue) {
  Vue.directive('hasRole', hasRole);
  Vue.directive('hasPermi', hasPermi);
  Vue.directive('preventReClick', preventReClick);
  Vue.directive('copy', copy);
};

if (window.Vue) {
  window['hasRole'] = hasRole;
  window['hasPermi'] = hasPermi;
  Vue.use(install) // eslint-disable-line
}

export default install;
