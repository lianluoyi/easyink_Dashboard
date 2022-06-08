import Vue from 'vue';
import Vuex from 'vuex';
import getters from '../src/store/getters';
import modules from '../src/store/modules';

Vue.use(Vuex);

/**
 * 使styleguide也能读取到vuex
 */
const store = new Vuex.Store({
  modules: modules,
  getters
});

export default previewComponent => {
  return {
    store,
    render(createElement) {
      return createElement(previewComponent);
    }
  };
};
