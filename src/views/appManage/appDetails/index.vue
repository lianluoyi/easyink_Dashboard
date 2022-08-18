<template>
  <div class="show-data-wrapper">
    <div class="back" @click="back">
      <i class="el-icon-arrow-left" />返回上一页
    </div>
    <div>
      <AppInfo
        :app-name="appDetail.name"
        :app-sketch="appDetail.description"
        :app-logo="appDetail.logoUrl"
        :show-tip="false"
      >

        <el-button
          v-if="!appDetail.installed"
          v-hasPermi="['wecom:application:install']"
          type="primary"
          @click="() => handleAddApp(appDetail)"
        >
          添加
        </el-button>
        <el-button v-else-if="!isShielding(appDetail)" type="primary" @click="() => handleOpenApp(appDetail)">进入</el-button>
      </AppInfo>
      <WorkSheetAssistantDetail v-if="appDetail.name && appDetail.name.includes('工单')" :app-detail="appDetail" />
    </div>
  </div>
</template>
<script>
import AppInfo from '../component/AppInfo';
import { getApplicationDetail, installApplication } from '@/api/appManage';
import { SERVER_TYPE_THIRD, SERVER_TYPE_INTERNAL } from '@/utils/constant';
import WorkSheetAssistantDetail from './workSheetAssistantDetail.vue';

export default {
  name: '',
  components: { AppInfo, WorkSheetAssistantDetail },
  props: {},
  data() {
    return {
      empty: false,
      activeName: 'set',
      appId: null,
      config: null,
      appDetail: {},
      serverTypeThird: SERVER_TYPE_THIRD,
      serverTypeInternal: SERVER_TYPE_INTERNAL
    };
  },
  created() {
    this.appId = this.$route.query.appId;
    this.appId && this.getDetail(this.appId);
    if (this.$route.query.config) {
      this.config = JSON.parse(this.$route.query.config);
    }
  },
  mounted() {},
  methods: {
    handleAddApp(app) {
      installApplication({ appid: app.appid }).then(() => {
        this.$router.push({
          path: 'appConfig',
          query: { appId: app.appid }
        });
      });
    },
    back() {
      this.$router.go(-1);
    },
    getDetail(id) {
      getApplicationDetail({ appid: id }).then((res) => {
        this.appDetail = res.data;
      });
    },
    handleOpenApp(app) {
      if (!app.config) {
        this.$notify({
          title: '提示',
          message: '该应用还未完成配置，无法进入，请前往【应用管理】-【我的应用】完成配置。',
          type: 'warning'
        });
      } else {
        const config = JSON.parse(app.config);
        if (!config.url && !app.applicationEntranceUrl) {
          this.$notify({
            title: '提示',
            message: '该应用还未完成配置，无法进入，请前往【应用管理】-【我的应用】完成配置。',
            type: 'warning'
          });
          return;
        }
        window.open(config.url || app.applicationEntranceUrl);
      }
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
.back {
  margin-bottom: 20px;
  cursor: pointer;
}
.back i{
  margin-right: 5px;
}
.show-data-wrapper {
  background-color: #fff;
  padding: 20px;
  color: #333;
}
</style>
