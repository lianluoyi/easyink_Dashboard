<!--
 * @Description: 配置公众号弹窗
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <el-dialog
    v-bind="$attrs"
    title="配置公众号"
    class="config-offAccount-modal"
    width="560px"
    v-on="$listeners"
    @close="onClose"
  >
    <el-alert
      title="由于雷达库功能需要获取客户身份标识，需要绑定公众号方可使用该功能"
      type="warning"
      :closable="false"
    />
    <div class="check-offAccount">
      <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
        <el-form-item label="使用公众号" prop="appId">
          <el-select v-model="formData.appId" placeholder="请选择公众号" clearable>
            <el-option
              v-for="item in offAccountList"
              :key="item.officialAccountAppId"
              :label="item.nickName"
              :value="item.officialAccountAppId"
            />
            <template slot="empty">
              <div class="select-empty">
                <EmptyDefaultIcon btn-text="授权公众号" :btn-click="impower" :loading="impowerLoading" :btn-permi-key="['officialAccountsManager:set']" />
              </div>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handelConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { setRadarConfig } from '@/api/radar';
import { getWechatOpenAuthUrl } from '@/api/wechatopen';
export default {
  components: { EmptyDefaultIcon },
  inheritAttrs: false,
  props: {
    // 获取雷达公众号
    getOffAccount: {
      type: Function,
      default: () => {}
    },
    // 公众号选项列表
    offAccountList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 确定按钮的loading
      loading: false,
      // 授权公众号按钮的loading
      impowerLoading: false,
      // 表单数据 (默认选择第一个options)
      formData: {
        appId: undefined
      },
      rules: {
        appId: [{ required: true, message: '请选择公众号', trigger: 'blur' }]
      }
    };
  },
  methods: {
    /**
     * @description: 进行赋值为第一个选项
     * @return {*}
     */
    setInitAppId() {
      this.formData.appId = this.offAccountList[0]?.officialAccountAppId;
    },
    /**
     * @description: 弹窗被关闭的回调
     * @return {*}
     */
    onClose() {
      this.$refs['elForm'].resetFields();
    },
    /**
     * @description: 自行关闭弹窗
     * @return {*}
     */
    close() {
      this.$emit('update:visible', false);
    },
    /**
     * @description: 点击确定
     * @return {*}
     */
    handelConfirm() {
      this.$refs.elForm.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        setRadarConfig({ appId: this.formData.appId }).then(res => {
          this.getOffAccount();
          this.close();
        }).finally(() => {
          this.loading = false;
        });
      });
    },
    /**
     * @description: 授权公众号
     * @return {*}
     */
    impower() {
      this.impowerLoading = true;
      getWechatOpenAuthUrl({}).then(res => {
        window.open(res.msg);
      }).finally(() => {
        this.impowerLoading = false;
      });
    }
  }
};
</script>
<style scoped lang="scss">

.check-offAccount{
  margin-top: 20px;
  height: 250px;
}

.select-empty{
  width: 100%;
  height: 205px;
}
</style>
