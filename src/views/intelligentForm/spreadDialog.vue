<!--
 * @Description: 推广弹窗
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <el-dialog
    v-bind="$attrs"
    class="spread-dialog"
    width="500px"
    :close-on-click-modal="false"
    title="推广"
    v-on="$listeners"
    @close="onClose"
  >
    <div class="spread-dialog-content">
      <div class="way-info">可将链接或二维码放置在海报、营销落地页、宣传单中邀请客户填写</div>
      <div class="way-item">
        <div class="way-item-title">方式一</div>
        <div class="way-item-content">
          <el-input :value="linkUrl" placeholder="请输入内容" style="width: 360px;" />
          <el-button
            v-if="linkUrl"
            v-copy="linkUrl"
            size="mini"
            type="text"
            class="btn-copy"
          >复制链接</el-button>
        </div>
      </div>
      <div class="way-item">
        <div class="way-item-title">方式二</div>
        <div class="way-item-content">
          <div class="qr-box">
            <img :src="qrCodeUrl">
          </div>
          <el-button
            v-if="qrCodeUrl"
            size="mini"
            type="text"
            class="qr-download"
            @click="downloadQR(qrCodeUrl)"
          >下载二维码</el-button>
        </div>
      </div>
    </div>

  </el-dialog>
</template>
<script>
import { getSpreadData } from '@/api/form';
import {
  downloadFile
} from '@/utils/common.js';
// 方式一
const WAY_ONE_TYPE = 1;
// 方式二
const WAY_TWO_TYPE = 2;
export default {
  name: '',
  components: { },
  props: {
    // 推广所需表单数据
    formRowData: undefined
  },
  data() {
    return {
      spreadData: []
    };
  },
  computed: {
    qrCodeUrl: function() {
      return this.spreadData.find(item => item.type === WAY_TWO_TYPE)?.qrCodeUrl;
    },
    linkUrl: function() {
      return this.spreadData.find(item => item.type === WAY_ONE_TYPE)?.linkUrl;
    }
  },
  watch: {},
  methods: {
    /**
     * @description: 获取新的推广数据
     * @return {*}
     */
    getNewSpreadData(id) {
      getSpreadData({ id }).then(res => {
        this.spreadData = res.data.wayList;
      });
    },
    onClose() {
      this.$emit('update:visible', false);
    },
    /**
     * @description: 下载二维码
     * @return {*}
     */
    downloadQR(url) {
      downloadFile(url, `${this.formRowData?.formName || '推广二维码'}`);
    }
  }

};
</script>
<style scoped lang='scss'>
.spread-dialog-content {
  display: flex;
  flex-direction: column;
  .way-info {
    margin-bottom: 10px;
  }
  .way-item {
    width: 100%;
    min-height: 50px;
    position: relative;
    .way-item-title {
      border-left: 5px solid #6BB4AB;
      padding: 2px 15px 2px 15px;
      color: black;
    }
    .way-item-content {
      margin: 20px 0 20px 0;
      padding-left: 20px;
    }
    .btn-copy {
      margin-left: 10px;
    }
    .qr-download{
      position: absolute;
      left:170px;
      bottom: 12px;
    }
    .qr-box {
      width: 150px;
      height: 150px;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
}
/deep/ .el-dialog__body {
  padding: 10px 20px 20px 20px;
}

</style>
