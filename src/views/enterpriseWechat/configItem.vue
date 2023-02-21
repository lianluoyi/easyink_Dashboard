<script>
import * as api from '@/api/enterpriseId';
import { setDefaultConfig } from '@/utils/enterpriseWechat';
import { ENTERPRISE_CONFIG_TIP, SERVER_TYPE_THIRD } from '@/utils/constant';

export default {
  components: {},
  props: {
    params: {
      type: Array,
      default: () => []
    },
    tip: {
      type: String,
      default: ''
    },
    btnText: {
      type: String,
      default: ''
    },
    form: {
      type: Object,
      default: () => ({})
    },
    oldForm: {
      type: Object,
      default: () => {}
    },
    btnType: {
      type: String,
      default: ''
    },
    // 接收applicationType来判断如果是代开发应用不显示应用信息下面内容里面的提示
    applicationType: {
      type: String,
      default: ''
    },
    // 接收applicationFromType来判断是否需要修改字体的样式
    applicationFromType: {
      type: String,
      default: ''
    }
  },
  data() {
    const isThirdType = this.$store.state.serverInfo && this.$store.state.serverInfo.serverType === SERVER_TYPE_THIRD;
    return {
      certFile: {},
      // 指定某些字段不可编辑
      disableInputField: ['h5DoMainName'],
      // 是否为第三方应用
      isThirdType: isThirdType,
      showWarnTip: false
    };
  },
  computed: {},
  watch: {
    certFile(val) {
      if (val && val.response && val.response.url) {
        this.onSaveSingle('save', 'certFilePath');
      }
    },
    form(val) {
      if (val && this.params?.length) this.checkEnterpriseIdValid(this.params);
    }
  },
  created() {
  },
  methods: {
    addOrUpdateConfig(newParams, callback) {
      if (!newParams.id) {
        this.addConfig({
          ...newParams,
          status: 0
        }, callback);
      } else {
        this.updateConfig(newParams, callback);
      }
    },
    addConfig(newParams, callback) {
      api.add(newParams)
        .then(() => {
          if (callback) {
            callback();
          } else {
            this.msgSuccess('操作成功');
            this.$emit('getNowConfig');
          }
        })
        .catch(() => {
          this.dialogVisible = false;
        });
    },
    /**
     * 更新企微配置
     */
    updateConfig(newParams, callback) {
      api.update(newParams)
        .then(() => {
          if (callback) {
            callback();
          } else {
            this.msgSuccess('操作成功');
            this.$emit('getNowConfig');
          }
        })
        .catch(() => {
          this.dialogVisible = false;
        });
    },
    // 保存该类下所有配置
    onSaveAll() {
      let newParams = {
        id: this.form.id
      };
      this.params.map(item => {
        newParams[item.field] = this.form[item.field];
      });
      if (this.checkEnterpriseIdValid(this.params)) return;
      newParams = setDefaultConfig(newParams);
      if (!this.dealUpdateCorpId(newParams)) return;
      this.addOrUpdateConfig(newParams, this.contactChangeSuccessAlert);
    },
    // 对修改企业id的业务逻辑处理
    dealUpdateCorpId(newParams) {
      const updateCorpIdFlag = this.params.some((item) => {
        return item.field === 'corpId';
      });
      if (updateCorpIdFlag && this.oldForm.corpId !== newParams.corpId) {
        this.confirmModal({
          msg: '当前企业修改后，EasyInk下所有在线员工将被强制下线，原有企业数据不可查看，是否继续？'
        }, () => {
          this.addOrUpdateConfig(newParams, this.contactChangeSuccessAlert);
        });
        return false;
      }
      return true;
    },
    // 保存单个配置
    onSaveSingle(btnType, field) {
      if (['customSecret'].includes(field) && !this.form[field]) {
        this.msgInfo('请输入要保存的内容');
        return;
      }
      let newParams = {
        agentSecret: this.form.agentSecret,
        id: this.form.id,
        [field]: this.form[field]
      };
      if (btnType === 'save') {
        newParams = setDefaultConfig(newParams);
        this.addOrUpdateConfig(newParams);
      }
    },
    contactChangeSuccessAlert() {
      this.$alert(ENTERPRISE_CONFIG_TIP,
        '配置成功',
        {
          confirmButtonText: '我知道了',
          dangerouslyUseHTMLString: true
        }
      );
      this.$emit('getNowConfig');
    },
    /**
     * 校验是否显示修改企业ID的提示
     */
    checkEnterpriseIdValid(val) {
      if (this.$store.state.serverInfo.serverType !== SERVER_TYPE_THIRD) {
        const flag = val.some(item => {
          return item.label === '企业ID' && this.form[item.field].includes('_');
        });
        this.showWarnTip = flag;
        return flag;
      }
    },
    clearTip(item) {
      if (item.label === '企业ID') this.showWarnTip = false;
    }
  }
};
</script>

