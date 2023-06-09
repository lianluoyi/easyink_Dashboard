<!--
 * @Description: 客户范围
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <el-alert
      :style="'width: 408px;margin-top:0;'"
      title="同时满足以下条件的客户执行SOP规则"
      type="warning"
      :closable="false"
    />
    <el-form-item label="性别" label-width="68px" style="padding: 10px 0">
      <el-radio-group v-model="customerInfo.gender">
        <el-radio :label="GENDER_TYPE['allGender']">全部</el-radio>
        <el-radio :label="GENDER_TYPE['male']">男性</el-radio>
        <el-radio :label="GENDER_TYPE['feMale']">女性</el-radio>
        <el-radio :label="GENDER_TYPE['unKnown']">未知性别</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="客户标签" label-width="68px" style="padding: 10px 0">
      <el-button icon="el-icon-plus" @click="openAddTag">添加标签</el-button>
      <el-tag
        v-for="(unit, unique) in customerInfo.tagList"
        :key="unique"
        type="info"
        closable
        @close="deleteOneSelectTag('tag', unit)"
      >{{ unit.name }}</el-tag>
    </el-form-item>
    <el-form-item label="添加时间" label-width="68px" style="padding: 10px 0">
      <el-date-picker
        v-model="customerInfo.addTime"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 320px"
        value-format="yyyy-MM-dd"
      />
    </el-form-item>
    <el-form-item v-if="sopType === SOP_TYPE['activity']" label="所属员工" label-width="68px" style="padding: 10px 0">
      <el-button icon="el-icon-plus" @click="dialogVisibleSelectUser = true">{{
        customerInfo.useStaff.length === 0 ? '添加成员' : '修改成员'
      }}</el-button>
      <el-tag v-for="(item, index) in customerInfo.useStaff" :key="index" class="user-tag iaic">
        <TagUserShow :show-icon="!item.userId" :name="item.name" />
      </el-tag>
    </el-form-item>
    <el-form-item label="其他属性" label-width="68px" style="padding: 10px 0">
      <div class="flex customer-property-list">
        <div
          v-for="(propertyItem, propertyIndex) in customerInfo.customPropertyList"
          :key="propertyIndex"
          class="mr10 mb10"
        >
          <BasePropertyItem
            v-if="propertyItem.name === '出生日期'"
            :item="propertyItem"
            :list.sync="customerInfo.customPropertyList"
            :index="propertyIndex"
            :edit-status="true"
            :is-customer-scoped="true"
          />
          <CustomPropertyItem
            v-else
            :item="propertyItem"
            :list.sync="customerInfo.customPropertyList"
            :index="propertyIndex"
            :edit-status="true"
            :select-single-radio="true"
            :is-customer-scoped="true"
          />
        </div>
      </div>
      <div class="add-other-property" @click="selectPropertyVisible = true"><i class="el-icon-plus" /></div>
    </el-form-item>
    <el-form-item label="过滤标签" label-width="68px" style="padding: 10px 0 0">
      <el-button icon="el-icon-plus" @click="openFilterTag">添加标签</el-button>
      <el-tag
        v-for="(unit, unique) in customerInfo.filterTagList"
        :key="unique"
        type="info"
        closable
        @close="deleteOneSelectTag('filter', unit)"
      >{{ unit.name }}</el-tag>
      <div class="range-item-tip">若客户包含过滤标签，则不会收到本次消息</div>
    </el-form-item>
    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      title="选择标签"
      type="search"
      info-msg="筛选出被打上选中标签的客户，执行SOP"
      :selected="tagType === 'filter' ? customerInfo.filterTagList : customerInfo.tagList"
      tag-type="customer"
      @success="submitSelectTag"
    />
    <!-- 选择使用员工弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择使用员工"
      :is-only-leaf="false"
      :selected-user-list="customerInfo.useStaff"
      @success="selectedUser"
    />
    <SelectProperty :visible.sync="selectPropertyVisible" :selected-value="customerInfo.customPropertyList" @submit="handleSelectProperty" />
  </div>
</template>

