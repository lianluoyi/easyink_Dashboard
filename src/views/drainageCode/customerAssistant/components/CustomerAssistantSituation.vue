<!--
 * @Description: 获客情况
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <Statistics title="获客情况" :col-list="colList">
      <template slot="extraInfo">
        <el-tooltip
          v-if="!loading"
          effect="dark"
          content="更新统计"
          placement="top"
        >
          <i
            class="el-icon-refresh theme-text-color refresh"
            @click="refreshSituation"
          />
        </el-tooltip>
        <i v-else v-loading="loading" class="loading" />
      </template>
      <template slot="operate">
        <el-popover trigger="hover" placement="left-start">
          <div class="popover-content">
            <div class="info">
              <p>今日新增客户：企业下，今天通过获客链接添加员工的客户数</p>
              <p>
                累计新增客户：截止到今天，企业下通过获客链接添加员工的客户数
              </p>
              <p>剩余使用量：企业购买的获客助手使用量余额</p>
            </div>
          </div>
          <div slot="reference">
            <span class="statistic theme-text-color mr10 f14">统计说明</span>
          </div>
        </el-popover>
        <el-button plain type="primary" @click="openWarnConfig">告警设置</el-button>
        <el-button plain type="primary" @click="openLink">购买使用量</el-button>
      </template>
    </Statistics>
    <AlarmSetting :visible.sync="alarmSettingVisible" />
  </div>
</template>
<script>
import { getSituation, syncSituation } from '@/api/drainageCode/customerAssistant';
import AlarmSetting from './AlarmSetting.vue';
import Statistics from '@/components/Statistics.vue';
export default {
  name: '',
  components: { Statistics, AlarmSetting },
  props: {},
  data() {
    return {
      colList: [
        {
          newCustomerCnt: 0,
          title: '今日新增客户',
          filed: 'newCustomerCnt'
        },
        {
          total: 0,
          title: '累计新增客户',
          filed: 'total'
        },
        {
          balance: 0,
          title: '剩余使用量',
          filed: 'balance'
        }
      ],
      alarmSettingVisible: false,
      loading: false
    };
  },
  created() {},
  mounted() {
    this.getCustomerSituation();
  },
  methods: {
    getCustomerSituation() {
      const LOWER_USE_ALERT = 50;
      const ALERT_FIELD_KEY = 'balance';
      getSituation().then((res) => {
        if (!res?.data) {
          this.colList = [
            {
              newCustomerCnt: 0,
              title: '今日新增客户',
              filed: 'newCustomerCnt'
            },
            {
              total: 0,
              title: '累计新增客户',
              filed: 'total'
            },
            {
              balance: 0,
              title: '剩余使用量',
              filed: 'balance'
            }
          ];
          return;
        }
        this.colList = this.colList?.map((item) => {
          const updateParams = {
            ...item,
            [item.filed]: res.data[item.filed]
          };
          if (
            item.filed === ALERT_FIELD_KEY &&
            res.data[ALERT_FIELD_KEY] <= LOWER_USE_ALERT
          ) { updateParams.numColor = '#EE6665'; }
          return updateParams;
        });
      });
    },
    refreshSituation() {
      this.loading = true;
      syncSituation().then(() => {
        this.getCustomerSituation();
      }).finally(() => {
        this.loading = false;
      });
    },
    /**
     * 打开告警设置弹窗
     */
    openWarnConfig() {
      this.alarmSettingVisible = true;
    },
    openLink() {
      const PURCHASE_URL = 'https://work.weixin.qq.com/wework_admin/frame#/customer/customerAcquisition/buy';
      window.open(PURCHASE_URL);
    }
  }
};
</script>
<style lang="scss" scoped>
.refresh {
  font-size: 16px;
  cursor: pointer;
}
.loading {
  /deep/ .el-loading-mask {
    .el-loading-spinner {
      margin-top: -12px;
      margin-left: 6px;
    }
    .el-loading-spinner .circular {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
