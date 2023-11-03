<!--
 * @Description: 欢迎语详情抽屉
 * @Author: broccoli
 * @LastEditors: wJiaaa
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
        <div class="welcome-msg-detail-item mb10">
          <div class="welcome-msg-detail-title">客户范围</div>
          <div class="filter flex">
            <div v-for="(ruleItem,index) in weMsgTlpFilterRules" :key="index" class="fcc mb10">
              <div :class="['filterType','filterValue'].includes(ruleItem.type) ? 'filter-item fcc' : 'ml5 mr5'">
                {{ getLabel(ruleItem) }}
              </div>
            </div>
          </div>
        </div>
        <div class="welcome-msg-detail-item">
          <div class="welcome-msg-detail-title">
            欢迎语内容
          </div>
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
import {
  SCREENING_GENDER_TYPE,
  SOURCE, GENDER, AND, OR, ADD_WAY_MAP, ALL_GENGER, ALL_SOURCE
} from '@/utils/constant/index';
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
    return {
      SOURCE, GENDER, AND, OR
    };
  },
  computed: {
    weMsgTlpFilterRules() {
      if (!this.item.weMsgTlpFilterRules?.length) {
        return this.dealFilterItem([{
          filterType: 0, // 选项
          filterCondition: true, // 判断
          filterValue: null // 结果
        }]);
      }
      return this.dealFilterItem(this.item.weMsgTlpFilterRules);
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    },
    getFilterValue(item) {
      if (item.filterType !== SOURCE) {
        return { ...SCREENING_GENDER_TYPE, [ALL_GENGER]: '所有性别' }[item.filterValue] || '所有性别';
      } else {
        return { ...ADD_WAY_MAP, [ALL_SOURCE]: '所有来源' }[item.filterValue] || '所有来源';
      }
    },
    /**
     * 处理客户范围条件
     */
    dealFilterItem(item) {
      const newArr = [];
      item.forEach((obj, index) => {
        if (index) {
          newArr.push(
            { type: 'multiFilterAssociation' }
          );
        }
        for (const key in obj) {
          if (['filterType', 'filterCondition', 'filterValue'].includes(key)) {
            newArr.push(
              {
                [key]: obj[key],
                type: key,
                // 当key为filterValue的时候需要判断是来源还是性别 将filterType添加到对象中进行判断
                ...(key === 'filterValue' && { filterType: obj['filterType'] })
              }
            );
          }
        }
      });
      return newArr;
    },
    /**
     * 获取显示的值
     */
    getLabel(ruleItem) {
      switch (ruleItem.type) {
        case 'filterType':
          return ruleItem.filterType === SOURCE ? '来源' : '性别';
        case 'filterValue':
          return this.getFilterValue(ruleItem);
        case 'filterCondition':
          return ruleItem.filterCondition ? '是' : '不是';
        case 'multiFilterAssociation': {
          return `，${this.item.multiFilterAssociation ? '且' : '或'}`;
        }
      }
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
          margin-left: 15px;
        }
        .welcome-msg-detail-title {
          color: #101010;
          border-left: 3px solid #6BB4AB;
          padding-left: 15px;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        /deep/ .welcome-msg-title {
            font-size: 16px;
            color: $black;
            margin-bottom: 10px;
        }
        /deep/ .default-msg-info {
            color: #666666;
        }
        .special-welcome-div {
          margin-left: 15px;
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
    .filter {
      flex-wrap: wrap;
      .filter-item {
        padding: 0 5px;
        border-radius: 4px;
        height: 28px;
        color: #606266;
        background-color: #FFFFFF;
        border: 1px solid #DCDFE6;
      }
    }
}
</style>
