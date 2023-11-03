/* eslint-disable no-magic-numbers */
// 每页大小
export const PAGE_LIMIT = 10;
export const PAGE_LIMIT_TWENTY = 20;
export const PAGE_LIMIT_THIRTY = 30;
export const PAGE_LIMIT_FIFTY = 50;
export const PAGE_LIMIT_INFINITE = 999;
export const DEFAULT_PAGE_NUM = 1;
// 海报
export const MEDIA_TYPE_POSTER = '0';
// 语音
export const MEDIA_TYPE_AUDIO = '1';
// 视频
export const MEDIA_TYPE_VIDEO = '2';
// 普通文件
export const MEDIA_TYPE_FILE = '3';
// 文本
export const MEDIA_TYPE_TEXT = '4';
// 图文链接
export const MEDIA_TYPE_IMGLINK = '5';
// 小程序
export const MEDIA_TYPE_MINIAPP = '6';
// 雷达链接
export const MEDIA_TYPE_RADARLINK = '7';
/** 智能表单链接 */
export const MEDIA_TYPE_SMARTFORM = '8';

// 素材库类型
export const MEDIA_TYPE = {
  [MEDIA_TYPE_POSTER]: '海报',
  [MEDIA_TYPE_AUDIO]: '语音',
  [MEDIA_TYPE_VIDEO]: '视频',
  [MEDIA_TYPE_FILE]: '文件',
  [MEDIA_TYPE_TEXT]: '文本',
  [MEDIA_TYPE_IMGLINK]: '链接',
  [MEDIA_TYPE_MINIAPP]: '小程序',
  [MEDIA_TYPE_RADARLINK]: '雷达链接',
  [MEDIA_TYPE_SMARTFORM]: '智能表单'
};
// 群发附件类型
export const MESSAGE_MEDIA_TYPE = {
  [MEDIA_TYPE_POSTER]: '图片',
  [MEDIA_TYPE_VIDEO]: '视频',
  [MEDIA_TYPE_FILE]: '文件',
  [MEDIA_TYPE_IMGLINK]: '链接',
  [MEDIA_TYPE_MINIAPP]: '小程序',
  [MEDIA_TYPE_RADARLINK]: '雷达链接',
  [MEDIA_TYPE_SMARTFORM]: '智能表单'
};

// 链接默认摘要
export const IMG_LINK_DIGEST = '请点击查看链接';

export const FILE_EXCEL_TYPE = 'excelType';

export const STATUS_DIMISION = 6;

const HAS_JOIN = 1;
const HAS_DISABLED = 2;
const TO_JOIN = 4;
const OUT_OF_BUSINESS = 5;
const DEL_STATUS = 6;
export const STATUS_ACTIVATE = {
  [HAS_JOIN]: '已加入',
  [HAS_DISABLED]: '已禁用',
  [TO_JOIN]: '待加入',
  [OUT_OF_BUSINESS]: '退出企业',
  [DEL_STATUS]: '删除'
};

export const GENDER_OF_MALE = 1;
export const GENDER_OF_FEMALE = 2;
export const GENDER_OF_UNKNOWN = 3;
export const GENDER_TYPE_OF_UNKNOWN = 0;
export const GENDER_TYPE_OF_ALL = -1;

// 性别
export const GENDER_TYPE = {
  [GENDER_OF_MALE]: '男',
  [GENDER_OF_FEMALE]: '女',
  [GENDER_OF_UNKNOWN]: '未知'
};

export const GROUP_MESSAGE_GENDER_TYPE_ARRAY = [
  GENDER_TYPE_OF_ALL,
  GENDER_OF_MALE,
  GENDER_OF_FEMALE,
  GENDER_TYPE_OF_UNKNOWN
];
export const GROUP_MESSAGE_GENDER_TYPE = {
  [GENDER_TYPE_OF_ALL]: '全部',
  [GENDER_OF_MALE]: '男',
  [GENDER_OF_FEMALE]: '女',
  [GENDER_TYPE_OF_UNKNOWN]: '未知性别'
};

