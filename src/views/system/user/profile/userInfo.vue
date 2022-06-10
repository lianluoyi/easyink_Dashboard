<template>
  <el-form ref="form" class="user-profile-form" :model="user" :rules="rules" label-width="80px" :disabled="isDkType">
    <el-form-item label="姓名" prop="nickName">
      <el-input v-model="user.nickName" maxlength="32" show-word-limit />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="user.sex">
        <el-radio label="1">男</el-radio>
        <el-radio label="2">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input v-model="user.phonenumber" maxlength="20" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" maxlength="32" />
    </el-form-item>
    <el-form-item label="所在企业">
      <el-input :value="$store.getters.enterPriseWechatConfig.companyName || ''" disabled />
    </el-form-item>
    <el-form-item label="所属部门">
      <el-input :value="isSuperAdmin ? '' : user.deptName" disabled />
    </el-form-item>
    <el-form-item label="角色">
      <el-input :value="isSuperAdmin ? '超级管理员' : user.roleName" disabled />
    </el-form-item>
    <el-form-item label="创建日期">
      <el-input :value="formatTime(user.createTime)" disabled />
    </el-form-item>
    <el-form-item>
      <el-button v-if="!isDkType" type="primary" size="mini" @click="submit">更新信息</el-button>
      <!-- <el-button type="danger" size="mini" @click="close">关闭</el-button> -->
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserProfile } from '@/api/system/user';
import { editUser } from '@/api/system/staff';
import moment from 'moment';

export default {
  props: {
    user: {
      type: Object,
      default: () => ({})
    },
    isSuperAdmin: {
      type: Boolean
    }
  },
  data() {
    return {
      // 表单校验
      rules: {
        nickName: [
          { required: true, message: '用户昵称不能为空', trigger: 'blur' }
        ],
        phonenumber: [
          { required: !this.isSuperAdmin, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  computed: {
    /** 是否是代开发应用 */
    isDkType() {
      return this.$store.state.serverInfo.dkCorp;
    }
  },
  methods: {
    formatTime(time) {
      if (!time) return '';
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this._props.isSuperAdmin) {
            updateUserProfile(this.user).then(response => {
              this.msgSuccess('更新成功');
            });
          } else {
            const { userId, nickName, sex, phonenumber, email } = this._props.user;
            const body = { userId, name: nickName, gender: sex, mobile: phonenumber, email };
            editUser(body).then(response => {
              this.msgSuccess('已更新至企业微信');
            });
          }
        }
      });
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route);
      this.$router.push({ path: '/index' });
    }
  }
};
</script>
<style scoped>
  .el-input {
    width: 448px;
  }
</style>
