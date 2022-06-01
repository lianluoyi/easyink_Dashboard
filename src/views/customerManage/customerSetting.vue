<!--
 * @Description: 客户设置
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="customer-setting">
    <RightContainer>
      <template v-slot:search>
        <el-form
          ref="queryForm"
          :inline="true"
          :model="query"
          label-width="100px"
          class="top-search"
          size="small"
        >
          <el-form-item prop="name">
            <el-input v-model="query.name" placeholder="请输入字段名称" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.status" placeholder="请选择启用状态" clearable>
              <el-option
                v-for="item in enableOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.required" placeholder="请选择是否必填" clearable>
              <el-option
                v-for="item in mandatoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label=" ">
            <el-button
              type="primary"
              @click="onSearch"
            >查询</el-button>
            <el-button
              class="btn-reset"
              @click="resetForm"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:operate-btn>
        <el-button
          v-preventReClick
          v-hasPermi="['customer:extendProp:add']"
          type="primary"
          @click="addField"
        >新增字段</el-button>
      </template>
      <template v-slot:data>
        <el-table
          ref="table"
          :data="list"
          class="property-list-table"
          tooltip-effect="dark"
          row-key="id"
          highlight-current-row
          @cell-mouse-enter="rowDrop"
          @cell-mouse-leave="mouseLeave"
        >
          <el-table-column
            prop="sort"
            label=""
            width="40"
          >
            <template slot-scope="scope">
              <el-popover
                placement="left"
                trigger="hover"
                content="长按上下拖拽排序"
              >
                <div slot="reference" class="handle handle-sort">
                  <i v-show="showDropIcon && scope.row.id === rowId" class="el-icon-sort" style="font-size: 16px;" />
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <template slot="empty">
            <empty-default-icon
              text="暂无数据"
            />
          </template>
          <el-table-column label="字段名称" prop="name" />
          <el-table-column label="字段类型" prop="type">
            <template slot-scope="{ row }">
              {{ propertyMap[row.type] }}
            </template>
          </el-table-column>
          <el-table-column label="启用" prop="status">
            <template #header>
              <span>启用</span>
              <el-popover
                placement="top-start"
                content="开启后，员工可为客户编辑该字段信息，后台可读取"
                trigger="hover"
                popper-class="tip-popover"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
              </el-popover>
            </template>
            <template slot-scope="{ row }">
              <el-switch
                v-model="row.status"
                :disabled="!checkPermi(['customer:extendProp:edit'])"
                @change="(value) => changeStatus(value, row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="必填" prop="required">
            <template #header>
              <span>必填</span>
              <el-popover
                placement="top-start"
                content="开启后，员工为客户编辑资料时该字段不能为空"
                trigger="hover"
                popper-class="tip-popover"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
              </el-popover>
            </template>
            <template slot-scope="{ row }">
              <el-switch
                v-model="row.required"
                :disabled="!checkPermi(['customer:extendProp:edit'])"
                @change="(value) => changeStatus(value, row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="{ row }">
              <el-button
                v-hasPermi="['customer:extendProp:edit']"
                type="text"
                size="small"
                :disabled="row.type === CUSTOMER_PROPERTY_VALUE['sysField']"
                @click="onEdit(row)"
              >编辑</el-button>
              <el-button
                v-hasPermi="['customer:extendProp:remove']"
                type="text"
                size="small"
                :disabled="row.type === CUSTOMER_PROPERTY_VALUE['sysField']"
                @click="onDelete(row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </RightContainer>
    <AddPropertyModal
      ref="addPropertyModal"
      :visible.sync="propertyVisible"
      width="700px"
      @getList="getPropertyList"
    />
  </div>
</template>
<script>
import RightContainer from '@/components/RightContainer';
import { deleteExtendProperty } from '@/api/extendProperty';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import AddPropertyModal from './components/addPropertyModal.vue';
import { CUSTOMER_PROPERTY_MAP, CUSTOMER_PROPERTY_VALUE } from '@/utils/constant';
import Sortable from 'sortablejs';
import { editBatchExtendProperty } from '@/api/extendProperty';
import { checkPermi } from '@/utils/permission';

