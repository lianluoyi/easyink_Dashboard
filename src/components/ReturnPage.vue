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
    },
    // 跳转的组件参数
    query: {
      type: Object,
      default: () => {}
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
      // 跳转到客户资料的不需要在组件中添加path 返回时会丢失原本的路由数据，若需要在详情页修改 ，可以在query里添加数据
      if (this.path) {
        this.$router.push(!Object.keys(this.query || {}).length ? this.path : { path: this.path, query: this.query });
      } else {
        // 由于客户详情页来自的页面不同 在此单独处理
        if (window.sessionStorage.getItem('from') !== '/customerManage/customerCenter/customer') {
          this.$router.go(-1);
          return;
        }
        this.$router.push(window.sessionStorage.getItem('from'));
      }
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
