<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { SERVER_TYPE_INTERNAL } from '@/utils/constant/index';
import { PAGE_FROM_PATH } from '@/utils/constant/routePath';
export default {
  name: 'App',
  computed: {
    serverType() {
      return this.$store.state.serverInfo.serverType;
    }
  },
  watch: {
    serverType(val) {
      // 多租户模式不调用登录秘钥
      if (val === SERVER_TYPE_INTERNAL) {
        this.getPublicKey();
      }
    },
    $route(to, from) {
      /**
       * @description 设置是否需要保留搜索条件 1.是否是从列表页进去的页面 比如 详情、编辑、新增。2.是否是新增
       * 编辑：进入编辑页后，点击保存按钮，保存成功，回到当前页，保留之前的搜索条件；
       * 新增/导入：进入编辑页后，点击保存按钮，新增成功，切换到第一页，不保留搜索条件；
       * 返回：点击新增或编辑按钮，进入编辑页，此时没有保存，点击了页面顶部的返回按钮，则回到当前页，保留之前的搜索条件；
       * 进入详情页：点击页面顶部的返回按钮，则回到当前页，保留之前的搜索条件；
       * 删除/批量删除：操作成功后，更新当前页数据（假设当前页所有数据删除，导致页面空白，为正常情况），保留之前的搜索条件；
       * 批量操作（批量打标签/批量移除标签）：操作成功后，更新当前页数据，保留之前的搜索条件；
       */
      // 针对新增后跳转到详情页 点击返回后回到列表页特殊处理
      if (to.query.addFlag) {
        this.$store.commit('SET_SAVE_CONDITION', false);
        return;
      }
      this.$store.commit('SET_SAVE_CONDITION', Boolean(PAGE_FROM_PATH[to.name]?.includes(from.name) && !this.$store.state.searchConditions.addFlag));
      if (PAGE_FROM_PATH[to.name]) {
        this.$store.commit('SET_ADD_FLAG', false);
      }
    }
  },
  methods: {
    // 获取RSA私钥
    getPublicKey() {
      this.$store.dispatch('GetPublicKey');
    }
  }
};
</script>
