<!--
 * @Description: 显示字段设置弹窗
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-dialog title="设置客户显示信息" :visible="visible" v-bind="$attrs" class="property-setting-modal" v-on="$listeners" @close="onClose">
    <el-alert
      title="设置要在表格显示的字段，展示客户更多个人信息"
      type="warning"
      :closable="false"
      show-icon
    />
    <el-transfer
      v-model="value"
      v-bind="$attrs"
      :data="data"
      :titles="['不显示的信息', '显示的信息']"
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
import store from '@/store';
export default {
  name: 'PropertySetting',
  components: {},
  props: {
    data: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      /**
       * 穿梭框中选中的值
       */
      value: []
    };
  },
  computed: {
  },
  watch: {
    visible(val) {
      if (val) {
        this.value = this.showValue();
      }
    }
  },
  created() {
    this.value = this.showValue();
  },
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    },
    /**
     * 点击确认
     */
    handelConfirm() {
      window.localStorage.setItem(`showCustomerProperty-${store.getters.userId}-${store.getters.corpId}`, this.value);
      this.value = this.showValue();
      this.onClose();
      this.$emit('getList');
    },
    showValue() {
      let newIdList = [];
      const idList = window.localStorage.getItem(`showCustomerProperty-${store.getters.userId}-${store.getters.corpId}`);

      if (idList || idList === '') {
        newIdList = idList.split(',');
      } else {
        // 用户没有设置过显示字段则使用默认字段
        newIdList = ['createTime', 'userName', 'tag', 'status'];
      }
      return newIdList || [];
    }
  }

};
</script>
<style scoped lang='scss'>
.property-setting-modal {
    .el-alert {
        margin-bottom: 15px;
    }
}
</style>
