<!--
 * @Description: 告警设置
 * @Author: wJiaaa
 * @LastEditors: broccoli
-->
<template>
  <el-dialog
    title="告警设置"
    :visible.sync="Pvisible"
    width="700px"
  >
    <el-form
      :model="alarmForm"
      label-width="110px"
      class="alarm-setting-form"
    >
      <el-form-item label="链接不可用通知">
        <div class="content">
          <el-switch
            v-model="alarmForm.linkUnavailableSwitch"
          />
          <span class="back-text">开启后，当获客链接暂时无法添加客户时，向员工发送告警通知</span>
        </div>
        <div v-show="alarmForm.linkUnavailableSwitch" class="content-info">
          <el-checkbox v-model="alarmForm.alarmCreater">链接创建人</el-checkbox>
          <div class="aic flexw">
            <el-checkbox v-model="alarmForm.alarmOtherUser" class="mb5">其他员工</el-checkbox>
            <el-button
              icon="el-icon-plus"
              size="mini"
              class="ml10 mr10 mb5"
              @click="selectUser('linkUnavailableUsersInfo')"
            >添加成员</el-button>
            <el-tag
              v-for="(item, index) in alarmForm.linkUnavailableUsersInfo"
              :key="index"
              size="medium"
              class="mb5 user-tag"
            >{{ item.name }}</el-tag>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="额度将耗尽预警">
        <div class="content">
          <el-switch
            v-model="alarmForm.balanceLowSwitch"
            :active-value="true"
            :inactive-value="false"
          />
          <span class="back-text">开启后，当获客助手的使用量即将耗尽时，向员工发送告警通知</span>
        </div>
        <div v-show="alarmForm.balanceLowSwitch" class="mt5">
          <el-button
            icon="el-icon-plus"
            class="mr10 mb5"
            size="mini"
            @click="selectUser('balanceLowUsersInfo')"
          >添加成员</el-button>
          <el-tag
            v-for="(item, index) in alarmForm.balanceLowUsersInfo"
            :key="index"
            class="mb5 user-tag"
            size="medium"
          >{{ item.name }}</el-tag>
        </div>
      </el-form-item>
      <el-form-item label="额度已耗尽通知">
        <div class="content">
          <el-switch
            v-model="alarmForm.balanceExhaustedSwitch"
            :active-value="true"
            :inactive-value="false"
          />
          <span class="back-text">开启后，当获客助手的使用量消耗完时，向员工发送告警通知</span>
        </div>
        <div v-show="alarmForm.balanceExhaustedSwitch" class="mt5">
          <el-button
            icon="el-icon-plus"
            class="mr10 mb5"
            size="mini"
            @click="selectUser('balanceExhaustedUsersInfo')"
          >添加成员</el-button>
          <el-tag
            v-for="(item, index) in alarmForm.balanceExhaustedUsersInfo"
            :key="index"
            class="mb5 user-tag"
            size="medium"
          >{{ item.name }}</el-tag>
        </div>
      </el-form-item>
      <el-form-item label="额度将过期通知">
        <div class="content">
          <el-switch
            v-model="alarmForm.quotaExpireSoonSwitch"
            :active-value="true"
            :inactive-value="false"
          />
          <span class="back-text">开启后，当获客助手的使用量即将过期时，向员工发送告警通知</span>
        </div>
        <div v-show="alarmForm.quotaExpireSoonSwitch" class="mt5">
          <el-button
            icon="el-icon-plus"
            class="mr10 mb5"
            size="mini"
            @click="selectUser('quotaExpireSoonUsersInfo')"
          >添加成员</el-button>
          <el-tag
            v-for="(item, index) in alarmForm.quotaExpireSoonUsersInfo"
            :key="index"
            class="mb5 user-tag"
            size="medium"
          >{{ item.name }}</el-tag>
        </div>
      </el-form-item>
      <el-divider />
      <el-form-item label="各事件通知频率">
        <el-radio-group v-model="alarmForm.type">
          <el-radio :label="1">每次告警</el-radio>
          <el-radio :label="0">每天只告警1次</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="Pvisible = false">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      :selected-user-list="nowSelectUserList"
      @success="selectedUser"
    />
  </el-dialog>
</template>

<script>
import SelectUser from '@/components/SelectUser/index.vue';
import { getWarnConfig, setWarnConfig } from '@/api/drainageCode/customerAssistant';

export default {
  components: {
    SelectUser
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      alarmForm: {
        // 链接不可用通知开关
        linkUnavailableSwitch: false,
        // 链接不可用是否通知链接创建人
        alarmCreater: false,
        // 额度即将耗尽通知开关
        balanceLowSwitch: false,
        balanceLowUsersInfo: [],
        // 额度已耗尽通知开关
        balanceExhaustedSwitch: false,
        balanceExhaustedUsersInfo: [],
        // 额度即将过期通知开关
        quotaExpireSoonSwitch: false,
        // 额度即将过期通知员工
        quotaExpireSoonUsersInfo: [],
        type: 1
      },
      dialogVisibleSelectUser: false,
      addUserType: undefined,
      nowSelectUserList: []
    };
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    visible(val) {
      if (val) this.getWarnConfig();
    }
  },
  methods: {
    selectedUser(list) {
      this.alarmForm[this.addUserType] = [...list];
    },
    selectUser(item) {
      this.addUserType = item;
      this.nowSelectUserList = this.alarmForm[item];
      this.dialogVisibleSelectUser = true;
    },
    /**
     * 获取告警设置
     */
    getWarnConfig() {
      getWarnConfig().then((res) => {
        this.alarmForm = {
          ...res?.data
        };
      });
    },
    submit() {
      const linkUnavailableUserIdList = this.alarmForm.linkUnavailableUsersInfo?.map(item => item.userId) || [];
      const balanceLowUserIdList = this.alarmForm.balanceLowUsersInfo?.map(item => item.userId) || [];
      const balanceExhaustedUserIdList = this.alarmForm.balanceExhaustedUsersInfo?.map(item => item.userId) || [];
      const quotaExpireSoonUserIdList = this.alarmForm.quotaExpireSoonUsersInfo?.map(item => item.userId) || [];
      const params = {
        ...this.alarmForm,
        linkUnavailableUsers: linkUnavailableUserIdList.join(','),
        balanceLowUsers: balanceLowUserIdList.join(','),
        balanceExhaustedUsers: balanceExhaustedUserIdList.join(','),
        quotaExpireSoonUsers: quotaExpireSoonUserIdList.join(',')
      };
      delete params.linkUnavailableUsersInfo;
      delete params.balanceLowUsersInfo;
      delete params.balanceExhaustedUsersInfo;
      delete params.quotaExpireSoonUsersInfo;
      setWarnConfig(params).then(res => {
        this.msgSuccess('设置完成');
        this.Pvisible = false;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-divider--horizontal {
  margin: 5px 0;
}
/deep/ .el-dialog__body {
  padding-top: 0;
}
/deep/ .el-form-item {
  padding-left: 0;
}
.alarm-setting-form {
  .content {
    display: flex;
    align-items: center;
  }
  .back-text {
    color:#999999;
    margin-left: 10px;
  }
  .content-info {
    border: 1px solid $borderColor;
    padding: 10px;
    width: 534px;
    margin-top: 5px;
  }
}
</style>
