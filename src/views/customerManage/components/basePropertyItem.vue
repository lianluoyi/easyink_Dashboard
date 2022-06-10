<!--
 * @Description: 基本信息字段
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="base-property-item">
    <div v-if="['remark'].includes(item.id)">
      <el-input
        v-if="editStatus"
        v-model="item.value"
        placeholder="请填写备注"
        maxlength="12"
        show-word-limit
      />
      <span v-else>{{ item.value }}</span>
    </div>
    <div v-if="['gender', 'age'].includes(item.id)">
      {{ item.value }}
    </div>
    <div v-if="item.id === 'tag'">
      <el-tag
        v-for="(unit, unique) in item.value"
        :key="unique"
        class="customer-tag-item"
        type="info"
      >{{ unit.tagName }}</el-tag>
      <i v-if="editStatus" class="el-icon-edit theme-text-color" @click="openModal" />
    </div>
    <div v-if="item.name === '出生日期'">
      <el-date-picker
        v-if="editStatus"
        v-model="item.value"
        type="date"
        :picker-options="pickerOptions"
        value-format="yyyy-MM-dd"
        placeholder="请选择出生日期"
      />
      <span v-else>{{ item.value }}</span>
    </div>
    <div v-if="['邮箱', '电话'].includes(item.name)">
      <el-input
        v-if="editStatus"
        v-model="item.value"
      />
      <span v-else>{{ item.value }}</span>
    </div>
    <div v-if="item.name === '地址'">
      <el-input
        v-if="editStatus"
        v-model="item.value"
        maxlength="64"
        show-word-limit
      />
      <span v-else>{{ item.value }}</span>
    </div>
    <div v-if="item.name === '描述'">
      <el-input
        v-if="editStatus"
        v-model="item.value"
        type="textarea"
        :rows="2"
        maxlength="200"
        show-word-limit
      />
      <span v-else>{{ item.value }}</span>
    </div>

  </div>
</template>
<script>
export default {
  name: '',
  components: { },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    /**
     * 是否可编辑
     */
    editStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      }

    };
  },
  created() {},
  mounted() {},
  methods: {
    openModal() {
      this.$emit('update:dialogVisible', true);
    },
    showAddTagDialog(data) {
      this.form = JSON.parse(
        JSON.stringify({ weTags: [], ...data })
      );
    }

  }

};
</script>
<style scoped lang='scss'>
.base-property-item {
  min-height: 21px;
  .el-icon-edit {
      cursor: pointer;
  }
  .customer-tag-item {
    margin-bottom: 2px;
    margin-top: 2px;
  }
}
</style>
