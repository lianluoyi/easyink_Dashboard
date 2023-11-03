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
/** 群发记录页的name*/
export const GROUP_RECORD = 'Record';
/** 群发详情页的name*/
export const GROUP_SEND_DETAIL = 'Detail';
/** 朋友圈记录页的name*/
export const MOMENT_RECORD = 'momentRecord';
/** 朋友圈详情页的name*/
export const MOMENT_DETAIL = 'Detail';
/** 客户SOP任务列表页的name*/
export const CUSTOMER_SOP = 'CustomerSOP';
/** 群SOP任务列表页的name*/
export const GROUP_SOP = 'GroupSOP';
/** 群日历SOP任务列表页的name*/
export const GROUP_CALENDAR_SOP = 'GroupCalendarSOP';
/** SOP任务详情页的name*/
export const SOP_DETAIL = 'SOPDetail';
/** 新增SOP任务页的name*/
export const ADD_SOP = 'AddSOP';
/** 客户群列表的name*/
export const GROUP_LIST = 'Group';
/** 客户群详情的name*/
export const CUSTOMER_GROUP_DEATIL = 'CustomerCenter/groupDetail';
/** 流失提醒列表的name*/
export const LOSS_REMIND_LIST = 'LossRemind';
/** 自动标签详情的name*/
export const AUTO_LABEL_DETAIL = 'LabelDetail';
/** 自动标签列表的name*/
export const AUTO_LABEL_LIST = 'AutoLabel';
/** 新增自动标签的name*/
export const ADD_LABEL_RULE = 'AddRule';
/** 批量打标签详情的name*/
export const BATCHTAG_TASK_DETAIL = 'CustomerCenter/BatchTagTaskDetail';
/** 批量打标签列表的name*/
export const BATCHTAG_TASK_LIST = 'batchTagTask';

/** 客户详情页的path*/
export const CUSTOMER_DEATIL_PATH = '/customerManage/customerCenter/customerDetail';
/** 客户列表页的path*/
export const CUSTOMER_PATH = '/customerManage/customerCenter/customer';

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
  [INTELLIGENT_FORM_DETAIL]: [CUSTOMER_DEATIL],
  // 群发记录
  [GROUP_RECORD]: [GROUP_SEND_DETAIL],
  // 朋友圈发布记录
  [MOMENT_RECORD]: [MOMENT_DETAIL],
  // 客户SOP
  [CUSTOMER_SOP]: [SOP_DETAIL, ADD_SOP],
  // 群SOP
  [GROUP_SOP]: [SOP_DETAIL, ADD_SOP],
  // 群日历SOP
  [GROUP_CALENDAR_SOP]: [SOP_DETAIL, ADD_SOP],
  // 客户群
  [GROUP_LIST]: [CUSTOMER_GROUP_DEATIL],
  // 流失提醒
  [LOSS_REMIND_LIST]: [CUSTOMER_DEATIL],
  // 自动标签 批量打标签
  [AUTO_LABEL_LIST]: [AUTO_LABEL_DETAIL, ADD_LABEL_RULE, BATCHTAG_TASK_DETAIL],
  // 批量打标签任务详情
  [BATCHTAG_TASK_DETAIL]: [CUSTOMER_DEATIL],
  // 规则详情
  [AUTO_LABEL_DETAIL]: [CUSTOMER_DEATIL]
};
