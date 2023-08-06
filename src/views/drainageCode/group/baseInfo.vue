<script>
import { add, update, getDetail } from '@/api/drainageCode/group';
import PhoneDialog from '@/components/PhoneDialog';
import CustomerGroupModal from './customerGroupModal.vue';
import EnterpriseCodeModal from './enterpriseCodeModal.vue';
import ActuaList from './actuaList.vue';
import { CREATE_TYPE } from '@/utils/constant';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading, checkChange } from '@/utils/common';
export default {
  components: { PhoneDialog, CustomerGroupModal, EnterpriseCodeModal, ActuaList, RequestButton },
  props: {
    // 实际群活码
    groupCodeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        activityName: '',
        activityDesc: '',
        avatarUrl: '',
        guide: '',
        showTip: 0,
        tipMsg: '',
        customerServerQrCode: '',
        actualList: [],
        createType: CREATE_TYPE['group']
      },
      // 活码头像数据
      headImage: null,
      rules: {
        activityName: [{ required: true, message: '请输入活码名称', trigger: 'blur' }],
        activityDesc: [{ required: true, message: '请输入活码描述', trigger: 'blur' }]
      },
      // 编辑客户群弹窗
      dialog: false,
      // 需要移除的客户群
      removeList: [],
      CREATE_TYPE,
      // 编辑企微活码弹窗
      enterpriseCodeDialog: false,
      // 活码弹窗类型（添加/编辑）
      modalType: 'add',
      // 当前点击编辑的活码下标
      editIndex: -1,
      // 保存按钮加载状态
      loading: false
      // customerGroupList: []
    };
  },
  computed: {
    // 活码弹窗是否为编辑状态
    isEditModal() {
      return this.modalType === 'edit';
    },
    // 是否为代开发应用
    isDKCorp() {
      return this.$store.state.serverInfo.dkCorp;
    }
  },
  beforeUpdate() {
    checkChange(this.$options.data().form, this.form);
  },
  created() {
    if (this.groupCodeId) this.getGroupDetail();
  },
  methods: {
    /**
     * @description 修改上传url
     */
    changeUploadUrl(url) {
      if (url.startsWith('/profile')) {
        return window.location.origin + url;
      }
      return url;
    },
    // 新增群活码
    add() {
      this.$refs.form.validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'save');
        this.loading = true;
        // 新增群活码数据至数据库
        add({
          ...this.form,
          avatarUrl: this.changeUploadUrl(this.form.avatarUrl),
          customerServerQrCode: this.changeUploadUrl(this.form.customerServerQrCode),
          actualList: this.form.actualList.map((actualListItem, index) => {
            // 进群方式为群二维码时拼接URL
            if (this.form.createType === CREATE_TYPE['group']) {
              actualListItem.actualGroupQrCode = this.changeUploadUrl(actualListItem.actualGroupQrCode);
            }
            return { ...actualListItem, sortNo: index + 1 };
          })
        }).then((res) => {
          changeButtonLoading(this.$store, 'save');
          this.loading = false;
          this.$router.back();
        });
      });
    },
    // 获取上传的头像数据
    handleUploadedHeadImage(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file.raw);

      reader.onload = () => {
        this.headImage = reader.result;
      };
    },
    // 更新群活码
    update() {
      this.$refs.form.validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'save');
        this.loading = true;
        update(this.groupCodeId, {
          ...this.form,
          avatarUrl: this.changeUploadUrl(this.form.avatarUrl),
          customerServerQrCode: this.changeUploadUrl(this.form.customerServerQrCode),
          actualList: this.form.actualList.map((actualListItem, index) => {
            // 进群方式为群二维码时拼接URL
            if (this.form.createType === CREATE_TYPE['group']) {
              actualListItem.actualGroupQrCode = this.changeUploadUrl(actualListItem.actualGroupQrCode);
            }
            return { ...actualListItem, sortNo: index + 1 };
          }),
          delActualIdList: this.removeList.map((item) => {
            return item.id;
          })
        }).then((res) => {
          changeButtonLoading(this.$store, 'save');
          this.loading = false;
          this.$router.back();
        });
      });
    },
    // 获取群活码信息
    getGroupDetail() {
      if (!this.groupCodeId) return;

      getDetail({ id: this.groupCodeId }).then((res) => {
        const resData = res.data;
        this.form = {
          activityName: resData.activityName,
          activityDesc: resData.activityDesc,
          avatarUrl: resData.avatarUrl,
          guide: resData.guide,
          showTip: parseInt(resData.showTip),
          tipMsg: resData.tipMsg,
          customerServerQrCode: resData.customerServerQrCode,
          uuid: resData.uuid,
          codeUrl: resData.codeUrl,
          actualList: resData.groupCodeDetailVOList?.map((item) => {
            return { ...item, groupList: item.groupDetailVOList };
          }),
          id: resData.id,
          createType: resData.createType
        };
      });
    },
    // 提交
    submit() {
      if (!this.form.actualList.length) {
        changeButtonLoading(this.$store, 'save');
        return this.msgWarn('请设置客户群');
      }
      if (!this.groupCodeId) return this.add();
      this.update();
    },

    /**
     * 打开添加客户群/添加企微活码弹窗
     */
    openDialog() {
      const type = this.form.createType === CREATE_TYPE['group'] ? 'dialog' : 'enterpriseCodeDialog';
      this[type] = true;
      this.$refs[type].initFormData();
      this.modalType = 'add';
    },
    /**
     * 切换入群方式
     */
    changeCreateGroupType() {
      this.form = { ...this.form, actualList: [] };
    },
    /**
     * 编辑活码
     */
    handleEditCode(item, index) {
      const type = this.form.createType === CREATE_TYPE['group'] ? 'dialog' : 'enterpriseCodeDialog';
      this[type] = true;
      this.$refs[type].form = { ...item };
      this.modalType = 'edit';
      this.editIndex = index;
    }
  }
};
</script>

