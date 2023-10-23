<!--
 * @Description: 获客链接详情
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div v-loading="detailLoading" class="link-detail-page">
    <div class="page-card mb10">
      <ReturnPage show-text="获客链接详情" />
      <div class="page-header">
        <div class="header-left">
          <div class="label-item">
            <div class="label-title">链接名称：</div>
            <span>{{ form.scenario }}</span>
          </div>
          <div class="label-item">
            <div class="label-title">场景描述：</div>
            <span>
              {{ form.description }}
            </span>
          </div>
          <div class="label-item">
            <div class="label-title pt5">使用员工：</div>
            <div class="flexw">
              <el-tag
                v-for="(item, index) in form.weEmpleCodeUseScops"
                :key="index"
                class="user-tag aic mb5"
                size="small"
              >
                <TagUserShow
                  :name="item.businessName"
                  :show-icon="item.businessIdType === SCOPELIST_TYPE.DEPARTMENT"
                />
              </el-tag>
            </div>
          </div>
          <div class="label-item">
            <div class="label-title pt5">客户标签：</div>
            <div class="flexw">
              <el-tag
                v-for="(item, index) in form.weEmpleCodeTags"
                :key="index"
                size="small"
                class="tag mb5"
              >{{ item.tagName }}</el-tag>
            </div>
          </div>
          <div class="label-item">
            <div class="label-title">客户备注：</div>
            <span>{{ form.remarkName }}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="label-item aic">
            <span class="label-title">自动通过：</span>
            <div class="aic">
              <el-switch v-model="form.isAutoPass" class="mr10" :active-value="1" :inactive-value="0" disabled />
              <span v-if="form.skipVerify === SKIP_VERIFY['close']" class="ml10 auto-pass">客户添加需要员工手动同意添加请求</span>
              <span v-else-if="form.skipVerify === SKIP_VERIFY['allDay']">全天生效</span>
              <span v-else-if="form.skipVerify === SKIP_VERIFY['timeAdd']">{{ `${form.effectTimeOpen}~${form.effectTimeClose}生效` }}</span>
            </div>
          </div>
          <div class="label-item">
            <span class="label-title">欢迎语：</span>
            <div
              v-if="form.welcomeMsg || (form.materialList && form.materialList.length)"
              class="welcome-div"
            >
              <div class="welcome-div-content">
                <div v-if="form.welcomeMsg" class="welcome-item">[文字] {{ form.welcomeMsg }}</div>
                <template v-if="form.materialList && form.materialList.length">
                  <div
                    v-for="(materialItem, index) in form.materialList"
                    :key="index"
                  >
                    <div v-if=" materialItem.mediaType === MEDIA_TO_WELCOME_TYPE[MEDIA_TYPE_SMARTFORM]" class="welcome-item">
                      <div>
                        {{ `[${MESSAGE_MEDIA_TYPE[materialItem.mediaType]}] ${materialItem.form.formName}` }}
                      </div>
                    </div>
                    <div v-else class="welcome-item">
                      {{ `[${MESSAGE_MEDIA_TYPE[materialItem.mediaType]}] ${ materialItem.materialName}` }}
                    </div>
                  </div>
                </template>
              </div>
              <div
                v-if="
                  (form.materialList && form.materialList.length) ||
                    form.welcomeMsg
                "
                class="preview theme-text-color"
                @click="previewVisible = true"
              >
                预览效果
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Statistics :col-list="colList" title="数据总览">
      <template slot="operate">
        <el-popover placement="left-start" trigger="hover" :offset="10">
          <!-- TODO 样式统一封装 -->
          <div class="popover-content">
            <div class="info">
              <p>累计添加客户数：截止到今天，累计通过链接添加员工的客户数量</p>
              <p>今日新增客户数：今天通过链接添加员工的客户数量</p>
              <p>今日流失客户数：今天把员工删除或拉黑的客户数量</p>
              <p>
                今日新客留存率：今日未将员工删除或拉黑的新增客户/今日新增客户
              </p>
            </div>
          </div>
          <div slot="reference" class="statistic-explain theme-text-color">
            统计说明
          </div>
        </el-popover>
      </template>
    </Statistics>
    <DetailCustomerCnt :emple-code-id="empleCodeId" :channel-list="channelList" />
    <RightContainer>
      <template v-slot:header>
        <div class="forms-handle-btn">
          <el-radio-group
            v-model="dimensionType"
            size="medium"
            @input="dimensionTypeChange"
          >
            <el-radio-button :label="CLIENT_DIMENSION">客户维度</el-radio-button>
            <el-radio-button :label="CHANNEL_DIMENSION">渠道维度</el-radio-button>
            <el-radio-button :label="DATE_DIMENSION">日期维度</el-radio-button>
          </el-radio-group>
          <el-button
            v-hasPermi="['customer:assistant:export']"
            v-preventReClick
            class="btn-reset btn-export"
            :loading="exportLoad"
            @click="exportForms"
          >导出报表</el-button>
        </div>
      </template>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="pageQuery"
          label-width="100px"
        >
          <el-form-item v-show="dimensionType === CLIENT_DIMENSION">
            <el-input
              v-model="pageQuery.name"
              placeholder="请输入客户名称"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <div class="tag-input" @click="dialogVisibleSelectUser = true">
              <span v-if="!userList.length" class="tag-place">请选择员工</span>
              <template v-else>
                <el-tag
                  v-for="(unit, unique) in userList"
                  :key="unique"
                  type="info"
                >
                  <TagUserShow :name="unit.name" :show-icon="!unit.userId" />
                </el-tag>
              </template>
            </div>
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="pageQuery.channelId"
              clearable
              filterable
              placeholder="请选择渠道"
            >
              <el-option
                v-for="item in channelList"
                :key="item.channelId"
                :label="item.name"
                :value="item.channelId"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="statisticTime"
              popper-class="forbid-clear-picker"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
              style="width: 260px"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
              :clearable="false"
            />
          </el-form-item>
          <el-form-item label=" ">
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button class="btn-reset" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:data>
        <el-table v-if="dimensionType === CLIENT_DIMENSION" ref="showTable" v-loading="loading" :data="list">
          <template slot="empty">
            <empty-default-icon :length="list.length" text="暂无数据" />
          </template>
          <el-table-column
            prop="customer"
            label="客户"
            min-width="300"
          >
            <template #default="{ row }">
              <UserItem :data="row" />
            </template>
          </el-table-column>
          <el-table-column
            prop="addCustomer"
            label="添加员工"
            min-width="265"
          >
            <template slot-scope="{ row }">
              <div>
                <div class="f14">{{ row.userName }}</div>
                <div>{{ row.departmentName }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="channelName"
            label="添加渠道"
            min-width="265"
          />
          <el-table-column
            prop="addTime"
            label="添加时间"
            min-width="180"
          />
          <el-table-column
            label="操作"
            min-width="150"
          >
            <template slot-scope="{ row }">
              <!-- 跳转到客户资料详情页 -->
              <el-button
                v-hasPermi="['customerManage:customer:view']"
                type="text"
                @click="skipToUserDetails(row)"
              >客户资料</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-table v-else ref="showTable" v-loading="loading" :data="list">
          <template slot="empty">
            <empty-default-icon :length="list.length" text="暂无数据" />
          </template>
          <el-table-column
            v-if="dimensionType === CHANNEL_DIMENSION"
            prop="name"
            label="渠道"
            min-width="200"
          >
            <!-- 由于表格组件切换时列渲染会异常，所以需要单独设置渲染布局 -->
            <template slot-scope="{ row }">
              <div class="intwoline">{{ row.name }}</div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="dimensionType === DATE_DIMENSION"
            prop="date"
            label="日期"
            min-width="200"
          >
            <template slot-scope="{ row }">
              {{ row.date }}
            </template>
          </el-table-column>
          <el-table-column
            prop="accumulateCustomerCnt"
            label="累计添加客户数"
            min-width="180"
          >
            <template #default="{ row }">
              {{ row.accumulateCustomerCnt }}
            </template>
          </el-table-column>
          <el-table-column
            prop="newCustomerCnt"
            label="新增客户数"
            min-width="180"
          />
          <el-table-column
            prop="lossCustomerCnt"
            label="流失客户数"
            min-width="180"
          />
          <el-table-column
            prop="retainNewCustomerRate"
            label="新客留存率"
            min-width="180"
          >
            <template #default="{ row }">
              {{ row.retainNewCustomerRate === DATA_STATISTICS_DEFAULT_SHOW ? DATA_STATISTICS_DEFAULT_SHOW : row.retainNewCustomerRate + '%' }}
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total * 1"
          :page.sync="pageQuery.pageNum"
          :limit.sync="pageQuery.pageSize"
          @pagination="handleChangePage()"
        />
      </template>
    </RightContainer>
    <el-dialog
      class="preview-dialog"
      title="预览效果"
      :visible.sync="previewVisible"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="preview-phone">
        <PhoneDialog :message="form.welcomeMsg" :msg-list="form.materialList" />
      </div>
    </el-dialog>
    <!-- 选择员工/部门弹窗 -->
    <SelectUser
      v-show="dialogVisibleSelectUser"
      :visible.sync="dialogVisibleSelectUser"
      title="选择员工"
      :is-only-leaf="true"
      :selected-user-list="userList"
      @success="selectedUser"
    />
  </div>
</template>

<script>
import SelectUser from '@/components/SelectUser/index.vue';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import TagUserShow from '@/components/TagUserShow';
import PhoneDialog from '@/components/PhoneDialog';
import Statistics from '@/components/Statistics';
import {
  SCOPELIST_TYPE, CLIENT_DIMENSION, CHANNEL_DIMENSION, DATE_DIMENSION, PAGE_LIMIT, MEDIA_TO_WELCOME_TYPE, MEDIA_TYPE_SMARTFORM, MESSAGE_MEDIA_TYPE,
  DATA_STATISTICS_DEFAULT_SHOW, SKIP_VERIFY
} from '@/utils/constant/index';
import { CUSTOMER_DEATIL_PATH } from '@/utils/constant/routePath';
import { groupByScopeType, WEEK_TIME, TODAY_TIME } from '@/utils/common';
import { getDetail, getDetailDataStatistics, getChannelList, statisticByCustomer, statisticByChannel, statisticByDate, exportStatisticByCustomer, exportStatisticByChannel, exportStatisticByDate } from '@/api/drainageCode/customerAssistant';
import { getFirstMsg } from '@/utils/drainageCode';
import DetailCustomerCnt from './components/DetailCustomerCnt.vue';
import UserItem from '@/components/UserItem.vue';
import { goRouteWithQuery } from '@/utils/index';

export default {
  components: {
    Statistics,
    EmptyDefaultIcon,
    RightContainer,
    PhoneDialog,
    TagUserShow,
    SelectUser,
    DetailCustomerCnt,
    UserItem
  },
  data() {
    return {
      detailLoading: false,
      empleCodeId: void 0,
      // 数据统计中的查询日期
      statisticTime: [WEEK_TIME + ' 00:00', TODAY_TIME + ' 23:59'],
      pageQuery: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        name: '',
        channelId: ''
      },
      userList: [],
      SCOPELIST_TYPE,
      dialogVisibleSelectUser: false,
      // 欢迎语预览弹窗
      previewVisible: false,
      // 获客链接详情
      form: {
        weEmpleCodeUseScops: [],
        weEmpleCodeTags: []
      },
      CLIENT_DIMENSION,
      dimensionType: CLIENT_DIMENSION,
      total: 0,
      list: [],
      enableBehaviorRecord: false,
      // 数据总览的属性配置
      colList: [
        {
          title: '累计添加客户',
          filed: 'accumulateCustomerCnt'
        },
        { title: '今日新增客户', content: '', filed: 'newCustomerCnt' },
        {
          title: '今日流失客户',
          filed: 'lossCustomerCnt'
        },
        {
          title: '今日新客留存率',
          filed: 'retainNewCustomerRate',
          unit: '%'
        }
      ],
      loading: false,
      // 导出报表按钮loading
      exportLoad: false,
      channelList: [], // 渠道点击人数排行列表
      beginTime: '',
      endTime: '',
      CHANNEL_DIMENSION,
      DATE_DIMENSION,
      MEDIA_TO_WELCOME_TYPE,
      MEDIA_TYPE_SMARTFORM,
      MESSAGE_MEDIA_TYPE,
      DATA_STATISTICS_DEFAULT_SHOW,
      SKIP_VERIFY
    };
  },

  created() {
    const id = this.$route.query.id;
    this.empleCodeId = id;
    if (id) {
      this.setQueryParams();
      this.getDetail(id);
      this.getOverview(id);
      this.getChannelList(id);
      this.getStatisticByCustomer();
    }
  },
  methods: {
    getOverview(empleCodeId) {
      getDetailDataStatistics(empleCodeId).then(res => {
        this.colList = this.colList?.map((item) => {
          const updateParams = {
            ...item,
            [item.filed]: res?.data && res?.data[item.filed]
          };
          return updateParams;
        });
      });
    },
    /**
     * 获取点击人数排行
     */
    getChannelList(empleCodeId) {
      getChannelList({ empleCodeId }).then(({ rows }) => {
        const channelList = rows.reverse();
        this.channelList = [...channelList];
      });
    },
    /**
     * @description 选择员工/部门的回调
     */
    selectedUser(list) {
      this.userList = list;
    },

    getStatisticByCustomer(page) {
      page && (this.pageQuery.pageNum = page);
      this.loading = true;
      this.getStatisticSearchDetailsDataFun()(this.getSearchPayload()).then(({ rows, total }) => {
        this.list = [...rows];
        this.total = total;
      }).finally(() => {
        this.loading = false;
      });
    },

    getSearchPayload() {
      if (this.statisticTime) {
        this.pageQuery.beginTime = this.statisticTime[0];
        this.pageQuery.endTime = this.statisticTime[1];
      } else {
        this.pageQuery.beginTime = '';
        this.pageQuery.endTime = '';
      }

      const allListObj = groupByScopeType(this.userList);
      const userIdList = allListObj.useEmployeesList.map(item => item.userId);
      this.pageQuery.userIds = userIdList.join(',');
      const params = { ...this.pageQuery };
      if (this.dimensionType !== CLIENT_DIMENSION) {
        delete params.name;
      }
      return {
        ...params,
        empleCodeId: this.empleCodeId
      };
    },
    getStatisticSearchDetailsDataFun() {
      switch (this.dimensionType) {
        case CLIENT_DIMENSION:
          return statisticByCustomer;
        case CHANNEL_DIMENSION:
          return statisticByChannel;
        case DATE_DIMENSION:
          return statisticByDate;
      }
    },
    onSearch() {
      this.getStatisticByCustomer(1);
    },
    /**
     * 重置查询条件
     */
    resetSearch() {
      this.pageQuery = {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        channelId: '',
        name: ''
      };
      this.statisticTime = [WEEK_TIME + ' 00:00', TODAY_TIME + ' 23:59'];
      this.userList = [];
      this.getStatisticByCustomer(1);
    },
    /**
     * 切换维度查询
     */
    dimensionTypeChange() {
      this.resetSearch();
    },
    /**
     * 表格翻页
     */
    handleChangePage() {
      this.getStatisticByCustomer();
    },
    /**
     * 获取详情
     */
    async getDetail(id) {
      this.detailLoading = true;
      const detailRes = await getDetail(id);
      this.detailLoading = false;
      if (detailRes) {
        const data = { ...detailRes?.data };
        this.form = {
          ...data,
          welcomeMsg: getFirstMsg(data).welcomeMsg,
          materialList: getFirstMsg(data).materialList
        };
      }
    },
    // 跳转到客户资料详情页
    skipToUserDetails(row) {
      this.$store.commit('SET_SEARCH_QUERY', {
        pageName: this.$route.name,
        query: {
          ...this.pageQuery,
          userList: this.userList.map(item => { return { userId: item.userId, name: item.name }; }),
          statisticTime: this.statisticTime
        }
      });
      goRouteWithQuery(
        this.$router,
        CUSTOMER_DEATIL_PATH,
        {},
        {
          id: row.externalUserId,
          userId: row.userId,
          prePageType: 'customer'
        }
      );
    },
    exportForms() {
      const exportFnMap = {
        [CLIENT_DIMENSION]: exportStatisticByCustomer,
        [CHANNEL_DIMENSION]: exportStatisticByChannel,
        [DATE_DIMENSION]: exportStatisticByDate
      };
      this.exportLoad = true;
      this.msgInfo('正在导出中...');
      exportFnMap[this.dimensionType](this.getSearchPayload()).then((res) => {
        this.download(res.data.msg, true);
      }).catch(() => {
        this.msgError('导出失败!');
      }).finally(() => {
        this.exportLoad = false;
      });
    },
    /**
     * TODO 后续返回保留查询条件的方法需抽离
     * @description 读取sessionStorage中保存的搜索数据并设置
     */
    setQueryParams() {
      if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
        const { userList, statisticTime, name, channelId, pageNum, pageSize } = this.$store.getters.searchQuery[this.$route.name];
        this.userList = userList || [];
        this.statisticTime = statisticTime || [];
        this.pageQuery = {
          name,
          channelId,
          pageNum,
          pageSize
        };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.forms-handle-btn {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  padding: 15px 15px 0 15px;
}
.statistic-explain {
  font-size: 14px;
  cursor: default;
}
.popover-content {
  width: 370px;
  font-size: 12px;
  line-height: 20px;
}
.link-detail-page {
  .bg-white {
    padding: 15px 15px 0;
    background-color: #fff;
  }
  display: flex;
  flex-direction: column;
  .page-card {
    .page-header {
      padding: 15px 15px 0;
      background-color: #fff;
      display: flex;
      .label-item {
        display: flex;
        margin-bottom: 20px;
        .label-title {
          color: #606266;
          flex-shrink: 0;
          width: 72px;
          text-align: right;
          margin-right: 10px;
        }
        .auto-pass {
          color: #999;
        }
      }
      .header-left {
        max-width: 520px;
      }
      .header-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 50px;
        .welcome-div {
          border: 1px solid #dce0e7;
          padding: 9px;
          .welcome-div-content {
            max-height: 300px;
            overflow-x: hidden;
            .welcome-item {
              margin-bottom: 10px;
            }
          }
          .preview {
            text-align: right;
            cursor: pointer;
          }
        }
      }
    }
  }
}
.preview-dialog {
  .preview-phone {
    /deep/ .preview {
      margin: 0 auto;
    }
  }
}
.tag-input {
  margin-top: 1px;
  .code-label {
    height: 32px;
    color: #606266;
  }
}
/deep/ .search-form-container {
    margin-bottom: -25px;
}
</style>
