<template>
  <div class="show-data-wrapper">
    <div v-if="myAppList.length != 0">
      <AppInfo
        v-for="app in myAppList"
        :key="app.appid"
        :app-name="app.name"
        :app-sketch="app.description"
        :app-logo="app.logoUrl"
        :show-tip="dealShowTip(app)"
      >
        <el-button
          v-if="(!!(app.config.url) || app.applicationEntranceUrl) && !isShielding(app)"
          type="primary"
          @click="() => openApp(app)"
        >进入应用</el-button>
        <el-button
          v-hasPermi="['wecom:myApplication:update']"
          class="app-config-btn btn-reset"
          @click="() => handleAppConfigClick(app)"
        >应用设置</el-button>
      </AppInfo>
    </div>
    <div v-else class="empty">
      <div class="empty-title">开启高效且持续的营收增长之路</div>
      <div class="empty-des">为企业提供更多应用工具，满足多场景、多行业的需求，提升运营服务能力</div>
      <div>
        <el-button
          type="primary"
          class="empty-btn"
          @click="handleGotoAppCenter"
        >了解详情</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import AppInfo from '../component/AppInfo';
import { getMyApplicationList } from '@/api/appManage';

export default {
  name: '',
  components: { AppInfo },
  props: {},
  data() {
    return {
      empty: false,
      myAppList: []
    };
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    handleAppConfigClick(app) {
      this.$router.push({
        path: 'appConfig',
        query: {
          appId: app.appid,
          config: encodeURIComponent(JSON.stringify(app.config))
        }
      });
    },
    getList() {
      getMyApplicationList().then((res) => {
        res.data.map((item) => {
          item.config = item.config && JSON.parse(item.config);
        });
        this.myAppList = res.data;
      });
    },
    openApp(app) {
      let url = app.config.url || app.applicationEntranceUrl;
      if (app.name.includes('工单')) {
        if (!app.config.networkId) {
          this.msgWarn('请先联系管理员配置网点ID');
          return;
        }
        url = `${url}/${app.config.networkId}`;
      }
      window.open(url);
    },
    handleGotoAppCenter() {
      this.$router.push({ path: 'appCenter' });
    },
    dealShowTip(app) {
      if (app.name) { return !app.config.url && !app.applicationEntranceUrl && !app.sidebarRedirectUrl; }
    },
    /**
     * 是否屏蔽进入应用按钮
     */
    isShielding(app) {
      return app?.name?.includes('工单');
    }
  }

};
</script>
<style scoped lang="scss">
@import '~@/styles/mixin.scss';
.show-data-wrapper{
  background-color: #fff;
  padding: 20px;
  color: #333;
}
.empty {
  text-align: center;
  min-height: 100%;
  background:url('../../../assets/image/myAppEmpty.svg') center center no-repeat;
}
.empty .empty-title{
  font-size: 40px;
  font-weight: bold;
  margin: 0 0 30px;
  padding: 50px 0 0;
}
.empty .empty-des{
  font-size: 18px;
  margin: 0 0 40px;
}
.empty-btn{
  width: 150px;
  height: 50px;
  font-size: 16px;
}
</style>
