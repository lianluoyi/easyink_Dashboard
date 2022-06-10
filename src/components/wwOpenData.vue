<!--
 * @Description: 获取企微账号数据的组件
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div>
    <ww-open-data v-if="showWWOpenData" :type="type" :openid="openid" />
    <span v-else>{{ userName }}</span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    // 类型：分为部门和人员姓名
    type: {
      type: String,
      default: undefined
    },
    // id:人员或部门的ID
    openid: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      showWWOpenData: true
    };
  },
  computed: {
    userName(val) {
      return this.$store.state.user.name;
    }
  },
  mounted() {
    this.showData();
    const textContent = document.querySelector('ww-open-data')?.textContent;
    if (!textContent && !this.userName.includes('_')) this.showWWOpenData = false;
  },
  methods: {
    showData() {
      // 绑定ww-open-data组件，这样才能显示出姓名或部门名
      const dom = document.querySelector('ww-open-data');
      // eslint-disable-next-line no-undef
      if (dom) WWOpenData.bind(dom);
    }
  }
};
</script>
