<!--
 * @Description: 返回组件
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="return-page-div" v-bind="$attrs">
    <el-button type="text" size="medium" @click="handlleReturn">
      <div class="btn-show-content">
        <svg class="icon-restore" :width="18" :height="18">
          <use href="#icon-restore" />
        </svg>
        <span>{{ showText }}</span>
      </div>
    </el-button>
    <el-button v-if="showNextStep" type="primary" @click="$emit('nextStep')">下一步</el-button>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    // 组件若接受path，则路由跳转到该path
    // 只有传入path的返回组件，返回时才会显示页面数据保存提示
    path: {
      type: String,
      default: ''
    },
    // 跳转的组件参数
    query: {
      type: Object,
      default: () => {}
    },
    // 是否显示下一步
    showNextStep: {
      type: Boolean,
      default: false
    },
    // 是否需要使用自定义的返回方法
    customBackMethod: {
      type: Boolean,
      default: false
    },
    showText: {
      type: String,
      default: '返回'
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
      if (this.customBackMethod) {
        return this.$emit('customBackMethod');
      }
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
    padding: 0 15px;
    z-index: 900;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    .icon-restore{
      vertical-align: middle;
      margin-right: 10px;
    }
    .btn-show-content {
      display: flex;
      align-items: center;
    }
  }
</style>
