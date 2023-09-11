<!--
 * @Description: 实际群聊详情列表
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <RightContainer>
    <template v-slot:data>
      <el-table
        v-loading="loading"
        :data="realCodes.slice((query.pageNum-1) * query.pageSize, query.pageNum * query.pageSize)"
        @selection-change="handleSelectionChange"
      >
        <template slot="empty">
          <empty-default-icon :length="realCodes.length" />
        </template>
        <el-table-column
          type="selection"
          width="55"
          align="center"
        />
        <el-table-column
          prop="actualGroupQrCode"
          :label="createType === CREATE_TYPE['group'] ? '群二维码' : '企微活码'"
          align="center"
          width="80"
        >
          <template #default="{ row }">
            <el-popover placement="bottom" trigger="hover">
              <el-image
                slot="reference"
                :src="row.actualGroupQrCode"
                class="code-image--small"
              />
              <el-image :src="row.actualGroupQrCode" class="code-image" />
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          v-if="createType === CREATE_TYPE['group']"
          prop="chatGroupName"
          label="客户群"
          align="center"
        />
        <el-table-column
          v-if="createType === CREATE_TYPE['corp'] && !isDKCorp"
          prop="roomBaseName"
          label="群聊昵称"
          align="center"
        />
        <el-table-column
          v-if="createType === CREATE_TYPE['group']"
          prop="effectTime"
          label="有效期"
          align="center"
        >
          <template #default="{ row }">
            {{ row.effectTime }}
            <el-popover
              v-if="row.isExpire"
              placement="bottom"
              width="200"
              trigger="hover"
              :content="getExpireInfo(row.effectTime)"
            >
              <i slot="reference" class="el-icon-warning expire-icon" />
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          prop="scanCodeTimesLimit"
          label="进群上限"
          align="center"
        />
        <el-table-column
          prop="scanCodeTimes"
          label="已扫码入群人数"
          align="center"
        >
          <template #header>
            <div>
              <span>已扫码入群人数</span>
              <el-popover
                v-if="createType === CREATE_TYPE['corp']"
                placement="top-start"
                trigger="hover"
                popper-class="tip-popover"
                content="客户识别一次企微活码，则认为其已扫码进群，进群人数统计与实际扫码进群人数有误差"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="使用状态"
          align="center"
        >
          <template #default="{ row }">
            <div v-if="parseInt(row.status) === 0" class="green-text">使用中</div>
            <div v-else class="red-text">已停用</div>
          </template>
          <template #header>
            <div>
              <span>使用状态</span>
              <el-popover
                placement="top-start"
                trigger="hover"
                popper-class="tip-popover"
                content="扫码次数达进群上限时将停用，不再展示给客户"
              >
                <i slot="reference" class="iconfont icon-question" style="font-size: 14px;" />
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="createType === CREATE_TYPE['corp']"
          prop="remark"
          label="备注信息"
          align="center"
        />
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="edit(scope.row, scope.$index)"
            >编辑</el-button>
            <el-button
              type="text"
              size="mini"
              @click="handleRemove(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </RightContainer>
</template>
<script>
import { remove } from '@/api/drainageCode/actual';
import { CREATE_TYPE } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
const ONE_DAY_SECOND = 86400;
const ONE_THOUSAND = 1000;
export default {
  name: '',
  components: { RightContainer, EmptyDefaultIcon },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    realCodes: {
      type: Array,
      default: () => []
    },
    handleSelectionChange: {
      type: Function,
      default: () => {}
    },
    getRealCodes: {
      type: Function,
      default: () => {}
    },
    edit: {
      type: Function,
      default: () => {}
    },
    createType: {
      type: Number,
      default: null
    },
    query: {
      type: Object,
      default: () => {}
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
    getExpireInfo(time) {
      const interval = (new Date(time)).getTime() / ONE_THOUSAND - (new Date()).getTime() / ONE_THOUSAND;
      if (interval < 0) {
        return '已过期';
      } else if (interval < ONE_DAY_SECOND) {
        return '即将过期';
      } else {
        return '有效';
      }
    },
    // 删除
    handleRemove(id) {
      this.confirmModal({
        msg: '删除后，群活码不再统计该客户群的入群人数，且数据不可恢复，是否继续？'
      }, () => {
        remove(id)
          .then((res) => {
            this.getRealCodes();
          });
      });
    }
  }
};
</script>
<style scoped lang="scss">
.green-text {
  color: #19be6b;
}
.red-text {
  color: #ed4014;
}
</style>