export const UNKNOW_SOURCE = '0';
export const ADD_BY_QRCODE = '1';
export const ADD_BY_PHONE = '2';
export const ADD_BY_BUSINESS_CARD = '3';
export const ADD_BY_GROUP = '4';
export const ADD_BY_PHONE_CONTACT = '5';
export const ADD_BY_WX_CONTACT = '6';
export const ADD_BY_WX = '7';
export const ADD_BY_THIRD_APP_AUTO = '8';
export const ADD_BY_MAIL = '9';
export const ADD_BY_CHANNEL = '10';
export const ADD_BY_INTERNAL_SHARE = '201';
export const ADD_BY_ADMIN = '202';
export const ADD_BY_SCHEDULE_PARTICIPATION = '11';
export const ADD_BY_CONFERENCE_PARTICIPATION = '12';
export const ADD_BY_WX_FRIEND = '13';
export const ADD_BY_INTELLIGENT_HARDWARE = '14';
export const ADD_BY_ON_SITE_SERVICE = '15';
export const ADD_BY_CUSTOMER_ASSISTANT = '16';
export const ADD_WAY_MAP = {
  [UNKNOW_SOURCE]: '未知来源',
  [ADD_BY_QRCODE]: '扫描二维码',
  [ADD_BY_PHONE]: '搜索手机号',
  [ADD_BY_BUSINESS_CARD]: '名片分享',
  [ADD_BY_GROUP]: '群聊',
  [ADD_BY_PHONE_CONTACT]: '手机通讯录',
  [ADD_BY_WX_CONTACT]: '微信联系人',
  [ADD_BY_THIRD_APP_AUTO]: '安装第三方应用时自动添加的客服人员',
  [ADD_BY_MAIL]: '搜索邮箱',
  [ADD_BY_CHANNEL]: '视频号添加',
  [ADD_BY_SCHEDULE_PARTICIPATION]: '通过日程参与人添加',
  [ADD_BY_CONFERENCE_PARTICIPATION]: '通过会议参与人添加',
  [ADD_BY_WX_FRIEND]: '添加微信好友对应的企业微信',
  [ADD_BY_INTELLIGENT_HARDWARE]: '通过智慧硬件专属客服添加',
  [ADD_BY_ON_SITE_SERVICE]: '通过上门服务客服添加',
  [ADD_BY_INTERNAL_SHARE]: '内部成员共享',
  [ADD_BY_ADMIN]: '管理员/负责人分配',
  [ADD_BY_CUSTOMER_ASSISTANT]: '通过获客链接添加'
};

// 视频播放速度
export const PLAYBACK_RATES = [0.7, 1.0, 1.5, 2.0];

export const VIDEO_TYPE_MP4 = 'video/mp4';

export const MSG_TYPE_ALL = '0';
// 图片
export const MSG_TYPE_IMG = '1';
// 文件
export const MSG_TYPE_FILE = '2';
// 链接
export const MSG_TYPE_LINK = '3';
// 语音
export const MSG_TYPE_VOICE = '4';
// 视频
export const MSG_TYPE_VIDEO = '5';

// 消息类型
export const MSG_TYPE = {
  [MSG_TYPE_IMG]: 'image',
  [MSG_TYPE_FILE]: 'file',
  [MSG_TYPE_LINK]: 'link',
  [MSG_TYPE_VOICE]: 'voice',
  [MSG_TYPE_VIDEO]: 'video'
};

export const SCOPE_TYPE_DEPARTMENT = 1;
export const SCOPE_TYPE_PERSONAL = 2;
// 全部员工
export const SCOPE_TYPE_ALL = 3;

// 按照部门/个人查询
export const SCOPE_TYPE = {
  'department': SCOPE_TYPE_DEPARTMENT,
  'personal': SCOPE_TYPE_PERSONAL,
  'all': SCOPE_TYPE_ALL
};

export const MS_TO_SECONDS = 1000;
export const ONE_HOUR = 3600;
export const ONE_DAY = 24;
const ONE_WEEK = 7;
const ONE_MONTH = 30;
const THREE_MONTH = 90;

export const MILI_SECOND_OF_ONE_WEEK = ONE_HOUR * MS_TO_SECONDS * ONE_DAY * ONE_WEEK;
export const MILI_SECOND_OF_ONE_MONTH = ONE_HOUR * MS_TO_SECONDS * ONE_DAY * ONE_MONTH;
export const MILI_SECOND_OF_ONE_SEASON = ONE_HOUR * MS_TO_SECONDS * ONE_DAY * THREE_MONTH;

const INVITE_BY_MEMBER = 1;
const INVITE_BY_MEMBER_LINK = 2;
const INVITE_BY_SCAN = 3;
// 邀请入群方式
export const JOIN_SCENE = {
  [INVITE_BY_MEMBER]: '直接邀请入群',
  [INVITE_BY_MEMBER_LINK]: '邀请链接入群',
  [INVITE_BY_SCAN]: '扫码入群'
};

