<!--
 * @Description: 工单助手系统设置界面
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<template>
  <div class="system-setting-config config-tab">
    <div class="tab-title">企业绑定</div>
    <div class="tab-tip">
      将工单系统下的网点ID填写到下面表单，实现当前企业微信所在企业与工单系统下网点绑定关联，员工可获取网点下的工单数据。
      <el-popover
        placement="top-start"
        width="200"
        trigger="hover"
      >
        <span slot="reference" class="demo-tip">如何获取网点ID？</span>
        <el-image
          :src="require('@/assets/example/demo/app-center/get-network.png')"
          :preview-src-list="[require('@/assets/example/demo/app-center/get-network.png')]"
        />
      </el-popover>
    </div>
    <div class="tab-form">
      <div v-if="config.networkName" class="flex network-info">
        <div class="enperprise-name">
          <svg class="icon-enterprise-wx mr10" :width="16" :height="16">
            <use href="#icon-enterprise-wx" />
          </svg>
          {{ companyName }}
        </div>
        <svg class="icon-antOutline-link ml20 mr20" :width="24" :height="24">
          <use href="#icon-antOutline-link" />
        </svg>
        <div class="enperprise-name mr10">
          <i class="el-icon-map-location mr10" />
          <div>{{ config.networkName }}</div>
        </div>
        <el-button class="btn-reset" @click="handleUnBind">解绑</el-button>
      </div>
      <div v-else class="flex network-info">
        <div class="label mr10">网点</div>
        <el-input
          v-model="inputNetworkId"
          placeholder="请填写工单系统下网点ID"
          style="width: 320px;"
          class="mr10"
        />
        <el-button type="primary" class="pro-address-save" @click="handleBind">绑定</el-button>
      </div>
    </div>
    <div v-if="networkId">
      <div class="tab-title">员工与工单账号绑定</div>
      <div class="tab-tip">
        将企业下员工与工单系统账号绑定关联，员工可在侧边栏【应用工具】查看其在工单系统下的工单数据。
      </div>
      <div class="tab-des">
        当前企业共 <span>{{ bindTotalInfo.userNum }}</span> 个在职员工，已绑定 <span>{{ bindTotalInfo.bindNum }}</span> 人，<span class="go-link-span theme-text-color" @click="goToBind">
          {{ bindTotalInfo.bindNum > 0 ? '绑定详情' : '去绑定' }} >
        </span>
      </div>
    </div>
    <div v-if="networkId">
      <div class="tab-title">AI配置系统使用范围</div>
      <div class="tab-tip">
        配置可以登录AI配置系统，并对机器人进行相关设置的操作人员。
      </div>
      <div class="select-role">
        <el-radio-group v-model="useScope">
          <el-radio :label="USESCOPE_TYPE['role']">
            指定角色
            <el-select
              v-show="useScope === USESCOPE_TYPE['role']"
              v-model="selectedRole"
              class="mt10"
              clearable
              filterable
              placeholder="请选择角色"
              @change="handleChangeRole"
            >
              <el-option
                v-for="(item, index) in roleList"
                :key="index"
                :label="item.roleName"
                :value="item.roleId"
              />
            </el-select>
          </el-radio>
          <el-radio :label="USESCOPE_TYPE['user']">
            指定员工
            <div v-show="useScope === USESCOPE_TYPE['user']" class="mt15 user-list">
              <el-button icon="el-icon-plus" class="mr10" @click="dialogVisibleSelectUser = true">添加员工</el-button>
              <el-tag
                v-for="(item, index) in useStaff"
                :key="index"
                class="user-tag"
              >
                <TagUserShow :name="item.name" :show-icon="item.type === USESCOPE_TYPE['department']" />
              </el-tag>
            </div>
          </el-radio>
        </el-radio-group>
      </div>
    </div>
    <EmployeeBindAccountModal
      ref="employeeBindAccountModal"
      :visible.sync="employeeVisible"
      title="员工绑定工单账号"
      :network-id="networkId"
      :bind-total-info="bindTotalInfo"
      :config="config"
      @getBindTotal="getBindTotal"
    />
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      :is-only-leaf="false"
      :selected-user-list="useStaff"
      @success="selectedUser"
    />
  </div>
