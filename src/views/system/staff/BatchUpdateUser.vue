<!--
 * @Description: 批量修改员工
 * @Author: 佚名
 * @LastEditors: wJiaaa
-->
<template>
  <el-dialog v-bind="$attrs" width="500px" custom-class="dialog" @close="$emit('update:visible', false)">
    <el-form ref="BatchUpdateUser" :model="form" :rules="rules" size="mini" label-width="80px">
      <template v-if="!showUpdateUserRes">
        <el-form-item label="批量修改">
          <el-radio-group v-model="type">
            <el-radio :label="1">角色</el-radio>
            <el-radio v-if="!isDKCorp" :label="2">职务</el-radio>
            <el-radio v-if="!isDKCorp" :label="3">所在部门</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="type === ROLE_TYPE" label="角色" prop="roleId" required>
          <el-select
            v-model="form.roleId"
            placeholder="请选择"
            style="width:308px"
          >
            <el-option v-for="item in roleData" :key="item.roleId" :label="item.roleName" :value="item.roleId" />
          </el-select>
        </el-form-item>

        <el-form-item v-else-if="type === POSITION_TYPE" label="职务" prop="position" required>
          <el-input
            v-model="form.position"
            show-word-limit
            maxlength="64"
            style="width:308px"
          />
        </el-form-item>

        <el-form-item v-else-if="type === DEPARTMENT_TYPE" label="所在部门" prop="department" required>
          <el-cascader
            v-model="form.department"
            style="width:308px"
            :options="treeData"
            :show-all-levels="false"
            :props="{
              expandTrigger: 'hover',
              checkStrictly: true,
              emitPath: false,
              value: 'id',
              label: 'name',
            }"
          />
        </el-form-item>
      </template>

      <template v-else>
        <div class="result">
          <p class="resultText">修改完成，修改<span class="success">成功{{ updateUserRes.successCount }}个</span>，修改<span class="fail">失败{{ updateUserRes.failCount }}个</span></p>
          <template v-if="updateUserRes.fileUrl">
            <p class="failReportText">下载修改失败报告，查看错误原因</p>
            <el-link class="downfailReportText theme-text-color" :underline="false" icon="el-icon-download" @click="downloadErrFile(updateUserRes.fileUrl)">下载修改失败报告</el-link>
          </template>
        </div>
      </template>

    </el-form>

    <div slot="footer">
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
    </div>

  </el-dialog>
</template>

<script>
import { download } from '@/utils/download';
import { listRole } from '@/api/system/role';

const ROLE_TYPE = 1;
const POSITION_TYPE = 2;
const DEPARTMENT_TYPE = 3;
export default {
  name: '',
  components: {},
  props: {
    // 已勾选的员工列表
    multiSelect: {
      type: Array,
      default: () => []
    },
    updateUserRes: {
      type: Object,
      default: () => {}
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    // 是否为代开发应用
    isDKCorp: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      ROLE_TYPE,
      POSITION_TYPE,
      DEPARTMENT_TYPE,
      type: 1,
      roleData: [],
      treeData: [],
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true,
        emitPath: false
      },
      rules: {
        roleId: [
          { required: true, message: '请选择员工角色', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请选择员工部门', trigger: 'blur' }
        ],
        position: [
          { required: true, message: '请填写员工职务', trigger: 'blur' }
        ]
      },
      form: {}
    };
  },
  computed: {
    showUpdateUserRes() {
      // 当 updateUserRes 的任意一项有值时，返回 true
      return Object.values(this.updateUserRes).some(val => val);
    }
  },
  watch: {
    type() {
      this.form = {};
    }
  },
  async created() {
    // 获取角色列表
    listRole().then(res => { this.roleData = res.rows; });
    // 获取部门数据
    try {
      const data = await this.$store.dispatch('GetDepartmentList');
      this.treeData = this.handleTree(data || []);
    } catch (error) {
      this.scopeDeptList = [];
      this.treeData = [];
    }
  },
  methods: {
    submit() {
      if (!this.showUpdateUserRes) {
        this.$refs['BatchUpdateUser'].validate(async valid => {
          if (!valid) return;
          this.$emit('submit', {
            ...this.form,
            type: this.type
          });
        });
      } else {
        this.$emit('update:visible', false);
      }
    },
    downloadErrFile(url) {
      download(url);
    }
  }

};
</script>

<style scoped lang='scss'>
  .result {
    text-align: center;

    .resultText {
      font-size: 16px;

      .success {
        color: $wxGreen;
      }
      .fail {
        color: $red;
      }
    }

    .failReportText{
      margin-top: 2em;
      margin-bottom: .3em;
    }

    .downfailReportText{
      font-size: 14px;
    }
  }
</style>
