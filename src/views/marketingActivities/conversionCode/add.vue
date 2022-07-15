<!--
 * @Description: 新建兑换码活动
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="wrap">
    <ReturnPage />
    <div class="wrap-body">
      <el-alert
        title="功能说明"
        type="info"
        description="结合员工活码或其他功能使用，向指定客户发送兑换活动下的兑换码，客户获得兑换码后换取专属权益。"
        show-icon
        :closable="false"
      />
      <div class="wrap-body-form">
        <el-form ref="form" :model="form" label-width="100px" class="form" :rules="rules">
          <p class="config-title" style="margin-bottom: 16px;">基础设置</p>
          <el-alert
            style="margin-left:26px;width:550px;"
            title="兑换码具有唯一性，发送给A客户后即视为已兑换，不会发送给B客户"
            type="warning"
            :closable="false"
          />
          <el-form-item label="活动名称" prop="activityName">
            <el-input
              v-model="form.activityName"
              maxlength="32"
              show-word-limit
              placeholder="请填写活动名称或兑换商品，方便区分管理"
              clearable
            />
          </el-form-item>
          <el-form-item label="活动时间">
            <el-date-picker
              v-model="activeTime"
              :picker-options="pickerOptions"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="left"
            />
          </el-form-item>
          <p class="config-title" style="margin-bottom: 16px">高级设置</p>
          <el-form-item label="参与限制" prop="skipVerify">
            <div style="width:600px">
              <el-switch v-model="form.enableLimited" :active-value="ENABLE_ALARM_OR_LIMITED['open']" :inactive-value="ENABLE_ALARM_OR_LIMITED['close']" />
              <span class="we-emple-code-tags-tip">开启后，同一活动，客户只能参与一次，不开启则默认可参与多次</span>
            </div>
          </el-form-item>
          <el-form-item label="告警通知" prop="skipVerify">
            <div>
              <el-switch v-model="form.enableAlarm" :active-value="ENABLE_ALARM_OR_LIMITED['open']" :inactive-value="ENABLE_ALARM_OR_LIMITED['close']" @change="changeEnableAlarm" />
              <span class="we-emple-code-tags-tip">开启后，当兑换码库存等于阈值，向员工发送告警通知</span>
              <div v-if="form.enableAlarm" class="form-range-area">
                <el-form-item label="告警阈值" label-width="80px" style="padding:8px 0;" prop="alarmThreshold">
                  <el-input
                    v-model="form.alarmThreshold"
                    style="width: 97px;"
                    size="mini"
                    :min="0"
                    clearable
                    @input="handleEdit"
                  />
                </el-form-item>
                <el-form-item label="通知员工" label-width="80px" style="padding:8px 0;" prop="useUsers">
                  <el-button icon="el-icon-plus" @click="dialogVisibleSelectUser = true">{{ form.useUsers.length === 0 ? '添加成员' : '修改成员' }}</el-button>
                  <el-tag
                    v-for="(unit, unique) in form.useUsers"
                    :key="unique"
                    class="theme-text-color user-tag"
                  >{{ unit.name }}</el-tag>
                </el-form-item>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="save" button-type="save">{{ !this.$route.query.id ? '创建活动，导入兑换码' : '保存' }}</RequestButton>
    </div>
    <!-- 选择所属员工弹窗 -->
    <SelectUser
      :is-only-leaf="true"
      :visible.sync="dialogVisibleSelectUser"
      title="选择员工"
      :selected-user-list="form.useUsers"
      @success="selectedUser"
    />
  </div>
</template>

