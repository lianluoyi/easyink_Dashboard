/*
 * @Description: 复制指令
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
/**
 * vue 自定义复制指令
 * 使用 <div @click="search" v-copy="value">点击复制</div>
 */
import { Notification } from 'element-ui';
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
    el.removeEventListener('click', el.handleClick);
  }
};
function handleClick() {
  const input = document.createElement('input');
  input.value = this.copyData.toLocaleString();
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
  Notification.closeAll();
  Notification({
    title: '成功',
    message: '链接已复制到剪切板，可Ctrl+V粘贴',
    type: 'success'
  });
}
