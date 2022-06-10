<!--
 * @Description: 换肤抽屉
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-drawer
    class="change-theme-drawer"
    :before-close="handleClose"
    title="更换主题"
    v-bind="$attrs"
    size="600px"
  >
    <div style="padding: 0 20px;color: #606266">
      请从以下主题中选择自己的easyWeCom主打色
    </div>
    <div class="theme-list">
      <div
        v-for="(item, index) in themeList"
        :key="index"
        class="theme-div"
      >
        <div class="theme-color-div" :style="`background-color: ${item.id}`" @click="() => changeTheme(item.id, index + 1)">
          <i v-if="nowActiveTheme === `theme${index + 1}`" class="el-icon-check" />
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      themeList: [{ id: '#66BFBF', otherList: ['#47A9A9', '#66BFBF', '#BCE1E1', '#DFF1F1'] },
        { id: '#6BB4AB', otherList: ['#3AB2A6', '#6BB4AB', '#C1DDD8', '#F0F8F7'] },
        { id: '#196B69', otherList: ['#196B69', '#259D9B', '#CDE9E9', '#DFF1F1'] },
        { id: '#3498DB', otherList: ['#3498DB', '#CBE5F6', '#E1F0FA'] },
        { id: '#3F72AF', otherList: ['#3F72AF', '#A9C2DF', '#CEDCED'] },
        { id: '#112D4E', otherList: ['#112D4E', '#BCD4F0', '#D2E2F4'] },
        { id: '#090723', otherList: ['#090723', '#37ADFF', '#B8E4FF', '#D1EDFF'] },
        { id: '#3A4750', otherList: ['#3A4750', '#37ADFF', '#B8E4FF', '#D1EDFF'] }],
      nowActiveTheme: 'theme1'
    };
  },
  created() {
    this.nowActiveTheme = localStorage.getItem('themeType') || 'theme1';
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    },
    changeTheme(val, theme) {
      window.document.documentElement.setAttribute('data-theme', `theme${theme}`);
      localStorage.setItem('themeType', `theme${theme}`);
      this.nowActiveTheme = `theme${theme}`;
    }
  }

};
</script>
<style scoped lang='scss'>
.change-theme-drawer {
    color: $black;
    .theme-list {
        display: flex;
        margin-top: 10px;
        flex-wrap: wrap;
        padding-left: 20px;
        .theme-div {
            width: 70px;
            height: 70px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            .theme-color-div {
              color: #fff;
              width: 50px;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              &:hover {
                  width: 60px;
                  height: 60px;
              }
            }
        }
    }
}
</style>