const MEMBER_ENTERPRISE = 1;
const MEMBER_CUSTOMER = 2;
export const MEMBER_TYPE = {
  [MEMBER_ENTERPRISE]: '企业成员',
  [MEMBER_CUSTOMER]: '外部联系人'
};

export const BUSINESS_ID_TYPE_SINGLE_USER = 1;
export const BUSINESS_ID_TYPE_MULTIPLE_USER = 2;
export const DRAINAGE_CODE_TYPE = {
  [BUSINESS_ID_TYPE_SINGLE_USER]: '单人',
  [BUSINESS_ID_TYPE_MULTIPLE_USER]: '多人'
};

export const STAFF_CODE_TYPE = 3;

// const LIVE_CODE = 1;
export const EMPLOYEES_WELCOME = 1;
export const INTO_GROUP = 2;
// 欢迎语类型
export const TYPE_OF_WELCOME = {
  // [LIVE_CODE]: '活码',
  [EMPLOYEES_WELCOME]: '好友',
  [INTO_GROUP]: '入群'
};

const FIRST_STEP = 0;
const SECOND_STEP = 1;
const THIRD_STEP = 2;
const FORTH_STEP = 3;
// 企微配置步骤条
export const ENTERPRISE_WECHAT_CONFIG_STEP_TEXT = {
  [FIRST_STEP]: '已复制，下一步',
  [SECOND_STEP]: '已开通，下一步',
  [THIRD_STEP]: '已复制，回到表单填写'
};
export const ENTERPRISE_WECHAT_AUTH_STEP_TEXT = {
  [FIRST_STEP]: '已复制，下一步',
  [SECOND_STEP]: '下一步',
  [THIRD_STEP]: '下一步',
  [FORTH_STEP]: '已授权，回表单填写配置'
};

// 没有企微配置状态码
export const NO_ENTERPRISE_CONFIG_CODE = 503;
// 角色已被使用状态码
export const ROLE_IN_USE_CODE = 501;

export const GROUP_MESSAGE_PUSH_TYPE_CUSTOMER = '0';
export const GROUP_MESSAGE_PUSH_TYPE_GROUP = '1';
// 发送对象
export const GROUP_MESSAGE_PUSH_TYPE = {
  [GROUP_MESSAGE_PUSH_TYPE_CUSTOMER]: '客户',
  [GROUP_MESSAGE_PUSH_TYPE_GROUP]: '客户群'
};

export const GROUP_MESSAGE_PUSH_RANGE_ALL = '0';
export const GROUP_MESSAGE_PUSH_RANGE_SOME = '1';
// 发送范围
export const GROUP_MESSAGE_PUSH_RANGE = {
  [GROUP_MESSAGE_PUSH_RANGE_ALL]: '全部客户',
  [GROUP_MESSAGE_PUSH_RANGE_SOME]: '指定客户'
};

export const GROUP_MESSAGE_PUSH_TIME_NOW = '0';
export const GROUP_MESSAGE_PUSH_TIME_SET = '1';
// 发送范围
export const GROUP_MESSAGE_PUSH_TIME = {
  [GROUP_MESSAGE_PUSH_TIME_NOW]: '立即发送',
  [GROUP_MESSAGE_PUSH_TIME_SET]: '定时发送'
};

export const GROUP_MESSAGE_MSG_TYPE_TEXT = '0';
export const GROUP_MESSAGE_MSG_TYPE_IMG = '1';

const ENABLE = 0;
const DISABLE = 1;
const DEPARTURE = 6;
// 员工状态
export const STAFF_STATUS = {
  [ENABLE]: '启用',
  [DISABLE]: '禁用',
  [DEPARTURE]: '离职'
};

const STAFF_HAS_BEEN_ACTIVATED = 1;
const STAFF_INACTIVE = 4;
const STAFF_HAS_DISABLED = 2;
const STAFF_OUT_OF_BUSINESS = 5;
// const STAFF_DEL_STATUS = 6;
// 员工状态
export const STAFF_STATUS_ACTIVATE = {
  [STAFF_HAS_BEEN_ACTIVATED]: '已激活',
  [STAFF_HAS_DISABLED]: '已禁用',
  [STAFF_INACTIVE]: '未激活',
  [STAFF_OUT_OF_BUSINESS]: '退出企业'
  // [STAFF_DEL_STATUS]: '删除'
};