</template>
<script>
import { listRole } from '@/api/system/role';
import EmployeeBindAccountModal from './employeeBindAccountModal.vue';
import SelectUser from '@/components/SelectUser/index.vue';
import { updateMyApplicationConfig, setMyApplicationUseScope } from '@/api/appManage';
import { verifyNetwork, getBindTotal } from '@/api/order';
import { mapGetters } from 'vuex';
import { groupBy } from 'lodash';
import TagUserShow from '@/components/TagUserShow';

const YUAN_TONG_TYPE = 1;
const YUN_DA_TYPE = 2;
const ZHONG_TONG_TYPE = 3;
// 快递类型
const COURIER_TYPE = {
  'yuanTong': YUAN_TONG_TYPE,
  'yunDa': YUN_DA_TYPE,
  'zhongTong': ZHONG_TONG_TYPE
};

// 指定员工
const USER_SCOPE = 1;
// 指定角色
const ROLE_SCOPE = 2;
// 指定部门
const DEPARTMENT_SCOPE = 3;
// 使用范围类型
const USESCOPE_TYPE = {
  'user': USER_SCOPE,
  'role': ROLE_SCOPE,
  'department': DEPARTMENT_SCOPE
};

export default {
  name: 'SystemSetConfig',
  components: { EmployeeBindAccountModal, SelectUser, TagUserShow },
  props: {
    appDetail: {
      type: Object,
      default: () => {}
    },
    appId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      useScope: 0,
      roleList: [],
      selectedRole: null, // 指定角色
      employeeVisible: false,
      dialogVisibleSelectUser: false,
      useStaff: [], // 指定员工
      config: {
        // 网点id
        networkId: ''
      },
      networkName: '',
      inputNetworkId: '',
      COURIER_TYPE,
      USESCOPE_TYPE,
      bindTotalInfo: {}
    };
  },
  computed: {
    ...mapGetters(['companyName']),
    networkId() {
      return this.config.networkId;
    }
  },
  watch: {
    appDetail(val) {
      if (val) this.dealInitDetail();
    }
  },
  created() {
    this.getListRole();
  },
  mounted() {
    this.dealInitDetail();
    this.getBindTotal();
    this.dealType();
  },
  methods: {
    /**
     * 根据指定范围类型处理对应渲染的数据
     */
    dealType() {
      if (this.appDetail.scopeList && this.appDetail.scopeList.length > 0) {
        const type = this.appDetail.scopeList[0].type;
        this.useScope = [USESCOPE_TYPE['user'], USESCOPE_TYPE['department']].includes(type) ? USESCOPE_TYPE['user'] : USESCOPE_TYPE['role'];
        const userOrDepartmentList = [...this.appDetail.scopeList];
        const groupByUserOrDepartmentList = groupBy(userOrDepartmentList, item => item.type);
        let userList = groupByUserOrDepartmentList[USESCOPE_TYPE['user']] || [];
        userList = userList.map(item => { return { ...item, userId: item.val }; });
        let departmentList = groupByUserOrDepartmentList[USESCOPE_TYPE['department']] || [];
        departmentList = departmentList.map(item => { return { ...item, id: item.val }; });
        const roleList = groupByUserOrDepartmentList[USESCOPE_TYPE['role']] || [];
        this.useStaff = [...userList, ...departmentList];
        this.selectedRole = roleList[0]?.val;
      }
    },
    getBindTotal() {
      getBindTotal().then(res => {
        this.bindTotalInfo = res.data || {};
      });
    },
    dealInitDetail() {
      const appConfigJson = this.appDetail.config ? JSON.parse(this.appDetail.config) : {};
      this.config = { ...this.config, ...appConfigJson };
      if (this.config.networkId) this.$refs.employeeBindAccountModal.networkUser();
    },
    /**
     * 绑定网点
     */
    handleBind() {
      if (!this.inputNetworkId) {
        this.msgWarn('请填写工单系统的网点ID');
        return;
      }
      verifyNetwork({
        networkId: this.inputNetworkId
      }).then(res => {
        this.confirmModal({
          msg: `在工单系统下为您找到与${this.inputNetworkId}匹配的网点「${res?.data?.networkName}」，是否要绑定？`,
          title: '温馨提示'
        }, () => {
          this.handleConfirmBind();
        });
      }).catch(err => {
        this.confirmModal({
          msg: err.msg,
          title: '温馨提示'
        }, () => {});
      });
    },
    /**
     * 确认绑定网点
     */
    async handleConfirmBind() {
      const updateRes = await this.updateMyApplicationConfig({
        appid: this.appId,
        config: JSON.stringify({ ...this.config, networkId: this.inputNetworkId })
      });
      if (updateRes) this.getBindTotal();
    },
    /**
     * 获取角色列表
     */
    getListRole() {
      listRole({}).then(res => {
        this.roleList = res.rows;
      });
    },
    /**
     * 显示员工绑定工单账号弹窗
     */
    goToBind() {
      this.employeeVisible = true;
      this.$refs.employeeBindAccountModal.listOfBindDetail();
    },
    // 选择添加人确认按钮
    selectedUser(users) {
      let newUsers = [...users];
      newUsers = newUsers.map(item => { return { ...item, type: item.userId ? USESCOPE_TYPE['user'] : USESCOPE_TYPE['department'] }; });
      this.useStaff = newUsers;
      this.handleChangeScope();
    },
    async updateMyApplicationConfig(params) {
      const updateRes = await updateMyApplicationConfig(params);
      this.msgSuccess('配置成功');
      this.$emit('getDetail', this.appId);
      return updateRes;
    },
    /**
     * 更改使用范围
     * @param 使用范围类型
     */
    handleChangeScope() {
      const type = this.useScope;
      let useScopeList = [];
      switch (type) {
        case USESCOPE_TYPE['role']: {
          useScopeList = [{ type, val: this.selectedRole }];
          break;
        }
        case USESCOPE_TYPE['user']: {
          if (this.useStaff && this.useStaff.length) useScopeList = this.useStaff.map(item => { return { type: item.userId ? type : USESCOPE_TYPE['department'], val: item.userId || item.id }; });
          break;
        }
      }
      this.setMyApplicationUseScope({
        appid: this.appId,
        useScopeList
      });
    },
    /**
     * 更改角色
     */
    handleChangeRole() {
      this.handleChangeScope();
    },
    setMyApplicationUseScope(params) {
      setMyApplicationUseScope(params).then(res => this.msgSuccess('配置成功'));
    },
    /**
     * 解绑
     */
    handleUnBind() {
      const config = { ...this.config, networkId: '' };
      this.confirmModal({
        msg: '企业解绑后，员工将不可在侧边栏【应用工具】中查看并处理工单数据，是否继续？'
      }, async() => {
        const updateRes = await updateMyApplicationConfig({
          appid: this.appId,
          config: JSON.stringify(config)
        });
        if (updateRes) {
          this.msgSuccess('解绑成功');
          this.inputNetworkId = '';
          this.$emit('getDetail', this.appId);
        }
      });
    }
  }

};
</script>
<style scoped lang='scss' src="./styles/config.scss">
</style>
<style scoped lang='scss'>
@import '~@/styles/mixin.scss';
.tab-tip, .tab-des, .tab-form {
    margin-bottom: 15px;
    padding-left: 20px;
}
.demo-tip {
  @include text_btn_color($color-theme2-1, !important);
}
.tab-des {
    span {
        font-weight: bold;
    }
}
.tab-form {
    align-items: center;
    .enperprise-name {
      display: flex;
      padding: 10px 5px;
      background-color: #D1EDFF;
      color: #37ADFF;
      align-items: center;
      height: 32px;
      border-radius: 3px;
    }
    .network-info {
      align-items: center;
    }
}
.go-link-span {
    cursor: pointer;
}
.select-role {
    display: flex;
    flex-direction: column;
    /deep/ .el-radio {
        display: flex;
        margin-bottom: 15px;
        .el-radio__label {
            display: flex;
            flex-direction: column;

        }
    }
    .user-list {
      white-space: pre-wrap;
      .user-tag {
        height: 28px;
        line-height: 25px;
        margin-bottom: 10px;
      }
    }
}

</style>