const findMaxPropertySort = (prev, current) => current.propertySort > prev.propertySort ? current : prev;

export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon, AddPropertyModal },
  props: {},
  data() {
    return {
      enableOptions: [{
        label: '启用',
        value: 1
      }, {
        label: '未启用',
        value: 0
      }],
      mandatoryOptions: [{
        label: '必填',
        value: 1
      }, {
        label: '非必填',
        value: 0
      }],
      query: {
        // 字段名称
        name: '',
        status: null,
        required: null
      },
      list: [],
      propertyMap: CUSTOMER_PROPERTY_MAP,
      propertyVisible: false,
      editData: {},
      CUSTOMER_PROPERTY_VALUE,
      // 是否显示拖拽图标
      showDropIcon: false,
      // 当前鼠标移入的表格行id
      rowId: null,
      // 是否已经创建拖拽组件
      rowSortCreated: false
    };
  },
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>添加客户字段，记录客户更详细的个人信息</div>
      `
    );
    this.getPropertyList();
  },
  mounted() {},
  methods: {
    onSearch() {
      this.getPropertyList();
    },
    resetForm() {
      this.query = {
        // 字段名称
        name: '',
        status: null,
        required: null
      };
      this.getPropertyList();
    },
    /**
     * 新增字段
     */
    addField() {
      const propertySort = this.list.length && this.list.reduce(findMaxPropertySort).propertySort + 1;
      this.$refs.addPropertyModal.formData = {
        name: null,
        required: 0,
        status: 0,
        propertySort,
        optionList: [{ multipleValue: '' }]
      };
      this.propertyVisible = true;
    },
    /**
     * 编辑
     */
    onEdit(row) {
      this.$refs.addPropertyModal.formData = { ...row };
      this.$refs.addPropertyModal.activeName = row.type.toString();
      this.propertyVisible = true;
    },
    /**
     * 删除
     */
    onDelete(row) {
      this.confirmModal({
        msg: '删除后，该字段将被删除，员工不可再为客户编辑该字段，且不可恢复，是否继续？'
      }, async() => {
        const delRes = await deleteExtendProperty(row.id);
        if (delRes) {
          this.getPropertyList();
        }
      });
    },
    /**
     * 获取客户扩展属性列表
     */
    async getPropertyList(params = {}) {
      const listRes = await this.$store.dispatch('GetCustomerProperty', {
        name: this.query.name,
        required: this.query.required,
        status: this.query.status,
        ...params
      });
      if (listRes) {
        this.list = listRes.data;
      }
    },
    /**
     * 鼠标移入表格行
     */
    rowDrop(row) {
      this.showDropIcon = true;
      this.rowId = row.id;

      if (!this.rowSortCreated) {
        this.rowSortCreated = true;
        const animation = 150;
        // 行拖拽
        const _this = this;
        const tbody2 = this.$refs.table.$el.querySelector('.el-table__body-wrapper tbody');
        Sortable.create(tbody2, {
          handle: '.handle',
          animation: animation,
          onEnd({ newIndex, oldIndex }) {
            // 拖拽完成
            const currRow = _this.list.splice(oldIndex, 1)[0];
            _this.list.splice(newIndex, 0, currRow);
            const newList = [];
            _this.list.map((item, index) => {
              newList.push({
                ...item,
                propertySort: index + 1
              });
            });
            _this.sortEdit({
              properties: newList
            });
          }
        });
      }
    },
    /**
     * 鼠标移出表哥行
     */
    mouseLeave() {
      this.showDropIcon = false;
    },
    /**
     * 编辑字段信息
     */
    async sortEdit(params) {
      const editRes = await editBatchExtendProperty(params);
      if (editRes) this.msgSuccess('操作成功');
    },

    checkPermi(key) {
      return checkPermi(key);
    },
    /**
     * 修改启用/必填状态
     */
    changeStatus(value, row) {
      this.sortEdit({
        properties: [row]
      });
      this.$store.dispatch('UpdateCustomerProperty', row);
    }
  }

};
</script>
<style scoped lang='scss'>
</style>
