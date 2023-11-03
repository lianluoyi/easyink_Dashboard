<script>
import { MessageBox } from 'element-ui';
import * as api from '@/api/organization';
import { listStaff, getJoinQrCode, download, batchUpdateUser } from '@/api/system/staff';
import { listRole } from '@/api/system/role';
import { PAGE_LIMIT, STAFF_STATUS, STAFF_STATUS_ACTIVATE, PAGE_LIMIT_TWENTY } from '@/utils/constant/index';
import { validSpecialCharacters } from '@/utils/validate';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import CommonTree from '@/components/CommonTree';
import NoConfigInfo from '@/components/NoConfigInfo';
import RightContainer from '@/components/RightContainer';
import InviteForm from './InviteForm';
import AddMemberTip from './AddMemberTip';
import BatchUpdateUser from './BatchUpdateUser';
import { getFMdate, changeButtonLoading } from '@/utils/common';
import RequestButton from '@/components/Button/RequestButton.vue';
import SyncMemberInfo from './SyncMemberInfo.vue';
const EMAIL_LENGTH = 200;
const EXPIRATION_NUMBER = 7;
const WAIT_TIME = 8000;
const defaultUpdateUserRes = {
  successCount: 0,
  failCount: 0,
  fileUrl: ''
};

export default {
  name: 'Organization',
  components: {
    EmptyDefaultIcon,
    CommonTree,
    NoConfigInfo,
    RightContainer,
    InviteForm,
    AddMemberTip,
    BatchUpdateUser,
    RequestButton,
    SyncMemberInfo
  },
  props: {},

  data() {
    /**
     * 校验部门名称是否存在特殊字符
     */
    const checkDepartName = (rule, value, callback) => {
      const flag = validSpecialCharacters(this.formDepart.name);
      if (flag) {
        // 由于某些字符会被转义，所以需要在前面增加\
        callback(new Error('不能包含特殊字符\\\:\*?”<>｜'));
      } else {
        callback();
      }
    };
    /**
     * 校验格式及长度
     */
    const checkLength = (str, length, callback, reg) => {
      if (str.length > length) callback(new Error());
      if (str && reg && !reg.test(str)) {
        callback(new Error());
      }
      callback();
    };
    return {
      // 详情是否显示placeholder
      showPlaceHolder: true,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        userName: undefined,
        isActivate: '',
        roleId: undefined
      },
      treeData: [],
      userList: [],
      status: STAFF_STATUS,
      statusActivate: STAFF_STATUS_ACTIVATE,
      statusOptions: Object.keys(STAFF_STATUS_ACTIVATE).map((status) => ({
        label: STAFF_STATUS_ACTIVATE[status],
        value: status
      })),
      total: 0,
      defaultProps: {
        label: 'name',
        children: 'children',
        disabled(data, node) {
          return !data.enable;
        }
      },
      form: {},
      dialogVisible: false,
      disabled: false,
      loading: false,
      multipleSelection: [],
      formDepart: {},
      dialogVisibleDepart: false,
      dialogVisibleAvatar: false,
      queryImg: {
        pageNum: 1,
        pageSize: PAGE_LIMIT_TWENTY
      },
      totalImg: 0,
      treeMap: {},
      roleOptions: [],
      scopeDeptList: [],
      // 表单校验
      rules: Object.freeze({
        userName: [{ required: true, message: '必填项', trigger: 'blur' }],
        userId: [{ required: true, message: '必填项', trigger: 'blur' }],
        roleId: [{ required: true, message: '必填项', trigger: 'change' }],
        mainDepartment: [{ required: true, message: '必填项', trigger: 'change' }],
        email: [
          {
            message: "'请输入正确的邮箱地址",
            validator: (rule, value, callback) =>
              checkLength(value, EMAIL_LENGTH, callback, /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/),
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            pattern: /^\d{1,20}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ],
        idCard: [
          {
            pattern: /^\S{1,30}$/,
            message: '请输入正确的身份证',
            trigger: 'blur'
          }
        ],
        qqAccount: [
          {
            pattern: /^\d{1,20}$/,
            message: '请输入正确的QQ',
            trigger: 'blur'
          }
        ]
      }),
      // 添加部门表单验证规则
      departRules: Object.freeze({
        departName: [{ validator: checkDepartName, trigger: 'blur' }]
      }),
      showQrcodeAddDialog: false,
      inviteDialogVisible: false,
      addMemberFailDrawerVisible: false,
      direction: 'rtl',
      joinQrcodeUrl: '',
      qrcodeLoading: true,
      addMemberFailDrawerActive: '',
      expirationTime: '',
      updateUserVisible: false,
      updateUserLoading: false,
      // 批量修改的响应参数
      updateUserRes: { ...defaultUpdateUserRes },
      SyncMemberInfoDrawerVisible: false
    };
  },
  computed: {
    // 是否为代开发应用
    isDKCorp() {
      return this.$store.state.serverInfo.dkCorp;
    }
  },
  watch: {
    updateUserVisible(val) {
      if (val) {
        this.updateUserRes = { ...defaultUpdateUserRes };
      }
    }
  },
  created() {
    this.getRoles();
    this.getTree();
  },
  mounted() {},
  methods: {
    getRoles() {
      listRole({}).then((response) => {
        this.roleOptions = response.rows;
      });
    },
    async getTree() {
      try {
        const data = await this.$store.dispatch('GetOrUpdateDepartmentList');
        this.scopeDeptList = data;
        this.treeData = this.handleTree(this.scopeDeptList);
        this.treeMap = this.getDeptMap(data);
        this.query.departments = '';
        this.getList();
      } catch (error) {
        this.scopeDeptList = [];
        this.treeData = [];
        this.treeMap = {};
        this.query.departments = [];
      }
    },
    getDeptMap(deptOption) {
      const map = {};
      deptOption.forEach((dept) => {
        map[dept.id] = dept.name;
      });
      return map;
    },
    getList(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      listStaff(this.query)
        .then(({ rows, total }) => {
          this.userList = rows;
          this.total = +total;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleNodeClick(data) {
      this.query.departments = this.dealScopedDepts(data.id).join(',');
      this.getList(1);
    },
    dealScopedDepts(deptId) {
      if (!deptId) return [];
      let departments = [deptId];
      const childs = this.scopeDeptList.filter((ele) => ele.parentId === deptId).map((ele) => ele.id);
      departments = departments.concat(childs);
      if (childs.length > 0) {
        childs.forEach((deptId_) => {
          const grands = this.dealScopedDepts(deptId_);
          departments = departments.concat(grands);
        });
      }
      return [...new Set(departments)];
    },
    edit(data, type) {
      // 判断点击的是详情还是编辑
      this.showPlaceHolder = type !== 0;
      this.$refs['form'] && this.$refs['form'].clearValidate();
      this.form = Object.assign({}, data || { _new: true });
      this.dialogVisible = true;
      type || !data ? (this.disabled = false) : (this.disabled = true);
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const form = JSON.parse(JSON.stringify(this.form));
          if (!form.userName || !form.userId || !form.mainDepartment || !form.roleId) {
            changeButtonLoading(this.$store, 'save');
            this.msgError('请填写必填项');
            return;
          }
          form.department = form.mainDepartment;
          form.isLeaderInDept += '';
          api[form._new ? 'addUser' : 'updateUser']({ name: form.userName, ...form }).then(() => {
            changeButtonLoading(this.$store, 'save');
            this.msgSuccess('操作成功');
            this.dialogVisible = false;
            this.getList(form._new && 1);
          });
        } else {
          changeButtonLoading(this.$store, 'save');
        }
      });
    },
    startOrStop(data) {
      const params = {
        userId: data.userId,
        enable: Number(data.enable) === 1 ? 0 : 1
      };
      if (data.enable) {
        this.confirmModal(
          {
            msg: '禁用后，该员工将被强制下线，且无法登录，是否继续？'
          },
          () => {
            // 0: 启用，1：禁用
            api
              .startOrStop(params)
              .then(() => {
                this.msgSuccess('操作成功');
                this.getList();
              })
              .catch(() => {});
          }
        );
      } else {
        api.startOrStop(params).then(() => {
          this.msgSuccess('操作成功');
          this.getList();
        });
      }
    },
    /** 删除按钮操作 */
    remove(id) {
      // const operIds = id || this.ids + "";
      this.confirmModal(
        {
          msg: '删除后，该成员将从企业下移除，是否继续？'
        },
        () => {
          return api.remove(id).then(() => {
            this.getList();
            this.msgSuccess('删除成功');
          });
        }
      );
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    syncUser() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      api.syncUser().then(() => {
        loading.close();
        this.msgSuccess('后台开始同步数据，请稍后关注进度');
        this.getList();
      });
    },
    batchImport() {},
    departEdit(data, type) {
      this.formDepart = Object.assign({}, type ? data : { parentId: data.id, pName: data.name });
      this.dialogVisibleDepart = true;
    },
    departRemove(id) {
      this.confirmModal(
        {
          msg: '是否确认删除吗?'
        },
        () => {
          return api.removeDepart(id).then(() => {
            this.getTree();
            this.msgSuccess('删除成功');
          });
        }
      );
    },
    departSubmit() {
      this.$refs.departForm.validate((valid) => {
        if (valid) {
          api[this.formDepart.id ? 'updateDepart' : 'addDepart'](this.formDepart)
            .then(() => {
              changeButtonLoading(this.$store, 'submit');
              this.msgSuccess('操作成功');
              this.dialogVisibleDepart = false;
              this.getTree();
            })
            .catch(() => {
              changeButtonLoading(this.$store, 'submit');
              this.dialogVisibleDepart = false;
            });
        } else {
          changeButtonLoading(this.$store, 'submit');
        }
      });
    },
    submitAvatar() {
      // this.form.avatarMediaid = g;
    },
    closeModal() {
      // 移除校验提示
      this.$refs.departForm.resetFields();
    },
    resetQuery() {
      this.query.userName = '';
      this.query.isActivate = '';
      this.query.roleId = undefined;
      this.$nextTick(() => {
        this.getList(1);
      });
    },
    handleCommand(command) {
      if (command === 'qrcode') {
        this.showQrcodeAddDialog = true;
        this.qrcodeLoading = true;
        this.expirationTime = getFMdate(EXPIRATION_NUMBER);
        getJoinQrCode().then((res) => {
          this.joinQrcodeUrl = res.data;
          this.qrcodeLoading = false;
        });
      } else if (command === 'invite') {
        this.inviteDialogVisible = true;
      }
    },
    handleShowAddMemberFailDrawer(type) {
      this.addMemberFailDrawerVisible = true;
      this.addMemberFailDrawerActive = type;
    },
    handleCloseDrawer(done) {
      done();
    },
    download() {
      const name =
        this.$store.state.enterPriseWechatConfig.companyName + '（' + this.expirationTime + '前有效）' + '.png';
      download(this.joinQrcodeUrl).then((res) => {
        if (res != null) {
          const blob = new Blob([res], { type: 'application/zip' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a'); // 创建a标签
          link.href = url;
          link.download = name; // 重命名文件
          link.click();
          URL.revokeObjectURL(url); // 释放内存
        }
      });
    },
    // 批量修改员工
    batchUpdateUser(form) {
      const userIdList = this.multipleSelection.map(({ userId, userName }) => ({ userId, userName }));
      const params = {
        ...form,
        userIdList
      };
      this.updateUserLoading = true;
      batchUpdateUser(params)
        .then((res) => {
          this.updateUserLoading = false;
          this.updateUserRes = { ...res.data };
          this.getList();
        })
        .catch(() => {
          this.updateUserLoading = false;
          this.getList();
        });

      setTimeout(() => {
        if (this.updateUserLoading) {
          MessageBox.alert('网络有点儿慢，请稍后回到员工管理查看员工信息是否修改成功', '温馨提示').then(() => {
            this.updateUserVisible = false;
          });
        }
      }, WAIT_TIME);
    },
    onBachtUpdate(e) {
      if (this.multipleSelection.length === 0) {
        this.$message({
          showClose: true,
          message: '请至少选择一个员工',
          type: 'warning'
        });
        let target = e.target;
        if (target.nodeName === 'SPAN') {
          target = e.target.parentNode;
        }
        target.blur(); // 使按钮失去焦点
        return;
      }
      this.updateUserVisible = true;
    }
  }
};
</script>

<template>
  <div>
    <div class="right-container">
      <NoConfigInfo
        alert-style="margin-bottom: 15px;padding: 17px 16px;"
        :config-keys="['contactSecret']"
        page-title="查看员工信息"
      />

      <el-form
        ref="queryForm"
        class="top-search staff-top-search pd15"
        :model="query"
        :inline="true"
        label-width="100px"
      >
        <el-form-item prop="userName" class="new-form-item">
          <el-input
            v-model="query.userName"
            placeholder="请输入员工姓名"
            clearable
            size="small"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="roleId" class="new-form-item">
          <el-select v-model="query.roleId" placeholder="请选择角色" clearable size="small" style="width: 240px">
            <el-option v-for="role in roleOptions" :key="role.roleId" :label="role.roleName" :value="role.roleId" />
          </el-select>
        </el-form-item>
        <el-form-item prop="isActivate" class="new-form-item">
          <el-select
            v-model="query.isActivate"
            placeholder="请选择员工激活状态"
            clearable
            size="small"
            style="width: 240px"
          >
            <el-option :key="null" :label="'全部'" :value="null" />
            <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="new-form-item">
          <el-button type="primary" @click="getList(1)">查询</el-button>
          <el-button class="btn-reset" @click="resetQuery()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-row type="flex" justify="space-between" class="staff-body">
        <!--部门数据-->
        <div
          class="head-container"
          :style="
            treeData && treeData.length > 0
              ? { backgroundColor: '#fff' }
              : { backgroundColor: '#fff', display: 'flex', alignItems: 'center' }
          "
        >
          <!-- <div>部门架构</div> -->
          <!-- :filter-node-method="filterNode" -->
          <common-tree
            ref="tree"
            class="left-tree"
            :data="treeData ? treeData : []"
            :props="defaultProps"
            :expand-on-click-node="false"
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template slot="empty">
              <empty-default-icon
                text="暂无企业"
                desc="若首次加载，请耐心等待后台数据同步，稍后回来"
                :desc-config="['contactSecret']"
              />
            </template>
            <div slot-scope="{ node, data }" class="custom-tree-node">
              <span class="toe" :title="node.label">{{ node.label }}</span>
              <span v-if="!isDKCorp" class="fr">
                <i
                  v-if="node.level !== 1"
                  v-hasPermi="['system:dept:edit']"
                  class="iconfont icon-tool-edit"
                  title="编辑"
                  @click.stop="departEdit(data, 1)"
                />
                <i
                  v-hasPermi="['system:dept:add']"
                  class="iconfont icon-add"
                  title="添加"
                  @click.stop="departEdit(data, 0)"
                />
                <i
                  v-if="node.level !== 1"
                  v-hasPermi="['system:dept:remove']"
                  class="iconfont icon-tool-delete"
                  title="删除"
                  @click.stop="departRemove(data.id)"
                />
              </span>
            </div>
          </common-tree>
        </div>
        <!--用户数据-->
        <div class="staff-container-right">
          <RightContainer>
            <template v-if="isDKCorp" v-slot:data-stat>
              <div class="dk-corp-tip-text">
                如需修改员工/部门信息，请前往
                <el-link
                  type="primary"
                  href="https://work.weixin.qq.com/wework_admin/frame#contacts"
                  target="_blank"
                >企业微信管理后台</el-link>
              </div>
            </template>
            <template v-slot:operate-btn>
              <el-button
                type="text"
                size="medium"
                style="color: rgba(153, 153, 153, 100)"
                @click="SyncMemberInfoDrawerVisible = true"
              >
                员工头像不显示？
              </el-button>
              <div class="divider" />
              <el-button
                v-if="!isDKCorp"
                type="text"
                size="medium"
                style="color: rgba(153, 153, 153, 100)"
                @click="handleShowAddMemberFailDrawer('qrcode')"
              >
                成员添加失败？
              </el-button>
              <el-dropdown v-if="!isDKCorp" @command="handleCommand">
                <el-button type="primary"> 添加员工<i class="el-icon-arrow-down el-icon--right" /> </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="qrcode">扫码加入</el-dropdown-item>
                  <el-dropdown-item command="invite">发起邀请</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button
                v-hasPermi="['contacts:organization:sync']"
                class="sync-user-btn btn-reset"
                @click="syncUser"
              >同步员工</el-button>
              <el-button v-hasPermi="['contacts:organization:edit']" class="btn-reset" @click="onBachtUpdate">
                批量修改员工
              </el-button>
            </template>
            <template v-slot:data>
              <el-table
                v-loading="loading"
                :data="userList"
                :header-cell-style="{ backhround: '#eee' }"
                @selection-change="handleSelectionChange"
              >
                <template slot="empty">
                  <empty-default-icon :length="userList.length" />
                </template>
                <el-table-column type="selection" width="50" align="left" />
                <el-table-column label="成员" align="left" width="140" prop="userId">
                  <template slot-scope="scope">
                    <div class="staff-info">
                      <img :src="scope.row.headImageUrl || require('@/assets/image/card-avatar.svg')" alt="">
                      <div class="staff-name">
                        <div
                          class="inoneline"
                          :title="scope.row.alias ? `${scope.row.alias}（${scope.row.userName}）` : scope.row.userName"
                        >
                          {{ scope.row.alias ? `${scope.row.alias}（${scope.row.userName}）` : scope.row.userName }}
                        </div>
                        <div class="inoneline">{{ scope.row.position }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="手机号" align="left" prop="mobile" width="120" />
                <el-table-column label="所属部门" align="left" :show-overflow-tooltip="true">
                  <template slot-scope="scope">
                    {{ treeMap[scope.row.mainDepartment] }}
                  </template>
                </el-table-column>
                <el-table-column label="角色" align="left" :show-overflow-tooltip="true">
                  <template slot-scope="scope">
                    {{ scope.row.roleName }}
                  </template>
                </el-table-column>
                <el-table-column label="激活状态" align="left">
                  <template #header>
                    <span>激活状态</span>
                    <el-popover placement="top-start" trigger="hover" popper-class="tip-popover">
                      <div>
                        <div>1. 已激活：员工已在企微客户端进入当前企业</div>
                        <div>2. 已禁用：员工被禁用，无法读取企业数据</div>
                        <div>3. 未激活：员工未在企微客户端进入当前企业</div>
                        <div>4. 退出企业：员工已退出企业，若自退出起30天内未进入，将被企微官方自动删除</div>
                      </div>
                      <i slot="reference" class="iconfont icon-question" style="font-size: 14px" />
                    </el-popover>
                  </template>
                  <template slot-scope="scope">
                    {{ statusActivate[scope.row.isActivate] }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="left" width="180" class-name="small-padding fixed-width">
                  <template slot-scope="scope">
                    <el-button
                      v-hasPermi="['contacts:organization:info']"
                      type="text"
                      @click="edit(scope.row, 0)"
                    >详情</el-button>
                    <el-button
                      v-if="scope.row.userId !== 1 && scope.row.enable < 2 && !isDKCorp"
                      v-hasPermi="['contacts:organization:forbidden']"
                      type="text"
                      @click="startOrStop(scope.row)"
                    >{{ status[scope.row.enable] }}</el-button>
                    <el-button
                      v-hasPermi="['contacts:organization:edit']"
                      type="text"
                      @click="edit(scope.row, 1)"
                    >编辑</el-button>
                    <el-button
                      v-if="scope.row.enable < 2 && !isDKCorp"
                      v-hasPermi="['contacts:organization:removeMember']"
                      type="text"
                      @click="remove(scope.row.userId)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <pagination
                v-show="total > 0"
                :total="total"
                :page.sync="query.pageNum"
                :limit.sync="query.pageSize"
                :select-data-len="multipleSelection.length"
                @pagination="getList()"
              />
            </template>
          </RightContainer>
        </div>
      </el-row>

      <!-- 人员弹窗 -->
      <el-dialog
        :title="form.userId ? (disabled ? '成员详情' : '修改成员') : '添加成员'"
        :visible.sync="dialogVisible"
        class="member-info-modal"
        :close-on-click-modal="form.userId ? (disabled ? true : false) : false"
      >
        <el-row :gutter="10" class="modal-top">
          <el-col :span="4" style="width: auto">
            <!-- <el-upload action :show-file-list="false" :on-success="d" :before-upload="d">
            <img v-if="form.avatarMediaid" :src="form.avatarMediaid" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>-->
            <div class="avatar-wrap ac">
              <img v-if="form.headImageUrl" class="avatar" :src="form.headImageUrl">
              <i v-else class="el-icon-plus avatar-uploader-icon cc" />
            </div>
          </el-col>
          <el-col :span="11">
            <el-form
              ref="form"
              label-position="right"
              :model="form"
              :rules="rules"
              label-width="60px"
              :disabled="disabled"
            >
              <el-form-item label="姓名" prop="userName">
                <el-input v-model="form.userName" disabled :maxlength="64" show-word-limit />
              </el-form-item>
              <el-form-item label="账号" prop="userId">
                <el-input
                  v-model="form.userId"
                  disabled
                  placeholder="成员唯一标识，不支持更改，不支持中文"
                />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="form.gender" disabled>
                  <el-radio :label="1">男</el-radio>
                  <el-radio :label="2">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row :gutter="10" class="modal-bottom">
          <el-col :span="12">
            <div class="type-title">基本信息</div>
            <el-form
              ref="form"
              label-position="right"
              :model="form"
              :rules="rules"
              label-width="80px"
              :disabled="disabled"
            >
              <el-form-item label="昵称">
                <el-input
                  v-model="form.alias"
                  disabled
                  :maxlength="64"
                  :placeholder="`${showPlaceHolder ? '可在新闻公告应用的生日祝福等场景使用' : ''}`"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="手机号" prop="mobile">
                <el-input v-model="form.mobile" disabled />
              </el-form-item>
              <el-form-item label="生日">
                <el-date-picker v-model="form.birthday" value-format="yyyy-MM-dd" type="date" placeholder />
              </el-form-item>
              <el-form-item label="身份证" prop="idCard">
                <el-input v-model="form.idCard" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" disabled />
              </el-form-item>
              <el-form-item label="QQ" prop="qqAccount">
                <el-input v-model="form.qqAccount" />
              </el-form-item>
              <el-form-item label="地址">
                <el-input
                  v-model="form.address"
                  disabled
                  type="textarea"
                  row="2"
                  :maxlength="128"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <div class="type-title">企业信息</div>
            <el-form
              ref="form"
              label-position="right"
              :model="form"
              :rules="rules"
              label-width="80px"
              :disabled="disabled"
            >
              <el-form-item label="角色" prop="roleId">
                <el-select v-model="form.roleId" placeholder="请选择">
                  <el-option
                    v-for="item in roleOptions"
                    :key="item.roleId"
                    :label="item.roleName"
                    :value="item.roleId"
                    :disabled="item.status == 1"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="所在部门" prop="mainDepartment">
                <el-cascader
                  v-model="form.mainDepartment"
                  disabled
                  :options="treeData"
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
              <el-form-item label="职务">
                <el-input v-model="form.position" disabled :maxlength="64" show-word-limit />
              </el-form-item>
              <!-- <el-form-item label="角色">
              <el-radio-group v-model="form.isLeaderInDept">
                <el-radio :label="0">普通成员</el-radio>
                <el-radio :label="1">上级</el-radio>
              </el-radio-group>
            </el-form-item> -->
              <el-form-item label="入职时间">
                <el-date-picker v-model="form.joinTime" value-format="yyyy-MM-dd" type="date" placeholder />
              </el-form-item>
              <!-- <el-form-item label="备注">
              <el-input type="textarea" v-model="model"></el-input>
            </el-form-item>-->
            </el-form>
          </el-col>
        </el-row>
        <div slot="footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <RequestButton type="primary" :request-method="submit" button-type="save">确 定</RequestButton>
        </div>
      </el-dialog>

      <!-- 部门弹窗 -->
      <el-dialog
        :title="(formDepart.id ? '修改' : '添加') + '部门'"
        :visible.sync="dialogVisibleDepart"
        :close-on-click-modal="false"
        @close="closeModal"
      >
        <el-form ref="departForm" :model="formDepart" label-width="80px" :rules="departRules">
          <el-form-item label="部门名称" prop="departName">
            <el-input v-model="formDepart.name" :maxlength="16" show-word-limit />
          </el-form-item>
          <el-form-item v-if="formDepart.pName" label="所属部门">
            <el-input v-model="formDepart.pName" disabled />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="dialogVisibleDepart = false">取 消</el-button>
          <RequestButton type="primary" :request-method="departSubmit" button-type="submit">确 定</RequestButton>
        </div>
      </el-dialog>
      <!-- 扫码添加 -->
      <el-dialog title="扫码加入" :visible.sync="showQrcodeAddDialog" width="500px" :destroy-on-close="true">
        <div class="tip">成员使用微信扫码快速加入企业，当前二维码7天内（{{ expirationTime }}前）有效</div>
        <div class="company-name">『{{ $store.state.enterPriseWechatConfig.companyName }}』</div>
        <div v-loading="qrcodeLoading" class="qrcode">
          <img v-if="joinQrcodeUrl" :src="joinQrcodeUrl" alt="" class="qrcode">
        </div>
        <div class="download">
          <el-button class="download-btn" type="text" size="medium" @click="download"> 下载二维码 </el-button>
        </div>
      </el-dialog>
      <!-- 发起邀请 -->
      <InviteForm
        :visible.sync="inviteDialogVisible"
        :handle-show-add-member-fail-drawer="handleShowAddMemberFailDrawer"
        :get-member-list="getList"
        :role-data="roleOptions"
        :department-data="treeData"
      />
      <!-- 成员添加教程抽屉 -->
      <el-drawer
        title="成员加入失败"
        :visible.sync="addMemberFailDrawerVisible"
        :direction="direction"
        :before-close="handleCloseDrawer"
        :append-to-body="true"
        size="780px"
      >
        <AddMemberTip :type="addMemberFailDrawerActive" />
      </el-drawer>

      <!-- 同步成员信息 -->
      <el-drawer
        class="extra-drawer-div"
        title="同步成员信息"
        :visible.sync="SyncMemberInfoDrawerVisible"
        :before-close="handleCloseDrawer"
        :close-on-press-escape="false"
        :wrapper-closable="false"
        :append-to-body="true"
        size="780px"
      >
        <SyncMemberInfo :extra-drawer="SyncMemberInfoDrawerVisible" @closeDrawer="SyncMemberInfoDrawerVisible = false" @getList="getList" />
      </el-drawer>

      <BatchUpdateUser
        title="批量修改信息"
        :visible.sync="updateUserVisible"
        :loading="updateUserLoading"
        :update-user-res="updateUserRes"
        :is-d-k-corp="isDKCorp"
        @submit="batchUpdateUser"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tip {
  color: rgba(51, 51, 51, 100);
  font-size: 14px;
  text-align: center;
  font-family: Arial-regular;
  margin-bottom: 20px;
}
.company-name {
  font-family: Arial;
  font-weight: 700;
  font-size: 16px;
  color: rgb(51, 51, 51);
  font-style: normal;
  letter-spacing: 0px;
  line-height: 18px;
  text-decoration: none;
  text-align: center;
  margin-bottom: 10px;
}
.qrcode {
  height: 153px;
  text-align: center;
}
.qrcode img {
  width: 150px;
  height: 150px;
}
.download {
  width: 100%;
  text-align: center;
}
.download-btn {
  font-size: 14px;
  font-family: Arial-regular;
}
.right-container {
  height: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  overflow: hidden;
  .fr {
    .iconfont {
      font-size: 1em;
      margin-left: 8px;
    }
  }
}
.avatar-wrap {
  width: 127px;
  height: 137px;
  border: 1px solid #eee;
  border-radius: 50%;
  // border-radius: 5px;
  position: relative;
  overflow: hidden;
}
.avatar {
  width: 125px;
  height: 135px;
}
.avatar-uploader-icon {
  font-size: 58px;
  color: #ddd;
}
.img-wrap {
  height: 340px;
  overflow: auto;
  /deep/.el-radio__input {
    position: absolute;
    right: 0;
  }
}
.img-li {
  width: 115px;
  height: 160px;
}
.mb15 {
  text-align: left;
}
.member-info-modal {
  /deep/ .el-dialog__body {
    padding: 20px;
  }
  .modal-top {
    display: flex;
    align-items: center;
  }
  .modal-bottom {
    /deep/ .el-form-item__content {
      width: calc(100% - 80px);
      position: relative;
      .el-cascader,
      .el-date-editor {
        width: 100%;
      }
    }
    .type-title {
      border-left: 2px solid #2d8ff4;
      padding-left: 12px;
      margin-left: 8px;
      margin-bottom: 14px;
      color: #333;
      height: 20px;
      line-height: 20px;
    }
  }
}
.staff-info {
  text-align: left;
  display: flex;
  img {
    width: 35px;
    height: 35px;
    border-radius: 5px;
  }
  .staff-name {
    margin-left: 5px;
    > div {
      width: 80px;
      padding-left: 5px;
    }
  }
}
.staff-top-search {
  background-color: #fff;
  padding: 5px;
}
.staff-body {
  margin-top: 10px;
  flex: 1;
}
.left-tree {
  width: 300px;
  padding: 10px;
  background-color: #fff;
}
.staff-container-right {
  width: calc(100% - 310px);
  margin-left: 10px;
  .dk-corp-tip-text {
    .el-link--primary {
      color: #66b1ff;
      vertical-align: inherit;
      line-height: 18px;
    }
    .el-link.el-link--primary.is-underline:hover:after {
      border-bottom: 1px solid #66b1ff;
    }
  }
}
.staff-container-right-top {
  padding-bottom: 10px;
}
.new-form-item {
  padding: 0;
  margin-right: 5px !important;
  margin-top: 0px !important;
}
.pd15 {
  padding: 15px;
}
/deep/ .el-table .el-table__header-wrapper th {
  background: #eee;
}
.sync-user-btn {
  margin-left: 10px;
}
/deep/ .el-textarea .el-textarea__inner {
  padding-right: 45px;
}
.divider {
  margin: 0 10px;
  border: 1px solid #BBBBBB;
  height: 18px;
  display: inline-block;
  margin-bottom: -4px;
}
.drawer-div, .extra-drawer-div {
  /deep/ .el-drawer__container {
    .el-drawer {
      width: 780px !important;
      .el-drawer__header {
        >span {
          font-size: 20px;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
  /deep/ .el-drawer__header {
    margin-bottom: 15px;
  }
  /deep/ .el-drawer__body {
    padding: 0 20px;
    height: calc(100% - 43px);
  }
}
</style>
