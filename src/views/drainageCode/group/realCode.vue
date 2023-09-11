<script>
import { add, remove, update } from '@/api/drainageCode/actual';
import { getDetail } from '@/api/drainageCode/group';
import Customer from './customer';
import { PAGE_LIMIT, CREATE_TYPE } from '@/utils/constant/index';
import GetQrcodeDemo from './demo/getQrcodeDemo.vue';
import RealCodeTable from './realCodeTable.vue';
import EnterpriseCodeModal from './enterpriseCodeModal.vue';

const DEFAULT_SCANCODETIMESLIMIT = 100;

const MAX_NUMBER = 200; // 进群上限的最大值
export default {
  components: { Customer, GetQrcodeDemo, RealCodeTable, EnterpriseCodeModal },
  props: {
    // 实际群活码
    groupCodeId: {
      type: String,
      default: ''
    },
    // 检索状态
    status: {
      type: Number,
      default: -1
    },
    createType: {
      type: Number,
      default: null
    }
  },
  data() {
    var checkScanCodeTimesLimit = (rule, value, callback) => {
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
      // 搜索数据
      query: {
        // 当前选择状态
        status: -1,
        // 当前页码
        pageNum: 1,
        // 每页数据量
        pageSize: PAGE_LIMIT
      },
      // 可选状态
      statusOptions: [
        { label: '全部状态', value: -1 },
        { label: '使用中', value: 0 },
        { label: '已停用', value: 1 }
      ],
      // 加载状态
      loading: false,
      // 多选群二维码
      multiRealCode: [],
      // 群二维码数据
      realCodes: [],
      // 新建群二维码dialog
      dialog: false,
      // 新建企微活码dialog
      enterpriseCodeDialog: false,
      // 选择客户群dialog
      customerDialog: false,
      // 示例dialog
      exampleDialog: false,
      // 群二维码表单
      form: {
        groupName: '',
        actualGroupQrCode: '',
        effectTime: '',
        scanCodeTimesLimit: DEFAULT_SCANCODETIMESLIMIT,
        chatId: '',
        chatGroupName: ''
      },
      // 当前编辑的实际群码
      editedRealCodeId: null,
      // 客户群数据
      customerGroup: [],
      // 总数据量
      total: 0,
      // 表单验证
      rules: {
        actualGroupQrCode: [
          { required: true, message: '请上传二维码', trigger: 'blur' }
        ],
        chatId: [
          { required: true, message: '请选择客户群', trigger: 'change' }
        ],
        scanCodeTimesLimit: [
          { validator: checkScanCodeTimesLimit, trigger: 'blur' }
        ]
      },
      // 日期选择器选项
      datePickerOptions: {
        disabledDate(time) {
          // eslint-disable-next-line no-magic-numbers
          return time.getTime() <= Date.now() - 8.64e7;
        }
      },
      CREATE_TYPE,
      editIndex: -1
    };
  },
  watch: {
    dialog(val) {
      if (val === false) {
        this.$refs.form.resetFields();
        this.form.chatId = '';
        this.form.chatGroupName = '';
        this.editedRealCodeId = null;
      }
    }
  },
  created() {
    this.query.status = this.status;

    this.getRealCodes();
  },
  methods: {
    // 判断是否过期

    // 获取所有群二维码
    getRealCodes() {
      let params = {
        id: this.groupCodeId
      };

      if (this.query.status !== -1) {
        params = Object.assign(params, this.query);
      }

      this.loading = true;
      getDetail(params, this.groupCodeId)
        .then((res) => {
          this.realCodes = res.data.groupCodeDetailVOList;
          this.total = parseInt(res.data.groupCodeDetailVOList.length);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 新增群二维码
    add() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        const data = Object.assign({}, this.form, {
          groupCodeId: this.groupCodeId
        });
        add(data)
          .then((res) => {
            this.dialog = false;
            this.getRealCodes();
          });
      });
    },
    // 编辑
    edit(realCode, index) {
      this.editIndex = index;
      this.editedRealCodeId = realCode.id;
      this.form = {
        groupName: realCode.groupName,
        actualGroupQrCode: realCode.actualGroupQrCode,
        effectTime: realCode.effectTime,
        scanCodeTimesLimit: realCode.scanCodeTimesLimit,
        chatId: realCode.chatId,
        chatGroupName: realCode.chatGroupName
      };

      const type = this.createType === CREATE_TYPE['group'] ? 'dialog' : 'enterpriseCodeDialog';
      this[type] = true;
      this.$refs[type] && (this.$refs[type].form = { ...realCode, groupList: realCode.groupDetailVOList });
    },
    // 更新群二维码
    update() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        const data = Object.assign(
          {
            id: this.editedRealCodeId
          },
          this.form
        );

        update(data)
          .then((res) => {
            this.dialog = false;
            this.getRealCodes();
          });
      });
    },
    handleSubmit() {
      if (!this.editedRealCodeId) return this.add();
      this.update();
    },
    // 批量删除
    handleBulkRemove() {
      this.confirmModal({
        msg: '删除后，群活码不再统计该客户群的入群人数，且数据不可恢复，是否继续？'
      }, () => {
        const ids = this.multiRealCode.map((code) => code.id);
        remove(ids + '')
          .then((res) => {
            this.getRealCodes();
          });
      });
    },
    // checkbox选择变更
    handleSelectionChange(val) {
      this.multiRealCode = val;
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
    },
    cancelClick() {
      this.customerDialog = false;
    },
    openSelectGroup() {
      this.customerDialog = true;
    },
    /**
     * 打开添加企微活码弹窗
     */
    openEnterpriseModal() {
      this.enterpriseCodeDialog = true;
      const type = this.createType === CREATE_TYPE['group'] ? 'dialog' : 'enterpriseCodeDialog';
      this.$refs[type].initFormData();
    }
  }
};
</script>

