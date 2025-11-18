<template>
  <div>
    <el-cascader
      :key="cascaderKey"
      ref="cascaderRef"
      v-model="cascaderValue"
      :props="{
        value: 'fullname',
        label: 'fullname',
        checkStrictly: !isEdit,
        lazy: true,
        lazyLoad: loadDistricts,
      }"
      clearable
      placeholder="省、市、区/县、街道/镇"
      style="margin-right: 20px;"
      :style="{
        width
      }"
      @change="handleChange"
    />
    <SensitiveAutocomplete
      v-if="isEdit"
      v-model="formItem.value.detailAddress"
      :fetch-suggestions="querySearchAsync"
      :disabled="!cascaderValue.length"
      :maxlength="MAX_INPUT_LENGTH"
      placeholder="请输入详细地址"
      :auto-fetch="true"
      :api-params="{ encryptValue: formItem.value.detailAddressEncrypt }"
      :style="{
        width
      }"
      @select="handleSelect"
    >
      <template #suffix>
        <i
          v-if="formItem.value.detailAddress"
          class="el-icon-close"
          @click.stop="handleClear"
        />
      </template>
    </SensitiveAutocomplete>
    <el-input
      v-else
      v-model="formItem.detailValue"
      placeholder="请输入详细地址"
      clearable
      :style="{
        width
      }"
    />
  </div>
</template>

<script>
import { getSubDistrictList, getAddressByKeyword, getRegeocode } from '@/api/map';
import { MUNICIPAL, SPECIAL_REGION, NO_AREA_CITY } from '@/utils/constant';
import { Notification } from 'element-ui';
import SensitiveAutocomplete from '@/components/SensitiveAutocomplete/index.vue';
const PROVINCE_LEVEL = 1;
const CITY_LEVEL = 2;
const AREA_LEVEL = 3;
const STREET_LEVEL = 4;
const DISTRICT_ID_LENGTH = 6; // 省市区id的长度
/** 区划级别 */
const DISTRICT_LEVEL = {
  PROVINCE: PROVINCE_LEVEL,
  CITY: CITY_LEVEL,
  AREA: AREA_LEVEL,
  STREET: STREET_LEVEL
};
// 防抖延迟时间
const DEBOUNCE_DELAY = 500;
// 详细地址最大输入长度
const MAX_INPUT_LENGTH = 48;
// 台湾省区划编码开头
const TAIWAN_START_CODE = '71';
// 错误消息防抖延迟时间
const ERROR_MESSAGE_DELAY = 100;
// 错误消息防抖定时器
let errorMessageTimer = null;

