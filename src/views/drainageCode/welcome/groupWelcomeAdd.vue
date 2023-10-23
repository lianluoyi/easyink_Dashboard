<!--
 * @Description: 添加入群欢迎语
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="flex add-group-welcome-page">
    <ReturnPage path="/operationsCenter/drainageCode/welcome" :query="{ welcomeMsgTplType: this.$route.query.welcomeMsgTplType }" />
    <div class="wrap-body">
      <el-alert
        title="功能说明"
        type="info"
        description="管理员创建入群欢迎语素材，员工为客户群选择入群欢迎语模版后，客户入群将收到欢迎语；"
        show-icon
        :closable="false"
      />
      <div class="add-container">
        <div class="wrap-body-form">
          <el-form ref="form" :model="form" label-width="100px" class="form" :rules="rules">
            <p class="config-title">基础设置</p>
            <el-alert class="alert-tip" type="warning" :closable="false">
              <div>1. 入群欢迎语素材最多可创建100个，包含在企业微信管理后台或其他应用创建的</div>
              <div>2. 入群欢迎语素材仅支持文本+1个附件</div>
            </el-alert>
            <el-form-item label="欢迎语">
              <el-input
                v-model="form.defaultWelcomeMsg"
                type="textarea"
                :maxlength="welMsgMaxlength"
                show-word-limit
                :autosize="{ minRows: 4, maxRows: 10 }"
                placeholder="请输入欢迎语"
              />
              <div class="quick-actions">
                <span @click="handeAddTextClick('#客户昵称#')">#客户昵称#</span>
              </div>
              <AddAppendixBtn
                :sub-title="subTitle"
                :limit-select-length="limitSelectLength"
                :max-appendix-num="MAX_APPENDIX_NUM"
                :appendix-list.sync="appendixList"
                :remove-appendix-list.sync="removeAppendixList"
                :msg-tip="`欢迎语最多支持设置${MAX_APPENDIX_NUM}个附件`"
                :radar-hidden="true"
                :hide-video-cover="true"
              />
            </el-form-item>
            <el-form-item v-if="!form.id" label="通知员工">
              <el-switch
                v-model="form.noticeFlag"
              />
              <span class="switch-tip">开启后，企业微信团队将通知员工将这条入群欢迎语应用到客户群中</span>
            </el-form-item>
          </el-form>
        </div>
        <div class="preview-wrap">
          <PhoneDialog
            :message="form.defaultWelcomeMsg"
            :msg-list="appendixList"
          />
        </div>
      </div>
    </div>
    <div class="wrap-footer">
      <RequestButton type="primary" :request-method="submit" button-type="submit">保存</RequestButton>
    </div>
  </div>
