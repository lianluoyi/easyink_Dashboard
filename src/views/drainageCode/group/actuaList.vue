<!--
 * @Description: 群活码列表
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div v-if="form.createType === CREATE_TYPE['group']" class="customer-group-list-div">
      <div v-for="(item, index) in form.actualList" :key="index" class="group-item">
        <div class="group-index">{{ `客户群${index + 1}` }}</div>
        <div class="group-info">
          <div class="group-qrcode">
            <el-image :src="item.actualGroupQrCode" />
          </div>
          <div class="group-detail">
            <div class="group-name">{{ item.chatGroupName }}</div>
            <div class="group-info-title">有效期：{{ item.effectTime }}</div>
            <div class="group-info-title">进群上限：{{ item.scanCodeTimesLimit }}</div>
          </div>
        </div>
        <MoveTool
          :index="index"
          :item="item"
          :list.sync="form.actualList"
          :show-tool="['edit', 'placedAtTop', 'moveTop', 'moveBottom', 'remove']"
          :manual-remove="true"
          @getRemoveList="getRemoveList"
          @handleRemove="handleRemove"
          @handleEdit="handleEdit"
        />
      </div>
    </div>
    <div v-if="form.createType === CREATE_TYPE['corp']" class="enterprise-code-list-div">
      <div v-for="(item, index) in form.actualList" :key="index" class="group-item">
        <div class="group-index">{{ `企微活码${index + 1}` }}</div>
        <div class="group-info">
          <div class="group-qrcode">
            <el-image :src="item.actualGroupQrCode" />
          </div>
          <div class="group-detail">
            <div v-if="!isDKCorp" class="group-info-title">群聊昵称：{{ item.roomBaseName }}</div>
            <div v-if="!isDKCorp" class="group-info-title">起始序号：{{ item.roomBaseId }}</div>
            <div class="group-info-title">进群上限：{{ item.scanCodeTimesLimit }}</div>
            <div class="group-info-title">备注信息：{{ item.remark }}</div>
          </div>
        </div>
        <MoveTool
          :index="index"
          :item="item"
          :list.sync="form.actualList"
          :manual-remove="true"
          :show-tool="['edit', 'placedAtTop', 'moveTop', 'moveBottom', 'remove']"
          @getRemoveList="getRemoveList"
          @handleRemove="handleRemove"
          @handleEdit="handleEdit"
        />
      </div>
    </div>
  </div>
</template>
<script>
import MoveTool from '@/components/MoveTool.vue';
import { CREATE_TYPE } from '@/utils/constant';
export default {
  name: 'ActuaList',
  components: { MoveTool },
  props: {
    form: {
      type: Object,
      default: () => {}
    },
    // 移除的活码列表
    removeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      CREATE_TYPE
    };
  },
  computed: {
    // 是否为代开发应用
    isDKCorp() {
      return this.$store.state.serverInfo.dkCorp;
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 获取移除的附件列表
     */
    getRemoveList(list) {
      if (list && list.length > 0) this.$emit('update:removeList', list.map(item => item.id));
    },
    /**
     * 移除企微活码
     */
    handleRemove(index, item) {
      this.confirmModal({
        msg: '删除该数据后，可重新添加，是否继续？'
      }, async() => {
        this.form.actualList.splice(index, 1);
        const list = [...this.removeList];
        list.push(item);
        this.$emit('update:removeList', list);
      });
    },
    /**
     * 编辑活码
     */
    handleEdit(item, index) {
      this.$emit('handleEditCode', item, index);
    }
  }
};
</script>
<style scoped lang='scss'>
.enterprise-code-list-div,
  .customer-group-list-div {
    padding-left: 18px;
    margin-top: 10px;
    .group-item {
      margin-bottom: 10px;
      display: flex;
      .group-index {
        margin-right: 10px;

      }
      .group-info {
        display: flex;
        border: 1px solid $borderColor;
        padding: 10px;
        width: 447px;
        .group-qrcode {
          margin-right: 10px;
          .el-image {
            width: 80px;
            height: 80px;
          }
        }
        .group-detail {
          .group-name {
            margin-bottom: 10px;
          }
          .group-info-title {
            color: #606266;
            line-height: 20px;
          }
        }
      }
      .tool-div {
        display: flex;
        align-items: flex-end;
      }
    }
  }
  .customer-group-list-div {
    .group-index {
        width: 70px;
      }
  }
  .enterprise-code-list-div {
    .group-index {
        width: 100px;
      }
  }
</style>
