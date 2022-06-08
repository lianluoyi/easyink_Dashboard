<script>
import * as taskApi from '@/api/task';
import SelectTag from '@/components/SelectTag';
import SelectUser from '@/components/SelectUser';
import SelectPoster from '@/components/SelectPoster';
export default {
  name: 'EditTask',
  components: {
    SelectUser,
    SelectTag,
    SelectPoster,
    TargetSelectUser: SelectUser
  },
  data() {
    return {
      query: {
        taskName: '',
        fissInfo: '',
        fissNum: '',
        dateRange: ''
      },
      groupForm: {
        taskFissionStaffs: [],
        sendType: 0,
        customerTag: [],
        customerTagId: [],
        tagType: 0,
        postersId: '',
        postersUrl: '',
        fissionTarget: '',
        fissionTargetId: '',
        welcomeMsg: '',
        rewardUrl: '',
        rewardImageUrl: '',
        rewardRule: ''
      },
      rewardImageUrlTemp: '',
      action:
        process.env.VUE_APP_BASE_API +
        window.CONFIG.services.wecom +
        '/fission/upload',
      headers: window.CONFIG.headers,
      ruleForm: {
        taskName: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        postersId: [{ required: true, message: '请输入海报', trigger: 'blur' }],
        fissionTargetId: [
          { required: true, message: '请选择员工', trigger: 'blur' }
        ],
        fissNum: [
          { required: true, message: '请输入数量', trigger: 'blur' },
          { pattern: /^[1-9]+$/, message: '请输入数字', trigger: 'blur' }
        ],
        dateRange: [
          { required: true, message: '时间不可为空', trigger: 'blur' }
        ]
      },
      dialogVisibleSelectUser: false,
      dialogVisibleSelectTag: false,
      dialogVisibleSelectPoster: false,
      dialogVisibleTargetStff: false,
      selectTagType: '',
      pageType: 'add',
      taskDetail: {}
    };
  },
  created() {
    if (this.$route.query.id) {
      this.pageType = 'edit';
      this.getList(this.$route.query.id);
    }
  },
  mounted() {},
  methods: {
    submitForm() {
      try {
        const basciForm = new Promise((resolve, reject) => {
          this.$refs['ruleForm'].validate((valid) => {
            if (valid) resolve();
          });
        });
        const posterForm = new Promise((resolve, reject) => {
          this.$refs['fissTarget'].validate((valid) => {
            if (valid) resolve();
          });
        });
        Promise.all([basciForm, posterForm]).then(() => {
          console.log('验证通过,提交表单');
          const params = {
            ...this.query,
            ...this.groupForm
          };
          params.startTime = params.dateRange[0];
          params.overTime = params.dateRange[1];
          delete params.dateRange;
          // 发送成员选择全部
          if (!params.sendType) {
            params.taskFissionStaffs = [
              {
                staffId: '',
                staffName: '',
                // eslint-disable-next-line no-magic-numbers
                staffType: 3
              }
            ];
          }
          delete params.sendType;
          // 客户标签选择全部
          console.log(params);
          if (!params.tagType) {
            params.customerTag = '';
            params.customerTagId = 'all';
          } else {
            params.customerTag = params.customerTag.join(',');
            params.customerTagId = params.customerTagId.join(',');
          }
          delete params.tagType;
          params.fissionType = 1;
          if (this.pageType === 'add') {
            this.addTaskRequest(params);
          } else {
            params['id'] = this.$route.query.id;
            this.editTaskRequest(params);
          }
        });
      } catch (error) {
        // error
      }
    },
    addTaskRequest(params) {
      taskApi.addTask(params).then((res) => {
        this.msgSuccess('新增成功');
        taskApi.sendFission(JSON.parse(res.msg).id);
        this.$router.push({
          path: 'taskGroup'
        });
      });
    },
    editTaskRequest(params) {
      taskApi.editTask(params).then((res) => {
        this.msgSuccess('修改成功');
        this.$router.push({
          path: 'taskGroup'
        });
        // taskApi.sendFission(JSON.parse(res.msg).id)
      });
    },
    changeType() {
      // console.log(this.groupForm.sendType)
      // this.groupForm.taskFissionStaffs = []
    },
    getList(id) {
      taskApi.getTaskDetail(id).then((res) => {
        this.taskDetail = res.data;
        console.log(res.data);
        const query = {
          taskName: res.data.taskName,
          fissInfo: res.data.fissInfo,
          fissNum: res.data.fissNum,
          dateRange: [
            res.data.startTime + ' 00:00:00',
            res.data.overTime + ' 00:00:00'
          ]
        };
        this.query = query;
        this.groupForm = {
          taskFissionStaffs: res.data.taskFissionStaffs,
          sendType:
            res.data.taskFissionStaffs.length &&
            res.data.taskFissionStaffs[0].staffId
              ? 1
              : 0,
          customerTag:
            res.data.customerTagId === 'all'
              ? ''
              : res.data.customerTag.split(','),
          customerTagId:
            res.data.customerTagId === 'all'
              ? 'all'
              : res.data.customerTagId.split(','),
          tagType: res.data.customerTagId === 'all' ? 0 : 1,
          postersId: res.data.postersId,
          postersUrl: res.data.postersUrl,
          fissionTarget: res.data.fissionTarget,
          fissionTargetId: res.data.fissionTargetId,
          welcomeMsg: res.data.welcomeMsg,
          rewardUrl: res.data.rewardUrl,
          rewardImageUrl: res.data.rewardImageUrl,
          rewardRule: res.data.rewardRule
        };
      });
    },
    changeTagType() {},
    selectedUser(value) {
      this.groupForm.taskFissionStaffs = value.map((item) => {
        let selectParam = {};
        if (item.userId) {
          selectParam = {
            staffId: item.userId,
            staffName: item.name,
            // eslint-disable-next-line no-magic-numbers
            staffType: 2
          };
        } else {
          selectParam = {
            staffId: item.id,
            staffName: item.name,
            staffType: 1
          };
        }
        return selectParam;
      });
    },
    submitSelectTag(value) {
      this.dialogVisibleSelectTag = false;
      const tagIds = [];
      const tagName = [];
      value.forEach((item) => {
        tagIds.push(item.tagId);
        tagName.push(item.name);
      });
      this.groupForm.customerTag = tagName;
      this.groupForm.customerTagId = tagIds;
    },
    submitSelecPoster(value) {
      this.groupForm.postersId = value.id;
      this.groupForm.postersUrl = value.materialUrl;
    },
    tagetSelect(value) {
      console.log(value);
      this.groupForm.fissionTarget = value[0].name;
      this.groupForm.fissionTargetId = value[0].userId;
    },
    insertCustomer() {
      this.groupForm.welcomeMsg += '#客户昵称#';
    },
    handleAvatarSuccess(res, file) {
      //   this.rewardImageUrlTemp = URL.createObjectURL(file.raw) //预览
      this.rewardImageUrlTemp = this.groupForm.rewardImageUrl =
        res.data.rewardImageUrl;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';

      if (!isJPG && !isPNG) {
        this.msgError('上传头像图片只能是 JPG/PNG 格式!');
      }

      return isJPG || isPNG;
    }
  }
};
</script>