export const GET_INFO_ERROR = 'GET_INFO_ERROR';
// 企业配置完成通知
export const ENTERPRISE_CONFIG_TIP = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;企业完成配置后，系统会为员工初始化系统角色，不同角色有不同的操作权限（详情见【角色管理】），可根据企业自身情况在【员工管理】中为员工选择合适的角色。';

export const DEFAULT_AVATAR = require('@/assets/image/card-avatar.svg');

// 客户类型
// 微信客户
export const WX_TYPE = 1;
// 外部企业客户
export const CORP_TYPE = 2;

// 会话存档secrec
export const CHAT_SECRET = 'chatSecret';

// 系统类型
// 第三方应用
export const SERVER_TYPE_THIRD = 'third';
// 内部应用
export const SERVER_TYPE_INTERNAL = 'internal';

// 第三方应用被屏蔽的菜单名
export const THIRD_INVISIBLE_MENUS = ['在线账号', '定时任务', '数据监控', '服务监控', '菜单管理'];

// 图标名与文件后缀名一致的后缀名列表
export const ICON_LIST = ['ai', 'pdf', 'zip', 'exe', 'csv', 'html', 'ppt', 'mp4', 'psd', 'txt', 'xml', 'doc'];

// 企业话术
const ENTERPRISE_VERBAL_TRICK = 0;
// 部门话术
const DEPARTMENT_VERBAL_TRICK = 1;
// 我的话术
const PERSONAL_VERBAL_TRICK = 2;

// 话术类型
export const VERBAL_TRICK_TYPE = {
  'enterprise': ENTERPRISE_VERBAL_TRICK,
  'department': DEPARTMENT_VERBAL_TRICK,
  'personal': PERSONAL_VERBAL_TRICK
};

// 企业表单
const ENTERPRISE_FORM = 1;
// 部门表单
const DEPARTMENT_FORM = 2;
// 我的表单
const PERSONAL_FORM = 3;

// 智能表单的表单tab类型
export const INTELLIGENT_FORM_TYPE = {
  'enterprise': ENTERPRISE_FORM,
  'department': DEPARTMENT_FORM,
  'personal': PERSONAL_FORM
};

// 树的"全部"节点的id
export const TREE_ALL_GROUP_ID = '0';

// 不自动通过
const UN_AUTO_ADD = 0;
// 全天生效
const ALL_DAY_ADD = 1;
// 时间段
const TIME_ADD = 2;
// 员工活码自动成为好友类型
export const SKIP_VERIFY = {
  'close': UN_AUTO_ADD,
  'allDay': ALL_DAY_ADD,
  'timeAdd': TIME_ADD
};

const SYS_FIELD = 1;
const SINGLE_TEXT = 2;
const MUL_TEXT = 3;
const SINGLE_RADIO = 4;
const MUL_RADIO = 5;
const SELECT_SINGLE = 6;
const DATE_FIELD = 7;
const IMG_FIELD = 8;
const FILE_FIELD = 9;

// 客户字段类型值
export const CUSTOMER_PROPERTY_VALUE = {
  'sysField': SYS_FIELD,
  'singleText': SINGLE_TEXT,
  'mulText': MUL_TEXT,
  'singleRadio': SINGLE_RADIO,
  'mulRadio': MUL_RADIO,
  'selectSingle': SELECT_SINGLE,
  'dateField': DATE_FIELD,
  'img': IMG_FIELD,
  'file': FILE_FIELD
};

// 客户字段类型名
export const CUSTOMER_PROPERTY_MAP = {
  [SYS_FIELD]: '系统字段',
  [SINGLE_TEXT]: '单行文本',
  [MUL_TEXT]: '多行文本',
  [SINGLE_RADIO]: '单选框',
  [MUL_RADIO]: '多选框',
  [SELECT_SINGLE]: '下拉框',
  [DATE_FIELD]: '日期',
  [IMG_FIELD]: '图片',
  [FILE_FIELD]: '文件'
};

export const GROUP_MESSAGE_SEND_STATUS_UNEXEC = '0';
export const GROUP_MESSAGE_SEND_STATUS_EXECED = '1';
export const GROUP_MESSAGE_SEND_STATUS_SUCCESS = '2';
export const GROUP_MESSAGE_SEND_STATUS_FAIL = '3';

// 已执行群发状态
export const GROUP_MESSAGE_SEND_STATUS_MAP = {
  [GROUP_MESSAGE_SEND_STATUS_SUCCESS]: '发送成功',
  [GROUP_MESSAGE_SEND_STATUS_FAIL]: '发送失败'
};

export const GROUP_STATUS_ALL = -1;
export const GROUP_STATUS_NORMAL = 0;
export const GROUP_STATUS_UNEXTEND = 1;

