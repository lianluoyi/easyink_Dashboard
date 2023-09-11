<!--
 * @Description: 如何使用兑换活动
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <el-drawer
    :append-to-body="true"
    title="如何使用兑换活动"
    :visible.sync="Pvisible"
    size="780px"
    :wrapper-closable="true"
  >
    <div class="draw-body">
      <div class="draw-body-step">
        <div class="draw-body-title">一、创建兑换活动</div>
        <div class="draw-body-content">在营销活动下，填写基本信息，创建兑换活动
          <el-image
            class="part-img"
            :src="require('@/assets/image/add-code-1.png')"
            :preview-src-list="[
              require('@/assets/image/add-code-1.png'),
            ]"
          />
        </div>
      </div>
      <div class="draw-body-step">
        <div class="draw-body-title">二、导入兑换码</div>
        <div class="draw-body-content">根据模板填入兑换码数据，一键导入
          <el-image
            class="part-img"
            :src="require('@/assets/image/add-code-2.png')"
            :preview-src-list="[
              require('@/assets/image/add-code-2.png'),
            ]"
          />
        </div>
      </div>
      <div class="draw-body-step">
        <div class="draw-body-title">三、应用兑换活动</div>
        <div class="draw-body-content">前往员工活码，设置欢迎语类型为“活动欢迎语”，选择兑换活动，在欢迎语中插入“#兑换码#”并生成员工活码。当客户通过活码添加员工时，将“#兑换码#”替换为真正的兑换码并作为欢迎语发出，客户即可拿到兑换码换取权益。
          <div>
            （新客进群也支持兑换活动）
          </div>
          <el-image
            class="part-img"
            :src="require('@/assets/image/add-code-3.png')"
            :preview-src-list="[
              require('@/assets/image/add-code-3.png'),
            ]"
          />
        </div>
      </div>
      <div class="confirm-div">
        <div class="confirm-btn-div">
          <el-button type="primary" @click="goRoute()">现在去创建活动</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  methods: {
    goRoute() {
      if (this.Pvisible) {
        this.Pvisible = false;
        this.$emit('update:pvisible', false);
        setTimeout(() => {
          this.$router.push('/operationsCenter/conversionCode/conversionCodeAdd');
        // eslint-disable-next-line no-magic-numbers
        }, 200);
      } else {
        this.$router.push('/operationsCenter/conversionCode/conversionCodeAdd');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-drawer__header {
  margin-bottom: 26px
}
.draw-body {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .draw-body-title {
      margin-left: 20px;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 9px;
    }
    .draw-body-content {
      margin-bottom: 10px;
      line-height:20px;
      margin-left: 58px;
    }
    .confirm-div {
      display: inline-block;
      .confirm-btn-div {
        float: right;
        margin: 20px 20px;
        &::after{
          clear: both;
        }
      }
    }
}
.part-img {
  width: 520px;
  height: 300px;
  margin-top: 5px;
  border: 1px solid gray;
}
</style>
