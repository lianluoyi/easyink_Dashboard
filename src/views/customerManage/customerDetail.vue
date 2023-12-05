<script>
import { updateCustomerDetail, getDetail, getEmployeesList } from '@/api/customer';
import { ADD_WAY_MAP, CUSTOMER_PROPERTY_VALUE, GENDER_TYPE, WX_TYPE, ADD_BY_CHANNEL, CUSTOMER_DETAIL } from '@/utils/constant/index';
import ReturnPage from '@/components/ReturnPage.vue';
import { dealShowText, initGetCustomerProper, dealAtInfo } from '@/utils/common';
import BasePropertyItem from './components/basePropertyItem.vue';
import CustomPropertyItem from './components/customPropertyItem.vue';
import moment from 'moment';
import SelectTag from '@/components/SelectTag';
import { deepClone } from '@/utils/index';
import { isEqual } from 'lodash';
import CustomerOrGroupInfo from './components/CustomerOrGroupInfo.vue';
const fieldObj = {
  '出生日期': 'birthday',
  '邮箱': 'email',
  '地址': 'address',
  '描述': 'description',
  '电话': 'remarkMobiles'
};
export default {
  // name: 'CustomerDetail',
  components: { ReturnPage, BasePropertyItem, CustomPropertyItem, SelectTag, CustomerOrGroupInfo },
  data() {
    return {
      datePickerVisible: false,
      customer: {},
      remarkMobiles: '',
      description: '',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      addWayMap: ADD_WAY_MAP,
      CUSTOMER_PROPERTY_VALUE,
      // 是否为编辑状态
      editStatus: false,
      // 旧标签
      oldTags: [],
      // 基本信息字段
      baseList: [],
      // 自定义信息字段
      customList: [],
      // 是否显示选择标签弹窗
      dialogVisible: false,
      tagDialogLoading: false,
      // 已被选择的标签
      selectedTag: [],
      oldCustomList: [],
      oldBaseList: [],
      // 员工列表
      employeesList: [],
      // 添加的员工数量
      addEmployeesTotal: 0,
      // tab栏绑定的员工ID
      employeesId: this.$route.query.userId,
      wxType: WX_TYPE,
      ADD_BY_CHANNEL,
      // 是否有数据权限编辑客户信息
      permission: true,
      activeTabName: CUSTOMER_DETAIL['customerInfo'],
      CUSTOMER_DETAIL
    };
  },
  computed: {
    // 系统字段
    sysPropertyList() {
      let list = [...this.$store.state.customerProperty.customerProperList];
      list = list.filter(item => {
        return item.type === CUSTOMER_PROPERTY_VALUE['sysField'];
      });
      const extraList = [{ id: 'remark', name: '备注' },
        { id: 'gender', name: '性别' },
        { id: 'tag', name: '标签' }];
      if (list.find(listItem => listItem.name === '出生日期')) extraList.push({ id: 'age', name: '年龄' });
      list = [...extraList,
        ...list];
      return list;
    },
    // 自定义字段
    baseCustomPropertyList() {
      let list = [...this.$store.state.customerProperty.customerProperList];
      list = list.filter(item => item.type !== CUSTOMER_PROPERTY_VALUE['sysField']);
      return list;
    },
    // 所有自定义字段和系统字段
    customPropertyList() {
      return [...this.$store.state.customerProperty.customerProperList];
    }
  },
  watch: {
    // 监听sysPropertyList异步请求是否有结果
    sysPropertyList() {
      if (this.employeesList.length) {
        this.getDetail();
      }
    },
    // 监听employeesId的改变
    employeesId() {
      if (this.employeesList.length) {
        this.getDetail();
      }
    }
  },
  created() {
    initGetCustomerProper(this.$store);
    this.getEmployeesList();
    // 在该数组下的路径不显示编辑按钮
    const blackPathName = ['conversionCodeDetail', 'customerClickRecord', 'channelClickRecord'];
    if (blackPathName.includes(this.$route.query.prePageType)) {
      this.permission = false;
    }
  },
  // 在这里单独写是因为监听不到改变
  beforeRouteLeave(to, from, next) {
    if (isEqual(this.oldBaseList, this.baseList) && isEqual(this.oldCustomList, this.customList)) {
      next();
    } else {
      this.$confirm('离开后，当前页面更改内容不会保存，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        next();
      }).catch(() => {
        next(false);
      });
    }
  },
  methods: {
    getEmployeesList() {
      getEmployeesList(this.$route.query.id).then((res) => {
        const { data } = res;
        if (data.length !== 0) {
          this.addEmployeesTotal = data.length;
          // 获取列表中相同的员工
          const dropNum = data.map(item => item.userId).indexOf(this.$route.query.userId);
          // 获取员工信息
          const dropObj = data[dropNum];
          this.employeesList = data;
          if (dropObj) {
            // 删除员工
            data.splice(dropNum, 1);
            // 将员工添加到首位
            this.employeesList.unshift(dropObj);
          }
          this.employeesId = this.employeesList[0].userId;
        } else {
          this.employeesList.push({
            userId: this.$route.query.userId,
            userName: this.$route.query.userName
          });
        }
        this.employeesId = this.employeesList[0].userId;
        this.getDetail();
      });
    },
    updateCustomer(params, callback) {
      const data = {
        externalUserid: this.customer.externalUserid,
        userId: this.customer.userId,
        ...params
      };
      updateCustomerDetail(data).then((response) => {
        this.msgSuccess('操作成功');
        this.getDetail(callback);
      });
    },
    getDetail(callback) {
      const routerQuery = this.$route.query;
      let params = {
        dimissionTime: routerQuery.dimissionTime
      };
      if (routerQuery.prePageType) {
        switch (routerQuery.prePageType) {
          case 'lossRemind': {
            params = {
              ...params,
              perms: 'customerManage:lossRemind:view'
            };
            break;
          }
          case 'customer': {
            params = {
              ...params,
              perms: 'customerManage:customer:view'
            };
            break;
          }
          default: break;
        }
      }
      getDetail(routerQuery.id, this.employeesId, params).then(({ data }) => {
        this.customer = data[0];
        this.remarkMobiles = this.customer.remarkMobiles;
        this.description = this.customer.description;
        this.dealPropertyList(this.customer);
        this.setTagList();
        callback && callback();
      });
    },
    setTagList() {
      const tagList = [];
      this.customer?.weFlowerCustomerTagRels.map(item => {
        tagList.push({ ...item, name: item.tagName });
      });
      this.selectedTag = tagList;
      this.oldTags = tagList;
    },

    /**
     * 处理所有字段列表数据
     */
    dealPropertyList(customerInfo) {
      const baseList = [];
      const customList = [];
      this.sysPropertyList.map(sysItem => {
        const newItem = { ...sysItem };
        switch (sysItem.id) {
          case 'remark': {
            newItem.value = customerInfo.remark;
            break;
          }
          case 'gender': {
            newItem.value = GENDER_TYPE[customerInfo.gender] || '未知';
            newItem.optionValue = customerInfo.gender;
            break;
          }
          case 'tag': {
            newItem.value = customerInfo?.weFlowerCustomerTagRels;
            break;
          }
        }
        switch (sysItem.name) {
          case '年龄': {
            const day = moment().diff(moment(customerInfo.birthday), 'years');
            newItem.value = day || '';
            break;
          }
          case '出生日期': {
            newItem.value = customerInfo.birthday;
            break;
          }
          case '邮箱': {
            newItem.value = customerInfo?.email;
            break;
          }
          case '地址': {
            newItem.value = customerInfo?.address;
            break;
          }
          case '电话': {
            newItem.value = customerInfo.remarkMobiles;
            break;
          }
          case '描述': {
            newItem.value = customerInfo.description;
            break;
          }
        }
        baseList.push(newItem);
      });
      this.oldBaseList = deepClone(baseList);
      this.baseList = [...baseList];
      // 处理自定义字段显示内容
      this.baseCustomPropertyList.map(customItem => {
        let newItem = { ...customItem };
        if ([CUSTOMER_PROPERTY_VALUE['singleText'],
          CUSTOMER_PROPERTY_VALUE['mulText'],
          CUSTOMER_PROPERTY_VALUE['dateField']
        ].includes(customItem.type)) {
          newItem.value = this.dealShowText(customItem, customerInfo, 'textType')?.value;
        }
        if ([CUSTOMER_PROPERTY_VALUE['singleRadio'],
          CUSTOMER_PROPERTY_VALUE['selectSingle']
        ].includes(customItem.type)) {
          const dealObj = this.dealShowText(customItem, customerInfo, 'singleType');
          newItem = {
            ...newItem,
            optionList: customItem.optionList,
            optionValue: null,
            ...dealObj
          };
        }
        if ([CUSTOMER_PROPERTY_VALUE['mulRadio']].includes(customItem.type)) {
          const dealObj = this.dealShowText(customItem, customerInfo, 'mulType');
          newItem = {
            ...newItem,
            optionList: customItem.optionList,
            optionValue: [],
            ...dealObj
          };
        }
        if ([CUSTOMER_PROPERTY_VALUE['img'],
          CUSTOMER_PROPERTY_VALUE['file']].includes(customItem.type)) {
          const dealObj = this.dealShowText(customItem,
            customerInfo, customItem.type === CUSTOMER_PROPERTY_VALUE['img'] ? 'imgFile' : 'fileType');
          newItem = {
            ...newItem,
            ...dealObj
          };
        }
        customList.push(newItem);
      });
      this.oldCustomList = deepClone([...customList]);
      this.customList = [...customList];
    },
    /**
     * 处理自定义字段显示内容
     */
    dealShowText(colunmItem, row, type) {
      return dealShowText(colunmItem, row, type);
    },
    filterTag(oldlist, newlist) {
      const addList = [];
      const deleteList = [];
      newlist.forEach(item => {
        if (oldlist.findIndex(olditem => item.tagId === olditem.tagId) === -1) {
          addList.push(item);
        }
      });
      oldlist.forEach(item => {
        if (newlist.findIndex(newitem => item.tagId === newitem.tagId) === -1) {
          deleteList.push(item);
        }
      });

      return {
        addList,
        deleteList
      };
    },
    /**
     * 过滤出有更新的字段
     */
    filterDuplicateItem(list, oldList) {
      const newList = [];
      list.map(newItem => {
        let type = 'value';
        if ([CUSTOMER_PROPERTY_VALUE['mulRadio'],
          CUSTOMER_PROPERTY_VALUE['selectSingle'],
          CUSTOMER_PROPERTY_VALUE['singleRadio']].includes(newItem.type)) {
          type = 'optionValue';
        }
        const oldIndex = oldList.findIndex(oldItem => oldItem.id === newItem.id);
        if (oldIndex > -1 && !isEqual(newItem[type], oldList[oldIndex][type])) {
          newList.push(newItem);
        }
      });
      return newList;
    },
    /**
     * 确认修改
     */
    handleSubmit() {
      if (this.editStatus) {
        const allList = [...this.baseList, ...this.customList];
        const requiredIndex = allList.findIndex(item => {
          switch (item.type) {
            case CUSTOMER_PROPERTY_VALUE['img']:
            case CUSTOMER_PROPERTY_VALUE['file']: {
              return item.required && !item.value?.length;
            }
            case CUSTOMER_PROPERTY_VALUE['mulRadio']:
            case CUSTOMER_PROPERTY_VALUE['selectSingle']:
            case CUSTOMER_PROPERTY_VALUE['singleRadio']: {
              return item.required && !item?.optionValue?.length;
            }
            default: {
              return item.required && (!item.value && !item.optionValue);
            }
          }
        });
        if (requiredIndex > -1) {
          this.msgWarn(`请填写${allList[requiredIndex].name}`);
          return;
        }
        const params = {};

        const newBaseList = this.filterDuplicateItem(this.baseList, this.oldBaseList);
        newBaseList.map(item => {
          if (item.id === 'remark') params[item.id] = item.value || '';
          if (fieldObj[item.name]) {
            params[fieldObj[item.name]] = item.value || '';
          }
          if (item.id === 'tag') {
            const { addList, deleteList } = this.filterTag(this.oldTags, this.selectedTag);
            params.removeTags = deleteList;
            params.addTags = addList;
          }
        });
        const extendProperties = [];
        const newCustomList = this.filterDuplicateItem(this.customList, this.oldCustomList);
        newCustomList.map(item => {
          switch (item.type) {
            case CUSTOMER_PROPERTY_VALUE['mulRadio']: {
              if (item.optionValue.length === 0) {
                extendProperties.push({
                  extendPropertyId: item.id,
                  propertyValue: null
                });
                break;
              }
              item.optionValue.map(optionItem => {
                extendProperties.push({
                  extendPropertyId: item.id,
                  propertyValue: optionItem
                });
              });
              break;
            }
            case CUSTOMER_PROPERTY_VALUE['img']:
            case CUSTOMER_PROPERTY_VALUE['file']: {
              if (item.value.length === 0) {
                extendProperties.push({
                  extendPropertyId: item.id,
                  propertyValue: null
                });
                break;
              }
              item.value.map(optionItem => {
                extendProperties.push({
                  extendPropertyId: item.id,
                  propertyValue: item.type === CUSTOMER_PROPERTY_VALUE['file'] ? `{"name":"${optionItem.name}","url":"${optionItem.url}","content":"${optionItem.content}"}` : optionItem
                });
              });
              break;
            }
            case CUSTOMER_PROPERTY_VALUE['selectSingle']:
            case CUSTOMER_PROPERTY_VALUE['singleRadio']: {
              extendProperties.push({
                extendPropertyId: item.id,
                propertyValue: item.optionValue || null
              });
              break;
            }
            default: {
              extendProperties.push({
                extendPropertyId: item.id,
                propertyValue: item.value || ''
              });
              break;
            }
          }
        });
        if (extendProperties.length > 0) params['extendProperties'] = extendProperties;
        this.updateCustomer(params, this.editStatus = !this.editStatus);
      } else {
        this.editStatus = !this.editStatus;
      }
    },
    /**
     * 确认选择标签
     */
    submitSelectTag(tagList) {
      this.selectedTag = [...tagList];
      const newList = [...this.baseList];
      const baseItem = newList.find(item => item.id === 'tag');
      this.dialogVisible = false;
      if (baseItem) {
        const tagList = [];
        this.selectedTag.map(item => {
          tagList.push({ ...item, tagName: item.name });
        });

        baseItem.value = tagList;
        this.baseList = newList;
      }
    },
    /**
     * 处理 @微信 的字样
     */
    renderUserInfo(item, type) {
      return dealAtInfo(item, type);
    }
  }
};
</script>

