<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" class="user-info-tab" :tab-position="'left'">
      <el-tab-pane label="基本设置" name="userinfo">
        <div class="tab-title">基本设置</div>
        <userInfo :user="user" :is-super-admin="isSuperAdmin" />
        <div class="user-avatar">
          <userAvatar :user="user" />
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="isSuperAdmin" label="安全设置" name="resetPwd">
        <div class="tab-title">安全设置</div>
        <resetPwd :user="user" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import store from '@/store';
import userAvatar from './userAvatar';
import userInfo from './userInfo';
import resetPwd from './resetPwd';
import { getUserProfile } from '@/api/system/user';
import { getUser } from '@/api/system/staff';
export default {
  name: 'Profile',
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      activeTab: 'userinfo',
      isSuperAdmin: store.getters.isSuperAdmin,
      userId: store.getters.userId,
      deptList: []
    };
  },
  watch: {
    deptList(list) {
      if (list.length > 0) {
        this.getUser(list);
      }
    }
  },
  created() {
    !this.isSuperAdmin && this.getDept();
    this.isSuperAdmin && this.getUser();
  },
  methods: {
    getUser(list) {
      if (this.isSuperAdmin) {
        getUserProfile().then(response => {
          const user = response.data;
          this.user = user;
        });
      } else {
        getUser({ userId: this.userId }).then(response => {
          if (response.data) {
            const { userId, roleName, department, userName, gender, mobile, email, joinTime } = response.data;
            const dept = list.find(ele => ele.id === department);
            const user = { userId, nickName: userName, sex: String(gender), phonenumber: mobile, email, roleName, deptName: dept && dept.name, createTime: joinTime };
            this.user = user;
          }
        });
      }
    },
    async getDept() {
      const data = await this.$store.dispatch('GetDepartmentList');
      this.deptList = data;
    }
  }
};
</script>

<style scoped>
  .app-container {
    background: #fff;
    padding: 0;
    height: 100%;
    position: relative;
  }
  .tab-title {
    font-size: 18px;
    color: #333;
    font-weight: 700;
    margin-bottom: 20px;
    padding-left: 15px;
    margin-top: 10px;
  }
  .user-avatar {
    position: absolute;
    left: 600px;
    top: 85px;
  }
</style>
