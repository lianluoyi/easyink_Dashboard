<script>
import {
  getDetail,
  getTimeRangeAnalyseCount,
  download,
  getUserByEmplyCode
} from '@/api/drainageCode/staff';
import ClipboardJS from 'clipboard';
import echarts from 'echarts';
import { Notification } from 'element-ui';
import { DRAINAGE_CODE_TYPE, SKIP_VERIFY, MESSAGE_MEDIA_TYPE } from '@/utils/constant';
import PhoneDialog from '@/components/PhoneDialog';

const DEFAULT_TIME_RANGE = 7;
const DEFAULT_SLICE_LENGHT = 3;
const ITEM_GAP = 50;
export default {
  name: 'CodeDetail',
  components: { PhoneDialog },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 员工列表参数
      userByEmplyCodeList: {},
      // 查询参数
      query: {
        userId: undefined,
        addWay: undefined,
        beginTime: undefined,
        endTime: undefined
      },
      type: DRAINAGE_CODE_TYPE,
      timeRange: DEFAULT_TIME_RANGE,
      SKIP_VERIFY,
      // 已选择的员工
      selectedUser: null,
      MESSAGE_MEDIA_TYPE,
      // 欢迎语预览弹窗
      previewVisible: false
    };
  },
  created() {
    const id = this.$route.query.id;
    id && this.getDetail(id);
    // this.getList()
  },
  mounted() {
    var clipboard = new ClipboardJS('.copy-btn');
    clipboard.on('success', (e) => {
      Notification.closeAll();
      this.$notify({
        title: '成功',
        message: '链接已复制到剪切板，可粘贴。',
        type: 'success'
      });
    });
    clipboard.on('error', (e) => {
      this.msgError('链接复制失败');
    });
  },
  methods: {
    /** 获取详情 */
    getDetail(id) {
      this.loading = true;
      // 获取员工活码的使用员工数据
      getUserByEmplyCode(id).then(({ data }) => {
        this.userByEmplyCodeList = data;
        this.query.userId = data[0].userId;
      });
      getDetail(id).then(({ data }) => {
        this.form = data;
        this.loading = false;
        this.query.addWay = 1;
        this.query.state = data.state;
        this.setTime(DEFAULT_TIME_RANGE);
        // this.getList()
      });
    },
    /**  */
    getList() {
      this.query.beginTime = this.dateRange[0];
      this.query.endTime = this.dateRange[1];
      this.query.userId = this.selectedUser;
      getTimeRangeAnalyseCount(this.query).then(({ data }) => {
        this.total = data.total;
        const list = data.list;
        const dateList = list.map(item => item.time);
        const addList = list.map(item => item.addCount);
        const loseList = list.map(item => item.loseCount);
        this.loading = false;

        const option = {
          xAxis: {
            type: 'category',
            data: dateList
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '新增人数',
              data: addList,
              type: 'line',
              color: '#14BF48'
            },
            {
              name: '流失人数',
              data: loseList,
              type: 'line',
              color: '#E24F59'
            }
          ],
          legend: {
            data: ['新增人数', '流失人数'],
            itemGap: ITEM_GAP
          }
        };
        var myChart = echarts.init(this.$refs.chart);
        myChart.setOption(option);
        this.$nextTick(() => {});
      });
    },
    setTime(days) {
      this.timeRange = days;
      const date = new Date();
      date.setDate(date.getDate() - days);
      this.dateRange = [this.getTime(date), this.getTime()];
      this.getList();
    },
    getHandledValue(num) {
      // eslint-disable-next-line no-magic-numbers
      return num < 10 ? '0' + num : num;
    },
    getTime(datePar) {
      const d = datePar ? new Date(datePar) : new Date();
      const year = d.getFullYear();
      const month = this.getHandledValue(d.getMonth() + 1);
      const date = this.getHandledValue(d.getDate());
      return year + '-' + month + '-' + date;
    },
    download() {
      let name = '';
      if (this.form.scenario) {
        name = this.form.scenario + '.png';
      } else {
        let userName = this.form.weEmpleCodeUseScops.map((item) => {
          return item.businessName;
        }).slice(0, DEFAULT_SLICE_LENGHT).join(',');
        if (this.form.weEmpleCodeUseScops.length > DEFAULT_SLICE_LENGHT) {
          userName += '等';
        }
        name = userName + '.png';
      }
      download(this.form.id).then((res) => {
        if (res != null) {
          const blob = new Blob([res], { type: 'application/zip' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a'); // 创建a标签
          link.href = url;
          link.download = name; // 重命名文件
          link.click();
          URL.revokeObjectURL(url); // 释放内存
        }
      });
    },
    goBack() {
      this.$router.go(-1);
    },
    /**
     * 选择员工
     */
    handleSelect(val) {
      this.getList();
    },
    /**
     * 预览欢迎语
     */
    hanldePreview() {
      this.previewVisible = true;
    }
  }
};
</script>