<template>
  <div class="base-info-page">
    <div class="base-info-div">
      <el-form ref="form" class="form" :model="form" :rules="rules" label-width="100px">
        <div class="config-item">
          <p class="config-title">基础设置</p>
          <el-form-item label="活码名称" prop="activityName">
            <el-input
              v-model="form.activityName"
              placeholder="请填写活码名称，向客户传达活动场景"
              maxlength="32"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="活码描述" prop="activityDesc">
            <el-input
              v-model="form.activityDesc"
              type="textarea"
              placeholder="仅内部可见，请填写活码使用场景，方便应用"
              maxlength="64"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="加群引导语">
            <el-input
              v-model="form.guide"
              type="textarea"
              placeholder="客户扫描客户群活码后进入页面可以看到的群介绍内容，引导客户加群"
              maxlength="2000"
              :rows="4"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="无法加群">
            <div class="unadd-group">
              <el-switch v-model="form.showTip" :active-value="1" :inactive-value="0" />
              <div class="tip">开启后, 页面底部显示无法进群按钮, 点击可查看提示内容</div>
            </div>
            <transition name="el-fade-in-linear">
              <div v-show="form.showTip" class="un-add-group-tip">
                <el-alert
                  type="warning"
                  :closable="false"
                  title="当客户被分配到的群聊人数已满或进入异常，可联系客服处理"
                />
                <el-form-item label="提示语">
                  <el-input v-model="form.tipMsg" placeholder="请输入提示语" maxlength="10" show-word-limit />
                </el-form-item>
                <el-form-item label="客服二维码">
                  <div class="display: flex; align-items: center;">
                    <upload
                      :file-url.sync="form.customerServerQrCode"
                      class="image-uploader"
                      :show-remove-file-icon="true"
                    >
                      <div slot="tip">注：只能上传jpg/png格式图片，且不超过2M</div>
                    </upload>
                  </div>
                </el-form-item>
              </div>
            </transition>
          </el-form-item>
        </div>
        <div class="config-item">
          <p class="config-title" style="margin-bottom: 16px">
            <span style="color:red;border-left:none;margin-left: 0px;padding-left: 0px;">*</span>客户群设置<span>客户扫描客户群活码之后被分配的客户群</span>
          </p>
          <el-alert
            v-if="form.createType === CREATE_TYPE['group']"
            type="warning"
            :closable="false"
            class="group-set-alert-div"
          >
            <div class="group-set-alert">
              <div>1. 将按照客户群添加顺序为客户分配，若某个群已达进群上限，将自动分配下一个客户群</div>
              <div>2. 客户群扫码进群人数上限是200个，设置进群人数上限时需注意减去已存在人数，避免客户进群失败</div>
              <div>3. 上传的客户群二维码需和选择的客户群一致，否则会导致统计失败</div>
              <div>4. 企业微信后台生成的群二维码只有7天有效期</div>
            </div>
          </el-alert>
          <el-alert
            v-if="form.createType === CREATE_TYPE['corp']"
            type="warning"
            :closable="false"
            class="group-set-alert-div"
          >
            <div class="group-set-alert">
              <div>1. 按照企微活码添加顺序为客户分配，若某个活码已达进群上限，将自动分配下一个企微活码</div>
              <div>
                2.
                企微活码最多可包含5个客户群，扫码进群人数上限是1000个，设置进群人数上限时需注意减去已存在人数，避免客户进群失败
              </div>
              <div>3. 不支持在小程序内识别企微活码，如果使用小程序推广活码，请引导客户截图后在微信内识别</div>
              <div v-if="isDKCorp">
                4. 客户识别一次企微活码，则认为其已扫码进群，进群人数统计与实际扫码进群人数有误差
              </div>
            </div>
          </el-alert>
          <el-form-item label="进群方式" label-width="85px">
            <el-radio-group v-model="form.createType" :disabled="!!form.id" @change="changeCreateGroupType">
              <el-radio :label="CREATE_TYPE['group']">群二维码</el-radio>
              <el-radio :label="CREATE_TYPE['corp']">企微活码</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-button class="btn-reset add-customer-btn" @click="() => openDialog()">
            {{ form.createType === CREATE_TYPE['group'] ? '添加客户群' : '添加企微活码' }}
          </el-button>
          <ActuaList :remove-list.sync="removeList" :form.sync="form" @handleEditCode="handleEditCode" />
        </div>
        <div class="config-item qrcode-config">
          <p class="config-title" style="margin-bottom: 16px">活码设置<span>设置个性化活码，添加企业形象</span></p>
          <el-form-item label="活码头像">
            <upload
              :file-url.sync="form.avatarUrl"
              class="image-uploader"
              :show-remove-file-icon="true"
              @update:file="handleUploadedHeadImage"
            >
              <div slot="tip">注：只能上传jpg/png格式图片，且不超过2M</div>
            </upload>
          </el-form-item>
          <div v-if="!!form.avatarUrl" class="code-content">
            <el-image v-if="!!form.avatarUrl" :src="form.avatarUrl" fit="fit" />
          </div>
        </div>
      </el-form>

      <div class="qrcode-preview">
        <PhoneDialog :title="form.activityName || '活码名称'" :custom-dom-flag="true" :tool-show="false">
          <div>
            <div class="preview-guide">
              {{ form.guide || '加群引导语' }}
            </div>
            <div class="preview-code-box">
              <div class="code-box-title">客户群</div>
              <div class="code-content" />
              <transition name="el-fade-in-linear">
                <div v-show="form.showTip" class="preview-customer-service">
                  <el-button type="danger"> 无法加群? </el-button>
                </div>
              </transition>
            </div>
          </div>
        </PhoneDialog>
      </div>
      <CustomerGroupModal
        v-show="dialog"
        ref="dialog"
        :visible.sync="dialog"
        :is-edit-modal="isEditModal"
        :customer-group-list.sync="form.actualList"
        :edit-index="editIndex"
      />
      <EnterpriseCodeModal
        v-show="enterpriseCodeDialog"
        ref="enterpriseCodeDialog"
        :visible.sync="enterpriseCodeDialog"
        :is-edit-modal="isEditModal"
        :group-code-list.sync="form.actualList"
        :edit-index="editIndex"
        :group-id="form.id"
      />
    </div>
    <div class="save-btn">
      <RequestButton type="primary" :request-method="submit" button-type="save">保存</RequestButton>
    </div>
  </div>
