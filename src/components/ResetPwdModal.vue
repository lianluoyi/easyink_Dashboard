<template>
  <el-dialog
    title="修改密码"
    :visible.sync="dialogVisible"
    width="500px"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    @close="handleClose"
  >
    <!-- 用户信息 -->
    <div class="user-info">
      <span class="label">尊敬的用户：</span>
      <span>{{ currentUser }}</span>
    </div>

    <!-- 提示信息 -->
    <div class="notice-text">
      当前密码已过期，请重置密码
    </div>

    <!-- 密码表单 -->
    <el-form ref="form" :model="user" :rules="rules" label-width="78px" class="pwd-form">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="user.oldPassword"
          placeholder="请输入旧密码"
          type="password"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="user.newPassword"
          placeholder="请输入新密码"
          type="password"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="user.confirmPassword"
          placeholder="请输入确认密码"
          type="password"
          show-password
          clearable
        />
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateUserPwd } from '@/api/system/user';
import { RSAECBEncrypt } from '@/utils/jsencrypt';

export default {
  name: 'ResetPwdModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentUser: {
      type: String,
      default: 'admin-123'
    }
  },
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
      loading: false,
      user: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
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
          { validator: equalToPassword, trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true;
          const publicKey = this.$store.state?.secretKey?.RSAPublicKey;
          updateUserPwd(
            RSAECBEncrypt(this.user.oldPassword, publicKey),
            RSAECBEncrypt(this.user.newPassword, publicKey)
          ).then(
            response => {
              this.$message.success('修改成功');
              this.handleClose();
            }
          ).catch(() => {
            this.$message.error('修改失败');
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },
    handleClose() {
      this.$emit('close');
      this.resetForm();
    },
    resetForm() {
      this.user = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    }
  }
};
</script>

<style scoped>
.user-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #101010;
  font-weight: bold;
}

.notice-text {
  margin-bottom: 24px;
  font-size: 14px;
  color: #101010;
  font-weight: bold;
}

.pwd-form .el-form-item {
  background: none;
  margin-bottom: 10px !important;
}
</style>
