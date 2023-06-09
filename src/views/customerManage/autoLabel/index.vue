<!--
 * @Description: 标签列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="label-page">
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="AUTOLABEL_TYPE['keyWords']">关键词打标签</el-radio-button>
        <el-radio-button :label="AUTOLABEL_TYPE['intoGroup']">入群打标签</el-radio-button>
        <el-radio-button :label="AUTOLABEL_TYPE['newCustomer']">新客打标签</el-radio-button>
        <el-radio-button v-hasPermi="['wecom:batchtag:list']" :label="AUTOLABEL_TYPE['batch']">批量打标签</el-radio-button>
      </el-radio-group>
    </div>
    <div class="content-container">
      <LabelList v-if="activeName !== AUTOLABEL_TYPE['batch']" :label-type="activeName" :label-tip="dealLabelTip()" />
      <BatchTag v-else />
    </div>
  </div>
</template>

<script>
import { AUTOLABEL_TYPE } from '@/utils/constant';
import LabelList from './components/labelList.vue';
import { removeUrlParams } from '@/utils/common';
import BatchTag from './BatchTag.vue';
export default {
  name: '',
  components: { LabelList, BatchTag },
  props: {},
  data() {
    return {
      activeName: AUTOLABEL_TYPE['keyWords'],
      AUTOLABEL_TYPE
    };
  },
  watch: {
    activeName(val) {
      var url = window.location.href;
      url = removeUrlParams(url);
      window.history.pushState({}, 0, `${url}?labelType=${val}`);
    }
  },
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>当客户满足规则时，为其打上指定标签，完善客户画像，帮助企业做下一步运营转化</div>
      `
    );
    const routerQuery = this.$route.query;
    const labelType = routerQuery.labelType;
    this.activeName = labelType ? Number(labelType) : AUTOLABEL_TYPE['keyWords'];
  },
  beforeRouteEnter(to, from, next) {
    // TODO 是否能够在mixin中处理
    if (from.path !== '/customerManage/customerCenter/BatchTagTaskDetail') {
      sessionStorage.removeItem('BatchTag');
    }
    next();
  },
  methods: {
    // 处理不同类型表格上方的提示
    dealLabelTip() {
      let tip = '';
      switch (this.activeName) {
        case AUTOLABEL_TYPE['keyWords']: {
          tip = '当客户的聊天内容包含指定关键词，为其自动打上客户标签';
          break;
        }
        case AUTOLABEL_TYPE['intoGroup']: {
          tip = '当客户进入指定群聊，为其自动打上客户标签';
          break;
        }
        case AUTOLABEL_TYPE['newCustomer']: {
          tip = '当客户在指定时段与员工成为好友，为其自动打上客户标签';
          break;
        }
      }
      return tip;
    }
  }
};
</script>

<style scoped lang='scss'>
.label-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  /deep/ .content-container {
    flex: 1;
    overflow: auto;
    .label-list-page {
      height: 100%;
    }
    .batch-tag {
      height: 100%;
    }
  }
}
</style>
