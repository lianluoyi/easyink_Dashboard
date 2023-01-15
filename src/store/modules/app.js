import Cookies from 'js-cookie';

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus')
      ? !!+Cookies.get('sidebarStatus')
      : true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium',
  busininessDesc: undefined
};

const mutations = {
  TOGGLE_SIDEBAR: (_state) => {
    _state.sidebar.opened = !_state.sidebar.opened;
    _state.sidebar.withoutAnimation = false;
    if (_state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1);
    } else {
      Cookies.set('sidebarStatus', 0);
    }
  },
  CLOSE_SIDEBAR: (_state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0);
    _state.sidebar.opened = false;
    _state.sidebar.withoutAnimation = withoutAnimation;
  },
  TOGGLE_DEVICE: (_state, device) => {
    _state.device = device;
  },
  SET_SIZE: (_state, size) => {
    _state.size = size;
    Cookies.set('size', size);
  },
  SET_busininessDesc: (_state, busininessDesc) => {
    _state.busininessDesc = busininessDesc;
  }
};

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR');
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation);
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device);
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size);
  },
  setBusininessDesc({ commit }, busininessDesc) {
    commit('SET_busininessDesc', busininessDesc);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
