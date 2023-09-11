<template>
  <div :class="classObj" class="app-wrapper">
    <div class="top-wrap">
      <navbar />
    </div>
    <div class="main-wrap">
      <div class="main main-size">
        <sidebar v-if="$route.name !== '首页' && $route.name !== '我的账号'" class="sidebar-container" />
        <div class="main-container">
          <div v-show="$route.name !== '首页' && $route.name !== '我的账号'">
            <hamburger id="hamburger-container" class="hamburger-container" />
            <breadcrumb
              id="breadcrumb-container"
              class="breadcrumb-container"
            />
          </div>
          <app-main />
        </div>
        <customer-service-popover v-if="$store.state.serverInfo.serverType === SERVER_TYPE_THIRD" />
      </div>
    </div>
  </div>
</template>

<script>
import '@/config';
import { AppMain, Navbar, Sidebar } from './components';
import Breadcrumb from './components/Breadcrumb';
import Hamburger from './components/Hamburger';
import CustomerServicePopover from '../components/CustomerServicePopover';

import ResizeMixin from './mixin/ResizeHandler';
import { mapState } from 'vuex';
import { SERVER_TYPE_THIRD } from '@/utils/constant/index';

export default {
  name: 'Layout',
  components: {
    Breadcrumb,
    Hamburger,
    AppMain,
    Navbar,
    Sidebar,
    CustomerServicePopover
  },
  mixins: [ResizeMixin],
  data() {
    return {
      SERVER_TYPE_THIRD
    };
  },
  computed: {
    //  ...mapGetters(['sidebar', 'avatar', 'device']),
    ...mapState({
      sidebar: (state) => state.app.sidebar,
      device: (state) => state.app.device
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      };
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false });
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }

  .top-wrap {
    height: 65px;
    @include bg_color($color-theme2-1);
  }

  .main-wrap {
    height: calc(100vh - 65px);
    background: #eee;
    .main {
      height: 100%;
      padding: 10px;
      display: flex;
      align-items: stretch;
    }
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}

.hamburger-container {
  cursor: pointer;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}
.slogan {
  font-size: 22px;
  color: #999;
  vertical-align: middle;
}
</style>
