<!--
 * @Description: 客户范围详情弹窗
 * @Author: wJiaaa
 * @LastEditors: chenchengjie
-->
<template>
  <el-dialog
    :visible="visible"
    width="500px"
    title="客户范围"
    custom-class="customer-scope-dialog"
    v-on="$listeners"
  >
    <div v-for="(item, index ) in customerDetail" :key="index">
      <div class="customer-scope-list">
        <div class="item-label">{{ item.label }}：</div>
        <div v-if="item.key === 'userInfoList'" class="user-item-value">
          <span v-for="(user, userIndex) in item.value" :key="userIndex">
            <TagUserShow :name="user.departmentName || user.userName" :show-icon="!user.userId" />
            <span v-show="userIndex !== item.value.length-1">、</span>
          </span>
        </div>
        <div v-else class="item-value">
          {{ item.value }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { initGetCustomerProper } from '@/utils/common';
import { GROUP_MESSAGE_GENDER_TYPE, ADD_WAY_MAP, ADD_WAY, CUSTOMER_PROPERTY_VALUE, SOP_TYPE, RELATION_TYPE } from '@/utils/constant/index';
import moment from 'moment';
import TagUserShow from '@/components/TagUserShow';

const TYPE_MAP = {
  [RELATION_TYPE.containsAll]: '包含全部',
  [RELATION_TYPE.containsAny]: '包含任一'
};
export default {
  components: {
    TagUserShow
  },
  props: {
    sopDetail: {
      type: Object,
      default: () => {}
    },
    // 添加标签显隐
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      customerDetail: []
    };
  },
  watch: {
    visible(val) {
      if (val && !this.customerDetail.length) {
        this.dealCustomerScopeInfo();
      }
    }
  },
  created() {
    const routerQuery = this.$route.query;
    const sopType = Number(routerQuery.sopType);
    if ([SOP_TYPE['activity'], SOP_TYPE['birthday'], SOP_TYPE['newCustomer']].includes(sopType)) {
      initGetCustomerProper(this.$store);
    }
  },
  methods: {
    dealCustomerScopeInfo() {
      // 定义每个字段的 label  value
      const { gender, userInfoList, departmentInfoList, tagList, filterTagList, startTime, endTime, columnList, includeTagMode, filterTagMode
      } = this.sopDetail.sopCustomerFilter;
      const matchList = [
        { key: 'userInfoList', label: '所属员工', value: [...(userInfoList || []), ...(departmentInfoList || [])] },
        { key: 'gender', label: '性别', value: GROUP_MESSAGE_GENDER_TYPE[gender] },
        { key: 'tagList', label: '客户标签', value: (tagList && tagList.length > 0) ? `【${TYPE_MAP[includeTagMode]}】 ${((tagList || []).map((item) => item.name)).join('、')}` : '' },
        { key: 'addTime', label: '添加时间', value: startTime && endTime ? moment(startTime).format('YYYY-MM-DD') + ' ~ ' + moment(endTime).format('YYYY-MM-DD') : undefined }
      ];
      this.customerDetail = matchList.filter((item) => Array.isArray(item.value) ? item.value.length : item.value);
      const newcolumnList = columnList.map((item) => {
        if (item.type === ADD_WAY) {
          return { label: '来源', value: ADD_WAY_MAP[item.propertyValue] };
        } else {
          const customPropertyObj = this.$store.state.customerProperty.customPropertyObj;
          const customPropertyItem = customPropertyObj[item.extendPropertyId];
          if (customPropertyItem.type === CUSTOMER_PROPERTY_VALUE['singleRadio'] || customPropertyItem.type === CUSTOMER_PROPERTY_VALUE['selectSingle']) {
            return {
              label: customPropertyItem.name,
              value: customPropertyItem.optionList.find(o => o.id === item.propertyValue)?.multipleValue
            };
          }
          if (customPropertyItem.type === CUSTOMER_PROPERTY_VALUE['dateField'] || customPropertyItem.name === '出生日期') {
            return {
              label: customPropertyItem.name,
              value: item.propertyValue?.replace(',', '~')
            };
          }
        }
      });
      this.customerDetail.push(...newcolumnList);
      // 判断是否有过滤标签
      if (filterTagList.length > 0) {
        const filterTagValue = `【${TYPE_MAP[filterTagMode]}】 ${((filterTagList || []).map((item) => item.name)).join('、')}`;
        this.customerDetail.push({ key: 'filterTagList', label: '过滤标签', value: filterTagValue });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .customer-scope-dialog {
  .el-dialog__body {
    max-height: 600px;
  }
}
.customer-scope-list {
  font-size: 14px;
  display: flex;
  color: #333;
  margin-bottom: 20px;
  align-items: center;
  .item-label {
    color: #909399;
    width: 98px;
    font-size: 14px;
    text-align: right;
    word-break: break-all;
  }
  .item-value {
    font-size: 14px;
    color: #101010;
    line-height: 20px;
    word-break: break-all;
    margin-left: 5px;
    flex: 1;
  }
  .user-item-value {
    @extend .item-value;
  }
}
</style>
