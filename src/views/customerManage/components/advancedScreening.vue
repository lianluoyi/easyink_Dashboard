<template>
  <el-drawer
    class="advancedScreening-drawer"
    title="高级筛选"
    :visible.sync="Pvisible"
    :size="780"
    append-to-body
  >
    <el-form ref="elForm" :inline="true" label-position="top" class="drawer-container">
      <el-form-item v-for="(formItem,index) in formItemData" :key="index" :label="formItem.label" prop="name">
        <el-input v-if="formItem.type === CUSTOMER_PROPERTY_VALUE['singleText']" v-model="formItem.value" :placeholder="formItem.placeholder" clearable />
        <el-select v-if="formItem.type === CUSTOMER_PROPERTY_VALUE['selectSingle']" v-model="formItem.value" :multiple="formItem.multiple" :placeholder="formItem.placeholder" clearable>
          <el-option
            v-for="selectOptionsItem in formItem.options"
            :key="selectOptionsItem.value"
            :label="selectOptionsItem.label"
            :value="selectOptionsItem.value"
          />
        </el-select>
        <el-date-picker
          v-if="formItem.type === CUSTOMER_PROPERTY_VALUE['dateField']"
          v-model="formItem.value"
          :picker-options="formItem.customDateField ? customPickerOptions : pickerOptions(formItem)"
          :value-format="formItem.field === 'addTime' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm'"
          :type="formItem.field === 'addTime' ? 'daterange' : 'datetimerange'"
          :default-time="formItem.field === 'addTime' ? [] : ['00:00:00', '23:59:59']"
          :format="formItem.field === 'addTime'? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm'"
          align="right"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <div v-if="formItem.type === SELECT_USER_TYPE">
          <div class="tag-input" @click="dialogVisibleSelectUser = true">
            <span v-if="!queryUser.length" class="tag-place">{{ formItem.placeholder }}</span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in queryUser"
                :key="unique"
                type="info"
              >{{ unit.name }}</el-tag>
            </template>
          </div>
        </div>
        <div v-if="formItem.type === SELECT_TAG_TYPE">
          <div class="tag-input" @click="showTagDialog">
            <span v-if="!queryTag.length" class="tag-place">{{ formItem.placeholder }}</span>
            <template v-else>
              <el-tag
                v-for="(unit, unique) in queryTag"
                :key="unique"
                type="info"
                closable
                @close="deleteTag(unit)"
              >{{ unit.tagName || unit.name }}</el-tag>
            </template>
          </div>
        </div>
      </el-form-item>
      <div class="drawer-footer">
        <el-button @click="reset()">重 置</el-button>
        <el-button type="primary" @click="search()">查 询</el-button>
      </div>
    </el-form>
    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      :selected="selectedTagList"
      :is-show-add="true"
      type="search"
      info-msg="通过新客进群任务的活码添加员工的客户，将被自动打上选中的标签"
      @success="submitSelectTag"
    />
    <!-- 选择添加人弹窗 -->
    <SelectUser
      :visible.sync="dialogVisibleSelectUser"
      title="选择添加人"
      :selected-user-list="queryUser"
      @success="selectedUser"
    />
  </el-drawer>
</template>

<script>
import { SCREENING_GENDER_TYPE, SCREENING_ADD_WAY_MAP, CUSTOMER_PROPERTY_VALUE, CUSTOMER_STATUS, COMMON_TYPE, LOSS_TYPE, TRANSFER_TYPE, TO_INHERIT_TYPE, ALL_TYPE, GENDER_TYPE_OF_UNKNOWN, GENDER_OF_FEMALE, GENDER_OF_MALE } from '@/utils/constant';
import SelectUser from '@/components/SelectUser/index.vue';
import SelectTag from '@/components/SelectTag';
import { findIndex } from 'lodash';
import moment from 'moment';
const SELECT_USER_TYPE = 11;
const SELECT_TAG_TYPE = 12;
/** 客户自定义中系统字段名*/
const SYS_FIELD_NAME = {
  'birthday': '出生日期',
  'remarkMobiles': '电话',
  'email': '邮箱',
  'address': '地址',
  'description': '描述'
};

/** 后端查询参数 客户自定义中的系统字段 */
const SYS_FIELD = {
  '出生日期': 'birthday',
  '电话': 'phone',
  '邮箱': 'email',
  '地址': 'address',
  '描述': 'desc'
};

