<!--
 * @Decsription: 敏感行为管理布局
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="alarming-manage-div">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="alarming-item"
    >
      <div class="img">
        <img :src="renderCover(item)">
      </div>
      <div class="content">
        <div class="title">{{ item.actName }}</div>
        <div>
          <el-switch v-model="item.enableFlag" :active-value="1" :inactive-value="2" @change="handleStatusChange(item)" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import deleteCustomerImg from '@/assets/image/delete-customer.svg';
import redPacketImg from '@/assets/image/red-packet.svg';
import businessCardImg from '@/assets/image/business-card.svg';

export default {
  components: {

  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    handleStatusChange: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {

    };
  },
  mounted() {
  },
  methods: {
    renderCover(item) {
      let coverImg = businessCardImg;
      switch (item.actName) {
        case '拉黑/删除客户': {
          coverImg = deleteCustomerImg;
          break;
        }
        case '员工/客户发送红包': {
          coverImg = redPacketImg;
          break;
        }
        case '员工发送名片': {
          coverImg = businessCardImg;
          break;
        }
      }
      return coverImg;
    }
  }
};
</script>
<style lang="scss" scoped>
.alarming-manage-div {
  display: flex;
  padding: 20px;
  flex-wrap: wrap;
  .alarming-item {
    border: 1px solid #C5E1DD;
    border-radius: 3px;
    width: 300px;
    height: 200px;
    margin-right: 15px;
    display: flex;
    flex-direction: column;
    .img {
      text-align: center;
      background-color: $bgLightBaseColor;
      flex: 1;
      img {
        height: 150px;
        width: 150px;
      }
    }
    .content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      padding: 0 10px;
      border-top: 1px solid #C5E1DD;
      .title {
        color: $black;
        font-weight: bold;
        font-size: 16px;
      }
    }
  }
}
</style>
