<script>
import BaseInfo from './baseInfo';

export default {
  components: { BaseInfo },
  data() {
    return {
      groupCode: null,
      groupCodeId: ''
    };
  },
  created() {
    this.groupCodeId = this.$route.query.groupCodeId;
  },
  methods: {
    handlleReturn() {
      this.$router.go(-1);
    }
  }
};
</script>

<template>
  <div class="page">
    <div class="wrap-head">
      <el-button type="text" size="medium" @click="handlleReturn">
        <svg class="icon-restore" :width="18" :height="18">
          <use href="#icon-restore" /></svg>返回
      </el-button>
    </div>
    <div class="wrap-body">
      <el-alert
        title="功能说明"
        type="info"
        description="客户扫描生成的客户群活码，将打开一个页面，引导客户进群，页面里显示第一个群聊，若该群聊已过期或达到进群上限，则自动分配下一个群聊。"
        show-icon
        :closable="false"
      />
      <div class="wrap-body-form">
        <BaseInfo ref="baseInfo" :group-code-id="groupCodeId" />
      </div>
    </div>
  </div>
</template>
<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style scoped lang="scss">
.page {
  background-color: #fff;
  .wrap-body {
    height: calc(100% - 48px);
    display: flex;
    flex-direction: column;
    .wrap-body-form {
      flex: 1;
      overflow-y: auto;
    }
  }
}
</style>
