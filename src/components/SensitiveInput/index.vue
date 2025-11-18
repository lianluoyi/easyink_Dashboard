<template>
  <el-input
    v-model="displayValue"
    v-bind="$attrs"
    v-on="$listeners"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template #suffix>
      <i
        v-if="value &&checkPermi([permissionKey])"
        :class="suffixIconClass"
        class="toggle-icon"
        @click="toggleDisplay"
      />
    </template>
  </el-input>
</template>

<script>
import { decrypt } from '@/api/common';
import { checkPermi } from '@/utils/permission';

export default {
  name: 'SensitiveInput',
  inheritAttrs: false,
  props: {
    // v-model 值
    value: {
      type: String,
      default: ''
    },
    // 获取明文的接口参数
    apiParams: {
      type: Object,
      default: () => ({})
    },
    /** 是否自动获取明文 */
    autoFetch: {
      type: Boolean,
      default: false
    },
    permissionKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showFullText: false,
      fullText: '', // 从接口获取的明文
      loading: false,
      userEditedValue: '' // 用户编辑的值
    };
  },
  computed: {
    // 显示的值：密文或明文
    displayValue: {
      get() {
        // 如果显示明文且有明文数据，则显示明文
        if (this.showFullText && this.fullText) {
          this.$emit('input', this.fullText);
          return this.fullText;
        }
        return this.value;
      },
      set(val) {
        // 当用户编辑内容时，保存编辑的值并更新明文状态
        this.userEditedValue = val;
        this.fullText = val; // 更新明文为用户编辑的内容
        this.$emit('input', val);
      }
    },
    // 后缀图标样式类
    suffixIconClass() {
      if (this.loading) {
        return 'el-icon-loading';
      }
      return this.showFullText ? 'icon-plaintext iconfont' : 'icon-ciphertext iconfont';
    }
  },
  mounted() {
    if (this.autoFetch) {
      this.fetchFullText();
    }
  },
  methods: {
    checkPermi(key) {
      return checkPermi(key);
    },
    /**
     * 处理焦点事件
     */
    async handleFocus(event) {
      this.$emit('focus', event);
    },

    /**
     * 处理失焦事件
     */
    handleBlur(event) {
      this.$emit('blur', event);
    },

    /**
     * 切换显示状态
     */
    async toggleDisplay() {
      if (this.loading) return;
      if (!this.showFullText) {
        // 显示明文，需要调用接口获取
        await this.fetchFullText();
      } else {
        // 隐藏明文，如果用户有编辑过，则保持编辑的值
        this.showFullText = false;
        if (this.userEditedValue) {
          // 如果用户编辑过，使用编辑的值
          this.$emit('input', this.userEditedValue);
        }
      }
    },
    async handleDecrypt(data) {
      const res = await decrypt(data);
      return res.data;
    },
    /**
     * 调用接口获取明文
     */
    async fetchFullText() {
      if (this.fullText || this.userEditedValue) {
        // 如果已经获取过明文或用户已编辑，直接显示
        this.showFullText = true;
        return;
      }
      if (!this.apiParams.encryptValue) {
        return;
      }
      this.loading = true;
      try {
        const res = await this.handleDecrypt(this.apiParams);
        this.fullText = res.decryptValue;
        this.showFullText = true;
      } catch (error) {
        console.error('获取明文失败:', error);
        this.$message.error('获取明文失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.toggle-icon {
  cursor: pointer;
  font-size: 16px;
  transition: color 0.3s;

  &:hover {
    color: #409EFF;
  }

  &.el-icon-loading {
    color: #409EFF;
    animation: rotating 2s linear infinite;
  }
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