<template>
  <div>
    <div class="mid-action">
      <div>
        <el-select
          v-model="query.status"
          class="ml10"
          placeholder="请选择客户群使用状态"
          @change="getRealCodes"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <div>
        <el-button v-if="createType === CREATE_TYPE['group']" type="primary" @click="dialog = true">
          添加客户群
        </el-button>
        <el-button v-else type="primary" @click="openEnterpriseModal">
          添加企微活码
        </el-button>
        <el-button
          :disabled="multiRealCode.length === 0"
          @click="handleBulkRemove"
        >
          批量删除
        </el-button>
      </div>
    </div>
    <RealCodeTable
      :loading="loading"
      :real-codes="realCodes"
      :handle-selection-change="handleSelectionChange"
      :edit="edit"
      :get-real-codes="getRealCodes"
      :create-type="createType"
      :query="query"
    />

    <el-dialog :title="`${editedRealCodeId ? '编辑' : '新增'}客户群`" :visible.sync="dialog" append-to-body>
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        :rules="rules"
      >
        <el-form-item label="客户群" prop="chatId">
          <template v-if="form.chatId">
            <el-button type="primary" @click="openSelectGroup">
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
          <div class="qrcode-div">
            <upload :file-url.sync="form.actualGroupQrCode" class="image-uploader">
              <div slot="tip">
                注：只能上传jpg/png格式图片，且不超过2M
              </div>
            </upload>
            <div>
              <el-button type="text" @click="exampleDialog = true">
                如何获取二维码
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="有效期" prop="effectTime">
          <el-date-picker
            v-model="form.effectTime"
            type="datetime"
            placeholder="请选择有效期"
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
            placeholder="请输入次数"
            type="Number"
            style="width: 115px"
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
        :customer-group-id="form.chatId"
        :cancel-click="cancelClick"
        :ok-click="handleSelectCustomerGroup"
        :close-on-click-modal="false"
        @callback="getSelectCustomerGroup"
      />
      <GetQrcodeDemo :visible.sync="exampleDialog" title="如何获取二维码" />

      <div slot="footer">
        <el-button @click="dialog = false"> 取消 </el-button>
        <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
      </div>
    </el-dialog>
    <EnterpriseCodeModal
      ref="enterpriseCodeDialog"
      :visible.sync="enterpriseCodeDialog"
      :group-code-list.sync="realCodes"
      :edit-index="editIndex"
      :group-id="groupCodeId"
      :real-add="true"
      @reGetList="getRealCodes"
    />

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="query.pageNum"
      :limit.sync="query.pageSize"
      @pagination="getRealCodes()"
    />
  </div>
</template>

<style scoped lang="scss">
.code-image {
  width: 200px;
  height: 200px;
}
.code-image--small {
  width: 50px;
  height: 50px;
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
.tip {
  color: #aaa;
  font-size: 12px;
}
.expire-icon {
  color: red;
}
.example-code-box {
  margin: 0 5px;
  background-color: white;
  padding: 10px;
  font-weight: bold;
  color: #666666;

  .example-text {
    font-size: 12px;
    padding: 10px 0;
  }
  .code-user {
    font-size: 30px;
    color: #4185f4;
  }
  .code-content {
    text-align: center;

    .el-image {
      margin-top: 20px;
    }
  }
}
.qrcode-div {
  /deep/ .upload-div {
    display: flex;
    align-items: flex-end;
    .tip {
      margin-left: 10px;
    }
  }
}
</style>
