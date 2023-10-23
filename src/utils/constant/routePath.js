/*
 * @Description: 路由路径、路由名常量
 * @Author: broccoli
 * @LastEditors: wJiaaa
 */
/** 员工活码列表路由名 */
export const STAFF_LIST = 'Staff';
/** 新建员工活码路由名 */
export const ADD_STAFF_CODE = 'StaffAdd';
/** 员工活码详情路由名 */
export const ADD_STAFF_DETAIL = 'StaffDetail';
/** 客户群活码列表路由名 */
export const CUSTOMER_GROUP_LIST = 'CustomerGroup';
/** 新建客户群活码、客户群活码详情 路由名 */
export const ADD_CUSTOMER_GROUP_NAME = 'CustomerGroupDetail';
/** 新客进群列表路由名 */
export const NEW_CUSTOMER_LIST = 'NewCustomer';
/** 新客进群 路由名 */
export const NEW_CUSTOMER_AEV = 'NewCustomerAev';
/** 老客进群列表路由名 */
export const OLD_CUSTOMER_LIST = 'Tag';
/** 老客进群 路由名 */
export const OLD_CUSTOMER_AEV = 'OldCustomerAev';
/** 好友欢迎语列表路由名 */
export const WELCOME_LIST = 'Welcome';
/** 好友欢迎语 路由名 */
export const WELCOME_ADD = 'WelcomeAdd';
/** 入群欢迎语列表路由名 */
export const GROUP_WELCOME_LIST = 'Welcome';
/** 好友欢迎语 路由名 */
export const GROUP_WELCOME_ADD = 'GroupWelcomeAdd';
/** 兑换码列表 */
export const CONVERSION_CODE_LIST = 'List';
/** 兑换码详情 */
export const CONVERSION_CODE_DETAIL = 'ConversionCodeDetail';
/** 新增、编辑兑换码 */
export const CONVERSIONCODE_ADD = 'ConversionCodeAdd';
/** 雷达详情 */
export const RADAR_DETAIL = 'RadarDetail';
/** 雷达列表 */
export const RADAR_MANAGE_LIST = 'RadarManage';
/** 智能表单详情 */
export const INTELLIGENT_FORM_DETAIL = 'FormDetail';
/** 智能表单列表 */
export const INTELLIGENT_FORM_LIST = 'IntelligentForm';
/** 新增、编辑智能表单 */
export const EDIT_INTELLIGENT_FORM = 'EditForm';
/** 获客链接列表页 */
export const CUSTOMER_ASSISTANT_LIST = 'CustomerAssistant';
/** 获客链接详情页 */
export const CUSTOMER_ASSISTANT_DETAIL = 'CustomerAssistantDetail';
/** 获客链接编辑页 */
export const CUSTOMER_ASSISTANT_EDIT = 'CustomerAssistantEdit';
/** 获客链接新增页 */
export const CUSTOMER_ASSISTANT_ADD = 'CustomerAssistantAdd';
/** 客户详情页的name*/
export const CUSTOMER_DEATIL = 'CustomerCenter/customerDetail';

/** 客户详情页的path*/
export const CUSTOMER_DEATIL_PATH = '/customerManage/customerCenter/customerDetail';
/** 客户列表页的path*/
export const CUSTOMER_PATH = '/customerManage/customerCenter/customer';
/** 获客链接列表页 */
export const CUSTOMER_ASSISTANT_PATH = '/operationsCenter/drainageCode/customerAssistant';
/** 获客链接详情页 */
export const CUSTOMER_ASSISTANT_DETAIL_PATH = '/operationsCenter/drainageCode/customerAssistantDetail';
/** 获客链接编辑页 */
export const CUSTOMER_ASSISTANT_EDIT_PATH = '/operationsCenter/drainageCode/customerAssistantEdit';

/** 是否为需要显示之前查询条件的路由名 */
export const PAGE_FROM_PATH = {
  // 员工活码
  [STAFF_LIST]: [ADD_STAFF_CODE, ADD_STAFF_DETAIL],
  // 客户群活码
  [CUSTOMER_GROUP_LIST]: [ADD_CUSTOMER_GROUP_NAME],
  // 新客进群
  [NEW_CUSTOMER_LIST]: [NEW_CUSTOMER_AEV],
  // 老客进群
  [OLD_CUSTOMER_LIST]: [OLD_CUSTOMER_AEV],
  // 好友欢迎语、入群欢迎语
  [WELCOME_LIST]: [WELCOME_ADD, GROUP_WELCOME_ADD],
  // 获客链接列表
  [CUSTOMER_ASSISTANT_LIST]: [CUSTOMER_ASSISTANT_DETAIL, CUSTOMER_ASSISTANT_EDIT, CUSTOMER_ASSISTANT_ADD],
  // 获客链接详情
  [CUSTOMER_ASSISTANT_DETAIL]: [CUSTOMER_DEATIL],
  // 兑换码列表
  [CONVERSION_CODE_LIST]: [CONVERSION_CODE_DETAIL, CONVERSIONCODE_ADD],
  // 兑换码详情
  [CONVERSION_CODE_DETAIL]: [CUSTOMER_DEATIL],
  // 雷达列表
  [RADAR_MANAGE_LIST]: [RADAR_DETAIL],
  // 雷达详情
  [RADAR_DETAIL]: [CUSTOMER_DEATIL],
  // 智能表单列表
  [INTELLIGENT_FORM_LIST]: [EDIT_INTELLIGENT_FORM, INTELLIGENT_FORM_DETAIL],
  // 智能表单详情
  [INTELLIGENT_FORM_DETAIL]: [CUSTOMER_DEATIL]
};
