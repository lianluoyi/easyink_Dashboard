<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { getCodeList } from '@/api/drainageCode/staff';
import remove from 'lodash/remove';
import { PAGE_LIMIT_TWENTY } from '@/utils/constant/index';
import NumPagination from '@/components/Pagination/NumPagination.vue';
import { differenceWith } from 'lodash';
export default {
  name: 'SelectCode',
  components: { EmptyDefaultIcon, NumPagination },
  props: {
    /** 是否显示选择渠道  */
    visible: {
      type: Boolean,
      default: false
    },
    /** 编辑的时候显示的已选择的渠道列表 */
    confirmSelectedCodeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      codeList: [],
      selectCodeList: [],
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT_TWENTY,
        scenario: ''
      },
      total: 0,
      searchLoading: false,
      checkAll: false,
      isIndeterminate: false
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
    'query.scenario'(val) {
      if (!val) {
        this.searchList();
      }
    },
    Pvisible(val) {
      // 弹窗展示时重新设置列表的选中状态
      if (val) {
        const resList = [...this.confirmSelectedCodeList];
        this.selectCodeList = resList;
        this.searchList();
      }
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.searchLoading = true;
      getCodeList(this.query).then((res) => {
        this.total = res.total;
        this.codeList = this.initCheckFlag(res.rows);
      }).catch(() => {
      }).finally(() => {
        this.searchLoading = false;
        this.dealCheckAllStatus();
        // 处理滚动条位置
        if (this.Pvisible) {
          this.$nextTick(() => {
            this.$refs['codeListRef'].$el.scrollTop = 0;
          });
        }
      });
    },
    /**
     * @description 处理全选/半选状态
     */
    dealCheckAllStatus() {
      this.checkAll = this.codeList.every(codeItem =>
        this.selectCodeList.some(item => item.id === codeItem.id)
      ) && this.selectCodeList.length > 0;
      this.isIndeterminate = this.selectCodeList.some(selectItem =>
        this.codeList.some(codeItem => codeItem.id === selectItem.id)
      ) && !this.checkAll;
    },
    /**
     * @description 通过已勾选的列表处理当前渠道列表是否为被勾选状态
     * @param list 需判断是否为勾选状态的列表
     * @param selectCodeList 已勾选的列表
     */
    initCheckFlag(list, selectCodeList = this.selectCodeList) {
      return list.map(item => {
        const findIndex = selectCodeList.find(k => k.id === item.id);
        item.checked = !!findIndex;
        return item;
      });
    },
    /**
     * @description 选择渠道变化
     */
    selectChange(item) {
      const index = this.selectCodeList.findIndex((o) => o.id === item.id);
      if (index === -1) {
        this.selectCodeList.push(item);
        this.dealCheckAllStatus();
      } else {
        this.handleRemove(item);
      }
    },
    /**
     * @description 移除选中的渠道
     * @param item
     */
    handleRemove(item) {
    // 这个checked是自己维护的一个选择框状态 再移除选中的渠道的时候要设为false
      this.codeList = this.codeList.map((o) => {
        return {
          ...o,
          ...(o.id === item.id && { checked: false })
        };
      });
      remove(this.selectCodeList, (o) => o.id === item.id);
      this.dealCheckAllStatus();
    },
    searchList() {
      this.query.pageNum = 1;
      this.getList();
    },
    handleEnterSearch() {
      this.query.scenario && this.searchList();
    },
    submit() {
      this.$emit('success', [...this.selectCodeList]);
      this.Pvisible = false;
    },
    resetChecked() {
      this.selectCodeList = [];
      this.checkAll = false;
      this.isIndeterminate = false;
      this.codeList = this.codeList.map((item) => {
        return {
          ...item,
          checked: false
        };
      });
    },
    /**
     * @description 处理全选/取消状态
     * @param val 当前状态
     */
    handleCheckAllChange(val) {
      this.codeList = this.codeList.map((item) => {
        item.checked = val;
        return item;
      });
      if (val) {
        this.isIndeterminate = false;
        this.selectCodeList = [...this.selectCodeList, ...this.codeList];
      } else {
        this.selectCodeList = differenceWith(this.selectCodeList, this.codeList, (a, b) => a.id === b.id);
      }
    }
  }
};
</script>
<template>
  <el-dialog
    title="选择渠道"
    :visible.sync="Pvisible"
    :close-on-click-modal="false"
    class="dialog-div"
    append-to-body
  >
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="12" :xs="24">
        <div class="head-container">
          <el-input
            v-model="query.scenario"
            clearable
            prefix-icon="el-icon-search"
            placeholder="请输入渠道名称，回车搜索"
            @keyup.enter.native="handleEnterSearch"
          />
        </div>
        <div v-loading="searchLoading" class="customer">
          <empty-default-icon ref="codeListRef" :length="codeList.length" style="height: 450px; overflow: auto;">
            <el-checkbox v-model="checkAll" class="mb10" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选当前页</el-checkbox>
            <div
              v-for="item in codeList"
              :key="item.id"
              class="customer-choose inoneline"
            >
              <el-checkbox v-model="item.checked" @change="selectChange(item)">
                <div class="customer-name inoneline">
                  {{ item.scenario }}
                </div>
              </el-checkbox>
            </div>
          </empty-default-icon>
        </div>
        <NumPagination
          class="mt10"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="getList"
        />
      </el-col>
      <!--用户数据-->
      <el-col :span="12" :xs="24" class="user-list">
        <el-row :gutter="10">
          <div class="user-list-top mb5">
            <span style="line-height: 32px">选择渠道列表 </span>
            <el-button @click="resetChecked">一键清空</el-button>
          </div>
        </el-row>
        <empty-default-icon :length="selectCodeList.length" />
        <div class="selected-list">
          <el-row v-for="(item, index) in selectCodeList" :key="index" class="select-code-list-li">
            <span class="inoneline">{{ item.scenario }}</span>
            <i
              class="el-icon-minus fr cp"
              title="取消选择"
              @click="handleRemove(item)"
            />
          </el-row>
        </div>
      </el-col>
    </el-row>
    <div slot="footer">
      <slot name="footer">
        <el-button @click="Pvisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </slot>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
/deep/ .pagination-container {
  text-align: center;
}
.head-container {
  > .el-input {
    width: 100%;
    margin-bottom: 5px;
  }
}
.customer {
  margin-top: 5px;
  .customer-choose {
    height: 26px;
    margin-left: 16px;
    .el-checkbox {
      display: flex;
      align-items: center;
    }
    .customer-name {
      font-size: 14px;
      max-width: 292px;
    }
  }
  .load-status {
    text-align: center;
  }
}
.user-list {
  .el-row {
    line-height: 26px;
  }
}

.user-list-top {
  display: flex;
  justify-content: space-between;
}
.selected-list {
  overflow: auto;
  padding-right: 5px;
  max-height: 450px;
  .select-code-list-li {
    display: flex;
    align-items: center;
    span {
      flex: 1;
    }
  }
}
.customClass {
  font-size: 18px;
  margin-top: 10px;
  height: 20px;
  top: 5px;
}
.no-more {
  font-size: 14px;
  color: rgb(0, 0, 0);
  text-align: center;
}
</style>
