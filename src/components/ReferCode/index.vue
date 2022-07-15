<!--
 * @Description: 引用兑换码
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="value-info">
      将#兑换码#插入到欢迎语中，系统将在发送欢迎语时，将该值替换为兑换活动下可用的兑换码
    </div>
    <div class="send-list timeline-list">
      <el-timeline class="timeline-div">
        <el-timeline-item v-for="(item,index) in sendList" :key="index" placement="top">
          <template #dot>
            <div class="step-dot">{{ index + 1 }}</div>
          </template>
          <div class="timeline-name">
            {{ item.value }}
          </div>
          <div>
            <div v-if="item.index === redeemCodeMsgType['success']">
              <el-input
                v-model="msg.codeSuccessMsg"
                type="textarea"
                :maxlength="welMsgMaxlength"
                show-word-limit
                :autosize="{ minRows: 10, maxRows: 50 }"
                :placeholder="successPlaceholder"
                class="welcome-textarea"
              />
            </div>
            <div v-if="item.index === redeemCodeMsgType['fail']">
              <el-input
                v-model="msg.codeFailMsg"
                type="textarea"
                :maxlength="welMsgMaxlength"
                show-word-limit
                :autosize="{ minRows: 10, maxRows: 50 }"
                :placeholder="failPlaceholder"
                class="welcome-textarea"
              />
            </div>
            <div v-if="item.index === redeemCodeMsgType['repeat']">
              <el-input
                v-model="msg.codeRepeatMsg"
                type="textarea"
                :maxlength="welMsgMaxlength"
                show-word-limit
                :autosize="{ minRows: 10, maxRows: 50 }"
                :placeholder="repeatPlaceholder"
                class="welcome-textarea"
              />
            </div>
            <div class="quick-actions">
              <span @click="handeAddTextClick(index,'#客户昵称#')">#客户昵称#</span>
              <span @click="handeAddTextClick(index,'#员工姓名#')">#员工姓名#</span>
              <span v-if="item.index === redeemCodeMsgType['success']" @click="handeAddTextClick(index,'#兑换码#')">#兑换码#</span>
            </div>
            <div v-if="item.index===redeemCodeMsgType['success']">
              <AddAppendixBtn
                :sub-title="successInfo.title"
                :limit-select-length="successInfo.limitSelectLength"
                :max-appendix-num="MAX_APPENDIX_NUM"
                :appendix-list.sync="materialList.codeSuccessMaterialList"
              />
            </div>
            <div v-if="item.index===redeemCodeMsgType['fail']">
              <AddAppendixBtn
                :sub-title="failInfo.title"
                :limit-select-length="failInfo.limitSelectLength"
                :max-appendix-num="MAX_APPENDIX_NUM"
                :appendix-list.sync="materialList.codeFailMaterialList"
              />
            </div>
            <div v-if="item.index===redeemCodeMsgType['repeat']">
              <AddAppendixBtn
                :sub-title="repeatInfo.title"
                :limit-select-length="repeatInfo.limitSelectLength"
                :max-appendix-num="MAX_APPENDIX_NUM"
                :appendix-list.sync="materialList.codeRepeatMaterialList"
              />
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script>
const MAX_WELCOME_MSG_LENGTH = 2000;
const titleInfo = {
  title: '已添加 0 个附件，还可选择 9 个',
  limitSelectLength: MAX_APPENDIX_NUM
};
import AddAppendixBtn from '@/components/AddAppendixBtn.vue';
import {
  MAX_APPENDIX_NUM, redeemCodeMsgType
} from '@/utils/constant';
export default {
  components: { AddAppendixBtn },
  props: {
    // 发送内容
    codeMsg: {
      type: Object,
      default: () => {}
    },
    // 发送附件
    codeMaterialList: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      MAX_APPENDIX_NUM,
      redeemCodeMsgType,
      msg: this.codeMsg,
      materialList: this.codeMaterialList,
      welMsgMaxlength: MAX_WELCOME_MSG_LENGTH,
      sendList: [
        { index: redeemCodeMsgType['success'], value: '所选兑换活动下有可使用的兑换码时，回复以下内容' },
        // eslint-disable-next-line no-magic-numbers
        { index: redeemCodeMsgType['fail'], value: '所选兑换活动下没有可使用的兑换码，如兑换码已被使用完、兑换码已过期、活动已过期、兑换活动被删除， 回复以下内容' },
        // eslint-disable-next-line no-magic-numbers
        { index: redeemCodeMsgType['repeat'], value: '若客户已领取过所选兑换活动下的兑换码，回复以下内容' }
      ],
      successInfo: titleInfo,
      failInfo: titleInfo,
      repeatInfo: titleInfo,
      successPlaceholder: '',
      failPlaceholder: '',
      repeatPlaceholder: ''
    };
  },
  watch: {
    msg: {
      handler: function(val) {
        this.$emit('update:codeMsg', val);
      },
      deep: true,
      immediate: true
    },
    materialList: {
      handler: function(val) {
        this.successInfo = this.delselectInfo(val['codeSuccessMaterialList'].length);
        this.failInfo = this.delselectInfo(val['codeFailMaterialList'].length);
        this.repeatInfo = this.delselectInfo(val['codeRepeatMaterialList'].length);
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    switch (this.type) {
      case 'staffAdd':
        this.successPlaceholder = '请输入欢迎语，例：您好，我是#员工姓名#，前往自动售卖机输入兑换码：#兑换码#，即可以最低折扣购买百事可乐中瓶';
        this.failPlaceholder = '请输入欢迎语，例：您好，我是您的专属顾问#员工姓名#，折扣活动已过期，您可以点击我的头像，了解更多关于我们的信息';
        this.repeatPlaceholder = '请输入欢迎语，例：您好，我是#员工姓名#，您之前已参与过该活动，不可再次参与，下次有优惠活动告知您~';
        break;
      case 'customerAdd':
        this.successPlaceholder = '客户添加员工后，将收到加群引导语，例：您好，我是#员工姓名#，前往自动售卖机输入兑换码：#兑换码#，即可以最低折扣购买百事可乐中瓶，进入专属福利群，可享更多优惠';
        this.failPlaceholder = '客户添加员工后，将收到加群引导语，例：您好，我是您的专属顾问#员工姓名#，折扣活动已过期，您可以进入专属福利群，参与更多折扣活动';
        this.repeatPlaceholder = '客户添加员工后，将收到加群引导语，例：您好，我是#员工姓名#，您之前已参与过该活动，不可再次参与，可进群了解其他优惠活动~';
    }
  },
  methods: {
    /**
     * 处理素材库选择的标题
     */
    delselectInfo(num = 0) {
      return {
        title: `已添加 ${num} 个附件，还可选择 ${MAX_APPENDIX_NUM - num} 个`,
        limitSelectLength: MAX_APPENDIX_NUM - num
      };
    },
    /**
     * 点击为输入框赋值
     */
    handeAddTextClick(index, text) {
      switch (index + 1) {
        case redeemCodeMsgType['success']:
          this.msg.codeSuccessMsg += text;
          break;
        case redeemCodeMsgType['fail']:
          this.msg.codeFailMsg += text;
          break;
        case redeemCodeMsgType['repeat']:
          this.msg.codeRepeatMsg += text;
          break;
      }
    }
  }
};
</script>
<style lang="scss" src="@/styles/timelineList.scss" scoped>
</style>
<style scoped lang="scss">
.send-list {
    .timeline-div {
      .timeline-name {
          font-size: 12px;
          line-height: 20px;
          padding-top: 7px;
          color:#AEAEAE;
          width: 600px !important;
      }
    }
    /deep/.el-timeline-item__tail {
      margin-top: 10px;
    }
    .step-dot {
      margin-top: 10px;
    }

}
.value-info {
  color:rgba(153, 153, 153, 100);
  font-size: 14px;
  width: 600px;
}
.quick-actions {
  border-radius: 0 0 4px 4px;
  border: 1px solid #dcdfe6;
  border-top: 0;
  padding: 5px 10px;
  width: 100%;
  span {
    margin-right: 5px;
    color: rgba(96, 98, 102, 100);
    font-size: 14px;
    text-align: left;
    font-family: Arial-regular;
  }
}
.welcome-textarea {
  /deep/textarea {
    height: 93px !important;
    min-height: 93px !important;
  }
}
</style>
