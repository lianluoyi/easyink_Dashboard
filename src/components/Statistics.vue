<!--
* @Description: 发布统计
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="index">
    <div class="index_l whitebg">
      <div class="tables">
        <div style="text-align: left">
          <el-row type="flex" class="row-bg" justify="space-between">
            <el-col :span="24" class="title_name">
              {{ title }}
              <span v-if="showUptime" class="fontgay">更新于{{ uptime }}</span>
            </el-col>
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
            <el-col :span="6">{{ numsList.userNum || numsList.sumClickPersonNum || 0 }}</el-col>
            <el-col :span="6">{{ numsList.publishNum || numsList.sumClickNum || 0 }}</el-col>
            <el-col :span="6">{{ numsList.notPublishNum || numsList.nowadaysClickPersonNum || 0 }}</el-col>
            <el-col :span="6">{{ numsList.expireNum || numsList.nowadaysClickNum || 0 }}</el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    // 列表各个项的总数
    numsList: {
      type: Object,
      default: () => {}
    },
    // 是否展示更新时间
    showUptime: {
      type: Boolean,
      default: false
    },
    // 更新时间
    uptime: {
      type: String,
      default: ''
    },
    // 列表详情  title：展示的标题 showPopover：是否显示弹出框 content：弹出框内容  placement:弹出框位置
    colList: {
      type: Array,
      default: () => []
    },
    // 标题
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  watch: {},
  methods: {}
};
</script>
<style lang="scss" scoped>
.index {
  width: 100%;
  background: #f1f1f1;
  margin-top: 2px;
  .title_name {
    font-size: 24px;
    font-weight: bold;
    color: #000000;
    padding-top: 15px;
  }
  .col_style {
    font-size: 18px;
    font-weight: 500;
    color: #666;
  }

  .fontgay {
    text-indent: 4em;
    color: #999;
    font-size: 14px;
    font-weight: 200;
  }

  .fr {
    float: right;
  }

  .tables {
    width: 100%;
    height: 200px;
    background: #fff;
    border-radius: 5px;
    padding: 15px;
    font-size: 16px;
  }

  .whitebg {
    min-height: 0px;
    float: left;
    border-radius: 5px;
    .data-count {
      margin-top: 10px;
      font-size: 35px;
      font-weight: bold;
      text-align: center;
    }
  }
  .index_l {
    width: 100%;
  }
}
</style>
