import { constantRoutes } from '@/router';
import { getRouters } from '@/api/menu';
import Layout from '@/layout/index';
import View from '@/layout/components/View';

const permission = {
  state: {
    routes: [],
    addRoutes: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes;
      state.routes = constantRoutes.concat(routes);
    }
  },
  actions: {
    // 生成路由
    GenerateRoutes({ commit }) {
      return new Promise((resolve) => {
        // 向后端请求路由数据
        getRouters().then((res) => {
          const accessedRoutes = filterAsyncRouter(res.data);
          accessedRoutes.push({ path: '*', redirect: '/404', hidden: true });
          commit('SET_ROUTES', accessedRoutes);
          resolve(accessedRoutes);
        });
      });
    }
  }
};

// 确认其自身是有权限的功能页面，或其子树中有一个是
const checkCanRedirect = childrenRoute => {
  if (childrenRoute.children) {
    return childrenRoute.children.find(checkCanRedirect);
  } else {
    return !childrenRoute.hidden;
  }
};

// 遍历后台传来的路由字符串，转换为组件对象
let level = 0;
function filterAsyncRouter(asyncRouterMap) {
  level++;
  const res = asyncRouterMap.filter((route) => {
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === 'Layout') {
        if (route.redirect === 'noRedirect' && route.children.length) {
          const routeChildren = route.children.find(checkCanRedirect);
          route.redirect = route.path + '/' + routeChildren?.path;
          // 子节点是目录
          if (routeChildren?.redirect === 'noRedirect' && routeChildren.children?.length) {
            const twoRouteChildren = routeChildren.children.find(checkCanRedirect);
            route.redirect = route.redirect + '/' + twoRouteChildren?.path;
          }
        }
        if (level !== 1) {
          route.component = View;
        } else {
          route.component = Layout;
        }
      } else {
        route.component = loadView(route.component);
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children);
    }
    return true;
  });
  level--;
  return res;
}

export const loadView = (view) => {
  // 路由懒加载
  return (resolve) => require([`@/views/${view}`], resolve);
};

export default permission;
