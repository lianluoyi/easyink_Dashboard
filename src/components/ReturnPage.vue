<!--
 * @Description: 返回组件
 * @Author: broccoli
 * @LastEditors: broccoli
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
  props: {},
  data() {
    return {
    };
  },
  created() {},
  mounted() {},
  methods: {
    handlleReturn() {
      this.$router.go(-1);
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