export const GROUP_STATUS_ORDER = [
  GROUP_STATUS_ALL, GROUP_STATUS_NORMAL, GROUP_STATUS_UNEXTEND
];

export const GROUP_STATUS_MAP = {
  [GROUP_STATUS_ALL]: '全部',
  [GROUP_STATUS_NORMAL]: '正常',
  [GROUP_STATUS_UNEXTEND]: '待继承'
};

export const ENTER_GROUP_WAY_ALL = 0;
export const ENTER_GROUP_WAY_INVITE = 1;
export const ENTER_GROUP_WAY_LINK = 2;
export const ENTER_GROUP_WAY_QRCODE = 3;

export const GROUP_ENTER_WAY_MAP = {
  [ENTER_GROUP_WAY_ALL]: '全部',
  [ENTER_GROUP_WAY_INVITE]: '直接邀请入群',
  [ENTER_GROUP_WAY_LINK]: '邀请链接入群',
  [ENTER_GROUP_WAY_QRCODE]: '扫码入群'
};

export const GROUP_MESSAG_STATUS_SENDED = '1';

/** 转接失败（EasyInk自定义） */
export const INHERIT_STATUS_FAIL = 0;
/** 接替完毕 */
export const INHERIT_STATUS_INHERITED = 1;
/** 等待接替 */
export const INHERIT_STATUS_INHERITING = 2;
/** 客户拒绝 */
export const INHERIT_STATUS_REFUSE = 3;
/** 接替员工客户数已达上限 */
export const INHERIT_STATUS_USER_REACHED_UPPER_LIMIT = 4;
/** 无接替记录 */
export const INHERIT_STATUS_EMPTY = 5;

// 离职继承的分配结果
export const DIMISSION_STATUS_MAP = {
  [INHERIT_STATUS_INHERITED]: '已接替',
  [INHERIT_STATUS_INHERITING]: '接替中',
  [INHERIT_STATUS_REFUSE]: '客户拒绝',
  [INHERIT_STATUS_USER_REACHED_UPPER_LIMIT]: '接替员工客户数已达上限',
  [INHERIT_STATUS_EMPTY]: '客户90天内接替次数已达上限'
};

/** sop提醒时间格式类型 */
const HOUR_MINUTE = 0;
const DAY_TIME = 1;
const EVERYDAY_TIME = 2;
const EVERY_WEEK_TIME = 3;
const EVERY_MONTH_TIME = 4;
const TIME = 5;
const BEFORE_DAY_TIME = 6;

export const RULE_PERFORM_TYPE = {
  'hourMinute': HOUR_MINUTE,
  'dayTime': DAY_TIME,
  'beforeDayTime': BEFORE_DAY_TIME,
  'everydayTime': EVERYDAY_TIME,
  'everyWeekTime': EVERY_WEEK_TIME,
  'everyMonthTime': EVERY_MONTH_TIME,
  'time': TIME
};

/** 定时sop */
const TIMING_SOP = 0;
/** 循环sop */
const CYCLE_SOP = 1;
/** 新客sop */
const NEWCUSTOMER_SOP = 2;
/** 活动sop */
const ACTIVITY_SOP = 3;
/** 生日sop */
const BIRTHDAY_SOP = 4;
/** 群日历 */
const GROUPCALENDAR_SOP = 5;

/** sop类型 */
export const SOP_TYPE = {
  'timing': TIMING_SOP,
  'cycle': CYCLE_SOP,
  'newCustomer': NEWCUSTOMER_SOP,
  'activity': ACTIVITY_SOP,
  'birthday': BIRTHDAY_SOP,
  'groupCalendar': GROUPCALENDAR_SOP
};

export const DEFAULT_LINK = false; // 默认链接
export const CUSTOM_LINK = true; // 自定义链接

const DEFAULT_MINUTE = 30;
const DEFAULT_TIME = '15:00';
/** 默认提醒时间自定义数据 */
export const DEFAULT_ALERTINFO = {
  hourMinute: {
    hour: 0,
    minute: DEFAULT_MINUTE
  },
  dayTime: {
    day: 1,
    time: DEFAULT_TIME
  },
  beforeDayTime: {
    day: 1,
    time: DEFAULT_TIME
  },
  time: '',
  everyWeekTime: {
    week: '1',
    time: DEFAULT_TIME
  },
  everyMonthTime: {
    month: 1,
    time: DEFAULT_TIME
  },
  everydayTime: DEFAULT_TIME
};

