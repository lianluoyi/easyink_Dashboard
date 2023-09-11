<!--
* @Description: 统计
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
// TODO 重新布局 采用自适应 每行最少显示3个 可进行换行显示
<template>
  <div class="index-main">
    <div :style="`border-radius:${borderRadius}`" class="tables whitebg">
      <div style="text-align: left">
        <el-row type="flex" class="row-bg" justify="space-between" align="middle">
          <el-col :span="24" class="title_name">
            {{ title }}
            <slot name="extraInfo" />
          </el-col>
          <!-- operate 插槽 用来控制标题右侧的内容-->
          <slot name="operate" />
        </el-row>
        <el-row type="flex" class="row-bg" justify="space-between" style="margin-top: 35px; text-align: center">
          <el-col v-for="(item, index) in colList" :key="index" :span="6" class="col_style">
            {{ item.title }}
            <el-popover
              v-if="item.showPopover"
              :placement="item.placement || 'top-start'"
              :content="item.content"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i
                slot="reference"
                class="iconfont icon-question"
                style="font-size: 12px"
              />
            </el-popover>
          </el-col>
        </el-row>
        <el-row type="flex" class="row-bg data-count theme-text-color" justify="space-between">
          <el-col v-for="(item,index) in colList" :key="index" :span="6">
            <span :style="`color: ${color} `" class="col-item theme-text-color">
              <template v-if="item[item.filed] === DATA_STATISTICS_DEFAULT_SHOW">{{ DATA_STATISTICS_DEFAULT_SHOW }}</template>
              <template v-else>
                <span :style="`color:${item.numColor}`">{{ item[item.filed] || 0 }}</span>
                <!-- 符号 -->
                <span class="unit">{{ item.unit }}</span>
              </template>
            </span>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import { DATA_STATISTICS_DEFAULT_SHOW } from '@/utils/constant/index';
export default {
  props: {
    /** 列表详情  title：展示的标题 showPopover：是否显示弹出框 content：弹出框内容  placement:弹出框位置 filed:要显示的字段 unit:单位 */
    colList: {
      type: Array,
      default: () => []
    },
    /** 标题 */
    title: {
      type: String,
      default: ''
    },
    /** 字体颜色 */
    color: {
      type: String,
      default: ''
    },
    /** 边框弧度 */
    borderRadius: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      DATA_STATISTICS_DEFAULT_SHOW
    };
  },
  watch: {},
  methods: {}
};
</script>
<style lang="scss" scoped>
.index-main {
  width: 100%;
  background: #f1f1f1;
  .title_name {
    flex:1;
    font-size: 24px;
    font-weight: bold;
    color: #000000;
  }
  .col_style {
    font-size: 18px;
    font-weight: 500;
    color: #666;
  }

  .tables {
    width: 100%;
    height: 180px;
    background: #fff;
    padding: 15px;
    font-size: 16px;
  }

  .whitebg {
    width: 100%;
    min-height: 0px;
    float: left;
    .data-count {
      margin-top: 10px;
      font-size: 35px;
      font-weight: bold;
      text-align: center;
    }
  }
  .col-item {
    display: flex;
    justify-content: center;
    align-items: baseline;
  }
  .unit {
    font-size: 16px;
  }
}
</style>
