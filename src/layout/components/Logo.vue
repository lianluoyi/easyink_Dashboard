<template>
  <div class="logo-container" :class="{ collapse: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        key="collapse"
        class="sidebar-logo-link"
        to="/"
      >
        <div v-if="companyName" class="logo-container-left">
          <div>
            <svg class="icon-easyWeCom_logo_white">
              <use href="#icon-easyWeCom_logo_white" />
            </svg>
          </div>
          <div class="logo-container-left-text">
            <p class="logo-name">easyink</p>
            <p class="logo-company-name">{{ companyName }}</p>
          </div>
        </div>
        <div v-else class="logo-no-company-name">
          <svg class="icon-easyWeCom_logo_white">
            <use href="#icon-easyWeCom_logo_white" />
          </svg>
          <p class="text-no-company-name">easyink</p>
        </div>
      </router-link>
    </transition>
  </div>
</template>

<script>
import logoImg from '@/assets/logo/logo.svg';
import { mapGetters } from 'vuex';

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean
      // required: true,
    }
  },
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      logo: logoImg
    };
  },
  computed: {
    ...mapGetters(['companyName'])
  }
};
</script>

<style lang="scss" scoped>
.logo-container-left svg{
  width: 35px;
  height: 35px;
}
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.logo-container {
  position: relative;
  width: 210px;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      // height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
  .logo-container-left{
    display: flex;
    margin-left: 20px;
  }
  .logo-company-name{
    font-size: 12px;
    width: 144px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-top: 3px;
    text-align: left;

  }
  .logo-name{
    font-size: 16px;
    text-align: left;
  }
  .logo-container-left-text{
    margin-left: 5px;
  }
  .logo-no-company-name{
    display: flex;
  }
  .logo-no-company-name svg{
    width: 25px;
    height: 25px;
    margin-right: 5px;
    margin-left: 20px;
  }
  .text-no-company-name{
    font-size: 16px;
    text-align: left;
    line-height: 25px;
  }
}
</style>
