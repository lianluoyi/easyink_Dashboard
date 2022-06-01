<script>
export default {
  name: 'CustomerServicePopover',
  components: {},
  props: {},
  data() {
    return {

    };
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {}
};
</script>

<template>
  <el-popover placement="right" trigger="click">
    <div class="popover-content">
      <h1>在线客服</h1>
      <p>为您解答系统使用问题</p>
      <img :src="require('@/assets/image/wxwork-qrcode.png')" alt="">
      <h3 style="font-weight: normal;">使用微信扫码</h3>
    </div>
    <div slot="reference" class="popover-btn">
      <svg class="icon-kefu" :width="25" :height="25">
        <use href="#icon-kefu" />
      </svg>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.popover-btn{
    @include bg_color($color-theme2-1);
    width: 45px;
    height: 45px;
    padding: 10px;
    border-radius: 5px 0px 0px 5px;
    position: absolute;
    right: 0;
    bottom: 65px;
    z-index: 999;
}
.popover-content{
    padding: 14px 26px 12px 20px;
    text-align: left;
}
.popover-content h1{
    font-size: 16px;
    color: #333;
    margin-bottom: 10px;
}
.popover-content p{
    font-size: 14px;
    font-family: Arial-regular;
    color: rgba(51, 51, 51, 100);
    margin-bottom: 9px;
}
.popover-content img{
    width: 140px;
    height: 140px;
    margin-bottom: 8px;
}
.popover-content h3{
    color: rgba(153, 153, 153, 100);
    font-size: 12px;
    font-family: Arial-regular;
}
</style>
