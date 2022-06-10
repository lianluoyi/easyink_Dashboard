<!--
 * @Description: 客户sop
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="customer-sop-page">
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="SOP_TYPE['newCustomer']">新客SOP</el-radio-button>
        <el-radio-button :label="SOP_TYPE['activity']">活动SOP</el-radio-button>
        <el-radio-button :label="SOP_TYPE['birthday']">生日SOP</el-radio-button>
      </el-radio-group>
    </div>
    <div class="content-container">
      <SOPList
        :type="'customer'"
        :sop-type="activeName"
        :show-use-employees="activeName !== SOP_TYPE['activity']"
        :sop-tip="dealSopTip()"
      />
    </div>
  </div>
</template>
<script>
import SOPList from '../components/SOPList.vue';
import { SOP_TYPE } from '@/utils/constant';
import { removeUrlParams } from '@/utils/common';
export default {
  name: '',
  components: { SOPList },
  props: {},
  data() {
    return {
      activeName: SOP_TYPE['newCustomer'],
      SOP_TYPE
    };
  },
  watch: {
    activeName(val) {
      var url = window.location.href;
      url = removeUrlParams(url);
      window.history.pushState({}, 0, `${url}?sopType=${val}`);
    }
  },
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>制定标准化客户服务运营方案，到指定时间提醒员工去执行，提升企业运营效率和留存率</div>
      `
    );
    const routerQuery = this.$route.query;
    const sopType = routerQuery.sopType;
    this.activeName = sopType ? Number(sopType) : SOP_TYPE['newCustomer'];
  },
  mounted() {},
  methods: {
    dealSopTip() {
      let tip = '';
      switch (this.activeName) {
        case SOP_TYPE['newCustomer']: {
          tip = '对新增的客户发送指定内容';
          break;
        }
        case SOP_TYPE['activity']: {
          tip = '对指定客户发送指定内容，实现精准营销';
          break;
        }
        case SOP_TYPE['birthday']: {
          tip = '客户过生日时发送指定内容';
          break;
        }
      }
      return tip;
    }
  }

};
</script>
<style scoped lang='scss'>
.customer-sop-page {
  display: flex;
  flex-direction: column;
  /deep/ .content-container {
    flex: 1;
    overflow: auto;
    .sop-list-page {
      height: 100%;
    }
  }
}
</style>
