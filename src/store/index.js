import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import user from './modules/user';
import permission from './modules/permission';
import enterPriseWechatConfig from './modules/enterPriseWechatConfig';
import serverInfo from './modules/serverInfo';
import getters from './getters';
import materialInfo from './modules/materialInfo';
import customerProperty from './modules/customerPropertyList';
import listInfo from './modules/listInfo';
import requestButton from './modules/requestButton';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    enterPriseWechatConfig,
    serverInfo,
    materialInfo,
    customerProperty,
    listInfo,
    requestButton
  },
  getters
});

export default store;
