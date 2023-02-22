<!--
 * @Description: 单个公众号信息卡片
 * @Author: xulinbin
 * @LastEditors: xulinbin
-->
<template>
  <div class="off-account-card">
    <div class="card-top">
      <el-tooltip v-if="cardData.nickName" placement="top">
        <div slot="content">
          <div class="tooltip-content"> {{ cardData.nickName }} </div>
        </div>
        <div class="top-title inoneline">
          {{ cardData.nickName }}
        </div>
      </el-tooltip>
      <div v-else class="top-title" />
      <div class="top-move">
        <el-button type="text" @click="move">移除</el-button>
      </div>
    </div>
    <div class="card-content">
      <div class="content-info">
        <el-tooltip v-if="cardData.principalName" placement="top">
          <div slot="content">
            <div class="tooltip-content"> {{ cardData.principalName }} </div>
          </div>
          <div class="info-msg inoneline">{{ cardData.principalName }}</div>
        </el-tooltip>
        <div v-else class="info-msg" />
        <div v-if="cardData.serviceTypeInfo || cardData.serviceTypeInfo === 0" class="info-tag">
          <div class="type-tag">
            {{ [SUBSCRIBE_OFF_ACCOUNT, UPDATED_SUBSCRIBE_OFF_ACCOUNT].includes(cardData.serviceTypeInfo) ? '订阅号' : '服务号' }}
          </div>
        </div>
      </div>
      <div v-if="cardData.headImg" class="content-img">
        <img :src="cardData.headImg">
      </div>
    </div>
  </div>

</template>
<script>
import {
  SUBSCRIBE_OFF_ACCOUNT,
  UPDATED_SUBSCRIBE_OFF_ACCOUNT,
  SERVICE_OFF_ACCOUNT,
  WX_PAAS_URL,
  CONFIG_INTRODUCE_URL
} from '@/utils/constant';
export default {
  props: {
    // 公众号卡片数据
    cardData: {
      type: Object,
      default: () => {}
    },
    // 获取新的公众号列表
    getList: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      SUBSCRIBE_OFF_ACCOUNT,
      UPDATED_SUBSCRIBE_OFF_ACCOUNT,
      SERVICE_OFF_ACCOUNT,
      WX_PAAS_URL,
      CONFIG_INTRODUCE_URL
    };
  },
  methods: {
    move() {
      this.confirmModal(
        {
          title: '移除公众号',
          type: null,
          msg:
          `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;若需要解除授权，请前往
          <a href="${WX_PAAS_URL}" style="color: #409eff" target="_blank">微信公众平台</a>
          进行操作，可参考
          <a href="${CONFIG_INTRODUCE_URL}" style="color: #409eff" target="_blank">配置说明</a>
          文档步骤说明。`,
          showCancelButton: false,
          confirmButtonText: '我知道了',
          dangerouslyUseHTMLString: true
        },
        () => {}
      );
    }
  }

};
</script>
<style lang="scss" scoped>
  .tooltip-content{
    max-width: 250px;
  }
  .off-account-card{
    width: 250px;
    height: 90px;
    margin: 0 15px 15px 0;
    background-color: #FFFFFF;
    border-radius: 3px;
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
    padding: 5px 10px 10px 10px;

    .card-top {
      display: flex;
      height: 25px;
      margin-bottom: 5px;
      justify-content: space-between;
      .top-title {
        width: 200px;
        line-height: 25px;
      }
      .top-move {
        display: flex;
        align-items: center;
      }
    }
    .card-content {
      display: flex;
      .content-img {
        width: 45px;
        height: 45px;
        img {
          height: 100%;
          width: 100%;
          object-fit: cover;
        }
      }
      .content-info {
        flex: 1;
        .info-msg {
          width: 180px;
          height: 14px;
          line-height: 14px;
          font-size: 12px;
          color: #7F7F7F;
        }
        .info-tag {
          margin-top: 10px;
          .type-tag {
            width: 40px;
            height: 18px;
            font-size: 12px;
            line-height: 18px;
            text-align: center;
            color: #6DB4AB;
            border-radius: 3px;
            border: 1px solid #6DB4AB;
          }
        }
      }
    }

  }
</style>
