/*
 * @Description: 引流获客公用方法
 * @Author: broccoli
 * @LastEditors: broccoli
 */
import { NORMAL_WORD, ACTIVE_WORD } from '@/utils/constant/index';
/**
 * 获取第一个欢迎语
 * 按照活动欢迎语顺序进行匹配 当匹配到即return 没有匹配到进入下一个if语句中
 * @param {*} item
 * @returns
 */
export const getFirstMsg = (item) => {
  switch (item.welcomeMsgType) {
  // 为普通欢迎语时返回下列字段值
    case NORMAL_WORD : {
      return {
        welcomeMsg: item.welcomeMsg || '',
        materialList: item?.materialList || []
      };
    }
    case ACTIVE_WORD : {
      return dealActiveMsg(item);
    }
  }
};

/**
 * 处理活动欢迎语的展示数据
 * @param {*} item
 * @returns
 */
const dealActiveMsg = (item) => {
  if (item.codeSuccessMsg || item.codeSuccessMaterialList?.length) {
    return {
      welcomeMsg: item.codeSuccessMsg || '',
      materialList: item?.codeSuccessMaterialList || []
    };
  }
  if (item.codeFailMsg || item.codeFailMaterialList?.length) {
    return {
      welcomeMsg: item.codeFailMsg || '',
      materialList: item?.codeFailMaterialList || []
    };
  }
  if (item.codeRepeatMsg || item.codeRepeatMaterialList?.length) {
    return {
      welcomeMsg: item.codeRepeatMsg || '',
      materialList: item?.codeRepeatMaterialList || []
    };
  }
};
