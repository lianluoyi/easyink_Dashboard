import { getChatPublicKey } from '@/api/enterpriseId';
// 设置必传字段默认值
export function setDefaultConfig(params) {
  const newParams = params;
  if (newParams.agentSecret) newParams.corpSecret = newParams.agentSecret;
  return newParams;
}

/**
 * 获取消息加密公钥内容
 * @returns
 */
export const handleGetChatPublicKey = async() => {
  try {
    const res = await getChatPublicKey();
    const data = res.data;
    return data;
  } catch {
    return;
  }
};
