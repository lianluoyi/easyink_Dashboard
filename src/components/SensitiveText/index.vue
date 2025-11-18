<template>
  <div class="sensitive-text-container">
    <span v-if="!showFullText">{{ text }}</span>
    <span v-else>{{ fullText }}</span>
    <i
      v-if="text && checkPermi([permissionKey])"
      :class="loading ? 'el-icon-loading' : (showFullText ? 'icon-plaintext' : 'icon-ciphertext')"
      class="toggle-icon iconfont"
      @click="toggleDisplay"
    />
  </div>
</template>

<script>
import { decrypt } from '@/api/common';
import { checkPermi } from '@/utils/permission';
export default {
  name: 'SensitiveText',
  props: {
    /** 原始加密文本 */
    text: {
      type: String,
      default: ''
    },
    /** 获取明文的接口参数 */
    apiParams: {
      type: Object,
      default: () => ({})
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
      loading: false
    };
  },
  methods: {
    checkPermi(key) {
      return checkPermi(key);
    },
    async handleDecrypt(data) {
      const res = await decrypt(data);
      return res.data;
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
.sensitive-text-container {
  display: flex;
  align-items: center;
}

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
