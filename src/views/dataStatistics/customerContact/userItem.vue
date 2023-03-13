<!--
 * @Description: 员工以及客户表格内的展示
 * @Author: xulinbin
 * @LastEditors: wJiaaa
-->
<template>
  <div class="user-wrap">
    <div class="user-img">
      <img :src="headImg || require('@/assets/image/card-avatar.svg')">
    </div>
    <div v-if="isStaff" class="user-textinfo">
      <div class="name oneline">{{ userName }}</div>
      <div class="department oneline">
        {{ companName }}{{ companName && data.departmentName && '/' }}{{ data.departmentName }}
      </div>
    </div>
    <div v-else class="user-name intwoline">
      {{ userName }}
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: { },
  props: {
    // 用户展示所需数据
    data: {
      type: Object,
      default: () => {}
    },
    // 是否是员工展示（员工展示下方为公司部门）、客户展示只有客户昵称
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  computed: {
    companName() {
      return this.$store.state.enterPriseWechatConfig.companyName;
    },
    // 头像
    headImg() {
      return this.isStaff ? this?.data?.userHeadImage : this?.data?.externalUserHeadImage;
    },
    // 名称
    userName() {
      return this.isStaff ? this?.data?.userName : this?.data?.externalUserName;
    }
  },
  watch: {},
  methods: {}
};
</script>
<style scoped lang='scss'>
.oneline {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  -ms-text-overflow: ellipsis;
  text-overflow: ellipsis;
}
.user-wrap {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
}
.user-img{
  height: 35px;
  width: 35px;
  margin-right: 5px;
  img {
    height: 100%;
    width: 100%;
  }
}
.user-textinfo, .user-name {
  flex: 1;
}
.user-textinfo {
  display: flex;
  flex-direction: column;
  .name {
    font-size: 14px;
  }
  .department {
    font-size: 12px;
    color: #AAA;
  }
}

</style>
