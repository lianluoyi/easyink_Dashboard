<!--
 * @Description: 查看上下文弹窗
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import chat from './chat.vue';
import {
  content
} from '@/api/content.js';
// 一页最大聊天数
const MAX_PAGE_TOTAL = 20;
export default {
  name: 'CheckContext',
  components: { chat },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    /** 查询上下文条件 */
    checkContextQuery: {
      type: Object,
      default: () => {}
    },
    /** 聊天类型 用来控制员工的会话固定在右边 */
    chatType: {
      type: String,
      default: 'employee'
    }
  },
  data() {
    return {
      allChat: [],
      chat: {},
      loading: false,
      prevButtonDisable: false,
      nextButtonDisable: false
    };
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        const { fromId } = this.checkContextQuery;
        this.chat = { fromId };
        this.getList({
          ...this.checkContextQuery,
          type: null
        }, true);
      } else {
        this.allChat = [];
        this.chat = {};
        this.prevButtonDisable = false;
        this.nextButtonDisable = false;
      }
    }
  },
  methods: {
    /**
     * @description 切换页码
     * @param flag 为true时下一页 false时上一页
     */
    pageChange(flag) {
      const params = {
        ...this.checkContextQuery,
        type: flag ? 'after' : 'before',
        msgId: flag ? this.allChat[this.allChat.length - 1].msgId : this.allChat[0].msgId
      };
      this.getList(params, false, flag ? 'after' : 'before');
    },
    /**
     * @description 获取聊天数据
     * @param params 参数
     * @param initReq 是否初次请求
     * @param flag 为 before 时上一页 after时下一页
     */
    getList(params, initReq, flag) {
      this.loading = true;
      content.viewContext(params).then(res => {
        if (!initReq && !res.rows.length) {
          this[flag === 'after' ? 'nextButtonDisable' : 'prevButtonDisable'] = true;
          return this.msgInfo('没有更多数据');
        } else {
          this.prevButtonDisable = false;
          this.nextButtonDisable = false;
        }
        this.allChat = res.rows;
        if (res.total < MAX_PAGE_TOTAL && !initReq) {
          this[flag === 'after' ? 'nextButtonDisable' : 'prevButtonDisable'] = true;
        } else {
          this[flag === 'after' ? 'prevButtonDisable' : 'nextButtonDisable'] = false;
        }
        this.$nextTick(() => {
          this.$refs['msgList'].initScollTop();
        });
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
</script>

<template>
  <el-dialog
    title="查看上下文"
    :visible.sync="Pvisible"
    append-to-body
    width="700px"
  >
    <div v-loading="loading" class="msg-list">
      <chat ref="msgList" :all-chat="allChat" :chat-data="chat" :chat-type="chatType" show-avatar />
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="check-context-footer">
        <div class="check-context-footer-button">
          <el-button :disabled="prevButtonDisable" @click="pageChange(false)">
            <i class="el-icon-arrow-left" />
            <span>上一页</span>
          </el-button>
          <el-button :disabled="nextButtonDisable" @click="pageChange(true)">
            <span>下一页</span>
            <i class="el-icon-arrow-right ml5" />
          </el-button>
        </div>
        <el-button @click="Pvisible = false">关闭</el-button>
      </span>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
/deep/ .takecontent {
  height: 490px;
  ul li {
    padding-left: 5px;
  }
}
/deep/ .el-dialog__body {
  padding: 0 15px;
}
.check-context-footer {
  display: flex;
  justify-content: space-between;
  .check-context-footer-button {
      button {
        width: 75px;
      }
      button:first-child {
        padding-left: 8px;
      }
  }
}
</style>
