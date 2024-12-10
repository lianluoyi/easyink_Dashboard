<!--
 * @Description: 表单详情
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="form-detail-page">
    <div class="page-card mb10">
      <ReturnPage />
      <div class="page-header">
        <div class="header-left">
          <div class="header-left-item">
            <span class="label">表单链接：</span>
            <div class="form-link">
              <div class="msg-card-info">
                <div class="msg-card-title">{{ formDetail.formName }}</div>
                <div class="msg-card-desc intwoline">{{ formDetail.description }}</div>
              </div>
              <svg-icon icon-class="form-preview" class-name="form-preview" />
            </div>
            <span class="preview-form" @click="previewDialogVisible = true">预览</span>
          </div>
          <div v-if="isThirdApplication" class="header-left-item">
            <!-- 自建不显示  -->
            <span class="label">公众号：</span>
            <div v-if="formDetail.weChatPublicPlatformNickName" class="form-link">
              <el-image
                :src="formDetail.weChatPublicPlatformHeadImg"
                style="width:40px;height:40px"
              />
              <div class="fcc ml10">
                <span>{{ formDetail.weChatPublicPlatformNickName }}</span>
              </div>
            </div>
          </div>
          <div class="mb10">
            <span class="label">截止时间：</span>
            {{ formDetail.deadLineType === FORVER_EFFECT ? '永久有效' : formDetail.customDate }}
          </div>
          <div>
            <span class="label">提交次数：</span>
            {{ SUBMIT_NUMS[formDetail.submitCntType] }}
          </div>
        </div>
        <div class="header-right">
          <div class="header-right-item mb10">
            <span class="label">提交结果：</span>
            <span v-if="formDetail.submitActionType === NOT_JUMP">不跳转</span>
            <span v-else-if="formDetail.submitActionType === JUMP_LINK">跳转链接</span>
            <div v-else class="submit-result">
              <div class="submit-result-image">
                <span class="mr10">图标</span>
                <el-image
                  :src="submitResult.iconUrl"
                />
              </div>
              <div class="submit-result-text">
                <span class="mr10">文案</span>
                <span>{{ submitResult.document }}</span>
              </div>
            </div>
          </div>
          <div class="mb10">
            <span class="label">行为通知：</span>
            <el-switch v-model="formDetail.actionNoteFlag" disabled />
          </div>
          <div class="mb10">
            <span class="label">轨迹记录：</span>
            <el-switch v-model="formDetail.tractRecordFlag" disabled />
          </div>
          <div class="customer-tag">
            <span class="label">客户标签：</span>
            <!--当没有设置标签的时候不显示 -->
            <div v-if="labelSetting.clickLabelIdList.length || labelSetting.submitLabelIdList.length" class="item-div">
              <div v-if="labelSetting.clickLabelIdList.length">
                点击表单
                <el-tag
                  v-for="(item, index) in labelSetting.clickLabelIdList"
                  :key="index"
                  class="tag ml5 mb5"
                >{{ item.tagName || item.name }}</el-tag>
              </div>
              <div v-if="labelSetting.submitLabelIdList.length" class="mt10">
                提交表单
                <el-tag
                  v-for="(item, index) in labelSetting.submitLabelIdList"
                  :key="index"
                  class="tag ml5 mb5"
                >{{ item.tagName || item.name }}</el-tag>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <Statistics
      :col-list="colList"
      title="数据总览"
    />
    <div class="mt10 page-record bg-white">
      <div class="operate-button">
        <el-radio-group
          v-model="activeRecord"
          class="mb15"
          size="medium"
          @input="() => reset()"
        >
          <el-radio-button :label="CLICK_RECORD['customer']">客户操作记录</el-radio-button>
          <el-radio-button :label="CLICK_RECORD['staff']">员工发送记录</el-radio-button>
        </el-radio-group>
        <el-button class="export" plain @click="exportReport">导出报表</el-button>
      </div>

      <div class="search-form">
        <el-select v-model="searchForm.timeType" style="width:100px;" placeholder="请选择" class="commit-time">
          <el-option
            v-for="item in commitTimeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <DatePicker
          style="border-top-left-radius:0px;border-bottom-left-radius:0px;width:280px;"
          type="datetimerange"
          :default-time="['00:00:00', '23:59:59']"
          value-format="yyyy-MM-dd HH:mm:ss"
          :time.sync="searchForm.dateRange"
        />
        <template v-if="activeRecord === CLICK_RECORD['customer']">
          <el-input v-model="searchForm.customerName" clearable style="width:240px" class="ml10 mr10" placeholder="请输入客户名称" />
          <el-select v-model="searchForm.channelType" clearable style="width:240px;" placeholder="请选择点击渠道">
            <el-option
              v-for="item in getChannelTypeOptions()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
        <el-input v-if="activeRecord === CLICK_RECORD['staff']" v-model="searchForm.userName" clearable style="width:240px" class="ml10 mr10" placeholder="请输入员工姓名" />
        <el-button
          v-preventReClick="200"
          type="primary"
          class="ml10"
          :loading="searchButtonLoading"
          @click="()=>{
            searchButtonLoading = true;
            search()
          }"
        >查询</el-button>
        <el-button
          v-preventReClick="200"
          class="btn-reset"
          :loading="resetButtonLoading"
          @click="()=>{
            resetButtonLoading = true;
            reset()
          }"
        >重置</el-button>
      </div>
      <div class="search-table">
        <RightContainer>
          <template v-slot:data>
            <el-table v-loading="loading" :data="recordList">
              <template slot="empty">
                <empty-default-icon :length="recordList.length" />
              </template>
              <template v-if="activeRecord === CLICK_RECORD['customer']">
                <el-table-column label="客户" align="center">
                  <template slot-scope="scope">
                    <div class="user-info">
                      <img :src="scope.row.externalUserHeadImage" alt="">
                      <span class="intwoline">{{ scope.row.externalUserName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="userName" label="所属员工" align="center" />
                <el-table-column label="点击渠道" align="center">
                  <template slot-scope="scope">
                    <span>{{ CLICK_CHANNEL[scope.row.channelType] }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="点击时间" align="center" />
                <el-table-column prop="commitTime" label="提交时间" align="center" />
                <el-table-column label="操作" align="center" width="140">
                  <template slot-scope="{ row }">
                    <el-button size="mini" type="text" @click="openFormDetail(row)">表单详情</el-button>
                    <el-button size="mini" type="text" @click="checkCustomerInfo(row)">客户资料</el-button>
                  </template>
                </el-table-column>
              </template>
              <template v-else>
                <el-table-column label="员工" align="center">
                  <template slot-scope="scope">
                    <div class="user-info">
                      <img :src="scope.row.userHeadImage || require('@/assets/image/card-avatar.svg')" alt="">
                      <div class="user-info-userName">
                        <span>{{ scope.row.userName }}</span>
                        <span class="user-info-departmentName">{{ companName }}{{ companName && scope.row.departmentName && '/' }}{{ scope.row.departmentName }}</span>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="clickCount" label="点击人数" align="center" />
                <el-table-column prop="submitCount" label="提交人数" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.submitCount }}
                  </template>
                </el-table-column>
                <el-table-column prop="submitPercent" label="填写率" align="center" />
              </template>
            </el-table>
            <pagination
              v-show="recordList.length > 0"
              :total="total"
              :disabled="loading"
              :limit.sync="searchForm.pageSize"
              :page.sync="searchForm.pageNum"
              @pagination="search"
            />
          </template>
        </RightContainer>
      </div>
    </div>
    <el-drawer
      :visible.sync="drawerVisible"
      class="form-result"
    >
      <div slot="title" class="title">
        <span class="title-text">{{ commitResult.formName }}</span>
        <el-tag size="mini" class="title-tag">{{ commitResult.channelType ? CLICK_CHANNEL[commitResult.channelType] : '' }}</el-tag>
      </div>
      <div class="form-result-content">
        <div class="content-header">
          <div class="user-info">
            <img :src="commitResult.externalUserHeadImage" alt="">
            <span>{{ commitResult.externalUserName }}</span>
          </div>
          <div class="commit-time">
            {{ commitResult.commitTime }}
          </div>
        </div>
        <div class="content-commit">
          <div v-for="(commitItem,commitIndex) in JSON.parse(commitResult.formResult || '[]').filter(item => item.showFlag)" :key="commitIndex">
            <div class="commit-item">
              <div class="commit-index">
                {{ commitIndex + 1 }}.
              </div>
              <div class="commit-result">
                <div class="commit-question">
                  {{ commitItem.question }}
                </div>
                <div class="commit-answer">
                  <!-- 单选 -->
                  <div v-if="[RADIO_COMPONENT,CHECKBOX_COMPONENT,SELECT_COMPONENT,ONE_LINE_TEXT_COMPONENT,MANY_LINE_TEXT_COMPONENT,DATE_TIME_COMPONENT].includes(commitItem.type)">
                    {{ commitItem.answer }}
                  </div>
                  <div v-if="commitItem.type === SCORE_COMPONENT" class="score-component">
                    <el-rate v-model="commitItem.answer" disabled disabled-void-color="#C0CBD9" :colors="['#EE0A24','#EE0A24','#EE0A24']" />
                    <span>{{ commitItem.text }}</span>
                  </div>
                  <div v-if="commitItem.type === NPS_COMPONENT" class="nps-component">
                    {{ commitItem.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="confirm-btn-div">
          <!-- 当提交结果是第一个的时候禁用 -->
          <el-button :disabled="commitResult.index === 1" @click="changeCommitResult(commitResult.index,true)">上一个</el-button>
          <el-button :disabled="commitResult.index === commitList.length" @click="changeCommitResult(commitResult.index,false)">下一个</el-button>
        </div>
      </div>
    </el-drawer>
    <el-dialog
      title="预览"
      :visible.sync="previewDialogVisible"
      width="500px"
    >
      <div class="preview-phone-dialog">
        <PhoneDialog
          :form-setting="formSetting"
          :form="formForm"
          is-form-preview
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 点击记录
const CLICK_RECORD = {
  customer: 1,
  // eslint-disable-next-line no-magic-numbers
  staff: 2
};
// 点击事件
const CLICK_TIME = 1;
// 提交时间
const SUBMIT_TIME = 2;

/** 侧边栏-智能表单 4: */
const CHANNEL_SIDEBAR = 4;
/** 推广 11*/
const CHANNEL_EXTENSION = 11;
/** 员工活码 */
const CHANNEL_EMPLE_CODE = 1;
/** 群发 */
const CHANNEL_GROUP_SEND = 3;
/** 欢迎语 */
const CHANNEL_WELCOME_MSG = 5;
/** 客户SOP */
const CHANNEL_CUSTOMER_SOP = 6;
/** 群SOP */
const CHANNEL_GROUP_SOP = 7;
/** 新客进群 */
const CHANNEL_NEW_IN_GROUP = 8;
/** 群日历 */
const CHANNEL_GROUP_CALENDAR = 9;
/** 获客助手 */
const CHANNEL_CUSTOMER_ASSISTANT = 12;
const CLICK_CHANNEL = {
  [CHANNEL_SIDEBAR]: '侧边栏',
  [CHANNEL_EXTENSION]: '推广',
  [CHANNEL_EMPLE_CODE]: '员工活码',
  [CHANNEL_GROUP_SEND]: '群发',
  [CHANNEL_WELCOME_MSG]: '欢迎语',
  [CHANNEL_GROUP_SOP]: '群SOP',
  [CHANNEL_NEW_IN_GROUP]: '新客进群',
  [CHANNEL_GROUP_CALENDAR]: '群日历',
  [CHANNEL_CUSTOMER_SOP]: '客户SOP',
  [CHANNEL_CUSTOMER_ASSISTANT]: '获客助手'
};
const SUBMIT_NUMS = {
  [NOT_LIMIT]: '不限制次数',
  [ONE_TIME]: '每个客户限提交一次'
};
import DatePicker from '@/components/DatePicker';
import moment from 'moment';
import { FORVER_EFFECT,
  NOT_LIMIT,
  ONE_TIME,
  NOT_JUMP,
  JUMP_RESULT_PAGE,
  JUMP_LINK,
  SERVER_TYPE_THIRD,
  PAGE_LIMIT,
  RADIO_COMPONENT,
  CHECKBOX_COMPONENT,
  SELECT_COMPONENT,
  ONE_LINE_TEXT_COMPONENT,
  MANY_LINE_TEXT_COMPONENT,
  DATE_TIME_COMPONENT,
  SCORE_COMPONENT,
  NPS_COMPONENT,
  DATE_DISABLED_TYPE
} from '@/utils/constant/index';
import { CUSTOMER_DEATIL_PATH } from '@/utils/constant/routePath';
import Statistics from '@/components/Statistics';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import RightContainer from '@/components/RightContainer';
import PhoneDialog from '@/components/PhoneDialog.vue';
import { formDetail, formDetailTotalView, getCustomerRecord, getStaffRecord, getFormResult, exportCustomerRecord, exportUserSendRecord } from '@/api/form';
import { goRouteWithQuery } from '@/utils';
import loadingMixin from '@/mixin/loadingMixin';
import { find } from 'lodash';
export default {
  components: { Statistics, EmptyDefaultIcon, RightContainer, PhoneDialog, DatePicker },
  mixins: [loadingMixin],
  data() {
    return {
      // 提交时间类型选项
      commitTimeOptions: Object.freeze([
        {
          value: CLICK_TIME,
          label: '点击时间'
        },
        {
          value: SUBMIT_TIME,
          label: '提交时间' }
      ]),
      FORVER_EFFECT,
      DATE_DISABLED_TYPE,
      SUBMIT_NUMS,
      NOT_JUMP,
      JUMP_RESULT_PAGE,
      JUMP_LINK,
      SERVER_TYPE_THIRD,
      CLICK_RECORD,
      CLICK_CHANNEL,
      RADIO_COMPONENT,
      CHECKBOX_COMPONENT,
      SELECT_COMPONENT,
      ONE_LINE_TEXT_COMPONENT,
      MANY_LINE_TEXT_COMPONENT,
      DATE_TIME_COMPONENT,
      SCORE_COMPONENT,
      NPS_COMPONENT,
      activeRecord: CLICK_RECORD['customer'],
      // 数据总览的属性配置
      colList: [
        {
          title: '总点击人数',
          filed: 'clickTotalCount',
          showPopover: true,
          placement: 'top',
          content: '统计有点击表单的客户，已去重，若同一客户访问了两个员工发出的表单，计为1'
        },
        { title: '总提交人数', filed: 'submitTotalCount', showPopover: true, placement: 'top', content: '统计有提交表单的客户，已去重，若同一客户填写了两个员工发出的表单，计为1' },
        {
          unit: '%',
          title: '填写率',
          filed: 'submitPercent',
          showPopover: true,
          placement: 'top',
          content: '填写率=提交人数/访问人数'
        },
        { title: '今日点击人数', filed: 'todayClickCount', showPopover: true, content: '统计有点击表单的客户，已去重，若同一客户访问了两个员工发出的表单，计为1', placement: 'top' },
        { title: '今日提交人数', filed: 'todaySubmitCount', showPopover: true, content: '统计有提交表单的客户，已去重，若同一客户填写了两个员工发出的表单，计为1', placement: 'top' },
        { title: '今日填写率', unit: '%', filed: 'todaySubmitPercent', showPopover: true, content: '填写率=提交人数/访问人数', placement: 'top' }
      ],
      previewDialogVisible: false,
      recordList: [], // 客户操作记录列表/员工发送记录列表
      loading: false,
      total: 0,
      formId: undefined,
      formDetail: {},
      labelSetting: {
        clickLabelIdList: [],
        submitLabelIdList: []
      },
      submitResult: {},
      searchForm: {
        pageSize: PAGE_LIMIT,
        pageNum: 1,
        timeType: CLICK_TIME,
        dateRange: [moment().subtract(1, 'month').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD 23:59:59')]
      },
      // 是否显示满意度调查弹窗
      drawerVisible: false,
      // 当前显示的提交结果
      commitResult: {
        index: 1
      },
      // 所有的提交结果
      commitList: [],
      formForm: {},
      formSetting: {}
    };
  },
  computed: {
    // 是否是三方
    isThirdApplication() {
      return this.$store.state.serverInfo && this.$store.state.serverInfo.serverType === SERVER_TYPE_THIRD;
    },
    companName() {
      return this.$store.state.enterPriseWechatConfig.companyName;
    }
  },
  created() {
    if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
      const { beginTime, endTime } = this.$store.getters.searchQuery[this.$route.name];
      if (beginTime && endTime) {
        this.searchForm.dateRange = [beginTime, endTime];
      }
      this.searchForm = this.$store.getters.searchQuery[this.$route.name];
    }
    const routerQuery = this.$route.query;
    this.formId = routerQuery.id;
    this.getFormSet();
    this.getOverview();
    this.search();
  },
  methods: {
    getChannelTypeOptions() {
      const newArr = [];
      Object.keys(CLICK_CHANNEL).forEach(item => {
        newArr.push({ value: +item, label: CLICK_CHANNEL[item] });
      });
      return newArr;
    },
    /**
     * 获取表单设置
     */
    getFormSet() {
      formDetail({ id: this.formId }).then((res) => {
        this.formDetail = res.data;
        if (res.data.submitActionType === JUMP_RESULT_PAGE) {
          this.submitResult = JSON.parse(res.data.actionInfoParamJson);
        }
        this.labelSetting.clickLabelIdList = res.data.labelSetting.clickLabelIdList || [];
        this.labelSetting.submitLabelIdList = res.data.labelSetting.submitLabelIdList || [];
        this.formSetting = {
          actionInfoParam: JSON.parse(this.formDetail.actionInfoParamJson),
          submitActionType: this.formDetail.submitActionType
        };
        const { description, descriptionFlag, formFieldListJson, formName, headImageOpenFlag, headImageUrl, showSortFlag, submitColor, submitText } = this.formDetail;
        //  组装数据传给表单预览手机页 isFormDetail用来给预览手机页 判断是否 是表单详情的手机页 因为表单详情无法修改。新增/编辑表单可以进行修改
        this.formForm = {
          isFormDetail: true,
          description,
          descriptionFlag,
          formFieldListJson,
          formName,
          headImageOpenFlag,
          headImageUrl,
          showSortFlag,
          submitColor,
          submitText
        };
      });
    },
    /**
     * 获取表单详情数据总览
     */
    getOverview() {
      formDetailTotalView({ id: this.formId }).then((res) => {
        this.colList = this.colList.map((item) => {
          return {
            ...item,
            [item.filed]: res.data[item.filed]
          };
        });
      });
    },
    /**
     * 查看客户资料
     */
    checkCustomerInfo(row) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: this.searchForm
      });
      goRouteWithQuery(this.$router, CUSTOMER_DEATIL_PATH,
        {}, {
          id: row.externalUserId,
          prePageType: 'staffClickRecord'
        });
    },
    /**
     * @description 查看表单详情
     */
    openFormDetail(row) {
      this.drawerVisible = true;
      const payload = {
        formId: this.formId,
        channelType: this.searchForm.channelType || ''
      };
      getFormResult(payload).then((res) => {
        // 根据recordId 查找后端返回的formResult 中 recordId 相同的表单
        this.commitList = res.data.map((item, index) => {
          if (item.recordId === row.recordId) {
            this.commitResult = { ...item, index: index + 1 };
          }
          return {
            ...item,
            index: index + 1
          };
        });
      });
    },
    /**
     * @description 搜索
     */
    search() {
      this.loading = true;
      const isCustomerRecord = this.activeRecord === CLICK_RECORD['customer'];
      (isCustomerRecord ? getCustomerRecord : getStaffRecord)(this.getSearchPayload()).then((res) => {
        this.recordList = res.rows;
        this.total = res.total;
      }).finally(() => {
        this.modifyButtonStatus();
        this.loading = false;
      });
    },
    /**
     * @description 重置
     */
    reset() {
      this.searchForm = this.$options.data().searchForm;
      this.search();
    },
    /**
     * @description 下一个/上一个提交结果
     * @param index 当前结果在列表中的index值
     * @param isPre 当前操作是否是上一个
     */
    changeCommitResult(index, isPre) {
      this.commitResult = find(this.commitList, { index: isPre ? index - 1 : index + 1 });
    },
    /**
     * @description 获取搜索的传参
     */
    getSearchPayload() {
      const payload = {
        ...this.searchForm,
        formId: this.formId
      };
      if (this.searchForm.dateRange) {
        payload.beginTime = this.searchForm.dateRange[0];
        payload.endTime = this.searchForm.dateRange[1];
        delete payload.dateRange;
      }
      return payload;
    },
    /**
     * @description 导出报表
     */
    exportReport() {
      const isCustomerRecord = this.activeRecord === CLICK_RECORD['customer'];
      // exportCustomerRecord exportUserSendRecord
      (isCustomerRecord ? exportCustomerRecord : exportUserSendRecord)(this.getSearchPayload()).then((res) => {
        this.download(res.data.msg, true);
      }).catch(() => {
        this.msgError('导出失败!');
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.item-div {
  border: 1px solid $borderColor;
  padding: 10px;
  width: 430px;
}
.customer-tag {
  display: flex;
}
.form-detail-page {
  height: 100%;
  .bg-white {
    height: 100%;
    padding: 15px;
    background-color: #fff;
  }
  display: flex;
  flex-direction: column;
  .page-card {
    .page-header {
      overflow: auto;
      padding: 15px;
      background-color: #fff;
      display: flex;
      .label {
        color: #999999;
        min-width: 70px;
        text-align: right;
      }
      .header-left {
        width: 320px;
        .header-left-item {
          display: flex;
          margin-bottom: 15px;
          .preview-form {
            color: #6BB4AB;
            margin-left: 10px;
            cursor: pointer;
            margin-top: 50px;
          }
        }
        .form-link {
          border: 1px solid $borderColor;
          width: 200px;
          display: flex;
          background: #fff;
          padding: 10px;
          .form-preview {
            width: 45px;
            height: 45px;
            border-radius: 3px;
          }
          .msg-card-info {
            width: calc(100% - 45px);
            text-align: left;
            margin-right: 5px;
          }
          .msg-card-title {
            font-size: 12px;
            line-height: 14px;
            color: #333;
            display: -webkit-box !important;
            overfLow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          .msg-card-desc {
            font-size: 10px;
            line-height: 12px;
            margin-top: 4px;
            color: #999;
          }
        }
      }
      .header-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 20%;
        .header-right-item {
          display: flex;
        }
        .submit-result {
          width: 430px;
          padding: 10px;
          border: 1px solid $borderColor;
          display: flex;
          flex-direction: column;
          .el-image {
            width: 80px;
            height: 80px;
            border-radius: 3px;
          }
          .submit-result-image {
            display: flex;
            margin-bottom: 10px;
          }
        }
      }
    }
  }
  .page-echart {
    display: flex;
    .echart {
      width: 70%;
      .echart-body {
        font-size: 16px;
        margin-left: -55px;
      }
      .echart-header {
        padding: 15px 0px;
        display: flex;
      }
    }
    .table {
      padding: 20px;
      margin-top: 40px;
      width: 400px;
      overflow-x: scroll;
      .table-body {
        height: 330px;
        overflow: hidden;
        width: 350px;
        overflow-y: scroll;
        margin-top: 15px;
      }
      .table-row {
        .table-row-detail {
          padding: 5px 10px;
          display: flex;
          align-items: center;
          height: 36px;
          .table-row-name {
            width: 180px;
          }
          .table-row-num {
            width: 60px;
            text-align: center;
          }
        }
      }
    }
  }
}
.search-form {
  display: flex;
  align-items: center;
  .commit-time {
    /deep/ .el-input {
      input {
        border-top-right-radius:0px ;
        border-bottom-right-radius: 0px;
      }
    }
  }
}
.search-table {
  margin: 0 -15px;
}
.user-info {
  display: flex;
  align-items: center;
  i {
    font-size: 35px;
    @include text_btn_color($color-theme2-1);
  }
  img {
    width: 35px;
    height: 35px;
  }
  span {
    color: #333;
    padding-left: 5px;
    line-height: 14px;
  }
  .user-info-userName {
    display: flex;
    flex-direction: column;
    .user-info-departmentName {
      margin-top: 5px;
      color: #AAA;
    }
  }
}
.form-result {
  .title {
    display: flex;
    align-items: center;
    .title-text {
      font-size: 20px;
      color: #333;
      margin-right: 10px;
    }
  }
  .form-result-content {
    padding: 20px;
    height: calc(100% - 85px);
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      .commit-time {
        color: #606266;
        font-size: 14px;
      }
    }
    .content-commit {
      height: calc(100% - 50px);
      overflow-y: auto;
    }
}
  .footer {
    display: flex;
    align-items: center;
    position: relative;
    height: 60px;
    .confirm-btn-div {
      position: absolute;
      right: 10px;
    }
  }
}
.commit-item {
  display: flex;
  margin-bottom: 20px;
  .commit-index {
    color:#9FA5AC;
    margin-right: 5px;
  }
  .commit-question {
    color:#9FA5AC;
  }
  .commit-answer {
    margin-top: 10px;
      .score-component {
        display: flex;
        align-items: center;
        span {
          color:#EE0A24;
          margin-left: 5px;
        }
      }
      .nps-component {
        width: 25px;
        height: 25px;
        color: #333;
        background-color: #F5F6F7;
        font-size: 12px;
        text-align: center;
        line-height: 25px;
      }
  }
}
.operate-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .export:hover {
    color: #6BB4AB;
    background-color: #f0f8f7;
    border-color: #6BB4AB;
  }
}
.preview-phone-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 40px;
}
</style>
