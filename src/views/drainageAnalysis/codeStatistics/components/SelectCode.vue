<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { getCodeList } from '@/api/drainageCode/staff';
import remove from 'lodash/remove';
import { PAGE_LIMIT_TWENTY } from '@/utils/constant';
export default {
  name: 'SelectCode',
  components: { EmptyDefaultIcon },
  props: {
    /** 是否显示选择活码  */
    visible: {
      type: Boolean,
      default: false
    },
    /** 编辑的时候显示的已选择的活码列表 */
    confirmSelectedCodeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      allCodeList: [],
      selectCodeList: [],
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT_TWENTY,
        scenario: ''
      },
      total: 0,
      noMore: false,
      loading: false,
      searchLoading: false
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
    },
    disabled() {
      return this.loading || this.noMore;
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
        this.allCodeList = this.initCheckFlag(this.allCodeList, resList);
      }
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      getCodeList(this.query).then((res) => {
        this.total = res.total;
        this.allCodeList = [...this.allCodeList, ...this.initCheckFlag(res.rows)];
        this.noMore = (this.allCodeList.length === this.total);
      }).catch(() => {
        this.noMore = true;
      }).finally(() => {
        this.loading = false;
        this.searchLoading = false;
      });
    },
    /**
     * @description 通过已勾选的列表处理当前活码列表是否为被勾选状态
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
     * @description 选择活码变化
     */
    selectChange(item) {
      const index = this.selectCodeList.findIndex((o) => o.id === item.id);
      if (index === -1) {
        this.selectCodeList.push(item);
      } else {
        this.handleRemove(item);
      }
    },
    /**
     * @description 移除选中的活码
     * @param item
     */
    handleRemove(item) {
    // 这个checked是自己维护的一个选择框状态 再移除选中的活码的时候要设为false
      this.allCodeList = this.allCodeList.map((o) => {
        return {
          ...o,
          ...(o.id === item.id && { checked: false })
        };
      });
      remove(this.selectCodeList, (o) => o.id === item.id);
    },
    searchList() {
      this.query.pageNum = 1;
      this.noMore = true;
      this.searchLoading = true;
      // 清空是因为getList里使用拼接 若不清空会继续进行拼接
      this.allCodeList = [];
      // 使用定时器 避免一闪的效果
      setTimeout(() => {
        this.getList();
      // eslint-disable-next-line no-magic-numbers
      }, 300);
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
      this.allCodeList = this.allCodeList.map((item) => {
        return {
          ...item,
          checked: false
        };
      });
    },
    /**
     * 滚动加载更多
     * @description 定时500再去调用 是为了让loading状态能够展现出来
     */
    load() {
      this.query.pageNum++;
      this.loading = true;
      setTimeout(() => {
        this.getList();
      // eslint-disable-next-line no-magic-numbers
      }, 500);
    }
  }
};
</script>
<template>
  <el-dialog
    title="选择活码"
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
            placeholder="请输入活码名称，回车搜索"
            @keyup.enter.native="handleEnterSearch"
          />
        </div>
        <div v-loading="searchLoading" class="customer">
          <empty-default-icon :length="allCodeList.length" style="max-height: 450px; overflow: auto;">
            <div v-infinite-scroll="load" :infinite-scroll-immediate="false" :infinite-scroll-disabled="disabled">
              <div
                v-for="item in allCodeList"
                :key="item.id"
                class="customer-choose inoneline"
              >
                <el-checkbox v-model="item.checked" @change="selectChange(item)">
                  <span class="customer-name inoneline">
                    {{ item.scenario }}
                  </span>
                </el-checkbox>
              </div>
            </div>
            <div v-if="loading" v-loading="loading" element-loading-spinner="el-icon-loading" class="customClass" />
            <div v-if="noMore && query.pageNum > 1" class="no-more">
              没有更多数据
            </div>
          </empty-default-icon>
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="12" :xs="24" class="user-list">
        <el-row :gutter="10">
          <div class="user-list-top mb5">
            <span style="line-height: 32px">选择活码列表 </span>
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
    .el-checkbox {
      display: flex;
      align-items: center;
    }
    .customer-name {
      font-size: 14px;
      max-width: 292px;
      display: inline-block;
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