</template>
<script>
import RequestButton from '@/components/Button/RequestButton.vue';
import AddAppendixBtn from '@/components/AddAppendixBtn.vue';
import PhoneDialog from '@/components/PhoneDialog';
import ReturnPage from '@/components/ReturnPage.vue';
import { editGroupWelMsg, addGroupWelMsg, getWelcomeDetaiById } from '@/api/tlp';
import { dealAppendixType, dealAppendixTypeToMaterial } from '@/utils/index';
import { checkChange, changeButtonLoading } from '@/utils/common';
import { INTO_GROUP } from '@/utils/constant/index';
// 入群欢迎语内容上限
const MAX_GROUP_WELCOME_MSG_LENGTH = 1000;
// 附件选择上限
const MAX_APPENDIX_NUM = 1;
export default {
  name: '',
  components: { AddAppendixBtn, PhoneDialog, ReturnPage, RequestButton },
  props: {},
  data() {
    const checkDefaultMsg = (rule, value, callback) => {
      if (!this.form.defaultWelcomeMsg && !this.appendixList.length) {
        callback(new Error('请填写欢迎语'));
      } else {
        callback();
      }
    };
    return {
      appendixList: [],
      /** 素材库选择弹窗子标题 */
      subTitle: '已添加 0 个附件，还可选择 1 个',
      form: {
        defaultWelcomeMsg: '',
        weEmpleCodeUseScops: []
      },
      MAX_APPENDIX_NUM,
      /** 附件上限 */
      limitSelectLength: MAX_APPENDIX_NUM,
      /** 移除的附件列表 */
      removeAppendixList: [],
      /** 是否通知员工 */
      noticeFlag: false,
      rules: {
        defaultWelcomeMsg: [{ required: true, validator: checkDefaultMsg, trigger: 'change' }]
      },
      /** 欢迎语文字上限 */
      welMsgMaxlength: MAX_GROUP_WELCOME_MSG_LENGTH
    };
  },
  watch: {
    /**
     * 附件数量改变
     */
    appendixList(val) {
      this.subTitle = `已添加 ${val.length} 个附件，还可选择 ${MAX_APPENDIX_NUM - val.length} 个`;
      this.limitSelectLength = MAX_APPENDIX_NUM - val.length;
    }
  },
  created() {
    this.form = Object.assign(this.form, this.$route.query);
    this.$route.meta.title = (this.form.id ? '编辑' : '新增') + '入群欢迎语';
    if (this.form.id) this.getDetail(this.form.id);
  },
  mounted() {},
  beforeUpdate() {
    checkChange({ ...this.$options.data().form, welcomeMsgTplType: INTO_GROUP }, this.form);
  },
  methods: {
    /**
     * 点击保存
     */
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const form = { ...this.form };
          const defaultMaterialList = dealAppendixType(this.appendixList);
          let params = {};

          if (this.form.id) {
            params = {
              defaultWelcomeMsg: form.defaultWelcomeMsg,
              defaultMaterialList,
              noticeFlag: form.noticeFlag,
              removeMaterialIds: this.removeAppendixList?.map(item => item.id),
              id: form.id
            };
          } else {
            params = {
              weMsgTlp: {
                defaultWelcomeMsg: form.defaultWelcomeMsg,
                defaultMaterialList,
                noticeFlag: form.noticeFlag
              }
            };
          }
          (this.form.id ? editGroupWelMsg : addGroupWelMsg)(params)
            .then(() => {
              this.$store.commit('SET_ADD_FLAG', !this.form.id);
              this.msgSuccess('操作成功');
              this.goBack();
            })
            .finally(() => {
              changeButtonLoading(this.$store, 'submit');
            });
        } else {
          changeButtonLoading(this.$store, 'submit');
        }
      });
    },
    /**
     * 返回上一页
     */
    goBack() {
      this.$router.push('welcome?welcomeMsgTplType=' + window.location.hash.match(/welcomeMsgTplType=(\d)/)[1]);
    },
    /**
     * 获取详情
     */
    getDetail(id) {
      getWelcomeDetaiById(id).then(res => {
        const resData = { ...res.data };
        this.form = { ...resData };
        const appendixList = dealAppendixTypeToMaterial(resData.defaultMaterialList);
        this.appendixList = appendixList;
      });
    },
    /**
     * 欢迎语插入变量
     */
    handeAddTextClick(text) {
      if (this.form.defaultWelcomeMsg.length + text.length > this.welMsgMaxlength) {
        this.msgWarn('字数已达上限');
        return;
      }
      this.form.defaultWelcomeMsg = this.form.defaultWelcomeMsg + text;
    }
  }
};
</script>
<style lang="scss" src="@/styles/communicate.scss" scoped>
</style>
<style scoped lang='scss'>
.add-group-welcome-page {
  background-color: #fff;
  .wrap-body {
    .add-container {
      display: flex;
      padding-top: 20px;
    }
    .alert-tip {
      margin-left: 18px;
      margin-top: 15px;
      /deep/ .el-alert__description {
        line-height: 20px;
      }
    }
    .switch-tip {
      color: $grayColor;
      margin-left: 9px;
    }
  }
  .wrap-body-form {
    width: 590px;
    margin-right: 170px;
    padding-top: 0;
    .form {
      width: 590px;
    }
  }
  .quick-actions{
    border-radius: 0 0 4px 4px;
    border: 1px solid #dcdfe6;
    border-top: 0;
    padding: 5px 10px;
    width: 100%;
    span{
      margin-right: 5px;
      color: rgba(96, 98, 102, 100);
      font-size: 14px;
      text-align: left;
      font-family: Arial-regular;
    }
  }
}
</style>
