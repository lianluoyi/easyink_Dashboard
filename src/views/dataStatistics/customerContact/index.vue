<!--
 * @Description: 数据统计-> 客户联系
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div class="page-wrap">
    <NoConfigInfo :config-keys="['chatSecret']" :page-title="'统计「新客开口率」、「服务响应率」、「客户活跃度」'" class="mb15" />
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium" @input="radioGroupChange">
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
import { CUSTOMER_LABEL_TYPE, CUSTOMER_CONTACT_SESSION_SAVE_KEY } from '@/utils/constant/index';
import { CUSTOMER_DEATIL_PATH } from '@/utils/constant/routePath';
import CustomerOverview from './customerOverview.vue';
import CustomerActiveness from './customerActiveness.vue';
import NoConfigInfo from '@/components/NoConfigInfo';
import { getQueryObject, changeURLParams } from '@/utils/index';
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
  created() {
    const queryObject = getQueryObject();
    if (queryObject.activeName) {
      this.$nextTick(() => {
        this.activeName = Number(queryObject.activeName);
      });
    }
  },
  methods: {
    // 当手动改变单选tab时，将tab选项设置到url上
    radioGroupChange(val) {
      changeURLParams('activeName', val);
    }
  },
  beforeRouteEnter(to, from, next) {
    // 若不是来自客户详情页的返回，则需要删除
    if (from.path !== CUSTOMER_DEATIL_PATH) {
      const allNeedClearSessionKey = Object.values(CUSTOMER_CONTACT_SESSION_SAVE_KEY);
      allNeedClearSessionKey.map(item => sessionStorage.removeItem(item));
    }
    next();
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