export default {
  components: { SelectUser, SelectTag },
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false
    },
    // 当前修改的搜索条件
    searchValue: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      SELECT_USER_TYPE,
      SELECT_TAG_TYPE,
      CUSTOMER_PROPERTY_VALUE,
      // 自定义日期不限制日期选择
      customPickerOptions: {
        disabledDate() {
          return false;
        }
      },
      formItemData: [
        { field: 'name', baseField: true, label: '客户名称/备注', value: undefined, placeholder: '请输入客户名称/备注', type: CUSTOMER_PROPERTY_VALUE['singleText'] },
        { field: 'status', baseField: true, label: '客户状态', value: undefined, placeholder: '请选择客户状态', type: CUSTOMER_PROPERTY_VALUE['selectSingle'],
          options: [{
            label: CUSTOMER_STATUS[ALL_TYPE],
            value: ALL_TYPE
          }, {
            label: CUSTOMER_STATUS[COMMON_TYPE],
            value: COMMON_TYPE
          }, {
            label: CUSTOMER_STATUS[LOSS_TYPE],
            value: LOSS_TYPE
          }, {
            label: CUSTOMER_STATUS[TRANSFER_TYPE],
            value: TRANSFER_TYPE
          }, {
            label: CUSTOMER_STATUS[TO_INHERIT_TYPE],
            value: TO_INHERIT_TYPE
          }]
        },
        { field: 'userIds', baseField: true, label: '所属员工', value: [], type: SELECT_USER_TYPE, placeholder: '请选择员工' },
        { field: 'addTime', baseField: true, label: '添加时间', value: undefined, type: CUSTOMER_PROPERTY_VALUE['dateField'] },
        { field: 'tagIds', baseField: true, label: '客户标签', value: [], type: SELECT_TAG_TYPE, placeholder: '请选择标签' },
        { field: 'corpFullName', label: '企业名称', value: undefined, placeholder: '请输入企业名称', type: CUSTOMER_PROPERTY_VALUE['singleText'] },
        { field: 'addWay', multiple: true, label: '来源', value: undefined, placeholder: '请选择来源', type: CUSTOMER_PROPERTY_VALUE['selectSingle'],
          options: this.getSourceLabel()
        },
        { field: 'gender', multiple: true, label: '性别', value: undefined, placeholder: '请选择性别', type: CUSTOMER_PROPERTY_VALUE['selectSingle'],
          options: [{
            label: SCREENING_GENDER_TYPE[GENDER_TYPE_OF_UNKNOWN],
            value: GENDER_TYPE_OF_UNKNOWN
          }, {
            label: SCREENING_GENDER_TYPE[GENDER_OF_MALE],
            value: GENDER_OF_MALE
          }, {
            label: SCREENING_GENDER_TYPE[GENDER_OF_FEMALE],
            value: GENDER_OF_FEMALE
          }]
        }
      ],
      // 选择员工弹窗
      dialogVisibleSelectUser: false,
      // 选择标签弹窗
      dialogVisibleSelectTag: false,
      queryUser: [],
      queryTag: [],
      selectedTagList: []
    };
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    searchValue: {
      handler(val) {
        this.dealInit(val);
      },
      deep: true
    },
    visible(val) {
      if (val) {
        this.reset();
        this.dealInit(this.searchValue);
      }
    }
  },
  mounted() {
    this.getPropertyList();
  },
  methods: {
    pickerOptions(item) {
      return {
        disabledDate(date) {
          if (item.field === 'addTime') {
            return date.getTime() > Date.now();
          }
          // 禁用今天之前的日期 但是当前天可以选择
          return date.getTime() > new Date(moment(new Date()).format('YYYY-MM-DD 23:59:59')).getTime();
        }
      };
    },
    /**
     * @description 处理在弹窗外选择的值
     */
    dealInit(data) {
      data.forEach(item => {
        const formIndex = findIndex(this.formItemData, (o) => { return o.field === item.field; });
        if (formIndex !== -1) {
          if (item.field === 'userIds') {
            this.queryUser = item.value;
          }
          if (item.field === 'tagIds') {
            this.queryTag = item.value;
          }
          this.$set(this.formItemData[formIndex], 'value', item.value);
        }
      });
    },
    /**
     * 获取客户自定义字段
     */
    getPropertyList() {
      if (!this.$store.state.customerProperty.customerProperList || this.$store.state.customerProperty.customerProperList.length === 0) {
        this.$store.dispatch('GetCustomerProperty').then(e => {
          this.dealShowList(this.$store.state.customerProperty.customerProperList);
        });
      } else {
        this.dealShowList(this.$store.state.customerProperty.customerProperList);
      }
    },
    /**
     * @description 处理客户设置字段中显示的字段
     */
    dealShowList(list = this.$store.state.customerProperty.customerProperList) {
      // 过滤未启用的以及不是 单选 多选 下拉框 单行文本 多行文本
      const FILTER_TYPE = [
        CUSTOMER_PROPERTY_VALUE['singleText'],
        CUSTOMER_PROPERTY_VALUE['mulText'],
        CUSTOMER_PROPERTY_VALUE['singleRadio'],
        CUSTOMER_PROPERTY_VALUE['mulRadio'],
        CUSTOMER_PROPERTY_VALUE['selectSingle'],
        CUSTOMER_PROPERTY_VALUE['dateField'],
        CUSTOMER_PROPERTY_VALUE['sysField']
      ];
      const newList = list.filter((item) => item.status && FILTER_TYPE.includes(item.type)).map((arg) => {
        // 出生日期
        if (arg.name === SYS_FIELD_NAME['birthday'] && arg.type === CUSTOMER_PROPERTY_VALUE['sysField']) {
          return {
            field: SYS_FIELD[arg.name], label: arg.name, value: undefined, type: CUSTOMER_PROPERTY_VALUE['dateField']
          };
        }

        // 电话 邮箱 地址 描述
        if ([SYS_FIELD_NAME['address'], SYS_FIELD_NAME['description'], SYS_FIELD_NAME['email'], SYS_FIELD_NAME['remarkMobiles']].includes(arg.name) && arg.type === CUSTOMER_PROPERTY_VALUE['sysField']) {
          return {
            field: SYS_FIELD[arg.name], label: arg.name, value: undefined, placeholder: '请输入' + arg.name, type: CUSTOMER_PROPERTY_VALUE['singleText']
          };
        }

        // 单选 多选 下拉框
        if ([CUSTOMER_PROPERTY_VALUE['singleRadio'], CUSTOMER_PROPERTY_VALUE['mulRadio'], CUSTOMER_PROPERTY_VALUE['selectSingle']].includes(arg.type)) {
          return {
            field: arg.id, label: arg.name, multiple: true, value: undefined, placeholder: '请选择' + arg.name, type: CUSTOMER_PROPERTY_VALUE['selectSingle'],
            options: arg.optionList.map((argItem) => {
              return {
                value: argItem.id,
                label: argItem.multipleValue
              };
            })
          };
        }
        // 单行文本 多行文本
        if (arg.type === CUSTOMER_PROPERTY_VALUE['mulText'] || arg.type === CUSTOMER_PROPERTY_VALUE['singleText']) {
          return {
            field: arg.id, label: arg.name, value: undefined, placeholder: '请输入' + arg.name, type: CUSTOMER_PROPERTY_VALUE['singleText']
          };
        }

        if (arg.type === CUSTOMER_PROPERTY_VALUE['dateField']) {
          return {
            field: arg.id, customDateField: true, label: arg.name, value: undefined, type: CUSTOMER_PROPERTY_VALUE['dateField']
          };
        }
      });
      this.formItemData = [...this.formItemData, ...newList];
    },
    /**
     * @description 获取来源选项
     */
    getSourceLabel() {
      const newArr = [];
      // SCREENING_ADD_WAY_TYPE, SCREENING_ADD_WAY_MAP
      Object.keys(SCREENING_ADD_WAY_MAP).forEach(key => {
        newArr.push({
          value: key,
          label: SCREENING_ADD_WAY_MAP[key]
        });
      });
      return newArr;
    },

    showTagDialog() {
      this.selectedTagList = [...this.queryTag];
      this.dialogVisibleSelectTag = true;
    },

    /**
     * @description 删除标签
     */
    deleteTag(tag) {
      const index = this.queryTag.findIndex(tag_ => tag_.tagId === tag.tagId);
      this.queryTag.splice(index, 1);
    },

    /**
     * @description 选择用户
     */
    selectedUser(list) {
      this.queryUser = list;
    },

    /**
     * @description 选择标签
     */
    submitSelectTag(selectTag) {
      this.dialogVisibleSelectTag = false;
      this.queryTag = selectTag.map((tag) => {
        return {
          tagId: tag.tagId,
          tagName: tag.name || tag.tagName
        };
      });
    },

    /**
     * @description 查询
     */
    search() {
      this.Pvisible = false;
      // 处理高级筛选选择的条件
      this.$emit('searchByAdvanced', this.dealBaseField(), this.dealSystemAndSetField());
    },

    /**
     * @description 处理基础字段
     */
    dealBaseField() {
      return this.formItemData.filter((item) => item.baseField).map(item => {
        if (item.type === SELECT_USER_TYPE) {
          item.value = this.queryUser;
        }
        if (item.type === SELECT_TAG_TYPE) {
          item.value = this.queryTag;
        }
        return item;
      });
    },

    /**
     * @description 处理系统字段和客户设置字段
     */
    dealSystemAndSetField() {
      // 第一次过滤掉baseField字段的 第二次过滤没有选择答案的字段
      return this.formItemData.filter((item) => !item.baseField).filter((arg) => {
        // 除去系统字段(性别)的多选框
        if (arg.type === CUSTOMER_PROPERTY_VALUE['selectSingle']) {
          return arg.value !== undefined && arg.value.length;
        } else {
          return arg.value !== undefined && arg.value !== '' && arg.value !== null;
        }
      });
    },

    /**
     * @description 重置
     */
    reset() {
      this.queryUser = [];
      this.queryTag = [];
      this.formItemData = this.formItemData.map((item) => {
        return {
          ...item,
          value: undefined
        };
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.advancedScreening-drawer {
  /deep/ .el-drawer__header {
    margin-bottom: 22px;
  }
  /deep/ .el-form-item:hover{
    background: none;
  }
  /deep/ .el-input {
    width: 225px !important;
  }
  /deep/  .el-date-editor {
    width: 225px !important;
  }
  /deep/ .el-form--label-top .el-form-item__label {
    padding: 0;
  }
  .drawer-container {
    max-width: 780px;
    padding-left: 10px;
    padding-right: 20px;
  }
  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }
  .tag-input {
    width: 225px;
  }
}
</style>
