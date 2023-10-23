<!--
 * @Description: 导出任务列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import { TASK_STATUS } from '@/utils/constant/index';
export default {
  name: 'ExportTask',
  components: {},
  props: {},
  data() {
    return {
      TASK_STATUS,
      showTashPopover: false
    };
  },
  computed: {
    exportTaskList() {
      return this.$store.state.exportTaskList.taskList;
    },
    blinkFlag() {
      const { taskList } = this.$store.state.exportTaskList;
      const flag = taskList.some(taskItem => {
        return taskItem.status === TASK_STATUS['process'];
      });
      return flag;
    },
    isDot() {
      return this.$store.state.exportTaskList.isDot;
    }
  },
  watch: {
    showTashPopover: {
      handler(val) {
        this.$store.commit('SET_TASK_POPOVER_STATUS', val);
      },
      immediate: true
    }
  },
  mounted() {
    let beginTime = 0; // 开始时间
    let differTime = 0; // 时间差
    window.onunload = () => {
      differTime = new Date().getTime() - beginTime;
      const DIFFER_TIME = 5;
      if (differTime <= DIFFER_TIME) {
        // 关闭
        window.localStorage.removeItem('exportTaskList');
      } else {
        window.localStorage.setItem('exportTaskList', JSON.stringify(this.exportTaskList));
      }
    };
    window.onbeforeunload = function() {
      beginTime = new Date().getTime();
    };
  },
  methods: {
    delTask(item) {
      this.$store.commit('DEL_TASK', {
        oprId: item.oprId
      });
      this.$nextTick(() => {
        this.$refs?.elPopover?.updatePopper();
      });
    },
    downloadFile(item) {
      this.download(item.fileName, false, this, () => {
        this.delTask(item);
      });
    }
  }
};
</script>

<template>
  <el-popover ref="elPopover" v-model="showTashPopover" placement="right-end" trigger="click" @show="() => $store.commit('SET_DOT', false)">
    <div class="popover-content">
      <div
        v-for="(item, index) in exportTaskList"
        :key="index"
        class="task-item"
      >
        <div class="task-info">
          <div class="task-name inoneline">{{ item.fileName }}</div>
          <div class="task-status">
            <span v-if="item.status === TASK_STATUS['error']" class="error">导出的数据量过大，请控制在20W条以内</span>
            <span v-if="item.status === TASK_STATUS['process']" class="process">
              <el-progress :percentage="item.percentage" color="#1990FF" :stroke-width="9" />
            </span>
            <span v-if="item.status === TASK_STATUS['success']" class="success theme-text-color" @click="downloadFile(item)">下载</span>
          </div>
        </div>
        <div class="task-file-icon">
          <svg class="icon" aria-hidden="true" width="50" height="50">
            <use xlink:href="#icon-excel" />
          </svg>
        </div>
        <i class="el-icon-circle-close" @click="delTask(item)" />
      </div>
    </div>
    <div slot="reference" :class="['popover-btn', blinkFlag ? 'blink' : '']">
      <el-badge :is-dot="isDot">
        <i class="el-icon-download" />
      </el-badge>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.popover-btn {
  @include bg_color($color-theme2-1);
  width: 45px;
  height: 45px;
  padding: 10px;
  border-radius: 5px 0px 0px 5px;
  position: absolute;
  right: 0;
  bottom: 115px;
  z-index: 999;
  cursor: pointer;
  .el-icon-download {
    color: #fff;
    font-size: 24px;
  }
  /deep/ .el-badge__content {
    border: 1px solid #e74e59;
  }
}
.blink {
  animation: blink 0.8s infinite;
}
.popover-content {
  width: 388px;
  max-height: 354px;
  overflow: auto;
  padding: 10px;
  .task-item {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
    padding: 10px;
    display: flex;
    border: 1px solid #ccc;
    height: 70px;
    position: relative;
    .el-icon-circle-close {
      position: absolute;
      top: -10px;
      right: -10px;
      font-size: 20px;
      cursor: pointer;
      background-color: #fff;
    }
    .task-info {
      flex: 1;
      overflow: hidden;
      .task-name {
        font-size: 16px;
        color: #101010;
        margin-bottom: 5px;
      }
      .task-status {
        .error {
          color: #ee6665;
        }
        .success {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