<script>
import SelectUser from '@/components/SelectUser/index.vue';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import * as conversionCodeActive from '@/api/redeem';
const ENABLE_ALARM_OR_LIMITED = {
  'open': 1,
  'close': 0
};
// 告警通知里的通知类型为员工
const employeesType = 2;
const DAY_TIME = 86400000;
export default {
  name: 'Add',
  components: { RequestButton, SelectUser },
  data() {
    return {
      ENABLE_ALARM_OR_LIMITED,
      // 表单参数
      form: {
        activityName: '', // 兑换码活动名
        enableLimited: ENABLE_ALARM_OR_LIMITED['open'], // 参与限制
        enableAlarm: ENABLE_ALARM_OR_LIMITED['close'], // 告警通知
        alarmThreshold: undefined, // 告警阈值
        useUsers: [] // 通知员工
      },
      pickerOptions: { // 禁用当前日期之前的日期
        disabledDate(time) {
          return time.getTime() < new Date().getTime() - DAY_TIME;
        }
      },
      activeTime: [], // 活动时间
      dialogVisibleSelectUser: false,
      rules: {
        activityName: [{ required: true, message: '请填写活动名称', trigger: 'blur' }],
        alarmThreshold: [{ required: true, message: '请填写告警阈值', trigger: 'blur' }],
        useUsers: [{ required: true, message: ' ', trigger: 'blur' }]
      }
    };
  },
  created() {
    this.$route.query.id && conversionCodeActive['getConversionCodeActiveDetail']({ id: this.$route.query.id }).then((res) => {
      const { activityName, effectEndTime, effectStartTime, enableLimited, enableAlarm, alarmUserList, alarmThreshold } = res.data;
      this.form = {
        ...this.form,
        activityName: activityName,
        enableLimited,
        enableAlarm,
        alarmThreshold
      };
      if (effectStartTime !== '0000-00-00' && effectEndTime !== '0000-00-00') {
        this.activeTime.push(effectStartTime);
        this.activeTime.push(effectEndTime);
      }
      this.form.useUsers = alarmUserList && alarmUserList.map((item) => {
        const params = {
          name: item.businessName
        };
        params['userId'] = item.targetId;
        return params;
      }) || [];
    });
  },

  methods: {
    /**
     * 选择添加人确认按钮
     */
    selectedUser(users) {
      this.form.useUsers = users;
    },
    /**
     * 限制输入框内容
     */
    handleEdit(e) {
      let value = e.replace(/[^\d]/g, ''); // 只能输入数字
      value = value.replace(/^0+(\d)/, '$1'); // 第一位0开头，0后面为数字，则过滤掉，取后面的数字
      this.form.alarmThreshold = value;
    },
    /**
     * 修改告警通知按钮状态
     */
    changeEnableAlarm() {
      this.form.alarmThreshold = undefined;
      this.form.useUsers = [];
    },
    /**
     * 保存提交
     */
    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) { // 检验通过
          const useUsers = this.form.useUsers.map((item) => {
            return {
              targetId: item.userId || item.id,
              type: employeesType
            };
          });
          const params = {
            ...this.form,
            effectStartTime: this.activeTime && this.activeTime[0] || '', // 活动开始时间
            effectEndTime: this.activeTime && this.activeTime[1] || '', // 活动结束时间
            useUsers,
            id: this.$route.query.id
          };
          conversionCodeActive[this.$route.query.id ? 'upadteConversionCodeActive' : 'addConversionCodeActive'](params).then((res) => {
            this.msgSuccess('操作成功');
            changeButtonLoading(this.$store, 'save');
            !this.$route.query.id ? this.$router.push({ path: '/operationsCenter/conversionCode/conversionCodeDetail', query: { id: res.data || this.$route.query.id }}) : this.$router.go(-1);
          });
        } else {
          changeButtonLoading(this.$store, 'save');
          if (!this.form.useUsers.length && this.form.enableAlarm) {
            this.msgError('请选择员工');
            return false;
          }
          return false;
        }
      });
    }
  }
};
</script>
<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style lang="scss" scoped>
.form-range-area {
  border: 1px solid #d9d9d9;
  padding: 10px;
  .el-button {
    margin-right: 10px;
    height: 28px;
    padding: 0 15px;
  }
  .el-form-item {
    align-items: center;
  }
}
.wrap {
  .el-form {
    margin-right: 10%;
  }
  background: #fff;
}

</style>