<template>
  <div class="config-content">
    <!-- 如果是待开发应用不显示 -->
    <div v-if="applicationType !== 'generationDevelopment'" class="tip">
      <i class="el-icon-info" /> {{ tip }}
    </div>
    <div class="config-list">
      <template v-for="(item, index) in params">
        <div :key="index" class="config-item">
          <div :class="`${applicationFromType === 'generationDevelopment' ? 'newlabel' : 'label'}`">
            <span v-if="item.required" class="require">*</span>
            {{ item.label }}
            <el-tooltip v-if="item.toolTipText" class="item" effect="dark" :content="item.toolTipText" placement="top-start">
              <i v-if="item.iconLabel" :class="item.iconLabel" />
            </el-tooltip>
          </div>
          <el-input
            v-if="item.type === 'input'"
            v-model="form[item.field]"
            :placeholder="`${item.placeholder ? item.placeholder : '请输入' + item.label}`"
            clearable
            :disabled="item.btnType === 'copy' || (isThirdType && disableInputField.includes(item.field))"
            @input="() => clearTip(item)"
          />
          <upload-txt
            v-if="item.type === 'upload'"
            class="upload-div"
            :file-url.sync="form.certFilePath"
            :file-name.sync="form.certFileName"
            :file.sync="certFile"
          />
          <el-button
            v-if="item.btnText && item.btnType === 'saveAll'"
            v-hasPermi="item.btnType === 'copy' ? [] : ['wechat:corp:edit']"
            class="btn-reset"
            @click="onSaveAll"
          >{{ item.btnText }}</el-button>
          <template v-else-if="item.btnText && !(isThirdType && disableInputField.includes(item.field))">
            <el-button
              v-if="item.btnType === 'copy'"
              v-hasPermi="item.btnType === 'copy' ? [] : ['wechat:corp:edit']"
              v-copy="form[item.field]"
              @click="onSaveSingle(item.btnType, item.field)"
            >
              {{ item.btnText }}
            </el-button>
            <el-button
              v-else
              v-hasPermi="item.btnType === 'copy' ? [] : ['wechat:corp:edit']"
              @click="onSaveSingle(item.btnType, item.field)"
            >
              {{ item.btnText }}
            </el-button>
          </template>
          <div v-if="item.label === '企业ID' && showWarnTip" class="warn-tip-text"><i class="el-icon-warning" />请替换为当前企业的ID。</div>
        </div>
      </template>
    </div>
    <!-- <div class="btn-all" v-if="btnText">
        </div> -->
  </div>
</template>
<style lang="scss" scoped>
.config-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  .tip {
    background-color: #F2F2F2;
    padding: 10px 15px;
    width: 642px;
    border-radius: 5px;
    margin-bottom: 5px;
    color: $grayColor;
    i {
      color: #909399;
      margin-right: 10px;
      font-size: 16px;
    }
  }
  .config-list {
    .config-item {
      display: flex;
      align-items: center;
      .label {
        width: 120px;
        text-align: right;
        .require {
          color: $red;
        }
        .el-icon-question {
          color: $orange;
        }
      }
      .newlabel {
        width: 100px;
        text-align: right;
        .require {
          color: $red;
        }
        .el-icon-question {
          color: $orange;
        }
      }
      /deep/ .el-input,
      .upload-div {
        width: 524px;
        margin: 5px;
      }
    }
  }
  .btn-all {
    text-align: center;
    width: 50%;
  }
  .warn-tip-text {
    color: #F59A23;
    .el-icon-warning {
      margin-right: 6px;
    }
  }
}
</style>
