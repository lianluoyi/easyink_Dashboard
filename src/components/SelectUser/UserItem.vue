<!--
 * @Description: 员工弹窗中 员工列表的单个节点样式布局
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="user-item-div">
    <!-- todo 待优化 -->
    <div v-if="!(node.key && (node.key.startsWith(moreFlag) || node.key.startsWith(loadingFlag)))" class="checkbox-div">
      <el-checkbox :value="checked" :disabled="(isSigleSelect || isOnlyLeaf) && !data.userId" @change="onSelect" @click.stop.native="clickFun" />
    </div>
    <div v-if="node.key && node.key.startsWith(loadingFlag)" class="ml5"><i class="el-icon-loading" style="font-size: 18px;" /></div>
    <div v-else-if="node.key && node.key.startsWith(moreFlag)" :class="`show-more theme-text-color cp ml20 ${loading ? 'disabled-btn' : ''}`" @click="showMore">
      <i v-if="loading" class="el-icon-loading mr5" />查看更多
    </div>
    <div v-else-if="data.userId" class="user-info">
      <img class="user-avatar" :src="data.avatarMediaid || require('@/assets/image/card-avatar.svg')">
      <span>{{ node.label }}</span>
    </div>
    <span v-else>{{ node.label }}（{{ data.totalUserCount || 0 }}）</span>
  </div>
</template>
<script>
export default {
  name: 'UserItem',
  components: {},
  props: {
    /**
     * 该节点的数据
     */
    data: {
      type: Object,
      default: () => {}
    },
    /**
     * 节点信息
     */
    node: {
      type: Object,
      default: () => {}
    },
    /**
     * 已选择的员工/部门列表
     */
    userList: {
      type: Array,
      default: () => []
    },
    /**
     * 查看更多节点的key
     */
    moreFlag: {
      type: String,
      default: ''
    },
    loadingFlag: {
      type: String,
      default: ''
    },
    /**
     * 是否单选
     */
    isSigleSelect: {
      type: Boolean,
      default: false
    },
    /**
     * 是否 只选择叶子节点（人员节点）/禁止选择父节点（部门节点）
     */
    isOnlyLeaf: {
      type: Boolean,
      default: false
    },
    /**
     * 部门数据id对应的key
     */
    departmentIdKey: {
      type: String,
      default: 'id'
    },
    /**
     * 是否显示根部门
     */
    isShowMainDep: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      checked: false,
      loading: false
    };
  },
  computed: {
  },
  watch: {
    userList(val) {
      // 好友数据获取到后取消转圈状态
      this.loading = false;
      this.dealCheckStatus(val);
    }
  },
  mounted() {
    this.dealCheckStatus(this.userList);
  },
  methods: {
    /**
     * 处理复选框选中状态
     */
    dealCheckStatus(userList) {
      const flag = userList.some((item) => {
        return (item.userId && (item.userId === this.data.userId)) || (item[this.departmentIdKey] && (item[this.departmentIdKey] === this.data[this.departmentIdKey]));
      });
      this.checked = flag;
    },
    /**
     * TODO 待优化
     * 点击复选框
     */
    onSelect() {
      const checkStatus = this.checked;
      this.checked = !checkStatus;
      if (this.isSigleSelect) {
        // 取消勾选
        if (checkStatus) {
          this.$emit('update:userList', []);
        } else {
          this.$emit('update:userList', [this.data]);
        }
      } else {
        if (checkStatus) {
          const list = [...this.userList];
          const index = list.findIndex(item => item.userId ? item.userId === this.data.userId : item[this.departmentIdKey] === this.data[this.departmentIdKey]);
          if (index > -1) {
            list.splice(index, 1);
          }
          this.$emit('update:userList', list);
        } else {
          const list = [...this.userList];
          list.push(this.data);
          this.$emit('update:userList', list);
        }
      }
    },
    /**
     * 查看更多
     */
    showMore() {
      if (this.loading) return;
      //  || this.node.data.mainDepartment添加这个条件 防止在部门下员工列表查看更多的时候不走该逻辑
      if (this.isShowMainDep || this.node.data.mainDepartment) {
        this.loading = true;
        this.$emit('handleUpdateKeyChildren', this.data.mainDepartment, this.node?.parent?.data?.key, { lastId: this.data?.lastId, lastIndex: this.data?.lastIndex }, () => {
          this.loading = false;
        });
      } else {
        this.loading = true;
        this.$emit('getOtherUserList', () => {
          this.loading = false;
        });
      }
    },
    /**
     * TODO
     * 由于在change里面阻止事件冒泡会失效，所以增加了点击事件去阻止，若有后续更优方法可进行优化
     */
    clickFun() {}
  }

};
</script>
<style scoped lang='scss'>
.user-item-div {
  display: flex;
  align-items: center;
  .user-info {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #606266;
  }
  .user-avatar {
    width: 30px;
    height: 30px;
    margin-right: 10px;
    border-radius: 4px;
  }
  .checkbox-div {
          margin-right: 8px;
  }
  .disabled-btn {
    cursor: not-allowed;
  }
}
</style>