export default {
  components: { SensitiveAutocomplete },
  props: {
    formItem: {
      type: Object,
      required: true
    },
    corpId: {
      type: String,
      required: true
    },
    addressOptions: {
      type: Array,
      required: true
    },
    width: {
      type: String,
      default: ''
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      districtValue: [],
      timeout: null,
      cascaderKey: Date.now(),
      lastSearchKeyword: '',
      lastSuggestion: [],
      MAX_INPUT_LENGTH
    };
  },
  computed: {
    cascaderValue: {
      get() {
        if (!this.formItem.value) {
          return [];
        }
        const { province, city, area, town } = this.formItem.value;
        if (MUNICIPAL.includes(province)) {
          return [...new Set([province, city, area, town])].filter(Boolean);
        }
        if (SPECIAL_REGION.includes(province)) {
          return [...new Set([province, city, area])].filter(Boolean);
        }
        return [province, city, area, town || '暂不选择'].filter(Boolean);
      },
      set(val) {
        /**
         * 直辖市值为['北京市','朝阳区','三里屯街道']
         * 非直辖市值为['福建省','厦门市','集美区','侨英街道']
         */
        if (MUNICIPAL.includes(val[0])) {
          this.formItem.value = {
            ...this.formItem.value,
            province: val[0],
            city: '',
            area: val[1],
            town: val[2]
          };
        } else if (['香港特别行政区', '澳门特别行政区'].includes(val[0])) {
          this.formItem.value = {
            ...this.formItem.value,
            province: val[0],
            area: val[1]
          };
        } else {
          this.formItem.value = {
            ...this.formItem.value,
            province: val[0],
            city: val[1],
            area: val[2],
            town: val[3]
          };
        }
      }
    }
  },
  methods: {
    // 防抖的错误消息显示函数
    showErrorMessage(message) {
      if (errorMessageTimer) {
        clearTimeout(errorMessageTimer);
      }
      errorMessageTimer = setTimeout(() => {
        Notification.error({
          title: message
        });
        errorMessageTimer = null;
      }, ERROR_MESSAGE_DELAY);
    },
    // 懒加载获取下级区划
    loadDistricts(node, resolve) {
      const START_LEVEL = 0;
      const level = node?.data?.level || node.level;
      // 初始加载
      if (level === START_LEVEL) {
        this.$nextTick(() => {
          resolve(this.addressOptions);
        });
      } else if (level === DISTRICT_LEVEL.STREET || node?.data?.leaf) {
        // 最后一级不加载下级数据
        resolve([]);
      } else if (level === DISTRICT_LEVEL.AREA && !SPECIAL_REGION.includes(node?.parent?.value)) {
        getSubDistrictList({
          corpId: this.corpId,
          id: node.data.id
        }).then(res => {
          const districts = res.data.result[0] || [];
          resolve(this.checkLeaf([...districts, { fullname: '暂不选择' }]));
        }).catch((err) => {
          this.showErrorMessage(err.msg);
          resolve([]);
        });
      } else {
        this.$nextTick(() => {
          resolve(this.checkLeaf(node.data.districts, node.data.fullname) || []);
        });
      }
    },
    checkLeaf(list, name) {
      const NO_AREA_CITY_LEVEL = 0; // 不设区县行政区的城市，如东莞、中山等
      /**
       * 不设区县的'直筒子市'值为['广东省','东莞市','东莞市','东城街道']
       * 需要在后缀添加(区/县)做区分，否则组件无法回显
       */
      return list.map(item => {
        if (!item.id) {
          return {
            ...item,
            leaf: true
          };
        }
        if (item.level === NO_AREA_CITY_LEVEL) {
          return {
            ...item,
            fullname: item.fullname + '(区/县)',
            leaf: item.level >= DISTRICT_LEVEL.STREET || item.id.length > DISTRICT_ID_LENGTH
          };
        }
        // 港澳台设置区县为最后一级
        if ((SPECIAL_REGION.includes(name) || item.id.startsWith(TAIWAN_START_CODE)) && item.level === DISTRICT_LEVEL.AREA) {
          return {
            ...item,
            leaf: true
          };
        }
        return {
          ...item,
          leaf: item.level >= DISTRICT_LEVEL.STREET || item.id.length > DISTRICT_ID_LENGTH
        };
      });
    },
    // 远程搜索地址
    querySearchAsync(queryString, callback) {
      // 检查输入值是否与上次搜索相同
      if (queryString === this.lastSearchKeyword) {
        callback(this.lastSuggestion);
        return;
      }

      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      if (!queryString) {
        callback([]);
        return;
      }
      // 没有选择省市区，只输入详细地址时，不进行远程搜索
      if (!this.formItem.value.location) {
        callback([]);
        return;
      }
      const { lat, lng } = this.formItem.value.location;
      const location = `${lat},${lng}`;
      const PAGE_INDEX = 1;
      const PAGE_SIZE = 20;
      this.timeout = setTimeout(() => {
        this.lastSearchKeyword = queryString.trim();
        getAddressByKeyword({
          corpId: this.corpId,
          keyword: queryString,
          location,
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE
        }).then(res => {
          const suggestions = res.data.data || [];
          const formattedSuggestions = suggestions.map(item => ({
            value: item.title,
            address: item.address,
            location: item.location
          }));
          this.lastSuggestion = formattedSuggestions;
          callback(formattedSuggestions);
        }).catch(() => {
          callback([]);
        });
      }, DEBOUNCE_DELAY);
    },
    // 选择详细地址
    handleSelect(item) {
      this.formItem.value.location = item.location;
      getRegeocode({
        corpId: this.corpId,
        location: `${item.location.lat},${item.location.lng}`
      }).then(res => {
        const { address_component, address_reference } = res.data.result;
        const { province, city, district } = address_component;
        this.formItem.value.province = province;
        this.formItem.value.city = city;
        this.formItem.value.area = NO_AREA_CITY.includes(city) ? (district + '(区/县)') : district;
        this.formItem.value.town = address_reference?.town?.title || '';
        // 通过修改key值，触发cascader组件的重新加载
        this.cascaderKey = Date.now();
      });
    },
    // 选择省市区
    handleChange() {
      const checkedNodes = this.$refs.cascaderRef.getCheckedNodes();
      if (checkedNodes.length) {
        const checkedNode = checkedNodes[checkedNodes.length - 1];
        this.formItem.value.location = checkedNode.data.location || checkedNode.parent.data.location;
        if (this.formItem.value.detailAddress) {
          this.formItem.value.detailAddress = '';
        }
      } else {
        this.formItem.value = {};
      }
    },
    handleClear() {
      this.formItem.value.detailAddress = '';
    }
  }
};
</script>
<style lang="scss" scoped>
.el-icon-close{
  cursor: pointer;
  line-height: 32px;
}
</style>
