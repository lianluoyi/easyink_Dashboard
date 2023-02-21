import router from './router';
import store from './store';
import { Message } from 'element-ui';
import { getToken } from '@/utils/auth';
import { GET_INFO_ERROR } from '@/utils/constant';
import { getNowTheme } from '@/utils/common';

const whiteList = ['/login', '/bind', '/register', '/test'];
const MSG_DURATION = 2000;
// 判断是否完成配置
const NUMBER = '2';
// 登录后校验是否配置通讯录，没有则跳转至企微配置
const checkLogin = (from, data, next) => {
  // 这里判断登录的时候页面的跳转
  if (from.path === '/login') {
    if (!data || (!data.corpId || !data.contactSecret || (data.status === NUMBER))) {
      next({ path: '/system/configCenter/enterpriseWechat' });
    }
  }
};

router.beforeEach((to, from, next) => {
  if (getToken()) {
    getNowTheme();
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' });
    } else {
      if (store.getters.roles.length === 0) {
        // 获取系统类型
        store.dispatch('GetServerType');
        // 获取是否为代开发
        store.dispatch('SET_DK_CORP');
        // 判断当前用户是否已拉取完user_info信息
        store
          .dispatch('GetInfo')
          .then((res) => {
            // 拉取user_info
            const roles = res.data.roles;
            store.dispatch('GenerateRoutes', { roles }).then((accessRoutes) => {
              // 测试 默认静态页面
              // store.dispatch('permission/generateRoutes', { roles }).then(accessRoutes => {
              // 根据roles权限生成可访问的路由表
              router.addRoutes(accessRoutes); // 动态添加可访问路由表
              // 判断是否有设置企业微信id
              // if (res.user && res.user.isSuperAdmin) {
              // 设置了企业微信，正常跳转
              next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
              // } else {
              // 没有设置企业微信的
              // let isEnterpriseWechat = accessRoutes.findIndex((element) => {
              //   element.path === '/_enterpriseWechat';
              // });
              // 若有设置企业微信的页面权限，默认跳转到设置企业微信页面
              // if (isEnterpriseWechat > -1) {
              //   next({ path: '/enterpriseWechat', replace: true });
              // } else {
              // 没有权限的给予提示，并退回登录页面
              // Message.error('没有设置企业微信的权限，请联系系统管理员');
              // next({ path: '/login', replace: true });
              // }
              // }
              // 设置企微配置全局变量
              store.dispatch('GetConfig').then(response => {
                checkLogin(from, response.data, next);
              }).catch(() => {
                checkLogin(from, null, next);
              });
            });
          })
          .catch((err) => {
            store.dispatch('FedLogOut').then(() => {
              // GetInfo错误则不提示
              err && err.message !== GET_INFO_ERROR && Message({
                message: err,
                type: 'error',
                duration: MSG_DURATION
              });
              next({ path: '/' });
            });
          });
      } else {
        next();
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        // if (hasPermission(store.getters.roles, to.meta.roles)) {
        //   next()
        // } else {
        //   next({ path: '/401', replace: true, query: { noGoBack: true }})
        // }
        // 可删 ↑
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
    }
  }
});

