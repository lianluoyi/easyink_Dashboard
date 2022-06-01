<!--
 * @Description: 选择其他属性进行筛选
 * @Author: broccoli
 * @LastEditors: broccoli
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
import { CUSTOMER_PROPERTY_VALUE } from '@/utils/constant';
export default {
  name: 'SelectProperty',
  components: {},
  props: {},
  data() {
    return {
      CUSTOMER_PROPERTY_VALUE,
      /**
       * 穿梭框中选中的值
       */
      value: []
    };
  },
  computed: {
    customProperty() {
      let list = [...this.$store.state.customerProperty.customerProperList];
      list = list.filter(item => item.status &&
      (item.type !== CUSTOMER_PROPERTY_VALUE['sysField'] &&
       ([CUSTOMER_PROPERTY_VALUE['singleRadio'], CUSTOMER_PROPERTY_VALUE['selectSingle'],
         CUSTOMER_PROPERTY_VALUE['dateField']].includes(item.type)) ||
        item.name === '出生日期'));
      return list;
    }
  },
  created() {},
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    },
    handelConfirm() {
      const list = [];
      const customPropertyObj = this.$store.state.customerProperty.customPropertyObj;
      this.value.map(item => {
        list.push(customPropertyObj[item]);
      });
      this.$emit('submit', list);
      this.onClose();
    }
  }

};
</script>
<style scoped lang='scss'>
</style>
