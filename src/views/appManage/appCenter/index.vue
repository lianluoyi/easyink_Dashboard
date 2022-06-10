<template>
  <div class="show-data-wrapper">
    <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick">
      <el-tab-pane name="tab1" class="tabs-pane tool-tab" :stretch="true">
        <div slot="label" class="tabs-name">
          <svg class="icon-a-gongju1" :width="25" :height="25">
            <use :href="activeName === 'tab1' ? '#icon-gongju' : '#icon-a-gongju1'" />
          </svg>
          <div :class="activeName === 'tab1' ?'active' : ''">
            企业工具
          </div>
        </div>
        <div style="height: 5px" />
        <AppInfo
          v-for="app in appList"
          :key="app.appid"
          :app-name="app.name"
          :app-sketch="app.description"
          :app-logo="app.logoUrl"
          :show-tip="false"
        >
          <el-button type="primary" @click="() => handleDetailsClick(app)">查看详情</el-button>
        </AppInfo>
      </el-tab-pane>
      <el-tab-pane name="tab2">
        <div slot="label" class="tabs-name">
          <svg class="icon-a-kehuziyuanguanli1" :width="25" :height="25">
            <use :href="activeName === 'tab2' ? '#icon-kehuziyuanguanli' : '#icon-a-kehuziyuanguanli1'" />
          </svg>
          <div :class="activeName === 'tab2' ?'active' : ''">客户资源</div>
        </div>
        <div class="empty"><el-empty :image="require('@/assets/image/appCenterEmpty.png')" :image-size="240" description="更多应用研发中，敬请期待.." /></div>
      </el-tab-pane>
      <el-tab-pane name="tab3">
        <div slot="label" class="tabs-name">
          <svg class="icon-a-neirongguanli1" :width="25" :height="25">
            <use :href="activeName === 'tab3' ? '#icon-neirongguanli' : '#icon-a-neirongguanli1'" />
          </svg>
          <div :class="activeName === 'tab3' ?'active' : ''">内容资源</div>
        </div>
        <div class="empty"><el-empty :image="require('@/assets/image/appCenterEmpty.png')" :image-size="240" description="更多应用研发中，敬请期待.." /></div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import AppInfo from '../component/AppInfo';
import { getApplicationList } from '@/api/appManage';

export default {
  name: '',
  components: { AppInfo },
  props: {},
  data() {
    return {
      activeName: 'tab1',
      appList: [],
      query: {
        type: 1
      }
    };
  },
  created() {
    this.getList(this.query);
  },
  mounted() {},
  methods: {
    handleClick(tab) {
      this.activeName = tab.name;
    },
    getList(type) {
      getApplicationList(type).then((res) => {
        this.appList = res.data;
      });
    },
    handleDetailsClick(app) {
      this.$router.push({
        path: 'appDetails',
        query: {
          appId: app.appid,
          config: app.config
        }
      });
    }
  }

};
</script>
<style scoped  lang="scss">
.tabs-name{
  display: flex;
  vertical-align: baseline;
  align-items: flex-end;
}
.tabs-name div{
  line-height: 25px;
  color: #666;
}
.show-data-wrapper{
  background-color: #fff;
  padding: 20px;
  color: #333;
}
.app-list-item{
  display: flex;
}
.app-banner img{
  width: 250px;
  height: 190px;
  border-radius: 5px;
  margin-right: 20px;
  vertical-align: bottom;
}
.tabs-name .active {
  color: #333;
}
.tabs-name div{
  margin-left: 5px;
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
/deep/ .el-empty__description p{
    font-size: 18px;
    font-weight: bold;
    color: #333;
}
.tabs{
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
/deep/ .el-tabs__content{
  min-height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
}
/deep/ .el-tab-pane{
  min-height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
}
.empty{
  display: flex;
  flex: 1;
  justify-content: center;
  flex-direction: column;
}
</style>
