<script>
import BaseInfo from './baseInfo';

export default {
  components: {
    BaseInfo
  },
  data() {
    return {
      // 当前群活码ID
      groupCodeId: null,
      // 当前激活的步骤
      active: 0
    };
  },
  methods: {
  }
};
</script>

<template>
  <div class="page">
    <ReturnPage path="/operationsCenter/drainageCode/customerGroup" />
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
    }
  }
}
</style>
