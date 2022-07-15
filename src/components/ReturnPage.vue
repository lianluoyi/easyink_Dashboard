<!--
 * @Description: 返回组件
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="return-page-div" v-bind="$attrs">
    <el-button type="text" size="medium" @click="handlleReturn">
      <svg class="icon-restore" :width="18" :height="18">
        <use href="#icon-restore" />
      </svg>返回
    </el-button>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    // 组件若接受path，则路由返回到该path
    path: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    };
  },
  created() {},
  mounted() {},
  methods: {
    handlleReturn() {
      if (this.path) {
        this.$router.push(this.path);
      } else {
        this.$router.go(-1);
      }
      // 后面重新修改
      // if (window.sessionStorage.getItem('labelType') && this.$route.query.labelType) { // 自动标签路由携带的参数
      //   this.$router.push({ path: window.sessionStorage.getItem('from'), query: { labelType: this.$route.query.labelType }});
      // } else if (window.sessionStorage.getItem('sopType') && this.$route.query.sopType) { // SOP路由携带参数
      //   this.$router.push({ path: window.sessionStorage.getItem('from'), query: { sopType: this.$route.query.sopType }});
      // } else if (window.sessionStorage.getItem('welcomeMsgTplType') && this.$route.query.welcomeMsgTplType) { // 欢迎语路由携带参数
      //   this.$router.push({ path: window.sessionStorage.getItem('from'), query: { welcomeMsgTplType: this.$route.query.welcomeMsgTplType }});
      // } else {
      //   this.$router.push(window.sessionStorage.getItem('from'));
      // }
    }
  }

};
</script>
<style scoped lang='scss'>
.return-page-div{
    /deep/ .el-button--text{
      color: #666;
      font-size: 14px;
      line-height: 28px;
    }
    width: 100%;
    height: 48px;
    border-bottom: 1px solid rgba(238, 238, 238, 100);
    padding-left: 15px;
    z-index: 900;
    background-color: #fff;
    .icon-restore{
      vertical-align: middle;
      margin-right: 10px;
    }
  }
</style>
