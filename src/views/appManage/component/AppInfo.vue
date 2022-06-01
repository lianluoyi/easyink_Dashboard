<script>
export default {
  name: 'AppInfo',
  components: {},
  props: {
    appName: {
      type: String,
      default: ''
    },
    appSketch: {
      type: String,
      default: ''
    },
    showTip: {
      type: Boolean,
      default: true
    },
    appLogo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
};
</script>

<template>
  <div class="app-list-item mb20">
    <div class="app-banner">
      <el-image :src="appLogo" alt="">
        <div slot="error" class="image-slot">
          <el-image :src="require('@/assets/logo/defaultAppLogo.png')" style="border:1px solid #E7E7E7;" />
        </div>
      </el-image>
    </div>
    <div class="app-sketch">
      <div>
        <div class="app-name">
          <span class="app-name-text"> {{ appName }} </span>
          <span v-if="showTip" class="app-name-tip"><i class="el-icon-warning" />应用无法使用，请联系企业管理员完善配置</span>
        </div>
        <div class="app-sketch-text"> {{ appSketch }} </div>
      </div>
      <div class="app-operation">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang='scss'>
.app-list-item{
  display: flex;
}
.app-banner {
  .el-image {
    width: 250px;
    height: 190px;
    border-radius: 5px;
    margin-right: 20px;
    vertical-align: bottom;
  }
}
.app-name{
  margin-bottom: 20px;
}
.app-name-text{
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  margin-right: 5px;
  vertical-align: middle;
}
.app-name-tip{
  vertical-align: middle;
  color: #FAAD14;
}
.app-sketch{
  display: flex;
  flex-flow: column;
  justify-content: space-between;
}
.app-sketch-text{
  font-size: 16px;
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
}
</style>

<docs lang="md">
应用信息组件
## 示例

应用中心:

```jsx
<NoConfigInfo :config-keys="['contactSecret', 'customSecret']" page-title="统计数据" />
```

</docs>
