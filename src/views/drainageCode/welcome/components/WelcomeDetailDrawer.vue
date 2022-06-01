<!--
 * @Description: 欢迎语详情抽屉
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <el-drawer
    v-bind="$attrs"
    :before-close="handleClose"
    :append-to-body="true"
    class="welcome-msg-detail-drawer"
    v-on="$listeners"
  >
    <div class="welcome-msg-detail">
      <div class="welcome-msg-detail-info">
        <div class="default-welcome-div">
          <div class="welcome-msg-title">默认欢迎语</div>
          <div class="default-msg-info mb10">{{ item.defaultWelcomeMsg }}</div>
          <div v-for="(detailItem, index) in item.defaultMaterialList" :key="index" class="detail-item mb10">
            <VerbalTrickDetailPreview :item="transferMaterialTypeItem(detailItem)" />
          </div>
        </div>
        <div v-if="item.weMsgTlpSpecialRules && item.weMsgTlpSpecialRules.length" class="special-welcome-div">
          <div v-for="(specialItem, specialIndex) in item.weMsgTlpSpecialRules" :key="specialIndex">
            <WelcomeDetailSpecial
              :special-item="specialItem"
              :transfer-material-type-item="transferMaterialTypeItem"
              :special-index="specialIndex"
            />
          </div>
        </div>
      </div>
      <div class="edit-btn">
        <el-button v-show="checkPermi('edit')" type="primary" @click="() => handleEdit(item)">编辑</el-button>
      </div>
    </div>
  </el-drawer>
</template>
<script>
import VerbalTrickDetailPreview from '@/views/verbalTrickLibrary/component/verbalTrickDetailPreview.vue';
import WelcomeDetailSpecial from './WelcomeDetailSpecial.vue';

export default {
  name: 'WelcomeDetailDrawer',
  components: { VerbalTrickDetailPreview, WelcomeDetailSpecial },
  props: {
    transferMaterialTypeItem: {
      type: Function,
      default: () => {}
    },
    item: {
      type: Object,
      default: () => {}
    },
    handleEdit: {
      type: Function,
      default: () => {}
    },
    checkPermi: {
      type: Function,
      default: () => { return false; }
    }
  },
  data() {
    return {};
  },
  created() {},
  mounted() {

  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    }
  }

};
</script>
<style scoped lang='scss'>
.welcome-msg-detail-drawer {
    .welcome-msg-detail {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .welcome-msg-detail-info {
        padding: 0 20px 20px 20px;
        flex: 1;
        overflow: auto;
        .default-welcome-div {
          margin-bottom: 15px;
        }
        /deep/ .welcome-msg-title {
            font-size: 18px;
            color: $black;
            font-weight: bold;
            margin-bottom: 10px;
        }
        /deep/ .default-msg-info {
            color: #666666;
        }
        .special-welcome-div {
          border-top: 1px solid #E7E7E7;
        }
    }
    .edit-btn {
        box-shadow: 0px -5px 10px 0px rgba(0, 0, 0, 0.11);
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 20px;
    }
}
</style>
