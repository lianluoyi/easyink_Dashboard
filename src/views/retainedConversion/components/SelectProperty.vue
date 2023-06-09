<!--
 * @Description: 选择其他属性进行筛选
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog v-bind="$attrs" title="其他属性" width="700px" class="select-property-modal" v-on="$listeners" @close="onClose">
    <el-alert
      :style="'margin-bottom: 15px;'"
      title="设置客户需要满足的其他条件"
      type="warning"
      :closable="false"
    />
    <el-transfer
      v-model="value"
      v-bind="$attrs"
      :data="customProperty"
      :titles="['不需要满足', '需要满足']"
      :props="{
        key: 'id',
        label: 'name'
      }"
    />
    <div slot="footer">
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="handelConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { CUSTOMER_PROPERTY_VALUE, ADD_WAY, SOP_TYPE } from '@/utils/constant';
import { getSourceLabel } from '@/utils/common';
export default {
  name: 'SelectProperty',
  components: {},
  props: {
    // 穿梭框中已选择的项
    selectedValue: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      CUSTOMER_PROPERTY_VALUE,
      /**
       * 穿梭框中选中的值
       */
      value: [],
      sopType: null
    };
  },
  computed: {
    customProperty() {
      let list = [...this.$store.state.customerProperty.customerProperList];
      if (this.sopType !== SOP_TYPE['activity']) {
        list.unshift({
          id: ADD_WAY, name: '来源', type: ADD_WAY
        });
      }
      list = list.filter(item => item.status &&
      (item.type !== CUSTOMER_PROPERTY_VALUE['sysField'] &&
       ([CUSTOMER_PROPERTY_VALUE['singleRadio'], CUSTOMER_PROPERTY_VALUE['selectSingle'],
         CUSTOMER_PROPERTY_VALUE['dateField']].includes(item.type)) ||
        item.name === '出生日期') || item.name === '来源');
      return list;
    }
  },
  watch: {
    // 这里使用watch监听是由于属性是异步加载的 同时需要使用去重 避免重复
    selectedValue(val) {
      this.value = [...new Set([...this.value, ...this.dealSelectedValue(val)])];
    }
  },
  created() {
    const routerQuery = this.$route.query;
    this.sopType = Number(routerQuery.sopType);
  },
  mounted() {},
  methods: {
    dealSelectedValue(val) {
      return val.map((item) => item.id);
    },
    onClose() {
      this.$emit('update:visible', false);
    },
    handelConfirm() {
      const list = [];
      const customPropertyObj = this.$store.state.customerProperty.customPropertyObj;
      this.value.map(item => {
        if (item === ADD_WAY) {
          list.push({ id: ADD_WAY, name: '来源', optionValue: undefined, placeholder: '请选择来源', type: CUSTOMER_PROPERTY_VALUE['selectSingle'],
            optionList: getSourceLabel({ key: 'id', value: 'multipleValue' }) });
        } else {
          list.push(customPropertyObj[item]);
        }
      });
      this.$emit('submit', list);
      this.onClose();
    }
  }

};
</script>
<style scoped lang='scss'>
</style>
