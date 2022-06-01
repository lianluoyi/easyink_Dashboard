<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :collapse-transition="false"
        :default-openeds="defaultOpens"
        mode="vertical"
      >
        <template v-for="(route, index) in newRoute">
          <sidebar-item
            :key="route.path + index"
            :item="route"
            :base-path="`${route.basePath}/${route.path}`"
          />
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SidebarItem from './SidebarItem';
import variables from '@/styles/variables.scss';

export default {
  components: { SidebarItem },
  data() {
    return {
      /**
       * 默认展开的菜单
       */
      defaultOpens: []
    };
  },
  computed: {
    ...mapGetters(['permission_routes', 'sidebar']),
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set

      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
    newRoute() {
      /**
       * 只显示二级菜单及下级菜单
       */
      // 过滤出当前模块的菜单
      const showRoute = this.permission_routes.filter(route => this.$route.path.startsWith(route.path));
      // 过滤出没有隐藏的菜单
      const nowRoutes = showRoute.find(route => !route.hidden);
      const list = [];
        nowRoutes?.children?.map(item => {
          list.push({ ...item, basePath: nowRoutes.path });
        });
        return list;
    }
  },
  watch: {
    /**
     * 监听左侧菜单栏折叠状态改变
     */
    isCollapse(val) {
      // 左侧菜单栏展开时需要重新赋值默认展开的菜单，否则不会展开
      if (!val) {
        this.defaultOpens = [...this.defaultOpens];
      }
    }
  },
  mounted() {
    const defaultList = [];
    // 找出二级菜单的路由
    this.permission_routes.map(item => {
      defaultList.push(`${item.path}`);
      if (!item.hidden) {
        item.children.map(childItem => {
          if (!childItem.hidden) {
            defaultList.push(`${item.path}/${childItem.path}/${childItem.path}`);
          }
        });
      }
    });
    this.defaultOpens = defaultList;
  }
};
</script>