<script>
import SelectUser from '@/components/SelectUser/index.vue';
import CustomPropertyItem from '@/views/customerManage/components/customPropertyItem.vue';
import BasePropertyItem from '@/views/customerManage/components/basePropertyItem.vue';
import { groupByScopeType, checkChange } from '@/utils/common';
import { SOP_TYPE, GENDER_TYPE_OF_ALL, GENDER_OF_MALE, GENDER_OF_FEMALE, GENDER_TYPE_OF_UNKNOWN } from '@/utils/constant';
import TagUserShow from '@/components/TagUserShow';
import SelectProperty from './SelectProperty.vue';
import SelectTag from '@/components/SelectTag';
import { cloneDeep } from 'lodash';
// 性别类型
const GENDER_TYPE = {
  allGender: GENDER_TYPE_OF_ALL,
  male: GENDER_OF_MALE,
  feMale: GENDER_OF_FEMALE,
  unKnown: GENDER_TYPE_OF_UNKNOWN
};

export default {
  components: {
    CustomPropertyItem,
    BasePropertyItem,
    TagUserShow,
    SelectProperty,
    SelectTag,
    SelectUser
  },
  props: {
    customerScopeInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      GENDER_TYPE: Object.freeze(GENDER_TYPE),
      SOP_TYPE: Object.freeze(SOP_TYPE),
      dialogVisibleSelectTag: false,
      // 过滤标签
      dialogVisibleSelectUser: false,
      // 是否显示自定义属性弹窗
      selectPropertyVisible: false,
      // 当前选择的标签类型
      tagType: 'tag',
      customerInfo: {
        gender: null,
        tagList: [], // 客户标签
        // 添加时间:
        addTime: [],
        // 使用员工
        useEmployeesList: [],
        // 使用部门
        useDepartmentList: [],
        // 客户自定义属性
        customPropertyList: [],
        // 过滤标签
        filterTagList: [],
        useStaff: []
      },
      sopType: null
    };
  },
  watch: {
    customerInfo: {
      handler(val) {
        this.$emit('updateCustomerScopeInfo', val);
      },
      deep: true
    }
  },
  created() {
    const routerQuery = this.$route.query;
    this.customerInfo = { ...this.customerInfo, ...this.customerScopeInfo };
    this.sopType = Number(routerQuery.sopType);
    if (Number(routerQuery.sopType) !== SOP_TYPE['activity']) {
      this.customerInfo.gender = GENDER_TYPE['allGender'];
    }
  },
  beforeUpdate() {
    checkChange(this.$options.data().customerInfo, this.customerInfo);
  },
  methods: {
    openAddTag() {
      this.dialogVisibleSelectTag = true;
      this.tagType = 'tag';
    },
    openFilterTag() {
      this.dialogVisibleSelectTag = true;
      this.tagType = 'filter';
    },
    /**
     * 删除标签
     * @param tag 删除的对应标签
     */
    deleteOneSelectTag(type, tag) {
      const tags = type === 'filter' ? [...this.customerInfo.filterTagList] : [...this.customerInfo.tagList];
      const index = tags.findIndex((tag_) => tag_.tagId === tag.tagId);
      tags.splice(index, 1);
      this.customerInfo[type === 'filter' ? 'filterTagList' : 'tagList'] = tags;
    },
    // 选择添加人确认按钮
    selectedUser(users) {
      this.customerInfo.useStaff = users;
      const groupByList = groupByScopeType(users);
      this.customerInfo.useEmployeesList = groupByList.useEmployeesList;
      this.customerInfo.useDepartmentList = groupByList.useDepartmentList;
    },
    handleSelectProperty(list) {
      const newList = cloneDeep(list).map((item) => {
      // 判断当前是否有已选择的属性
        const customerPropertyItem = this.customerInfo.customPropertyList.find(o => o.id === item.id);
        if (customerPropertyItem) {
          return customerPropertyItem;
        }
        return item;
      });
      this.customerInfo.customPropertyList = newList;
    },
    // 选择标签确认按钮
    submitSelectTag(data) {
      this.customerInfo[this.tagType === 'filter' ? 'filterTagList' : 'tagList'] = data;
      this.dialogVisibleSelectTag = false;
    }
  }
};
</script>

<style scoped lang="scss">
 .form-range-area {
    border: 1px solid #d9d9d9;
    padding: 10px;
    width: 430px;
    .el-button {
      margin-right: 10px;
      height: 28px;
      padding: 0 15px;
    }
    .el-form-item {
      align-items: center;
    }
    .add-other-property {
      border: 1px dashed rgba(217, 217, 217, 100);
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .customer-property-list {
      flex-wrap: wrap;
    }
    .range-item-tip {
      color: $grayColor;
    }
  }
</style>