</template>

<style lang="scss" src="@/styles/communicate.scss" scoped></style>
<style scoped lang="scss">
.base-info-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  .base-info-div {
    flex: 1;
    overflow-y: auto;
  }
  .save-btn {
    position: relative;
    margin-left: -15px;
    text-align: center;
    border-top: 1px solid rgba(238, 238, 238, 100);
    padding-top: 10px;
  }
  /deep/ .upload-div {
    display: flex;
    align-items: flex-end;
    .tip {
      margin-left: 10px;
    }
  }
}
/deep/ .image-uploader {
  .uploader-icon {
    width: 80px;
    height: 80px;
    line-height: 80px;
  }

  .upload-img {
    width: 80px;
    height: 80px;
  }
}

.el-form-item {
  margin-bottom: 30px;
}

.qrcode-preview {
  margin-left: 130px;
  .preview-content {
    width: 250px;
    height: 480px;
    background-color: #e9e9e9;
    margin-left: 50px;
    border-radius: 6px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 4px;
    }

    .el-divider {
      margin: 3px 0;
    }

    .preview-name {
      padding: 20px 6px;
      text-align: center;
      // line-height: 50px;
      word-wrap: break-word;
      word-break: normal;
      line-height: 20px;
    }

    .preview-guide {
      padding: 6px;
      text-align: left;
      word-break: break-all;
    }

    .preview-code-box {
      height: 226px;
      font-weight: bold;
      color: #666666;
      margin-top: 28px;
      .code-box-title {
        margin-bottom: 8px;
        color: $black;
      }
      .code-user {
        font-size: 30px;
        color: #4185f4;
      }

      .code-content {
        text-align: center;
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: url('../../../assets/image/qrcode.svg');
        background-size: 150px 150px;
        .el-image {
          width: 35px;
          height: 35px;
        }
      }
    }

    .preview-customer-service {
      text-align: center;
      padding: 20px 10px;
      button {
        padding: 8px 10px 8px 10px;
      }
    }
  }
}
.base-info-div {
  display: flex;
  .form {
    /deep/ .el-form-item {
      padding: 10px 0;
    }
  }
  .unadd-group {
    display: flex;
    align-items: center;
    .tip {
      color: $grayColor;
      margin-left: 9px;
    }
  }
  .group-set-alert-div {
    width: calc(100% - 18px);
    margin-left: 18px;
    .group-set-alert {
      div {
        line-height: 18px;
      }
    }
  }
  .add-customer-btn {
    margin-left: 18px;
  }
  .config-item {
    margin-bottom: 20px;
  }
  .un-add-group-tip {
    border: 1px solid #d9d9d9;
    padding: 10px;
  }
}
.code-content {
  text-align: center;
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../../../assets/image/qrcode.svg');
  background-size: 150px 150px;
  .el-image {
    width: 35px;
    height: 35px;
  }
}
.qrcode-config {
  position: relative;
  .code-content {
    position: absolute;
    right: -280px;
    top: 0px;
  }
}
</style>
