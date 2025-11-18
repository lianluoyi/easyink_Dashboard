<template>
  <el-autocomplete
    v-model="displayValue"
    v-bind="$attrs"
    v-on="$listeners"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template #suffix>
      <slot name="suffix" />
    </template>
  </el-autocomplete>
</template>

<script>
import { decrypt } from '@/api/common';
export default {
  name: 'SensitiveAutocomplete',
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
    }
  },
  data() {
    return {
      showFullText: false,
      fullText: '', // 从接口获取的明文
      loading: false
    };
  },
  computed: {
    // 显示的值：密文或明文
    displayValue: {
      get() {
        // 如果显示明文且有明文数据，则显示明文
        if (this.showFullText && this.fullText && this.value) {
          return this.fullText;
        }
        return this.value;
      },
      set(val) {
        // 当用户编辑内容时，同时更新明文和发出事件
        if (this.showFullText) {
          this.fullText = val;
        }
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
    /**
     * 处理焦点事件
     */
    handleFocus(event) {
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
        // 隐藏明文
        this.showFullText = false;
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
      if (this.fullText) {
        // 如果已经获取过明文，直接显示
        this.showFullText = true;
        return;
      }
      if (!this.apiParams.encryptValue) {
        return;
      }
      this.loading = true;
      try {
        // 使用定时器模拟接口调用
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