<template>
  <div v-loading="loading" class="drainage-code-detail-page">
    <div class="go-back">
      <i class="iconfont icon-restore" @click="goBack" />
      员工活码详情
    </div>
    <div class="info-div">
      <div class="title section-title">员工活码信息</div>
      <div class="flex top">
        <div class="ac">
          <el-image
            v-if="form.qrCode"
            :src="form.qrCode"
            fit="fit"
            :preview-src-list="[form.qrCode]"
            style="width: 150px; height: 150px"
          />
          <div v-else class="err-img">加载失败</div>
          <div>
            <el-button type="text" @click="download()">下载二维码</el-button>
            <el-button
              type="text"
              class="copy-btn"
              :data-clipboard-text="form.qrCode"
            >复制链接</el-button>
          </div>
        </div>
        <el-form ref="form" label-width="100px">
          <el-form-item label="活动场景：">{{ form.scenario }}</el-form-item>
          <el-form-item label="使用员工：">
            <el-tag
              v-for="(item, index) in form.weEmpleCodeUseScops"
              :key="index"
              class="user-tag"
              size="small"
            >{{ item.businessName }}</el-tag>
          </el-form-item>
          <el-form-item
            label="客户标签："
          ><el-tag
            v-for="(item, index) in form.weEmpleCodeTags"
            :key="index"
            size="small"
          >{{ item.tagName }}</el-tag></el-form-item>
          <el-form-item label="客户备注：">{{ form.remarkName }}</el-form-item>
        </el-form>
        <el-form ref="form" label-width="100px">
          <el-form-item label="自动通过：">
            <div style="display: flex;align-items:center;">
              <el-switch
                style="margin-right: 9px;"
                :value="!!form.skipVerify"
                disabled
              />
              <span v-if="form.skipVerify === SKIP_VERIFY['close']">客户扫码添加需要手动同意添加请求</span>
              <span v-else-if="form.skipVerify === SKIP_VERIFY['allDay']">全天生效</span>
              <span v-else-if="form.skipVerify === SKIP_VERIFY['timeAdd']">{{ `${form.effectTimeOpen}~${form.effectTimeClose}生效` }}</span>
            </div>
          </el-form-item>
          <el-form-item label="欢迎语：">
            <div v-if="(form.materialList && form.materialList.length) || form.welcomeMsg" class="welcome-div">
              <div class="welcome-div-content">
                <div v-if="form.welcomeMsg">[文字] {{ form.welcomeMsg }}</div>
                <div v-for="(materialItem, index) in form.materialList" :key="index">
                  <div>{{ `[${MESSAGE_MEDIA_TYPE[materialItem.mediaType]}] ${materialItem.materialName}` }}</div>
                </div>
              </div>
              <div v-if="form.materialList.length || form.welcomeMsg" class="preview theme-text-color" @click="hanldePreview">预览效果</div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="data-count-div">
      <div class="title section-title">数据统计
        <el-popover
          placement="top-start"
          trigger="hover"
          popper-class="tip-popover"
        >
          <div>
            <div>1. 累积扫码添加人数：查询时间内有扫码添加员工的人数统计，如果重复添加不会重复计数</div>
            <div>2. 新增人数：当天扫码添加的新增客户数，包含流失客户</div>
            <div>3. 流失人数：扫码添加后又将成员删除或拉黑的客户</div>
          </div>
          <i slot="reference" class="iconfont icon-question" />
        </el-popover>
      </div>
      <div class="scan-count mb15">累积扫码添加人数：{{ total }}</div>
      <div class="search-tool">
        <el-button-group>
          <el-button
            size="small"
            type="primary"
            :plain="timeRange != 7"
            @click="setTime(7)"
          >近7日</el-button>
          <el-button
            size="small"
            type="primary"
            :plain="timeRange != 30"
            @click="setTime(30)"
          >近30日</el-button>
        </el-button-group>

        <el-date-picker
          v-model="dateRange"
          size="small"
          class="ml20"
          style="width: 260px"
          value-format="yyyy-MM-dd"
          type="daterange"
          :clearable="false"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="getList"
        />
        <el-select v-model="selectedUser" class="select-user" clearable filterable placeholder="请选择员工" @change="handleSelect">
          <el-option
            v-for="(item, index) in userByEmplyCodeList"
            :key="index"
            :label="item.userName"
            :value="item.userId"
          />
        </el-select>
      </div>
      <div ref="chart" class="chart" style="width: 90%;height:400px;" />
    </div>
    <el-dialog
      class="preview-dialog"
      title="预览效果"
      :visible.sync="previewVisible"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="preview-phone">
        <PhoneDialog
          :message="form.welcomeMsg"
          :msg-list="form.materialList"
        />
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.drainage-code-detail-page {
  background-color: #fff;
  .go-back {
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 15px;
    border-bottom: 1px solid #eee;
    .icon-restore {
      margin-right: 7px;
      cursor: pointer;
    }
  }
  .info-div {
    padding: 15px;
    border-bottom: 1px solid #eee;
  }
  .data-count-div {
    padding: 15px;
    .scan-count {
      padding-left: 13px;
    }
  }
  .top {
    align-items: flex-start;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 20px;
  }
  .err-img {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    background: #F5F7FA;
    color: #C0C4CC;
    vertical-align: middle;
    height: 150px;
    width: 150px;
  }
  .select-user {
    width: 260px;
    margin-left: 5px;
  }
  .search-tool {
    padding-left: 13px;
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    .btn-reset {
      margin-left: 10px;
    }
  }
  .welcome-div {
    border: 1px solid #DCE0E7;
    padding: 9px;

    .welcome-div-content{
      max-height: 300px;
      overflow-x: hidden;
    }
    .preview {
      text-align: right;
      cursor: pointer;
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
</style>