export const ONE_DAY_MSECOND = 8.64e7; // 一整天的毫秒数
// 代开发应用企微配置正常和未授权安装应用
export const NORMAL = '0';
// 代开发应用企微配置授权未启用
export const AUTH_ENADLE = '2';

export const MAX_APPENDIX_NUM = 9;

/**
 * 欢迎语附件素材类型
 */
/** 文本 */
const WEL_MATERIAL_TEXT = 0;
const WEL_MATERIAL_IMAGE = 1;
const WEL_MATERIAL_IMGLINK = 2;
const WEL_MATERIAL_MINIAPP = 3;
const WEL_MATERIAL_FILE = 4;
const WEL_MATERIAL_VIDEO = 5;
const WEL_MATERIAL_RADAR_LINK = 7;
const WEL_MATERIAL_SMARTFORM = 8;

export const WELCOME_APPENDIX_TYPE = {
  'text': WEL_MATERIAL_TEXT,
  'img': WEL_MATERIAL_IMAGE,
  'imgLink': WEL_MATERIAL_IMGLINK,
  'miniApp': WEL_MATERIAL_MINIAPP,
  'file': WEL_MATERIAL_FILE,
  'video': WEL_MATERIAL_VIDEO,
  'radarLink': WEL_MATERIAL_RADAR_LINK,
  'smartForm': WEL_MATERIAL_SMARTFORM
};

/** 素材库素材类型转为欢迎语附件类型 */
export const MEDIA_TO_WELCOME_TYPE = {
  [MEDIA_TYPE_TEXT]: WEL_MATERIAL_TEXT,
  [MEDIA_TYPE_POSTER]: WEL_MATERIAL_IMAGE,
  [MEDIA_TYPE_IMGLINK]: WEL_MATERIAL_IMGLINK,
  [MEDIA_TYPE_MINIAPP]: WEL_MATERIAL_MINIAPP,
  [MEDIA_TYPE_VIDEO]: WEL_MATERIAL_VIDEO,
  [MEDIA_TYPE_FILE]: WEL_MATERIAL_FILE,
  [MEDIA_TYPE_RADARLINK]: WEL_MATERIAL_RADAR_LINK,
  [MEDIA_TYPE_SMARTFORM]: WEL_MATERIAL_SMARTFORM
};

/** 欢迎语附件类型转为素材库素材类型 */
export const WELCOME_TO_MEDIA_TYPE = {
  [WEL_MATERIAL_TEXT]: MEDIA_TYPE_TEXT,
  [WEL_MATERIAL_IMAGE]: MEDIA_TYPE_POSTER,
  [WEL_MATERIAL_IMGLINK]: MEDIA_TYPE_IMGLINK,
  [WEL_MATERIAL_MINIAPP]: MEDIA_TYPE_MINIAPP,
  [WEL_MATERIAL_VIDEO]: MEDIA_TYPE_VIDEO,
  [WEL_MATERIAL_FILE]: MEDIA_TYPE_FILE,
  [WEL_MATERIAL_RADAR_LINK]: MEDIA_TYPE_RADARLINK,
  [WEL_MATERIAL_SMARTFORM]: MEDIA_TYPE_SMARTFORM
};

/** 周的文字 */
export const weekNum = ['一', '二', '三', '四', '五', '六', '日'];

// 各类素材默认图片
export const DEFAULT_IMG = {
  'link': 'https://wecomsaas-1253559996.cos.ap-guangzhou.myqcloud.com/2022/01/19/飞书20220119-204645.jpg'
};

// 链接标题摘要最大限制的长度
export const LINK_TITLE_MAXLENGTH = 16; // 标题最大长度16
export const LINK_CONTENT_MAXLENGTH = 64; // 摘要最大长度64

// 进群方式
const CREATE_TYPE_GROUP = 1;
// 企微活码
const CREATE_TYPE_CORP = 2;
// 群二维码
export const CREATE_TYPE = {
  'group': CREATE_TYPE_GROUP,
  'corp': CREATE_TYPE_CORP
};

// 关键词打标签
const KEYWORDS_LABEL = 1;
// 入群打标签
const INTOGROUP_LABEL = 2;
// 新客打标签
const NEWCUSTOMER_LABEL = 3;
// 批量打标签
const BATCH_LABEL = 4;
// 自动标签类型
export const AUTOLABEL_TYPE = {
  // 关键词
  'keyWords': KEYWORDS_LABEL,
  // 入群
  'intoGroup': INTOGROUP_LABEL,
  // 新客
  'newCustomer': NEWCUSTOMER_LABEL,
  'batch': BATCH_LABEL
};

