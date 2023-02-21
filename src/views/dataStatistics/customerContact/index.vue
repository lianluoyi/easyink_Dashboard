<!--
 * @Description: 数据统计-> 客户联系
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div class="page-wrap">
    <NoConfigInfo :config-keys="['chatSecret']" :page-title="'统计「新客开口率」、「服务响应率」、「客户活跃度」'" class="mb15" />
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="CUSTOMER_LABEL_TYPE['overview']">客户概况</el-radio-button>
        <el-radio-button :label="CUSTOMER_LABEL_TYPE['activeness']">客户活跃度</el-radio-button>
      </el-radio-group>
    </div>
    <div class="content-container">
      <CustomerOverview v-if="activeName === CUSTOMER_LABEL_TYPE['overview']" />
      <CustomerActiveness v-if="activeName === CUSTOMER_LABEL_TYPE['activeness']" />
    </div>
  </div>
</template>
<script>
import { CUSTOMER_LABEL_TYPE } from '@/utils/constant';
import CustomerOverview from './customerOverview.vue';
import CustomerActiveness from './customerActiveness.vue';
import NoConfigInfo from '@/components/NoConfigInfo';
import { getQueryObject } from '@/utils/index';
export default {
  name: '',
  components: { CustomerOverview, CustomerActiveness, NoConfigInfo },
  props: {},
  data() {
    return {
      // 默认选择客户概况
      activeName: CUSTOMER_LABEL_TYPE['overview'],
      CUSTOMER_LABEL_TYPE
    };
  },
  mounted() {
    const queryObject = getQueryObject();
    if (queryObject.activeName_) {
      this.$nextTick(() => {
        this.activeName = Number(queryObject.activeName_);
      });
    }
  }
};
</script>
<style scoped lang='scss'>
.page-wrap {
  display: flex;
  flex-direction: column;
  /deep/ .content-container {
    flex: 1;
    overflow: auto;
    .overview-page {
      height: 100%;
    }
    .activeness-page {
      height: 100%;
    }
  }
  .warning-alert{
    margin-bottom: 15px;
    font-size: 13px;
  }
}
</style>
