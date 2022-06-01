<!--
 * @Description: 添加/编辑企微活码弹窗
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-dialog
    v-bind="$attrs"
    :title="isEdit ? '编辑企微活码' : '添加企微活码'"
    append-to-body
    :close-on-click-modal="false"
    custom-class="enterprise-code-modal"
    @close="onClose"
  >
    <div class="customer-group-dialog">
      <el-alert
        class="alert mb10"
        title="企微活码永不过期，活码下某个群聊人数达上限后会自动创建新群，每个企微活码最多关联5个群聊"
        type="warning"
        show-icon
        :closable="false"
      />
      <el-form
        v-if="isDKCorp"
        ref="DKCorpForm"
        :model="form"
        label-width="78px"
        :rules="rules"
      >
        <el-form-item label="企微活码" prop="actualGroupQrCode">
          <upload
            :file-url.sync="form.actualGroupQrCode"
            class="image-uploader"
            :file.sync="uploadFile"
            :disabled="isEdit"
          >
            <div slot="tip">
              注：只能上传jpg/png格式图片，且不超过2M
            </div>
          </upload>
          <div>
            <el-button type="text" @click="exampleDialog = true">
              如何获取企微活码
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="进群上限" prop="scanCodeTimesLimit">
          <el-input
            v-model="form.scanCodeTimesLimit"
            style="width: 115px"
            placeholder="请输入次数"
            type="Number"
            :min="MIN_POSITIVE_INTEGER"
            :max="MAX_NUMBER"
            @input="e => (text = isNumber(e, 'scanCodeTimesLimit'))"
          />
          <div class="tip">
            每个企微活码扫码入群上限人数是{{ MAX_NUMBER }}人，设置进群上限时注意减去群内已存在的人数
          </div>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input
            v-model="form.remark"
            style="width: 452px"
            placeholder="记录渠道和使用场景，方便查找和管理"
            show-word-limit
            maxlength="15"
          />
        </el-form-item>
      </el-form>
      <el-form
        v-else
        ref="form"
        :model="form"
        label-width="78px"
        :rules="rules"
      >
        <el-form-item label="客户群" prop="groupList">
          <div class="flex select-group">
            <el-button v-if="!isEdit" icon="el-icon-plus" class="mr10" @click="openSelectGroup">
              选择客户群
            </el-button>
            <el-tag
              v-for="(item, index) in form.groupList"
              :key="index"
              class="user-tag"
              :closable="!isEdit"
              @close="() => removeGroup(item)"
            >
              {{ item.groupName }}
            </el-tag>
          </div>
          <div class="tip">
            请至少选择一个已存在的客户群<span class="theme-text-color pointer ml5" @click="createGroupDemoDialog = true">如何创建客户群</span>
          </div>
        </el-form-item>
        <el-form-item label="群聊昵称" prop="roomBaseName">
          <el-input
            v-model="form.roomBaseName"
            style="width: 452px"
            placeholder="自建群聊的昵称前缀"
            show-word-limit
            maxlength="32"
          />
        </el-form-item>
        <el-form-item label="起始序号" prop="roomBaseId">
          <el-input
            v-model="form.roomBaseId"
            style="width: 85px"
            type="number"
            :min="MIN_POSITIVE_INTEGER"
            @input="e => (text = isNumber(e, 'roomBaseId'))"
          />
          <div class="tip">
            假设群聊昵称是“群聊”，起始序号是1，则自动创建的第一个群名是“群聊1”，自动创建的第二个群名是“群聊2”，依次类推
          </div>
        </el-form-item>
        <el-form-item label="进群上限" prop="scanCodeTimesLimit">
          <el-input
            v-model="form.scanCodeTimesLimit"
            style="width: 115px"
            placeholder="请输入次数"
            type="Number"
            :min="MIN_POSITIVE_INTEGER"
            :max="MAX_NUMBER"
            @input="e => (text = isNumber(e, 'scanCodeTimesLimit'))"
          />
          <div class="tip">
            每个企微活码扫码入群上限人数是{{ MAX_NUMBER }}人，设置进群上限时注意减去群内已存在的人数
          </div>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input
            v-model="form.remark"
            style="width: 452px"
            placeholder="记录渠道和使用场景，方便查找和管理"
            show-word-limit
            maxlength="15"
          />
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
        :customer-group-list="form.groupList"
        :select-single="false"
        @callback="getSelectCustomerGroup"
      />
    </div>
    <div slot="footer">
      <el-button @click="onClose"> 取消 </el-button>
      <el-button v-preventReClick type="primary" :loading="loading" @click="handleSubmit"> 确定 </el-button>
    </div>
    <GetEnterpriseQrcodeDemo :visible.sync="exampleDialog" title="如何获取企微活码" />
    <GetCreateGroupDemo :visible.sync="createGroupDemoDialog" title="如何创建客户群" />
  </el-dialog>
