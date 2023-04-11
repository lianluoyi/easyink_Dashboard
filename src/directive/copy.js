/*
 * @Description: 复制指令
 * @Author: wJiaaa
 * @LastEditors: Xzz
 */
/**
 * vue 自定义复制指令
 * 使用 <div @click="search" v-copy="value">点击复制</div>
 */
import { copyText } from '@/utils';
export default {
  inserted(el, binding) {
    el.copyData = binding.value;
    el.addEventListener('click', handleClick);
  },
  update(el, binding) {
    el.copyData = binding.value;
  },
  // 解除绑定
  unbind(el) {
    el.removeEventListener('click', handleClick);
  }
};
function handleClick() {
  copyText(this.copyData);
}