/** 周数组 */
export const WEEK_OPTIONS = [{
  value: 1,
  label: '周一'
}, {
  value: 2,
  label: '周二'
}, {
  value: 3,
  label: '周三'
}, {
  value: 4,
  label: '周四'
}, {
  value: 5,
  label: '周五'
}, {
  value: 6,
  label: '周六'
}, {
  value: 7,
  label: '周日'
}];

const NEWCUSOMTER_SCENE_TYPE_DAY = 1;
const NEWCUSOMTER_SCENE_TYPE_WEEK = 2;
const NEWCUSOMTER_SCENE_TYPE_MONTH = 3;

/**
 * 新客打标签 时间类型
 */
export const NEWCUSOMTER_SCENE_TYPE = {
  'day': NEWCUSOMTER_SCENE_TYPE_DAY,
  'week': NEWCUSOMTER_SCENE_TYPE_WEEK,
  'month': NEWCUSOMTER_SCENE_TYPE_MONTH
};

export const PUBLIC_KEY_BEGIN = '-----BEGIN PUBLIC KEY-----';
export const PUBLIC_KEY_END = '-----END PUBLIC KEY-----';

/**
 * 使用员工的类型
 * 1为部门，2为员工,3为全部员工
 */
export const SCOPELIST_TYPE = {
  ALL_USER: 3,
  USER: 2,
  DEPARTMENT: 1
};
// 欢迎语发送内容类型
export const redeemCodeMsgType = {
  'success': 1, // 可以使用兑换码
  'fail': 2, // 没有可使用的兑换码
  'repeat': 3 // 兑换码过期
};
// 欢迎语类型
export const NORMAL_WORD = 0; // 普通欢迎语
export const ACTIVE_WORD = 1; // 活动欢迎语

// 公众号类型
export const SUBSCRIBE_OFF_ACCOUNT = 0; // 订阅号
export const UPDATED_SUBSCRIBE_OFF_ACCOUNT = 1; // 历史老账号的订阅号
export const SERVICE_OFF_ACCOUNT = 2; // 服务号

// 微信公众号平台URL
export const WX_PAAS_URL = 'https://mp.weixin.qq.com/';
// 配置介绍文档Url
export const CONFIG_INTRODUCE_URL = 'https://xsxda94vjq.feishu.cn/docx/ZtSad9QWgo7ayfxreP7c8CvDnle';
// 企微管理后台 客户与上下游
export const MANAGE_BACKSTAGE_URL = 'https://work.weixin.qq.com/wework_admin/loginpage_wx?redirect_uri=https%3A%2F%2Fwork.weixin.qq.com%2Fwework_admin%2Fframe#customer/analysis';
// 企业雷达
const ENTERPRISE_RADAR = 3;
// 部门雷达
const DEPARTMENT_RADAR = 2;
// 我的雷达
const PERSONAL_RADAR = 1;

/** 雷达类型 */
export const RADAR_TYPE = {
  'enterprise': ENTERPRISE_RADAR,
  'department': DEPARTMENT_RADAR,
  'personal': PERSONAL_RADAR
};

// 发布朋友圈可见范围 （0：全部客户 1：部分客户）
export const FRIEND_PUSH_RANGE = {
  ALL_CLIENT: 0,
  PART_CLIENR: 1
};
// 发布朋友圈是否选择员工（2：未选择 1：已选择）
export const FRIEND_SELECT_USER = {
  IS_SELECT: 1,
  NO_SELECT: 2
};
// 排序
export const SORT = {
  'ascending': true, // 升序
  'descending': false // 降序
};

// 智能表单组件枚举
/** 单选 */
export const RADIO_COMPONENT = 1;
/** 多选 */
export const CHECKBOX_COMPONENT = 2;
/** 下拉框 */
export const SELECT_COMPONENT = 3;
/** 单行文本 */
export const ONE_LINE_TEXT_COMPONENT = 4;
/** 多行文本 */
export const MANY_LINE_TEXT_COMPONENT = 5;
/** 日期时间 */
export const DATE_TIME_COMPONENT = 6;
/** 评分 */
export const SCORE_COMPONENT = 7;
/** NPS */
export const NPS_COMPONENT = 8;
/** 文字 */
export const TEXT_COMPONENT = 9;
/** 图片 */
export const IMAGE_COMPONENT = 10;
/** 轮播图 */
export const CAROUSEL_COMPONENT = 11;

