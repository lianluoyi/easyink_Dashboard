<template>
  <div class="show-data-wrapper">
    <div class="back" @click="back">
      <i class="el-icon-arrow-left" />返回上一页
    </div>
    <div>
      <AppInfo
        :app-name="appName"
        :app-sketch="appDetail.description"
        :app-logo="appDetail.logoUrl"
        :show-tip="false"
      >
        <el-button class="app-del-btn btn-reset" @click="open">移除</el-button>
      </AppInfo>
      <div class="mt10">
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="配置管理" name="set">
            <WorkSheetAssistant
              v-if="appName.includes('工单')"
              :app-detail="appDetail"
            />
          </el-tab-pane>
          <!-- <el-tab-pane v-if="appName.includes('工单')" label="系统设置" name="system">
            <SystemSetConfig
              :update-my-application-config="handleInstallApp"
              :app-id="appId && Number(appId)"
              :app-detail="appDetail"
              @getDetail="getDetail"
            />
          </el-tab-pane> -->
          <!-- <el-tab-pane v-if="appId !== 1" label="充值与订单" name="order">充值与订单</el-tab-pane> -->
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import AppInfo from '../component/AppInfo';
import {
  getApplicationDetail,
  updateMyApplicationConfig,
  deleteMyApplication
} from '@/api/appManage';
import WorkSheetAssistant from './workSheetAssistant.vue';
// import SystemSetConfig from './systemSetConfig.vue';

export default {
  name: '',
  components: { AppInfo, WorkSheetAssistant },
  props: {},
  data() {
    return {
      empty: false,
      activeName: 'set',
      appId: null,
      appDetail: {},
      config: {
        url: ''
      },
      oldConfig: null
    };
  },
  computed: {
    appName() {
      return this.appDetail.name || '';
    }
  },
  created() {
    this.appId = this.$route.query.appId;
    this.appId && this.getDetail(this.appId);
    if (this.$route.query.config) {
      this.config = {
        url: '',
        ...JSON.parse(decodeURIComponent(this.$route.query.config))
      };
      this.oldConfig = JSON.parse(decodeURIComponent(this.$route.query.config));
    }
  },
  mounted() {},
  methods: {
    open() {
      this.$confirm(
        '移除后，员工不可再使用该应用，可从应用中心重新添加，是否继续？',
        '操作须知',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          deleteMyApplication({ appid: this.appId }).then(() => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.$router.push({
              path: 'myApp'
            });
          });
        })
        .catch(() => {
          this.msgInfo('已取消删除');
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
    handleInstallApp(params) {
      updateMyApplicationConfig(params).then(() => {
        this.oldConfig = this.config;
        this.$message({
          message: '配置成功',
          type: 'success'
        });
      });
    }
  }
};
</script>
<style scoped lang="scss">
.back {
  margin-bottom: 20px;
  cursor: pointer;
}
.back i {
  margin-right: 5px;
}
.show-data-wrapper {
  background-color: #fff;
  padding: 20px;
  color: #333;
}
</style>