<template>
  <div class="customer-detail-page">
    <ReturnPage />
    <div class="detail-div">
      <div class="customer-info-div employees-info">
        <div class="employees-tabs">
          <div class="employees">该客户已添加{{ employeesList.length }}个员工</div>
          <span class="icon-line" />
          <el-tabs v-model="employeesId">
            <el-tab-pane
              v-for="item in employeesList"
              :key="item.userId"
              :label="item.userName"
              :name="item.userId"
            />
          </el-tabs>
        </div>
        <div class="customer-info-div">
          <div class="avatar-div">
            <el-avatar :src="customer.avatar" />
          </div>
          <div class="customer-detail">
            <div class="customer-name">
              {{ customer.name }}
              <span :class="customer.type === wxType ? 'wx-type-flag' : 'corp-type-name'">
                {{ renderUserInfo(customer, 'type') }}
              </span>
              <span v-if="customer.type === wxType" class="corp-type-name">{{ customer.remarkCorpName }}</span>
            </div>
            <div class="customer-proper">
              <div class="proper-item-div">
                <div class="proper-item">
                  <span class="proper-name">添加时间：</span>
                  <span>{{ customer.createTime }}</span>
                </div>
                <div class="proper-item">
                  <span class="proper-name">所属员工：</span>
                  <span>{{ customer.userName }}</span>
                </div>
              </div>
              <div class="proper-item-div">
                <div class="proper-item">
                  <span class="proper-name">来源：</span>
                  <span>{{ addWayMap[customer.addWay] }}</span>
                  <span v-if="customer.addWay === ADD_BY_CHANNEL">“{{ customer.wechatChannel }}”添加</span>
                </div>
                <div class="proper-item">
                  <span class="proper-name">所属部门：</span>
                  <span>{{ customer.department }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="all-detail-div">
        <el-tabs v-model="activeTabName">
          <el-tab-pane label="客户资料" :name="CUSTOMER_DETAIL['customerInfo']" style="padding:20px;">
            <el-descriptions title="基本信息" direction="vertical" :column="4" border size="medium">
              <el-descriptions-item v-for="(baseItem, baseIndex) in baseList" :key="baseIndex" :label="baseItem.name" content-style="min-width: 100px">
                <template slot="label">
                  <span v-if="baseItem.required" class="required-mark">*</span>
                  {{ baseItem.name }}
                </template>
                <BasePropertyItem
                  :item="baseItem"
                  :list.sync="baseList"
                  :index="baseIndex"
                  :edit-status="editStatus"
                  :dialog-visible.sync="dialogVisible"
                />
              </el-descriptions-item>
            </el-descriptions>
            <el-descriptions
              title="自定义信息"
              direction="vertical"
              :column="4"
              border
              size="medium"
            >
              <el-descriptions-item
                v-for="(customItem, customIndex) in customList"
                :key="customIndex"
                :label="customItem.name"
              >
                <template slot="label">
                  <span v-if="customItem.required" class="required-mark">*</span>
                  {{ customItem.name }}
                </template>
                <CustomPropertyItem :item="customItem" :list.sync="customList" :index="customIndex" :edit-status="editStatus" />
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="信息动态" :name="CUSTOMER_DETAIL['informationDynamics']" />
          <el-tab-pane label="活动轨迹" :name="CUSTOMER_DETAIL['activityTrack']" />
          <el-tab-pane label="待办事项" :name="CUSTOMER_DETAIL['todo']" />
        </el-tabs>
        <CustomerOrGroupInfo
          v-if="activeTabName !== CUSTOMER_DETAIL['customerInfo']"
          :external-userid="$route.query.id"
          :active-tab="activeTabName"
          :user-id="employeesId"
        />
      </div>
      <div v-if="activeTabName === CUSTOMER_DETAIL['customerInfo']" class="bottom-tool">
        <el-button v-if="permission" type="primary" @click="handleSubmit">{{ editStatus ? '保存' : '编辑' }}</el-button>
      </div>
      <!-- 选择标签弹窗 -->
      <SelectTag
        ref="selectTag"
        :visible.sync="dialogVisible"
        title="客户标签"
        type="search"
        :selected="selectedTag"
        info-msg="请选择要为已勾选客户打上的标签"
        :loading="tagDialogLoading"
        :is-show-add="true"
        :is-mandatory="0"
        @success="submitSelectTag"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.employees-info {
  flex-direction:column;
  .employees-tabs {
    margin-bottom: 10px;
    width: 100%;
    display: flex;
    height: 36px;
    .employees {
      height:40px;
      line-height:40px;
      font-size:14px;
      color:#999999;
      overflow: hidden;
    }
    .icon-line {
      width: 1px;
      height: 18px;
      line-height: 18px;
      margin: 10px;
      border-right: 1px solid #D9D9D9;
    }
    /deep/.el-tabs {
      width: 80%;
      .el-tabs__nav-next, .el-tabs__nav-prev {
        line-height: 42px;
        margin-left: 4px;
        font-size: 14px;
        color:#999999;
      }
      .el-tabs__nav-scroll {
        margin: 0 14px;
      }
    }
  }
  /deep/ .el-tabs__item {
      font-size:14px;
      padding: 0 15px;
  }

  /deep/ .el-tabs__nav-wrap::after {
      display: none;
  }
  /deep/ .el-tabs__active-bar {
      transition: transform 0.1s cubic-bezier(0.645, 0.045, 0.355, 1), -webkit-transform 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
}

.info-wrap {
  margin-left: 20px;
  .info {
    color: #aaa;
    line-height: 32px;
  }
}

.el-card {
  display: inline-block;
  margin: 20px 20px 0 0;
  .el-row {
    color: #666;
    margin-bottom: 10px;
  }
  .el-col-12 {
    color: #333;
    >span {
    margin-right: 5px;
  }
  }
  .el-col-10 {
    color: #999;
    width: 70px;
    text-align-last: justify;
    margin-right: 10px!important;
  }
  .el-tag {
    margin-bottom: 5px;
  }
}
.el-icon-s-custom {
  font-size: 16px;
  margin-left: 4px;
  color: #999;
  &.man {
    color: #13a2e8;
  }
  &.woman {
    color: #f753b2;
  }
}
.info {
  height: 32px;
}
.customer-info-div {
  display: flex;
  background-color: #fff;
  padding: 10px 20px 20px;
  .avatar-div {
    margin-right: 15px;
    .el-avatar {
      width: 100px;
      height: 100px;
    }
  }
  .customer-detail {
    /deep/ .el-descriptions__body {
      .el-descriptions-row {
        // display: flex;
        .el-descriptions-item {
          margin-right: 58px;
        }
      }
    }
    .customer-name {
      font-size: 24px;
      color: $black;
      margin-bottom: 15px;
      span {
        font-size: 16px;
        margin-left: 10px;
      }
    }
    .customer-proper {
      display: flex;
      .proper-item-div {
        margin-right: 58px;
        .proper-item {
          margin-bottom: 10px;
          .proper-name {
            color: $grayColor;
          }
        }
      }
    }
  }
}
.customer-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  .detail-div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .all-detail-div {
    flex: 1;
    background-color: #fff;
    height: 100%;
    position: relative;
    /deep/ .el-tabs {
      .el-tabs__active-bar {
        margin-left: 5px;
      }
      .el-tabs__item {
        padding: 0 15px;
      }
      .el-tabs__nav {
        padding-left: 5px;
      }
      .el-tabs__header {
        margin: 0;
      }
    }
    margin-top: 15px;
    .el-descriptions {
      margin-bottom: 20px;
      /deep/ .el-descriptions__header {
        @include border_style($direction: left, $width: 3px);
        padding-left: 10px;
      }
    }
  }
  .bottom-tool {
    background-color: #fff;
    height: 48px;
    border: 1px solid rgba(238, 238, 238, 100);
    text-align: center;
    line-height: 48px;
    box-sizing: content-box;
  }
  .required-mark {
    color: $red;
  }

}
</style>