// 截止时间类型
/** 永久有效 */
export const FORVER_EFFECT = 1;
/** 自定义日期 */
export const CUSTOMER_DATE = 2;

// 提交次数类型
/** 不限制次数 */
export const NOT_LIMIT = 1;
/** 每个客户限提交一次 */
export const ONE_TIME = 2;

// 提交结果
/** 不跳转 */
export const NOT_JUMP = 1;
/** 跳转结果页面  */
export const JUMP_RESULT_PAGE = 2;
/** 跳转链接 */
export const JUMP_LINK = 3;

/** 客户概况*/
export const CUSTOMER_OVERVIEW = 1;
/** 客户活跃度*/
export const CUSTOMER_ACTIVENESS = 2;
/** 客户联系label*/
export const CUSTOMER_LABEL_TYPE = {
  'overview': CUSTOMER_OVERVIEW,
  'activeness': CUSTOMER_ACTIVENESS
};
/** 日期维度*/
export const DATE_DIMENSION = 1;
/** 员工维度*/
export const STAFF_DIMENSION = 2;
/** 客户维度*/
export const CLIENT_DIMENSION = 3;
/** 活码维度 */
export const CODE_DIMENSION = 4;
/** 渠道维度 */
export const CHANNEL_DIMENSION = 5;
/** 数据维度*/
export const DATA_DIMENSION = {
  'date': DATE_DIMENSION,
  'staff': STAFF_DIMENSION,
  'client': CLIENT_DIMENSION
};
/** sessionStorage保存的客户联系->客户活跃度的搜索参数的Key*/
export const CUSTOMER_CONTACT_SESSION_SAVE_KEY = {
  'addDateRange': 'activeness_addDateRange',
  'sendDateRange': 'activeness_sendDateRange',
  'userAndDepartmentList': 'activeness_userAndDepartmentList'
};

// 表单上传展示类型
/** 拖拽单个上传 */
export const DRAG_ONE_TYPE = 1;
/** 多选上传 */
export const MULTIPLE_TYPE = 3;
/** 单个上传 */
export const UPLOAD_ONE_TYPE = 4;
/** 字数 */
export const TEXT_LENGTH_TYPE = 2;

/** 表单默认头图 */
export const FORM_DEFAULT_HEAD_IMAGE_URL = 'https://wecomsaas-1253559996.cos.ap-guangzhou.myqcloud.com/2023/02/09/数据时代.png';

/** 部门和其他员工列表分页限制 */
export const USER_AND_DEPARTMENT_LIMIT = '999';

/** 激活的员工 */
export const IS_ACTIVATE = 1;

export const COMMON_TYPE = '0';
export const LOSS_TYPE = '1';
export const TRANSFER_TYPE = '4';
export const TO_INHERIT_TYPE = '3';
export const ALL_TYPE = '-1';

/** 客户状态 */
export const CUSTOMER_STATUS = {
  [COMMON_TYPE]: '正常',
  [LOSS_TYPE]: '已流失',
  [TO_INHERIT_TYPE]: '待继承',
  [TRANSFER_TYPE]: '转接中',
  [ALL_TYPE]: '全部'
};

/** 性别下拉框 */
export const SCREENING_GENDER_TYPE = {
  [GENDER_TYPE_OF_UNKNOWN]: '未知',
  [GENDER_OF_MALE]: '男性',
  [GENDER_OF_FEMALE]: '女性'
};

/**
 * @description 查看客户/客户群具体内容
 */
export const CUSTOMER_DETAIL = {
  'customerInfo': '2', // 客户资料
  'informationDynamics': '1', // 信息动态
  'activityTrack': '3', // 活动轨迹
  'todo': '4', // 待办事项
  'groupMemInfo': '5' // 群成员信息
};

/** 标签统计类型  */
export const TAG_LABEL_TYPE = {
  'customer': 1,
  'group': 2
};

/** 来源 */
export const ADD_WAY = 'addWay';
/** 数据统计默认占位符 */
export const DATA_STATISTICS_DEFAULT_SHOW = '-';

/** 任务状态 */
export const TASK_STATUS = {
  'error': 0,
  'success': 1,
  'process': 2
};
/** 来源 */
export const SOURCE = 0;
/** 性别 */
export const GENDER = 1;
/** 且 */
export const AND = 1;
/** 或 */
export const OR = 0;
/** 所有性别 */
export const ALL_GENGER = 3;
/** 所有来源 */
export const ALL_SOURCE = '17';
