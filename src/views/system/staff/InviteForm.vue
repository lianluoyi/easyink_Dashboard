<script>
import * as api from '@/api/system/staff';
import { MEDIA_TYPE_POSTER } from '@/utils/constant/index';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
const NOT_API_POWER = 48002;
const INVALID_ACCOUNT_CODE = 48003;
const ORDINARY_EMPLOYEES = '3';// 普通员工编号
export default {
  name: 'InviteForm',
  components: { RequestButton },
  props: {
    // 添加标签显隐
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '发起邀请'
    },
    handleShowAddMemberFailDrawer: {
      type: Function,
      default: () => {}
    },
    getMemberList: {
      type: Function,
      default: () => {}
    },
    roleData: {
      type: Array,
      default: () => []
    },
    departmentData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    var checkMobile = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      if (!/^1[3456789]\d{9}$/.test(this.lpdptel)) {
        return callback(new Error('请填写正确的手机号'));
      } else {
        return callback();
      }
    };
    var checkEmail = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!reg.test(value)) {
        return callback(new Error('请输入有效的邮箱'));
      } else {
        return callback();
      }
    };
    var checkUserId = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      var reg = /^[a-zA-Z0-9][a-zA-Z0-9_\-@]+$/;
      if (!reg.test(value)) {
        return callback(new Error('账号格式错误'));
      } else {
        return callback();
      }
    };
    return {
      loading: true, // 遮罩层
      form: {
        address: '', // 地址
        alias: '', // 用户昵称
        avatarMediaid: '', // 头像地址
        birthday: '', // 生日
        email: '', // 邮箱
        gender: null, // 性别。1表示男性，2表示女性
        idCard: '', // 身份证号
        joinTime: '', // 入职时间
        mainDepartment: null, // 主部门
        mobile: '', // 手机号
        name: '', // 用户名称
        position: '', // 职务
        qqAccount: '', // QQ号
        roleId: ORDINARY_EMPLOYEES, // 角色
        userId: '' // 账号
      },
      rules: {
        name: [{ required: true, message: '请填写员工姓名', trigger: 'blur' }],
        userId: [
          { required: true, message: '请填写员工账号', trigger: 'blur' },
          { validator: checkUserId, trigger: 'blur' }
        ],
        roleId: [{ required: true, message: '请填写员工角色', trigger: 'blur' }],
        mainDepartment: [{ required: true, message: '请填写员工部门', trigger: 'blur' }],
        mobile: [{ validator: checkMobile, trigger: 'blur' }],
        email: [{ validator: checkEmail, trigger: 'blur' }]
      },
      showFildBtn: false,
      MEDIA_TYPE_POSTER,
      formLoading: false
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
    departmentData(val) {
      // 如果存在根部门，则设置默认的所属部门为根部门
      if (val.length === 1 && !this.form.mainDepartment) {
        this.form.mainDepartment = val[0].id;
      }
    }
  },
  methods: {
    handleAvatarSuccess() {},
    beforeAvatarUpload() {},
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (!this.form.mobile && !this.form.email) {
            this.$message({
              showClose: true,
              message: '手机号和邮箱不能同时为空',
              type: 'warning'
            });
            changeButtonLoading(this.$store, 'submit');
            return false;
          }
          this.formLoading = true;
          api['addUser'](this.form)
            .then((res) => {
              changeButtonLoading(this.$store, 'submit');
              this.msgSuccess('已发出邀请，请等待员工加入企业');
              this.formLoading = false;
              this.Pvisible = false;
              this.getMemberList();
              this.form = {
                address: '', // 地址
                alias: '', // 用户昵称
                avatarMediaid: '', // 头像地址
                birthday: '', // 生日
                email: '', // 邮箱
                gender: null, // 性别。1表示男性，2表示女性
                idCard: '', // 身份证号
                joinTime: '', // 入职时间
                mainDepartment: null, // 主部门
                mobile: '', // 手机号
                name: '', // 用户名称
                position: '', // 职务
                qqAccount: '', // QQ号
                roleId: null, // 角色
                userId: '' // 账号
              };
            })
            .catch((res) => {
              changeButtonLoading(this.$store, 'submit');
              this.Pvisible = true;
              this.formLoading = false;
              if (res.code * 1 === NOT_API_POWER) {
                this.showFildBtn = true;
              } else if (res.code * 1 === INVALID_ACCOUNT_CODE) {
                this.$message({
                  showClose: true,
                  message: '无效的账号',
                  type: 'error'
                });
              }
            });
        } else {
          changeButtonLoading(this.$store, 'submit');
          return false;
        }
      });
    }
  }
};
</script>

