<!--
 * @Decsription: 敏感行为警告页面
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="alarming">
    <el-tabs v-model="activeName" class="white-tabs">
      <el-tab-pane v-hasPermi="['wecom:sensitiveact:list']" label="敏感行为记录" name="record">
        <RightContainer>
          <template v-slot:data>
            <el-table
              :data="recordSensitive"
              size="medium"
              style="width: 100%"
            >
              <template slot="empty">
                <empty-default-icon :length="recordSensitive.length" />
              </template>
              <el-table-column label="操作人">
                <template slot-scope="scope">
                  <div :class="`${(scope.row.operateObj && scope.row.operateObj.type) ? 'user-info-center' : ''} user-info`">
                    <img :width="35" :height="35" :src="(scope.row.operateObj && scope.row.operateObj.avatar) || scope.row.operatorHeadImageUrl || defaultUserImg">
                    <span class="inoneline">{{ (scope.row.operateObj && scope.row.operateObj.name) || scope.row.operator }}</span>
                    <span v-if="scope.row.operateObj" :class="scope.row.operateObj.type === wxType ? 'wx-type-flag' : 'customer-type'">{{ renderUserInfo(scope.row.operateObj) }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作对象">
                <template slot-scope="scope">
                  <div :class="`${(scope.row.operateTargetObj && scope.row.operateTargetObj.type) ? 'user-info-center' : ''} user-info`">
                    <img :width="35" :src="(scope.row.operateTargetObj && scope.row.operateTargetObj.avatar) || scope.row.operateTargetHeadImageUrl || defaultUserImg">
                    <div>
                      <span class="inoneline">{{ (scope.row.operateTargetObj && scope.row.operateTargetObj.name) || scope.row.operateTarget }}</span>
                      <span v-if="scope.row.operateTargetObj" :class="scope.row.operateTargetObj.type === wxType ? 'wx-type-flag' : 'customer-type'">{{ renderUserInfo(scope.row.operateTargetObj) }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="sensitiveAct" label="敏感行为" />
              <el-table-column prop="createTime" label="操作时间" />
            </el-table>
            <pagination
              v-show="total > 0"
              :total="recordPageTotal"
              :page.sync="recordPageConfig.pageNum"
              :limit.sync="recordPageConfig.pageSize"
              @pagination="getSensiveRecordList()"
            />
          </template>
        </RightContainer>
      </el-tab-pane>
      <el-tab-pane v-hasPermi="['wecom:sensitiveact:edit']" label="敏感行为管理" name="manage">
        <AlarmingManage :data="tabData" :handle-status-change="handleStatusChange" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import * as sensitiveApis from '@/api/conversation/security';
import { PAGE_LIMIT, DEFAULT_AVATAR, WX_TYPE } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import AlarmingManage from './alarmingManage';
import { dealAtInfo } from '@/utils/common';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';

export default {
  components: {
    RightContainer,
    AlarmingManage,
    EmptyDefaultIcon
  },
  data() {
    return {
      activeName: 'record',
      recordSensitive: [],
      tabData: [],
      total: 0,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      recordPageTotal: 0,
      recordPageConfig: {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      defaultUserImg: DEFAULT_AVATAR,
      wxType: WX_TYPE
    };
  },
  mounted() {
    this.getSensiveRecordList();
    this.getSensitiveManagementList();
  },
  methods: {
    dealUserInfo(item, key) {
      let obj = null;
      if (item[key]) {
        try {
          obj = JSON.parse(item[key]);
        } catch (e) {
          console.log('操作对象/操作人信息解析失败');
        }
      }
      return obj;
    },
    getSensiveRecordList() {
      sensitiveApis.getSensitiveRecord(this.recordPageConfig).then(res => {
        const resData = [...res.rows];
        resData.forEach((item) => {
          const dealOperateTargetObj = this.dealUserInfo(item, 'operateTarget');
          const dealOperatorObj = this.dealUserInfo(item, 'operator');
          if (dealOperateTargetObj) item.operateTargetObj = dealOperateTargetObj;
          if (dealOperatorObj) item.operateObj = dealOperatorObj;
        });
        this.recordSensitive = resData;
        this.recordPageTotal = Number(res.total);
      });
    },
    getSensitiveManagementList() {
      sensitiveApis.getSensitiveManagement(this.query).then(res => {
        this.tabData = res.rows;
        this.total = Number(res.total);
      });
    },
    /**
     * 开启/关闭敏感行为
     */
    handleStatusChange(item) {
      sensitiveApis.updateSensitive(item).then(res => {
        this.msgSuccess('操作成功');
      });
    },
    renderUserInfo(item, key) {
      return dealAtInfo(item, key);
    }
  }
};
</script>
<style lang="scss" scoped>
.white-tabs {
  padding: 10px 0;
  background: #fff;
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  /deep/ .el-tabs__nav-wrap::after {
    height: 0;
  }
  .user-info {
    display: flex;
    img {
      height: 35px;
      width: 35px;
      margin-right: 5px;
    }
    .wx-type-flag {
      color: $wxGreen;
      margin-left: 3px;
    }
    .customer-type {
      color: $orange;
      margin-left: 3px;
    }
  }
  .user-info-center {
    display: flex;
    align-items: center;
  }
}
</style>
