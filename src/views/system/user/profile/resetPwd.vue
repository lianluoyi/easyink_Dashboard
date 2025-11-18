<template>
  <el-form ref="form" class="user-pwd-form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">更新密码</el-button>
      <!-- <el-button type="danger" size="mini" @click="close">关闭</el-button> -->
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd } from '@/api/system/user';
import { RSAECBEncrypt } from '@/utils/jsencrypt';
export default {
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };

    // 密码强度校验函数
    const validatePasswordStrength = (rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }

      // 密码规则常量
      const MIN_PASSWORD_LENGTH = 8;
      const MAX_PASSWORD_LENGTH = 20;
      const MIN_CHAR_TYPES = 3;

      // 检查长度
      if (value.length < MIN_PASSWORD_LENGTH || value.length > MAX_PASSWORD_LENGTH) {
        callback(new Error('新密码长度必须为8～20位，且为字母大写、小写、数字、特殊字符中任意三种组合，请重新设置！'));
        return;
      }

      // 检查字符类型
      const hasUppercase = /[A-Z]/.test(value); // 大写字母
      const hasLowercase = /[a-z]/.test(value); // 小写字母
      const hasNumber = /[0-9]/.test(value); // 数字
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(value); // 特殊字符

      // 计算满足的字符类型数量
      const typeCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

      if (typeCount < MIN_CHAR_TYPES) {
        callback(new Error('新密码长度必须为8～20位，且为字母大写、小写、数字、特殊字符中任意三种组合，请重新设置！'));
        return;
      }

      callback();
    };

    return {
      test: '1test',
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined
      },
      // 表单校验
      rules: {
        oldPassword: [
          { required: true, message: '旧密码不能为空', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { validator: validatePasswordStrength, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { required: true, validator: equalToPassword, trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const publicKey = this.$store.state?.secretKey?.RSAPublicKey;
          updateUserPwd(
            RSAECBEncrypt(this.user.oldPassword, publicKey),
            RSAECBEncrypt(this.user.newPassword, publicKey)
          ).then(
            response => {
              this.msgSuccess('修改成功');
            }
          );
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
