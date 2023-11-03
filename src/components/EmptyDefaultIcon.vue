<!--
 * @Description: 空值缺省图
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->

<script>
/**
 * 空值缺省图
 * @displayName EmptyDefaultIcon(空值缺省图)
 */
export default {
  components: {},
  props: {
    /**
     * 数据大小（为0时显示空值图，不为0时使用传入的节点）
     */
    length: {
      type: Number,
      default: 0
    },
    /**
     * 主提示语文字
     */
    text: {
      type: String,
      default: '暂无数据'
    },
    /**
     * 次提示语文字
     */
    desc: {
      type: String,
      default: ''
    },
    // 按钮文字
    btnText: {
      type: String,
      default: ''
    },
    /**
     * 按钮图标
     */
    btnIcon: {
      type: String,
      default: ''
    },
    /**
     * 按钮点击事件
     */
    btnClick: {
      type: Function,
      default: () => {}
    },
    /**
     * 自定义空值图片路径
     */
    emptyIcon: {
      type: String,
      default: ''
    },
    /**
     * 搜索条件都为空时显示desc
     */
    descShowCondition: {
      type: Object,
      default: () => {}
    },
    /**
     * 根据给出的企微配置进行判断是否显示desc
     */
    descConfig: {
      type: Array,
      default: () => []
    },
    /**
     * 搜索条件都为空时显示按钮
     */
    btnShowCondition: {
      type: Object,
      default: () => {}
    },
    /**
     * 根据给出的企微配置进行判断是否显示按钮
     */
    btnConfig: {
      type: Array,
      default: () => []
    },
    btnPermiKey: {
      type: Array,
      default: () => []
    },
    // 按钮loading
    btnLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      enterPriseWechatConfig: this.$store && this.$store.state.enterPriseWechatConfig
    };
  },
  computed: {
    // desc：需要判断是否有查询条件，没有查询条件才显示
    canShowDesc() {
      return this.queryShowConfig(this.descShowCondition);
    },
    // desc：需要判断是否有对应企微配置才显示
    descConfigShow() {
      // 有传descConfig才根据企微配置进行判断
      return this.descConfig.length === 0 || this.configShow(this.descConfig);
    },
    // 按钮：需要判断是否有查询条件，没有查询条件才显示
    canShowBtn() {
      return this.queryShowConfig(this.btnShowCondition);
    },
    // 按钮：需要判断是否有对应企微配置才显示
    btnConfigShow() {
      // 有传btnConfig才根据企微配置进行判断
      return this.btnConfig.length === 0 || this.configShow(this.btnConfig);
    }
  },
  watch: {
  },
  created() {},
  mounted() {},
  methods: {
    onBtnClick() {
      this.btnClick && this.btnClick();
    },
    // 从企微配置中查询是否存在对于配置
    configShow(configKey) {
      return configKey.length > 0 &&
      configKey.every(key => !!(this.enterPriseWechatConfig && this.enterPriseWechatConfig[key]));
    },
    // 查询条件是否都为空
    queryShowConfig(queryKey) {
      for (const key in queryKey) {
        if (queryKey[key]?.length) {
          return false;
        }
      }
      return true;
    }
  }
};
</script>
<template>
  <div v-bind="$attrs" :class="length === 0 ? 'empty-list': ''">
    <div v-show="length === 0" class="empty-div">
      <img class="empty-img" :src="emptyIcon || require('@/assets/image/empty-icon.svg')" alt="">
      <div class="content">
        <div v-if="text" class="text">{{ text }}</div>
        <div v-if="desc && canShowDesc && descConfigShow" class="desc">{{ desc }}</div>
        <el-button
          v-if="btnText && canShowBtn && btnConfigShow"
          v-hasPermi="btnPermiKey"
          class="empty-btn"
          type="primary"
          :icon="btnIcon"
          :loading="btnLoading"
          @click="onBtnClick"
        >{{ btnText }}</el-button>
        <slot name="customBtn" />
      </div>
    </div>
    <!-- @slot 传入的length不为0时展示传入的slot节点 -->
    <slot v-show="length !== 0" />
  </div>
</template>

<style lang="scss" scoped>
.empty-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.empty-div {
  text-align: center;
  line-height: 16px;
  .empty-img {
    width: 150px;
  }
  .content {
    position: relative;
    top: -32px;
    text-align: center;
    .text, .desc {
      color: #bbb;
      line-height: 16px;
      text-align: center;
    }
    .text {
      font-size: 14px;
    }
    .desc {
      font-size: 12px;
      margin-top: 10px;
    }
    .empty-btn {
      margin-top: 10px;
    }
  }
}
</style>
<docs lang="md">

## 示例
带按钮的空值图:

```jsx
const list = [];
const onBtnClick = () => { console.log('触发按钮点击事件'); }
const queryField = '';
<empty-default-icon
  btn-text="按钮文字"
  :length="list.length"
  :btn-click="onBtnClick"
  :btn-show-condition="{ queryField }"
/>
```
</docs>
