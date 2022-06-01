<!--
* @Description: 发布统计
 * @Author: wJiaaa
 * @LastEditors: broccoli
-->
<template>
  <div class="index">
    <div class="index_l whitebg">
      <div class="tables">
        <div style="text-align:left">
          <el-row type="flex" class="row-bg" justify="space-between">
            <el-col :span="24" class="title_name">发布统计
              <span class=" fontgay">更新于{{ uptime }}</span>
            </el-col>
          </el-row>
          <el-row type="flex" class="row-bg" justify="space-between" style="margin-top:35px; text-align: center;">
            <el-col :span="6" class="col_style">
              员工总数
              <el-popover
                placement="top-start"
                content="需要发布该朋友圈的员工数量"
                trigger="hover"
                popper-class="tip-popover"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 12px;" />
              </el-popover>
            </el-col>
            <el-col :span="6" class="col_style">
              已发布员工
              <el-popover
                placement="top-start"
                content="收到通知后48小时内发布朋友圈的员工"
                trigger="hover"
                popper-class="tip-popover"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 12px;" />
              </el-popover>
            </el-col>
            <el-col :span="6" class="col_style">
              待发布员工
              <el-popover
                placement="top-start"
                content="发出通知后48小时内没有发布朋友圈的员工"
                trigger="hover"
                popper-class="tip-popover"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
              </el-popover>
            </el-col>
            <el-col :span="6" class="col_style">
              过期朋友圈
              <el-popover
                placement="top-start"
                content="收到通知后没有在48小时内发布朋友圈的员工，若48小时后发布，仍视为过期"
                trigger="hover"
                popper-class="tip-popover"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
              </el-popover>
            </el-col>
          </el-row>
          <el-row type="flex" class="row-bg data-count theme-text-color" justify="space-between">
            <el-col :span="6">{{ table.userNum || 0 }}</el-col>
            <el-col :span="6">{{ table.publishNum || 0 }}</el-col>
            <el-col :span="6">{{ table.notPublishNum || 0 }}</el-col>
            <el-col :span="6">{{ table.expireNum || 0 }}</el-col>
          </el-row>
        </div>
      </div>
      <!-- -->
    </div>
  </div>
</template>
<script>
import { getTotal } from '@/api/friends';
const DEFAULT_TIMEOUT = 500;
export default {
  data() {
    return {
      table: {},
      uptime: '',
      toolTipVisible: false
    };
  },
  watch: {},
  created() {
    this.getTotal();
    setTimeout(() => {
      this.toolTipVisible = true;
    }, DEFAULT_TIMEOUT);
  },
  // 调用
  mounted() {},
  methods: {
    getTotal() {
      getTotal({ momentTaskId: this.$route.query.id }).then(({ data }) => {
        this.table = data;
        this.uptime = data.updateTime;
      });
    }
  }
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
