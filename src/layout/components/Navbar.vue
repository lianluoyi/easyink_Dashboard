<template>
  <div class="navbar main-size">
    <logo />
    <el-scrollbar class="nav-scrollbar">
      <template v-for="(route, index) in permission_routes">
        <div
          v-if="!route.hidden"
          :key="route.path + index"
          :class="['nav', $route.path.startsWith(route.path) && 'active']"
          @click="goLink(route.path)"
        >
          {{ route.meta && route.meta.title }}
        </div>
      </template>
    </el-scrollbar>

    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <!-- <search id="header-search" class="right-menu-item" /> -->

        <!-- <screenfull id="screenfull" class="right-menu-item hover-effect" /> -->
      </template>
      <div class="version-introduced flex mr10 cp" @click="openUrl">
        <span>版本介绍</span>
        <svg v-if="showNewVersion" class="icon-new" :width="24" :height="24" style="margin-left: 3px;">
          <use href="#icon-new" />
        </svg>
      </div>
      <svg class="icon-skin" :width="25" :height="25" @click="openChangeTheme">
        <use href="#icon-skin" />
      </svg>
      <span class="icon-line" />
      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <div class="avatar-wrap">
            <img :src="avatarUrl" class="user-avatar" @error="avatarLoadError">
          </div>
          <span v-if="this.$store.state.user.isSuperAdmin">{{ this.$store.state.user.name }}</span>
          <WwOpenData v-else type="userName" :openid="this.$store.state.user.userId" />
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>我的账号</el-dropdown-item>
          </router-link>
          <!-- <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item> -->
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <SkinDrawer :visible.sync="themeVisible" />
  </div>
</template>

<script>
import store from '@/store';
import { isExternal } from '@/utils/validate';
import { mapGetters } from 'vuex';
import Logo from './Logo';
import WwOpenData from '@/components/wwOpenData.vue';
import SkinDrawer from './SkinDrawer.vue';
import { getCurrVersion } from '@/api/pagehome';

export default {
  components: {
    Logo,
    WwOpenData,
    SkinDrawer
  },
  data() {
    return {
      avatarUrl: store.getters.avatar || require('@/assets/image/admin-avatar.svg'),
      themeVisible: false,
      /** 版本介绍链接 */
      versionNoteUrl: '',
      /** 是否显示新版本提醒 */
      showNewVersion: false
    };
  },
  computed: {
    ...mapGetters(['avatar', 'device', 'permission_routes']),
    setting: {
      get() {
        return this.$store.state.settings.showSettings;
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        });
      }
    }
  },
  watch: {
    avatar(val) {
      this.avatarUrl = val;
    }
  },
  created() {
    // 获取当前版本号
    this.getCurrVersion();
  },
  methods: {
    async logout() {
      this.confirmModal({
        msg: '即将退出系统，是否继续？'
      }, () => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/';
        });
      });
    },
    goLink(path) {
      if (!isExternal(path)) {
        this.$router.push({ path });
      } else {
        window.open(path, '_blank');
      }
    },
    avatarLoadError() {
      this.avatarUrl = require('@/assets/image/admin-avatar.svg');
    },
    openChangeTheme() {
      this.themeVisible = true;
    },
    /**
     * 截取版本号前两位
     */
    subPreTwo(text) {
      if (!text) return '';
      const index = text.lastIndexOf('.');
      const stableVersion = text.substr(0, index);
      return stableVersion || '';
    },
    /**
     * 获取当前版本
     */
    getCurrVersion() {
      getCurrVersion().then(res => {
        const currentVersion = res.data.version;
        const preVersion = localStorage.getItem('versionView');
        this.showNewVersion = this.subPreTwo(currentVersion) !== this.subPreTwo(preVersion);
        this.currentVersion = currentVersion;
        this.versionNoteUrl = res.data.notes;
      });
    },
    /**
     * 打开版本介绍链接
     */
    openUrl() {
      localStorage.setItem('versionView', this.currentVersion);
      this.showNewVersion = false;
      window.open(this.versionNoteUrl);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.navbar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    position: absolute;
    right: 0;
    display: flex;
    align-items: center;
    &:focus {
      outline: none;
    }
    .version-introduced {
      align-items: center;
    }
    .icon-skin {
      cursor: pointer;
    }
    .right-menu-item {
      display: inline-block;
      padding: 0 8px 0 0;
      font-size: 18px;
      // color: #5a5e66;
      vertical-align: middle;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        position: relative;
        color: #fff;
        display: flex;
        align-items: center;
        font-size: 14px;
        .avatar-wrap {
          width: 31px;
          height: 31px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 10px;
          background: #Fff;
        }
        .user-avatar {
          @include border_color();
          cursor: pointer;
          width: 35px;
          height: 35px;
          position: relative;
          top: -2px;
          left: -2px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          font-size: 12px;
          margin-left: 10px;
        }
      }
    }
  }
}

.nav-scrollbar {
  width: calc(100% - 450px);
  /deep/.el-scrollbar__view {
    white-space: nowrap;
    line-height: 58px;
  }
  .nav {
    display: inline-block;
    margin: 0 20px;
    flex: none;
    position: relative;
    font-size: 15px;
    cursor: pointer;
    &.active::after {
      content: '';
      display: inline-block;
      position: absolute;
      bottom: 2px;
      width: 42px;
      height: 2px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 6px;
      background: #fff;
    }
  }
}
.icon-line {
  width: 1px;
  height: 15px;
  margin: 0 10px;
  border-right: 1px solid #D9D9D9;
}
</style>
