/*
 * @Description: 导出任务列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import { exportCustomerResult } from '@/api/customer';
import { TASK_STATUS } from '@/utils/constant/index';
const PERCENTAGE_ADD = 2;
const MAX_PERCENTAGE = 98;
const PERCENTAGE_ADD_TIME = 500; // 进度条自增时间间隔
const MAX_WAIT_EXPORT_TIME = 600000; // 最大等待导出时间 10 分钟
const GET_EXPORT_RES = 10000; // 获取导出资源的接口 调用间隔 10s
const FULL_PERCENTAGE = 100;
const HIDDEN_PERCENTAGE = 300; // 导出成功 间隔300ms隐藏任务条
const exportTaskList = {

  state: {
    // 任务列表
    taskList: [],
    // 是否已读未读
    isDot: false,
    // 导出任务旗袍是否显示
    taskPopoverStatus: false
  },

  mutations: {
    ADD_TASK: (state, payload) => {
      state.taskList.unshift(payload);
      if (payload.status === TASK_STATUS['process']) {
        // 进度条自增的 定时器
        payload.percentageAddTimer = setInterval(() => {
          payload.percentage += PERCENTAGE_ADD;
          if (payload.percentage >= MAX_PERCENTAGE) {
            clearInterval(payload.percentageAddTimer);
          }
        }, PERCENTAGE_ADD_TIME);
        // 最大等待时间定时器
        payload.maxWaitTimer = setTimeout(() => {
          payload.status = TASK_STATUS['error'];
          clearInterval(payload.percentageAddTimer);
          clearInterval(payload.getExportResTimer);
          clearTimeout(payload.maxWaitTimer);
        }, MAX_WAIT_EXPORT_TIME);
        // 获取结果定时器
        payload.getExportResTimer = setInterval(() => {
          exportCustomerResult({
            oprId: payload.oprId
          }).then((res) => {
            if (res.data.hasFinished) {
              // eslint-disable-next-line no-magic-numbers
              payload.percentage = FULL_PERCENTAGE;
              setTimeout(() => {
                payload.status = TASK_STATUS['success'];
              }, HIDDEN_PERCENTAGE);
              if (!state.taskPopoverStatus) {
                state.isDot = true;
              }
              clearInterval(payload.percentageAddTimer);
              clearInterval(payload.getExportResTimer);
              clearTimeout(payload.maxWaitTimer);
            }
          });
        }, GET_EXPORT_RES);
      }
    },
    DEL_TASK: (state, payload) => {
      const { oprId } = payload;
      state.taskList = state.taskList.filter((item) => item.oprId !== oprId);
    },
    SET_DOT: (state, payload) => {
      state.isDot = payload;
    },
    SET_TASK_POPOVER_STATUS: (state, payload) => {
      state.taskPopoverStatus = payload;
    }
  },

  actions: {
  }
};

export default exportTaskList;