<template>
  <div class="task-edit-container">
    <div class="edit-model">
      <h4 class="title">基本信息设置</h4>
      <el-form
        ref="ruleForm"
        :model="query"
        :rules="ruleForm"
        label-width="120px"
        class="top-search"
        label-position="left"
      >
        <el-form-item label="目标活动名称" prop="taskName">
          <el-input v-model="query.taskName" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="裂变引导语" prop="fissInfo">
          <el-input
            v-model="query.fissInfo"
            placeholder="请输入裂变引导语(最多255字)"
            maxlength="255"
          />
        </el-form-item>
        <el-form-item label="裂变客户数量" prop="fissNum">
          <el-input v-model="query.fissNum" />
        </el-form-item>
        <el-form-item label="活动时间" prop="dateRange">
          <el-date-picker
            v-model="query.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="edit-model">
      <h4 class="title">活动发起成员</h4>
      <el-form
        ref="fissStaff"
        :model="query"
        :rules="ruleForm"
        label-width="120px"
        class="top-search"
        label-position="left"
      >
        <el-form-item label="发起成员" prop="taskNames">
          <el-radio-group v-model="groupForm.sendType" @change="changeType">
            <el-radio :label="0">全部</el-radio>
            <el-radio :label="1">选择成员</el-radio>
          </el-radio-group>
          <div v-if="groupForm.sendType">
            <el-tag
              v-for="item in groupForm.taskFissionStaffs"
              :key="item.staffId"
            >{{ item.staffName }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item v-if="groupForm.sendType" label="">
          <el-button
            type="primary"
            class="ml10"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="dialogVisibleSelectUser = true"
          >选择成员</el-button>
        </el-form-item>
        <el-form-item label="客户标签" prop="tagType">
          <el-radio-group v-model="groupForm.tagType" @change="changeTagType">
            <el-radio :label="0">全部</el-radio>
            <el-radio :label="1">选择标签</el-radio>
          </el-radio-group>
          <div v-if="groupForm.tagType">
            <el-tag v-for="item in groupForm.customerTag" :key="item">{{
              item
            }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item v-if="groupForm.tagType" label="">
          <el-button
            type="primary"
            class="ml10"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="dialogVisibleSelectTag = true"
          >选择标签</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="edit-model">
      <h4 class="title">裂变海报</h4>
      <el-form
        ref="fissTarget"
        :model="groupForm"
        :rules="ruleForm"
        label-width="120px"
        class="top-search"
        label-position="left"
      >
        <el-form-item label="选择海报" prop="postersId">
          <el-button
            v-if="!groupForm.postersId"
            type="primary"
            class="ml10"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="dialogVisibleSelectPoster = true"
          >选择海报</el-button>
          <div v-if="groupForm.postersId" class="changePosterBody">
            <img :src="groupForm.postersUrl" class="postersUrl">
            <span
              class="changeUrl theme-text-color"
              @click="dialogVisibleSelectPoster = true"
            >修改</span>
          </div>
        </el-form-item>

        <el-form-item label="添加员工" prop="fissionTargetId">
          <el-button
            v-if="!groupForm.fissionTargetId"
            type="primary"
            class="ml10"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="dialogVisibleTargetStff = true"
          >添加员工</el-button>
          <div v-if="groupForm.fissionTargetId" class="changePosterBody">
            <el-tag>{{ groupForm.fissionTarget }}</el-tag>
            <span
              class="changeUrl theme-text-color"
              @click="dialogVisibleTargetStff = true"
            >修改</span>
          </div>
          <p class="targetTips">
            选择员工，用于此次任务裂变的目标添加人。如不选择将默认使用本次活动下发员工的活码信息。
          </p>
        </el-form-item>
      </el-form>
    </div>
    <div class="edit-model">
      <h4 class="title">活动奖励</h4>
      <el-form
        ref="reward"
        :model="groupForm"
        label-width="120px"
        class="top-search"
        label-position="left"
      >
        <el-form-item label="兑奖链接" prop="rewardUrl">
          <el-input
            v-model="groupForm.rewardUrl"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="兑奖图片" prop="rewardImageUrl">
          <el-upload
            class="avatar-uploader"
            :action="action"
            :headers="headers"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="rewardImageUrlTemp"
              :src="rewardImageUrlTemp"
              class="avatar"
            >
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="兑奖规则" prop="rewardRule">
          <el-input
            v-model="groupForm.rewardRule"
            type="textarea"
            style="border:none;resize:none;width:364px"
            maxlength="100"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="edit-model">
      <h4 class="title">新客欢迎语</h4>
      <el-form
        ref="welcomeTips"
        :model="groupForm"
        label-width="150px"
        class="top-search"
      >
        <div class="welcomeBox">
          <el-input
            v-model="groupForm.welcomeMsg"
            type="textarea"
            style="border:none;resize:none"
          />
          <div class="insertCustomer" @click="insertCustomer">
            <i class="el-icon-user-solid" />
            插入客户
          </div>
        </div>
      </el-form>
    </div>
    <el-button type="primary" @click="submitForm()">{{
      pageType == 'edit' ? '立即修改' : '立即创建'
    }}</el-button>

    <!-- 选择使用员工弹窗 -->
    <SelectUser
      key="2"
      :visible.sync="dialogVisibleSelectUser"
      title="选择成员"
      :is-only-leaf="false"
      :is-sigle-select="false"
      @success="selectedUser"
    />
    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      :selected="groupForm.toTag"
      @success="submitSelectTag"
    />
    <SelectPoster
      :visible.sync="dialogVisibleSelectPoster"
      :selected="groupForm.toTag"
      @success="submitSelecPoster"
    />
    <TargetSelectUser
      key="1"
      :visible.sync="dialogVisibleTargetStff"
      title="选择成员"
      :is-only-leaf="true"
      :is-sigle-select="true"
      @success="tagetSelect"
    />
  </div>
</template>

<style lang="scss">
@import '~@/styles/mixin.scss';
.task-edit-container {
  background-color: #efeff4;
  // height: 100%;
  .edit-model {
    background: #fff;
    margin-bottom: 20px;
    padding: 20px;
    .postersUrl {
      width: 70px;
      margin-right: 10px;
    }
    .changeUrl {
      font-size: 14px;
      cursor: pointer;
    }
    .changePosterBody {
      display: flex;
      align-items: center;
    }
    .targetTips {
      font-size: 12px;
      color: #909399;
    }
    .welcomeBox {
      position: relative;
      width: 464px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 16px 16px 0 16px;
      margin-bottom: 10px;
      .el-textarea__inner {
        border: none;
        resize: none;
        height: 120px;
      }
      .insertCustomer {
        background-color: #ebeef5;
        border: none;
        color: #606266 !important;
        position: absolute;
        right: 55px;
        bottom: 10px;
        padding: 9px 15px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 12px;
      }
    }
  }
  .title {
    text-align: left;
    color: #303133;
    margin-bottom: 10px;
  }
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  @include border_color();
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 78px;
  height: 78px;
  line-height: 78px;
  text-align: center;
}
.avatar {
  width: 78px;
  height: 78px;
  display: block;
}
</style>
