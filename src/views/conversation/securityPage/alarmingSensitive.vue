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
          <template v-slot:search>
            <el-form :inline="true" :model="recordPageConfig" class="demo-form-inline">
              <el-form-item>
                <div class="tag-input" @click="dialogVisibleSelectUser = true">
                  <span v-if="!queryUser.length" class="tag-place">请选择员工</span>
                  <template v-else>
                    <el-tag
                      v-for="(unit, unique) in queryUser"
                      :key="unique"
                      type="info"
                    >{{ unit.name }}</el-tag>
                  </template>
                </div>
              </el-form-item>
              <el-form-item>
                <el-select v-model="recordPageConfig.actName" placeholder="请选择敏感行为">
                  <el-option
                    v-for="item in tabData.map((item)=>item.actName)"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <DatePicker
                  :default-time="['00:00:00', '23:59:59']"
                  style="width:240px"
                  align="right"
                  type="datetimerange"
                  :time.sync="recordPageConfig.dateRange"
                  value-format="yyyy-MM-dd HH:mm:ss"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  v-preventReClick="200"
                  type="primary"
                  :loading="searchButtonLoading"
                  @click="()=>{
                    searchButtonLoading = true;
                    getSensiveRecordList(1)
                  }"
                >查询</el-button>
                <el-button
                  v-preventReClick="200"
                  class="btn-reset"
                  :loading="resetButtonLoading"
                  @click="()=>{
                    resetButtonLoading = true;
                    resetQuery()
                  }"
                >重置</el-button>
              </el-form-item>
            </el-form>
          </template>
          <template v-slot:data>
            <el-table
              v-loading="loading"
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
              :disabled="loading"
              :total="recordPageTotal"
              :page.sync="recordPageConfig.pageNum"
              :limit.sync="recordPageConfig.pageSize"
              @pagination="getSensiveRecordList()"
            />
            <!-- 选择添加人弹窗 -->
            <SelectUser
              :visible.sync="dialogVisibleSelectUser"
              title="选择添加人"
              :is-sigle-select="true"
              :selected-user-list="queryUser"
              @success="selectedUser"
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
import DatePicker from '@/components/DatePicker';
import moment from 'moment';
import SelectUser from '@/components/SelectUser/index.vue';
import * as sensitiveApis from '@/api/conversation/security';
import { PAGE_LIMIT, DEFAULT_AVATAR, WX_TYPE } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import AlarmingManage from './alarmingManage';
import { dealAtInfo } from '@/utils/common';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import loadingMixin from '@/mixin/loadingMixin';
export default {
  components: {
    RightContainer,
    AlarmingManage,
    EmptyDefaultIcon,
    DatePicker,
    SelectUser
  },
  mixins: [loadingMixin],
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
      queryUser: [], // 搜索框选择的添加人
      recordPageTotal: 0,
      recordPageConfig: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        auditScopeId: undefined,
        // 敏感行为
        actName: undefined,
        dateRange: [moment().subtract(1, 'month').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD 23:59:59')]
      },
      defaultUserImg: DEFAULT_AVATAR,
      wxType: WX_TYPE,
      loading: false,
      dialogVisibleSelectUser: false // 选择添加人弹窗显隐
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
    getSensiveRecordList(pageNum) {
      if (pageNum) this.recordPageConfig.pageNum = pageNum;
      this.loading = true;
      const payload = {
        ...this.recordPageConfig,
        beginTime: this.recordPageConfig.dateRange[0],
        endTime: this.recordPageConfig.dateRange[1]
      };
      delete payload.dateRange;
      sensitiveApis.getSensitiveRecord(payload).then(res => {
        const resData = [...res.rows];
        resData.forEach((item) => {
          const dealOperateTargetObj = this.dealUserInfo(item, 'operateTarget');
          const dealOperatorObj = this.dealUserInfo(item, 'operator');
          if (dealOperateTargetObj) item.operateTargetObj = dealOperateTargetObj;
          if (dealOperatorObj) item.operateObj = dealOperatorObj;
        });
        this.recordSensitive = resData;
        this.recordPageTotal = Number(res.total);
      }).finally(() => {
        this.modifyButtonStatus();
        this.loading = false;
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
    },
    selectedUser(list) {
      this.queryUser = list;
      this.recordPageConfig.auditScopeId = list.map((d) => d.userId) + '';
    },
    // 重置查询条件并调用查询接口
    resetQuery() {
      this.recordPageConfig = {
        pageSize: PAGE_LIMIT,
        pageNum: 1,
        auditScopeId: undefined,
        actName: undefined,
        dateRange: [moment().subtract(1, 'month').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD 23:59:59')]
      };
      // 选择的员工
      this.queryUser = [];
      this.getSensiveRecordList(1);
    }
  }
};
</script>
<style lang="scss" scoped>
.demo-form-inline {
  background: #efefef;
  padding: 18px 10px 0 10px;
  margin-bottom: 0 !important;
}
.white-tabs {
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
  /deep/ .show-data-wrapper {
    padding-top: 0;
    overflow: auto;
  }
}
</style>
