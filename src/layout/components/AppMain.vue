<template>
  <transition name="fade-transform" mode="out-in">
    <keep-alive v-if="isKeep">
      <router-view v-if="$route.meta.keepAlive" :key="key" class="page app-main" />
      <router-view v-else :key="key + new Date().getTime()" />
    </keep-alive>
    <router-view v-else :key="key" class="page app-main" />
  </transition>
</template>

<script>
import { CUSTOMER_PATH, CUSTOMER_DEATIL_PATH } from '@/utils/constant';

export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.path;
    },
    /**
     * 从详情页返回时,使用keep-alive保留查询条件和页码
     */
    isKeep() {
      /** 需要缓存的页面 */
      const keepAliveList = [CUSTOMER_DEATIL_PATH, CUSTOMER_PATH, '/customerManage/customerCenter/BatchTagTaskDetail'];
      return keepAliveList.includes(this.$route.path);
    }
  }
};
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  // min-height: calc(100vh - 50px);
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  // background-color: #fff;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
