<!--
 * @Description: 规则详情
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="label-detail-page">
    <ReturnPage />
    <div class="label-detail-content mt10">
      <el-tabs v-model="activeName" class="label-header-container">
        <el-tab-pane label="规则详情" :name="TAG_DETAIL['rule_detail']">
          <LabelDetailTab />
        </el-tab-pane>
        <el-tab-pane :label="'客户记录'" :name="TAG_DETAIL['customer_record']" :lazy="true">
          <CustomerRecord />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import ReturnPage from '@/components/ReturnPage.vue';
import LabelDetailTab from './components/labelDetailTab.vue';
import CustomerRecord from './components/customerRecord.vue';
const TAG_DETAIL = {
  'rule_detail': '0',
  'customer_record': '1'
};
export default {
  name: '',
  components: { ReturnPage, LabelDetailTab, CustomerRecord },
  // // 为子孙注入LabelRuleInfo 标签规则信息 可以给规则详情 和客户记录的组件用
  provide() {
    return {
      labelRuleInfo: this.labelRuleInfo
    };
  },
  data() {
    return {
      TAG_DETAIL,
      activeName: TAG_DETAIL['rule_detail'],
      labelRuleInfo: {
        labelType: null,
        ruleId: null
      }
    };
  },
  computed: { },
  created() {
    this.labelRuleInfo.labelType = Number(this.$route.query.labelType);
    this.labelRuleInfo.ruleId = this.$route.query.id;
    this.activeName = window.sessionStorage.getItem('DetailActive') || TAG_DETAIL['rule_detail'];
    window.sessionStorage.removeItem('DetailActive');
  },
  methods: {}
};
</script>

<style scoped lang='scss'>
.label-detail-page {
    display: flex;
    flex-direction: column;
    .label-detail-content {
        flex: 1;
        .label-header-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            /deep/ .el-tabs__header {
                background-color: #fff;
                margin-bottom: 0;
                .el-tabs__nav-wrap {
                    .el-tabs__item {
                        width: 100px;
                        text-align: center;
                            padding-left: 0;
                    }
                }
            }
            /deep/ .el-tabs__content {
                flex: 1;
                .el-tab-pane {
                    height: 100%;
                }
            }
        }
    }
}
</style>
