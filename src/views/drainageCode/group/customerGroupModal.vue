<template>
  <el-dialog
    v-bind="$attrs"
    :title="isEditModal ? '编辑客户群' : '添加客户群'"
    append-to-body
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="customer-group-dialog">
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        :rules="rules"
      >
        <el-form-item label="客户群" prop="chatId">
          <template v-if="form.chatId">
            <el-button type="primary" :disabled="isEditModal" @click="openSelectGroup">
              {{ form.chatGroupName }}
            </el-button>
          </template>
          <template v-else>
            <el-button icon="el-icon-plus" @click="openSelectGroup">
              选择客户群
            </el-button>
          </template>
        </el-form-item>
        <el-form-item label="二维码" prop="actualGroupQrCode">
          <div v-if="form.actualGroupQrCode" class="image-uploader" @click="onUpload">
            <img :src="form.actualGroupQrCode" class="upload-img">
          </div>
          <div v-else class="image-uploader" @click="onUpload">
            <i class="el-icon-plus uploader-icon" />
            <div class="tip">注：只能上传jpg/png格式图片，且不超过2M</div>
          </div>

          <div>
            <el-button type="text" @click="exampleDialog = true">
              如何获取二维码
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="有效期" prop="effectTime">
          <el-date-picker
            v-model="form.effectTime"
            type="datetime"
            placeholder="请选择日期时间"
            value-format="yyyy-MM-dd HH:mm"
            format="yyyy-MM-dd HH:mm"
            :picker-options="datePickerOptions"
          />
          <div class="tip">
            设置二维码的有效期，到期将不分配给客户，并提醒创建人更新群二维码
          </div>
        </el-form-item>
        <el-form-item label="进群上限" prop="scanCodeTimesLimit">
          <el-input
            v-model="form.scanCodeTimesLimit"
            style="width: 115px"
            placeholder="请输入次数"
            type="Number"
            :min="0"
            :max="MAX_NUMBER"
          />
          <div class="tip">
            当扫码进群人数达到上限，将自动分配下一个客户群
          </div>
        </el-form-item>

      </el-form>
      <Customer
        ref="customer"
        :visible.sync="customerDialog"
        append-to-body
        :close-on-click-modal="false"
        :customer-group-id="form.chatId"
        :cancel-click="cancelClick"
        :ok-click="handleSelectCustomerGroup"
        :customer-group-list="customerGroupList"
        @callback="getSelectCustomerGroup"
      />
    </div>
    <div slot="footer">
      <el-button @click="onClose"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </div>
    <TailoringImg
      ref="customerTailoringImg"
      title="上传二维码"
      :visible.sync="tailorVisible"
      class="customer-group-tailor"
      @handleUpload="handleUpload"
    />
    <GetQrcodeDemo :visible.sync="exampleDialog" title="如何获取二维码" />
  </el-dialog>
</template>
<script>
import Customer from './customer';
import TailoringImg from '@/components/TailoringImg.vue';
import { uploadFile2Cos } from '@/api/common';
import GetQrcodeDemo from './demo/getQrcodeDemo.vue';
const DEFAULT_SCANCODETIMESLIMIT = 100;
const MAX_NUMBER = 200;
export default {

  name: '',
  components: { Customer, TailoringImg, GetQrcodeDemo },
  props: {
    customerGroupList: {
      type: Array,
      default: () => []
    },
    // 弹窗是否为编辑状态
    isEditModal: {
      type: Boolean,
      default: false
    },
    // 编辑的活码下标
    editIndex: {
      type: Number,
      default: -1
    }
  },
  data() {
    const checkScanCodeTimesLimit = (rule, value, callback) => {
      if (value && value > MAX_NUMBER) {
        return callback(new Error('进群上限不能大于' + MAX_NUMBER));
      } else if (value && value <= 0) {
        return callback(new Error('进群人数不能小于0'));
      } else {
        callback();
      }
    };
    return {
      MAX_NUMBER: MAX_NUMBER, // 将最大值放到data中标签绑定使用
      // 实际群码表单
      form: {
        // 实际群码
        actualGroupQrCode: '',
        // 有效期
        effectTime: '',
        // 扫码次数限制
        scanCodeTimesLimit: DEFAULT_SCANCODETIMESLIMIT,
        // 群聊id
        chatId: '',
        // 群聊名称
        chatGroupName: ''
      },
      // 表单验证
      rules: {
        actualGroupQrCode: [
          { required: true, message: '请上传二维码', trigger: 'change' }
        ],
        chatId: [
          { required: true, message: '请选择客户群', trigger: 'change' }
        ],
        scanCodeTimesLimit: [
          { validator: checkScanCodeTimesLimit, trigger: 'blur' }
        ],
        tailorVisible: false
      },
      // 选择客户群dialog
      customerDialog: false,
      // 示例dialog
      exampleDialog: false,
      // 当前编辑的实际群码
      editedRealCodeId: null,
      // 日期选择器选项
      datePickerOptions: {
        disabledDate(time) {
          // eslint-disable-next-line no-magic-numbers
          return time.getTime() <= Date.now() - 8.64e7;
        }
      },
      tailorVisible: false
    };
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 初始化form数据
     */
    initFormData() {
      this.form = {
        actualGroupQrCode: '',
        effectTime: '',
        scanCodeTimesLimit: DEFAULT_SCANCODETIMESLIMIT,
        chatId: '',
        chatGroupName: ''
      };
    },
    cancelClick() {
      this.customerDialog = false;
    },
    // 客户群dialog选中数据
    handleSelectCustomerGroup() {
      this.$refs.customer.submit();
    },
    // 获取选中客户群
    getSelectCustomerGroup(customerGroup) {
      this.form.chatId = customerGroup ? customerGroup.chatId : '';
      this.form.chatGroupName = customerGroup ? customerGroup.groupName : '';
      this.customerDialog = false;
      this.$refs.form?.validateField('chatId');
    },
    openSelectGroup() {
      this.customerDialog = true;
    },
    handleSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const list = [...this.customerGroupList];
          if (this.isEditModal) {
            list[this.editIndex] = this.form;
          } else {
            list.push({ ...this.form });
          }
          this.$emit('update:customerGroupList', list);
          this.initFormData();
          this.onClose();
        }
      });
    },
    onClose() {
      this.$emit('update:visible', false);
    },
    onUpload(e) {
      this.tailorVisible = true;
    },
    async handleUpload(formData) {
      const uploadRes = await uploadFile2Cos(formData);
      if (uploadRes) {
        this.tailorVisible = false;
        const { data } = uploadRes;
        this.$refs.customerTailoringImg.visible = false;
        this.form.actualGroupQrCode = data?.url;
        this.$refs.form?.validateField('actualGroupQrCode');
      }
    }
  }

};
</script>
<style lang="scss" src="./style/groupCodeModal.scss" scoped>
</style>
<style scoped lang='scss'>
.customer-group-tailor {
    /deep/ .avatar-upload-preview {
        width: 200px;
        height: 200px;
        border-radius: 0px;
    }
}
</style>
