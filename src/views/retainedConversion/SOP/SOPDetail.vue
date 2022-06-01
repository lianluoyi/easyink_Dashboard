<!--
 * @Description: sop详情
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="sop-detail-page">
    <ReturnPage />
    <div class="sop-detail-content mt10">
      <el-tabs v-model="activeName" class="sop-header-container">
        <el-tab-pane :label="`${sopInfo.sopType === SOP_TYPE['groupCalendar'] ? '日历详情' : 'SOP详情'}`" name="0">
          <SOPDetailTab :sop-detail="sopDetail" :sop-type="sopInfo.sopType" />
        </el-tab-pane>
        <el-tab-pane :label="'执行记录'" name="1" :lazy="true">
          <PerformRecord :sop-id="sopDetail.id" :sop-type="sopInfo.sopType" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import ReturnPage from '@/components/ReturnPage.vue';
import SOPDetailTab from './SOPDetailTab.vue';
import PerformRecord from './performRecord.vue';
import { getSopDetail } from '@/api/sop';
import { SOP_TYPE } from '@/utils/constant';

export default {
  name: '',
  components: { ReturnPage, SOPDetailTab, PerformRecord },
  props: {},
  provide() {
    return {
      sopInfo: this.sopInfo
    };
  },
  data() {
    return {
      activeName: '0',
      sopInfo: {
        sopType: null
      },
      sopId: null,
      sopDetail: {},
      SOP_TYPE
    };
  },
  created() {
    const routerQuery = this.$route.query;
    this.sopInfo.sopType = Number(routerQuery.sopType);
    this.sopId = routerQuery.id;
    this.getSopDetail(routerQuery.id);
  },
  mounted() {},
  methods: {
    /**
     * 获取sop详情
     */
    getSopDetail(id) {
      getSopDetail({
        sopId: id
      }).then(res => {
        this.sopDetail = res.data;
      });
    }
  }

};
</script>
<style scoped lang='scss'>
.sop-detail-page {
    display: flex;
    flex-direction: column;
    .sop-detail-content {
        flex: 1;
        .sop-header-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            /deep/ .el-tabs__header {
                background-color: #fff;
                margin-bottom: 0;
                .el-tabs__nav-wrap {
                    .el-tabs__item {
                        width: 100px;
                        text-align: center;
                            padding-left: 0;
                    }
                }
            }
            /deep/ .el-tabs__content {
                flex: 1;
                .el-tab-pane {
                    height: 100%;
                }
            }
        }
    }
}
</style>