</template>
<script>
import { MEDIA_TYPE_POSTER } from '@/utils/constant';
import Customer from './customer';
import GetEnterpriseQrcodeDemo from './demo/getEnterpriseQrcodeDemo.vue';
import GetCreateGroupDemo from './demo/getCreateGroupDemo.vue';
import { addCorpCode, updateCorpCode } from '@/api/drainageCode/actual';
import { deepClone } from '@/utils/index';
// 企微活码扫码入群上限值
const MAX_NUMBER = 1000;
// 正整数最小值
const MIN_POSITIVE_INTEGER = 1;
export default {
  name: 'EnterpriseCodeModal',
  components: { Customer, GetEnterpriseQrcodeDemo, GetCreateGroupDemo },
  props: {
    groupCodeList: {
      type: Array,
      default: () => []
    },
    /**
     * 编辑的活码下标
     */
    editIndex: {
      type: Number,
      default: -1
    },
    /**
     * 群活码id
     */
    groupId: {
      type: String,
      default: null
    },
    /**
     * 需要调用新增接口
     */
    realAdd: {
      type: Boolean,
      default: false
    },
    /**
     * 是否为编辑状态
     */
    isEditModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const checkScanCodeTimesLimit = (rule, value, callback) => {
      if (!value) return callback(new Error('请设置进群上限'));
      if (value && value > MAX_NUMBER) {
        return callback(new Error('进群上限不能大于' + MAX_NUMBER));
      } else if (value && value <= 0) {
        return callback(new Error('进群人数需大于0'));
      } else {
        callback();
      }
    };
    const checkGroupList = (rule, value, callback) => {
      if (!this.form?.groupList?.length) return callback(new Error('请设置客户群'));
      callback();
    };
    return {
      // 表单验证
      rules: {
        actualGroupQrCode: [
          { required: true, message: '请上传企微活码', trigger: 'change' }
        ],
        scanCodeTimesLimit: [
          { required: true, validator: checkScanCodeTimesLimit, trigger: 'blur' }
        ],
        groupList: [
          { required: true, validator: checkGroupList, trigger: 'change' }
        ]
      },
      form: {
        // 企微活码
        actualGroupQrCode: null,
        groupNickName: null,
        // 进群上限
        scanCodeTimesLimit: MAX_NUMBER,
        // 备注信息
        remark: null,
        // 客户群列表
        groupList: []
      },
      // 如何获取企微活码抽屉显示
      exampleDialog: false,
      // 如何创建客户群抽屉显示
      createGroupDemoDialog: false,
      MAX_NUMBER,
      MEDIA_TYPE_POSTER,
      uploadFile: {},
      // 选择客户群dialog
      customerDialog: false,
      MIN_POSITIVE_INTEGER,
      // 添加/编辑企微活码接口响应状态
      loading: false
    };
  },
  computed: {
    // 是否为代开发应用
    isDKCorp() {
      return this.$store.state.serverInfo.dkCorp;
    },
    isEdit() {
      return this.isEditModal || !!this.form.id;
    }
  },
  watch: {
    uploadFile(val) {
      const newForm = { ...this.form };
      newForm.content = val.size;
      this.$emit('changeForm', newForm);
    }
  },
  created() {},
  mounted() {},
  methods: {
    onClose() {
      this.$emit('update:visible', false);
    },
    async realAddCode(list) {
      // 自建应用 或 从实际群聊详情进行新增活码 需调用企微提供的接口新增企微活码
      if (!this.isDKCorp || this.realAdd) {
        const chatIdList = this.form.groupList.map(item => { return item.chatId; });
        const form = this.form;
        this.loading = true;
        const groupCodeList = [...this.groupCodeList];
        try {
          const addRes = await addCorpCode({
            groupCodeId: this.groupId,
            weGroupCodeCorpActualList: [{
              ...form,
              chatIds: chatIdList.join(','),
              sortNo: (groupCodeList[groupCodeList.length - 1]?.sortNo + 1) || 1
            }]
          });
          this.loading = false;
          if (addRes) {
            list.push({ groupList: this.form.groupList, ...addRes.data[0] });
            this.updateAndCloseModal(list);
            this.$emit('reGetList');
          }
        } catch (e) {
          this.loading = false;
        }
      } else {
        list.push({ ...this.form });
        this.updateAndCloseModal(list);
        this.$emit('reGetList');
      }
      return list;
    },
    /**
     * 编辑企微活码
     */
    handleEditCode(list) {
      // 若为自建应用 或 是从实际群聊详情进行新增活码，则调用接口进行编辑
      if (!this.isDKCorp || this.realAdd) {
        // 过滤对象中某些属性
      // eslint-disable-next-line no-unused-vars
        const { groupList, ...newData } = this.form;
        this.loading = true;
        updateCorpCode({
          groupCodeId: this.groupId,
          weGroupCodeCorpActualList: [
            { ...newData }
          ]
        }).then(res => {
          this.loading = false;
          list[this.editIndex] = this.form;
          this.updateAndCloseModal(list);
        }).catch(e => {
          this.loading = false;
        });
      } else {
        list[this.editIndex] = this.form;
        this.updateAndCloseModal(list);
      }
    },
    /**
     * 更新活码列表、初始化活码信息、关闭弹窗
     */
    updateAndCloseModal(list) {
      this.$emit('update:groupCodeList', list);
      this.initFormData();
      this.onClose();
    },
    /**
     * 确认添加/编辑
     */
    handleSubmit() {
      this.$refs[this.isDKCorp ? 'DKCorpForm' : 'form'].validate(valid => {
        if (valid) {
          const list = deepClone(this.groupCodeList);
          // 编辑
          if (this.isEdit) {
            this.handleEditCode(list);
          // 添加
          } else {
            this.realAddCode(list);
          }
        }
      });
    },
    /**
     * 初始化form数据
     */
    initFormData() {
      this.form = {
        // 企微活码
        actualGroupQrCode: null,
        groupNickName: null,
        // 进群上限
        scanCodeTimesLimit: MAX_NUMBER,
        // 备注信息
        remark: null,
        // 客户群列表
        groupList: []
      };
    },
    /**
     * 选择客户群
     */
    openSelectGroup() {
      this.customerDialog = true;
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
      const MAX_SELECT_GROUP = 5;
      if (customerGroup.length > MAX_SELECT_GROUP) {
        this.msgWarn('最多只可选择5个群聊');
        return;
      }
      this.form.groupList = [...customerGroup];
      this.customerDialog = false;
      this.$refs.form?.validateField('groupList');
    },
    /**
     * 移除客户群
     */
    removeGroup(item) {
      const list = [...this.form.groupList];
      const index = list.findIndex(listItem => listItem.chatId === item.chatId);
      list.splice(index, 1);
      this.form = { ...this.form, groupList: list };
    },
    /**
     * 是否为正整数
     */
    isNumber(val, key) {
      const pattern = /^[1-9][0-9]*$/; // 正整数的正则表达式
      // 不符合正整数时
      if (!pattern.test(val)) {
        // input 框绑定的内容为空
        this.form[key] = '';
      }
    }
  }

};
</script>
<style lang="scss" src="./style/groupCodeModal.scss" scoped>
</style>
<style scoped lang='scss'>
/deep/ .enterprise-code-modal {
    .el-dialog__body {
        padding-top: 10px;
    }
    .user-tag {
        height: 32px;
        line-height: 32px;
    }
    .tip {
        line-height: 16px;
        margin-top: 10px;
    }
    .select-group {
      flex-wrap: wrap;
      button, .user-tag {
        margin-bottom: 5px;
      }
    }
}
</style>
