import { getToken } from '@/utils/auth';

window.CONFIG = {
  /**
   * 是否系统布局配置
   */
  showSettings: false,
  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',

  services: {
    wecom: '/wecom',
    common: '/common',
    wechatopen: '/wechatopen'
  },

  /**
   * 前端生成群活码跳转的H5链接
   * 由于群活码是由前端生成，需要配置一下群活码跳转的链接
   * 例如: http://xxx.xxx.xx/h5/groupCode
   */
  groupCodeH5Link: '',

  get headers() {
    return { Authorization: 'Bearer ' + getToken() };
  }
};
// 统一为img的src不是绝对地址的拼接接口地址
document.addEventListener(
  'error',
  // eslint-disable-next-line space-before-function-paren
  function (e) {
    const target = e.target;
    const src = target.attributes.getNamedItem('src').value;
    if (
      target.tagName.toUpperCase() === 'IMG' &&
      src &&
      !src.includes('http') &&
      !src.includes(process.env.VUE_APP_BASE_API)
    ) {
      target.src = process.env.VUE_APP_BASE_API + src;
    }
  },
  true
);

export default window.CONFIG;
