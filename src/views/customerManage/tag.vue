<script>
import CustomerTag from './customerTag.vue';
const tabType = {
  'customer': '客户标签',
  'group': '群标签'
};
export default {
  name: 'Tag',
  components: { CustomerTag },
  data() {
    return {
      tabType,
      activeName: 'customer'
    };
  },
  created() {},
  methods: {
  }
};
</script>
<template>
  <div>
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button label="customer">{{ tabType['customer'] }}</el-radio-button>
        <el-radio-button label="group">{{ tabType['group'] }}</el-radio-button>
      </el-radio-group>
    </div>
    <CustomerTag :type="activeName" />

  </div>
</template>
<style lang="scss" scoped></style>
