// 错误状态码
export const errorCode = {
  '401': '认证失败，无法访问系统资源',
  '403': '当前操作没有权限',
  '404': '访问资源不存在',
  'default': '系统未知错误，请反馈给管理员'
};

// 成功状态码
export const successCode = 200;
// XMLHttpRequest 请求已完成且响应已就绪
export const readyStateSucCode = 4;
// 登录过期
const LOGIN_OVERDUE = 401;
// 公用异常状态码，此状态码使用后端返回的msg提示
export const ERR_CODE = 400;
// 被后台强制退出
const FORCED_EXIT = 405;
// 管理员变更CORPID强制退出
const CORP_CHANGED_EXIT = 406;
const SERVER_ERRCODE = 500;
const WECOM_CONFIG_ERRCODE = 503;
// 其他状态码
export const otherCode = {
  'loginOverdue': LOGIN_OVERDUE,
  'serverCode': SERVER_ERRCODE,
  'wecomConfigErr': WECOM_CONFIG_ERRCODE,
  'corpChangedExit': CORP_CHANGED_EXIT,
  'forcedExit': FORCED_EXIT
};
