<!--
 * @Description: 新建兑换活动
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
              <el-switch v-model="form.enableLimited" :active-value="ENABLE_LIMITED['open']" :inactive-value="ENABLE_LIMITED['close']" />
              <span class="we-emple-code-tags-tip">开启后，同一活动，客户只能参与一次，不开启则默认可参与多次</span>
            </div>
          </el-form-item>
          <el-form-item label="告警通知" prop="skipVerify">
            <div>
              <el-switch v-model="form.enableAlarm" :active-value="ENABLE_ALARM['open']" :inactive-value="ENABLE_ALARM['close']" />
              <span class="we-emple-code-tags-tip">开启后，当兑换码库存等于阈值，向员工发送告警通知</span>
              <div v-if="form.enableAlarm" class="form-range-area">
                <el-form-item label="告警阈值" label-width="80px" style="padding:8px 0;" prop="alarmThreshold">
                  <el-input-number
                    v-model="form.alarmThreshold"
                    style="width: 97px;"
                    size="mini"
                    :min="0"
                    :controls="false"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="通知员工" label-width="80px" style="padding:8px 0;" prop="users">
                  <el-button icon="el-icon-plus" @click="dialogVisibleSelectUser = true">{{ form.users.length === 0 ? '添加成员' : '修改成员' }}</el-button>
                  <el-tag
                    v-for="(unit, unique) in form.users"
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
      <!-- <RequestButton type="primary" button-type="save" >保存， 导入兑换码</RequestButton> -->
      <el-button type="primary" @click="save">保存， 导入兑换码</el-button>
    </div>
    <!-- 选择所属员工弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择员工"
      :is-only-leaf="false"
      :selected-user-list="form.users"
      @success="selectedUser"
    />
  </div>
</template>

<script>
import SelectUser from '@/components/SelectUser';
// import RequestButton from '@/components/Button/RequestButton.vue';
// import { changeButtonLoading } from '@/utils/common';
const ENABLE_ALARM = {
  'open': 1,
  'close': 0
};
const ENABLE_LIMITED = {
  'open': 1,
  'close': 0
};
export default {
  name: 'Add',
  // components: { RequestButton, SelectUser },
  components: { SelectUser },
  data() {
    return {
      ENABLE_LIMITED: ENABLE_LIMITED,
      ENABLE_ALARM: ENABLE_ALARM,
      // 表单参数
      form: {
        activityName: '', // 兑换码活动名
        effectStartTime: '', // 活动开始时间
        effectEndTime: '', // 活动结束时间
        enableLimited: ENABLE_LIMITED['close'], // 参与限制
        enableAlarm: ENABLE_ALARM['close'], // 告警通知
        alarmThreshold: undefined, // 告警阈值
        users: []
      },
      activeTime: '', // 活动时间
      dialogVisibleSelectUser: false,
      rules: {
        activityName: [{ required: true, message: '请填写活动名称', trigger: 'blur' }],
        alarmThreshold: [{ required: true, message: '请填写告警阈值', trigger: 'blur' }],
        users: [{ required: true, message: ' ', trigger: 'blur' }]
      }
    };
  },
  watch: {
    // 此方法可以只监听对象中的某个属性
    'form.enableAlarm'(val) {
      if (!val) {
        this.form.users = [];
        this.form.alarmThreshold = undefined;
      }
    }
  },
  methods: {
    // 选择添加人确认按钮
    selectedUser(users) {
      this.form.users = users;
    },
    // 保存
    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) { // 检验通过
          console.log('this.', this.form);
        } else {
          if (!this.form.users.length && this.form.enableAlarm) {
            this.msgError('请至少选择一名使用员工');
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

