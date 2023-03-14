<!--
 * @Description: 选择离职继承分配的员工弹窗
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<script>
import { allocateUser } from '@/api/customer/dimission';
import SelectUser from '@/components/SelectUser/index.vue';

export default {
  name: 'AddMaterialModal',
  components: { SelectUser },
  props: {
    dialogVisibleSelectUser: {
      type: Boolean,
      default: false
    },
    currentRows: {
      type: Array,
      default: () => []
    },
    getList: {
      type: Function,
      default: () => {}
    },
    // 分配接口类型
    type: {
      type: String,
      default: 'allocateCustomer'
    }
  },
  data() {
    return {

    };
  },
  computed: {
    Pvisible: {
      get() {
        return this.dialogVisibleSelectUser;
      },
      set(val) {
        this.$emit('update:dialogVisibleSelectUser', val);
      }
    }
  },
  watch: {
  },
  created() {

  },
  mounted() {},
  methods: {
    checkSelected(userlist) {
      if (userlist.length === 0) {
        this.msgWarn('请选择分配人');
        this.Pvisible = true;
        return false;
      }
      if (userlist.length > 1) {
        this.msgWarn('只能选择一名分配人');
        this.Pvisible = true;
        return false;
      }
      return true;
    },
    /**
     * 确认进行分配
     */
    allocate(userlist) {
      if (!this.checkSelected(userlist)) return;

      const body = {
        handoverUserList: this.dealHandoverUserList(),
        takeoverUserid: userlist[0].userId,
        externalUserid: this.type === 'reAllocateCustomer' ? this.currentRows[0].externalUserid : undefined,
        chatId: this.type === 'reAllocateCustomerGroup' ? this.currentRows[0].chatId : undefined
      };

      this.handleAllocateUserApi(allocateUser, body);
    },
    dealHandoverUserList() {
      return this.currentRows.map(ele => ({ ...ele, department: [] }));
    },
    handleAllocateUserApi(allocateUserApi, body) {
      const loading = this.$loading();
      allocateUserApi(body)
        .then((res) => {
          const resData = { ...res.data };
          const failNum = this.type === 'allocateCustomer'
            ? ((resData.weCustomerFailNum + resData.weGroupFailNum) || 0) : resData.failNum;
          if (failNum) {
            this.$alert(`有 <span style="color: #e74e59">${failNum}</span> 个客户或客户群分配失败，可前往”已分配的离职员工“查看分配详情。`, '分配结果', {
              confirmButtonText: '我知道了',
              type: 'warning',
              dangerouslyUseHTMLString: true
            });
          } else {
            this.$alert('分配成功', '分配结果', {
              confirmButtonText: '我知道了',
              type: 'warning'
            });
          }
          this.getList(1);
          loading.close();
        })
        .catch(() => {
          loading.close();
        });
    }
  }
};
</script>

<template>
  <SelectUser
    v-if="Pvisible"
    :visible.sync="Pvisible"
    title="选择分配人"
    :is-sigle-select="true"
    @success="allocate"
  />
</template>

<style lang="scss" scoped>

</style>