<template>
  <el-dialog :title="title" :visible.sync="Pvisible" width="700px" :close-on-click-modal="false" class="dialog-invite">
    <div class="top">
      <el-alert
        title="使用该方式添加员工，需先获取员工的手机号或邮箱，用于发送邀请，如果没有，可通过扫码加入方式邀请"
        type="warning"
        show-icon
        :closable="false"
      />
    </div>
    <el-form ref="form" v-loading="formLoading" :model="form" label-width="60px" :rules="rules">
      <div class="user-info">
        <div class="user-info-left">
          <el-form-item label-width="0">
            <upload
              :file-url.sync="form.avatarMediaid"
              :type="MEDIA_TYPE_POSTER"
              upload-class="avatar-uploader"
              :show-remove-file-icon="true"
            />
          </el-form-item>
        </div>
        <div class="user-info-right">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" show-word-limit placeholder="请填写员工姓名" maxlength="64" />
          </el-form-item>
          <el-form-item label="账号" prop="userId">
            <el-input
              v-model="form.userId"
              show-word-limit
              placeholder="由数字、字母和_-@.组成，第一个字符必须是数字或字母"
              maxlength="64"
            />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="form.gender">
              <el-radio label="1">男</el-radio>
              <el-radio label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </div>
      <div class="info">
        <div class="basic-info">
          <p class="title">基础信息</p>
          <el-form-item label="昵称">
            <el-input v-model="form.alias" show-word-limit placeholder="可在生日祝福等场景使用" maxlength="64" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.mobile" placeholder="请填写手机号，企业内唯一" />
            <el-popover
              placement="top"
              content="若填写手机号，则发起邀请后对方会收到微信服务通知或短信邀请"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i slot="reference" class="iconfont icon-question" />
            </el-popover>
          </el-form-item>
          <el-form-item label="生日">
            <el-date-picker v-model="form.birthday" type="date" />
          </el-form-item>
          <el-form-item label="身份证">
            <el-input v-model="form.idCard" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="请填写有效的邮箱，企业内唯一" />
            <el-popover
              placement="top"
              content="若填写邮箱，则发起邀请后对方会收到邮箱邀请"
              trigger="hover"
              popper-class="tip-popover"
            >
              <i slot="reference" class="iconfont icon-question" />
            </el-popover>
          </el-form-item>
          <el-form-item label="QQ">
            <el-input v-model="form.qqAccount" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address" type="textarea" row="2" show-word-limit maxlength="128" />
          </el-form-item>
        </div>
        <div class="company-info">
          <p class="title">企业信息</p>
          <el-form-item label="角色" prop="roleId" label-width="80px">
            <el-select v-model="form.roleId" placeholder="请选择">
              <el-option v-for="item in roleData" :key="item.roleId" :label="item.roleName" :value="item.roleId" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属部门" prop="mainDepartment" label-width="80px">
            <el-cascader
              v-model="form.mainDepartment"
              :options="departmentData"
              :show-all-levels="false"
              :props="{
                expandTrigger: 'hover',
                checkStrictly: true,
                /** multiple: true,*/ emitPath: false,
                value: 'id',
                label: 'name'
              }"
            />
          </el-form-item>
          <el-form-item label="职务" label-width="80px">
            <el-input v-model="form.position" show-word-limit maxlength="64" />
          </el-form-item>
          <el-form-item label="入职时间" label-width="80px">
            <el-date-picker v-model="form.joinTime" type="date" />
          </el-form-item>
        </div>
      </div>
      <el-form-item label-width="0">
        <div class="footer">
          <div class="footer-left">
            <el-button
              v-if="showFildBtn"
              type="text"
              size="medium"
              style="color: red"
              @click="handleShowAddMemberFailDrawer('invite')"
            >
              加入失败？
            </el-button>
          </div>
          <div class="footer-right">
            <el-button @click="Pvisible = false">取 消</el-button>
            <RequestButton type="primary" :request-method="submit" button-type="submit">确 定</RequestButton>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
/deep/.el-form-item:hover {
  background: unset;
}
/deep/.el-alert__title {
  font-size: 12px;
}
/deep/.uploader-icon {
  width: 135px;
  height: 135px;
  line-height: 135px;
}
/deep/.upload-img {
  width: 135px;
  height: 135px;
}
.top {
  margin-bottom: 5px;
}
.user-info {
  display: flex;
}
.user-info-right {
  flex: 1;
}
.info {
  display: flex;
}
.basic-info {
  margin-right: 20px;
}
.basic-info,
.company-info {
  width: 317px;
}
.title {
  line-height: 20px;
  color: rgba(16, 16, 16, 100);
  font-size: 14px;
  text-align: left;
  font-family: Roboto;
  @include border_style($width: 3px, $direction: left);
  padding-left: 10px;
}
/deep/.basic-info .el-input,
/deep/.company-info .el-input {
  width: 225px;
}
.icon-question {
  position: absolute;
  font-size: 14px;
}
.footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
/deep/ .el-textarea .el-textarea__inner {
  padding-right: 45px;
}
</style>
