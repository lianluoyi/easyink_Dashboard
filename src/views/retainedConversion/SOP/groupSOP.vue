<!--
 * @Description: 群sop
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="group-sop-page">
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="SOP_TYPE['timing']">定时SOP</el-radio-button>
        <el-radio-button :label="SOP_TYPE['cycle']">循环SOP</el-radio-button>
      </el-radio-group>
    </div>
    <div class="content-container">
      <SOPList
        :type="'group'"
        :sop-type="activeName"
        :show-use-employees="false"
        :sop-tip="dealSopTip()"
      />
    </div>
  </div>
</template>
<script>
import { SOP_TYPE } from '@/utils/constant';
import SOPList from '../components/SOPList.vue';
import { removeUrlParams } from '@/utils/common';

export default {
  name: '',
  components: { SOPList },
  props: {},
  data() {
    return {
      SOP_TYPE,
      activeName: SOP_TYPE['timing']
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
        <div>制定标准化、流程化的客户群服务运营方案，到指定时间提醒员工去执行，提升客户群的转化效率</div>
      `
    );
    const routerQuery = this.$route.query;
    const sopType = routerQuery.sopType;
    this.activeName = sopType ? Number(sopType) : SOP_TYPE['timing'];
  },
  mounted() {},
  methods: {
    dealSopTip() {
      let tip = '';
      switch (this.activeName) {
        case SOP_TYPE['timing']: {
          tip = '对指定的群聊定时发送指定内容';
          break;
        }
        case SOP_TYPE['cycle']: {
          tip = '对指定的群聊定期循环发送指定内容';
          break;
        }
      }
      return tip;
    }
  }

};
</script>
<style scoped lang='scss'>
.group-sop-page {
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

