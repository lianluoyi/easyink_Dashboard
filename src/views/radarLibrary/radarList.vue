<!--
 * @Description: 雷达列表
 * @Author: wJiaaa
 * @LastEditors: xulinbin
-->
<template>
  <div style="height: 100%;">
    <ConfigOffAccount
      ref="offAccountConfigDialog"
      :visible.sync="configDialogVisible"
      :get-off-account="getOffAccountConfig"
      :off-account-list="offAccountList"
    />
    <RightContainer>
      <template v-slot:data-stat>
        <div>
          <el-input
            v-model="query.searchTitle"
            prefix-icon="el-icon-search"
            style="width: 240px"
            placeholder="请输入雷达/链接标题，回车搜索"
            @input="clear"
            @keyup.enter.native="onSearch"
          />
        </div>
      </template>
      <template v-slot:operate-btn>
        <div class="radar-handle-wrap">
          <div v-if="isDKCorp" class="config-offAccount" @click="openConfig">
            <i
              class="property-setting el-icon-setting"
              style="font-size: 20px; color: #6DB4AB; margin-right: 4px;"
            />
            <span v-if="!hasOffAccount" class="error-span">请配置公众号</span>
            <span v-else class="success-span">公众号: {{ offAccountInfo.nickName }}</span>
          </div>
          <div v-if="roleKey" class="operate-btn">
            <el-button class="btn-reset" @click="batchDel">批量删除</el-button>
            <el-button type="primary" @click="addRadarDrawer">添加雷达</el-button>
          </div>
        </div>
      </template>
      <template v-slot:data>
        <el-table
          v-loading="loading"
          :data="list"
          :default-sort="{prop: 'clickNum', order: null}"
          @selection-change="handleSelectionChange"
          @sort-change="changeTableSort"
        >
          <template slot="empty">
            <empty-default-icon :length="list.length" />
          </template>
          <el-table-column type="selection" width="55" />
          <el-table-column
            prop="codeUrl"
            label="雷达内容"
            align="center"
            width="250"
          >
            <template slot-scope="{ row }">
              <RadarLink
                class-name="link-preview"
                :link-title="row.weRadarUrl.title"
                :cover-url="row.weRadarUrl.coverUrl"
                :content="row.weRadarUrl.content"
              />
            </template>
          </el-table-column>
          <el-table-column prop="radarTitle" label="雷达标题" align="center" />
          <el-table-column label="客户标签" prop="radarTagList" align="left">
            <template #default="{ row }">
              <div class="tagList">
                <el-tag
                  v-for="item in dealTagList(row.radarTagList)"
                  :key="item.tagId"
                  class="mb5"
                  type="info"
                >{{ item.tagName }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="clickNum" sortable="custom">
            <template #default="{ row }">
              <div>{{ row.clickNum }}</div>
            </template>
            <template #header>
              <div>
                <span>总点击人数</span>
                <el-popover
                  placement="top-start"
                  trigger="hover"
                  popper-class="tip-popover"
                  content="已对客户去重"
                >
                  <i
                    slot="reference"
                    class="iconfont icon-question"
                    style="font-size: 14px"
                  />
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="创建人" align="center">
            <template slot-scope="{ row }">
              <div>
                <span>{{ row.createName }}</span>
                <div style="font-size: 12px">
                  {{ row.departmentName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            width="180"
          />
          <el-table-column label="操作" align="center" width="140">
            <template slot-scope="{ row }">
              <div>
                <el-button
                  size="mini"
                  type="text"
                  @click="goRoute(row)"
                >详情</el-button>
                <el-button
                  size="mini"
                  type="text"
                  @click="openVisible('customChannel', row.radarId)"
                >自定义渠道</el-button>
              </div>
              <div>
                <el-button
                  v-if="hasRole"
                  size="mini"
                  type="text"
                  @click="openVisible('edit', row.radarId)"
                >编辑</el-button>
                <el-button
                  v-if="hasRole"
                  size="mini"
                  type="text"
                  @click="handleDelete(row.radarId)"
                >删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="list.length > 0"
          :total="total"
          :limit.sync="query.pageSize"
          :page.sync="query.pageNum"
          :select-data-len="ids.length"
          @pagination="getRadaList()"
        />
      </template>
    </RightContainer>
    <AddRararDrawer
      ref="addRadarDrawer"
      :active-radar="activeRadar"
      :radar-id="radarId"
      :visible.sync="addRadarDrawerVisible"
      @close="closeAddRadarDrawer"
      @getRadaList="getRadaList"
    />
    <CustomChannel :role-key="roleKey" :visible.sync="customChannelVisible" :radar-id="radarId" />
  </div>
</template>

<script>
import RightContainer from '@/components/RightContainer';
import { RADAR_TYPE, PAGE_LIMIT, DEFAULT_PAGE_NUM, SORT } from '@/utils/constant';
import { getConfig } from '@/api/wechatopen';
import { checkPermi } from '@/utils/permission';
import { getRadarConfig } from '@/api/radar';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import AddRararDrawer from './components/addRadarDrawer.vue';
import CustomChannel from './components/customChannel.vue';
import { goRouteWithQuery } from '@/utils';
import { getRadaList, deleteRadar } from '@/api/radar';
import RadarLink from './components/radarLink.vue';
import ConfigOffAccount from './configOffAccount.vue';
export default {
  name: 'RadarList',
  components: {
    RightContainer,
    EmptyDefaultIcon,
    AddRararDrawer,
    CustomChannel,
    RadarLink,
    ConfigOffAccount
  },
  props: {
    activeRadar: {
      type: Number,
      default: RADAR_TYPE['enterprise']
    },
    roleKey: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      RADAR_TYPE,
      SORT,
      query: {
        searchTitle: '',
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT,
        enableSort: null
      },
      loading: false,
      list: [],
      total: 0,
      ids: [],
      addRadarDrawerVisible: false,
      customChannelVisible: false,
      radarId: '',
      tipDrawer: false,
      hasRole: this.roleKey,
      // 全部的公众号
      offAccountList: [],
      // 雷达是否配置公众号
      hasOffAccount: false,
      // 公众号信息
      offAccountInfo: undefined,
      // 配置公众号弹窗显隐
      configDialogVisible: false,
      // 弹出操作须知弹窗去配置按钮loading
      handleHintBtnLoading: false
    };
  },
  computed: {
    // 是否为代开发应用
    isDKCorp() {
      return this.$store.state.serverInfo.dkCorp;
    },
    // 处理标签
    dealTagList() {
      return function(tagList) {
        return (tagList && tagList.filter((item) => item !== null)) || [];
      };
    }
  },
  watch: {
    activeRadar() {
      this.getRadaList();
    },
    roleKey(val) {
      this.hasRole = val;
    },
    configDialogVisible(val, oldVal) {
      if (val) {
        // 请求一次全部的公众号
        this.getAllOffAccountConfig();
        // 设置为第一个选项
        this.$refs.offAccountConfigDialog.setInitAppId();
      }
    }
  },
  created() {
    this.init();
  },
  methods: {
    /**
     * @description: 打开配置公众号弹窗
     * @return {*}
     */
    openConfig() {
      this.configDialogVisible = true;
    },

    /**
     * 表格排序
     */
    changeTableSort(obj) {
      this.query.enableSort = null;
      this.query.enableSort = SORT[obj.order];
      this.getRadaList(1);
    },
    async init() {
      await this.getRadaList();
      this.getAllOffAccountConfig();
      this.getOffAccountConfig();
    },

    /**
     * @description: 获取全部的公众号
     * @return {*}
     */
    async getAllOffAccountConfig() {
      const configRes = await getConfig();
      this.offAccountList = configRes.data;
    },

    /**
     * @description: 获取雷达公众号配置
     * @return {*}
     */
    async getOffAccountConfig() {
      const radarConfigRes = await getRadarConfig();
      this.hasOffAccount = !!radarConfigRes.data;
      this.hasOffAccount ? this.offAccountInfo = radarConfigRes.data : null;
    },
    /**
     * 获取雷达列表
     */
    async getRadaList(pageNum) {
      pageNum && (this.query.pageNum = pageNum);
      const query = {
        ...this.query,
        type: this.activeRadar
      };
      this.loading = true;
      try {
        const res = await getRadaList(query);
        this.list = res.rows;
        this.loading = false;
        this.total = res.total;
        return res.rows;
      } catch {
        this.loading = false;
        return [];
      }
    },
    /**
     * 回车搜索
     */
    onSearch() {
      this.getRadaList(1);
    },
    /**
     * 清空客户昵称输入框触发的条件
     */
    clear(val) {
      if (!val) {
        this.getRadaList(1);
      }
    },
    /**
     * 处理多选
     */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.radarId);
    },
    /**
     * 添加雷达
     */
    addRadarDrawer() {
      this.radarId = '';
      this.addRadarDrawerVisible = true;
      // 代开发： 若该企业的雷达库没有配置过公众号则弹出操作须知弹窗
      if (this.isDKCorp && !this.hasOffAccount) {
        this.openHandleHint();
      }
      // 自建：若该企业未配置公众号则弹出操作须知弹窗
      if (!this.isDKCorp && !this.offAccountList?.length) {
        this.openHandleHint();
      }
    },
    /**
     * @description: 弹出操作须知弹窗
     * @return {*}
     */
    openHandleHint() {
      this.confirmModal({
        msg: '您还未配置公众号，需进行公众号配置后方可使用雷达功能。',
        confirmButtonText: '去配置'
      }, () => {
        // 当没有“公众号授权”页面权限时，点击该按钮后提示“暂无权限，需联系管理员进行公众号授权”
        if (!checkPermi(['system:offAccount:list'])) {
          this.msgError('暂无权限，需联系管理员进行公众号授权');
        } else {
          this.$router.push({ path: '/system/configCentre/offAccount' }); // 页面跳转至“公众号授权”的页面。
        }
      });
    },
    /**
     * 关闭侧边栏
     */
    closeAddRadarDrawer() {
      this.addRadarDrawerVisible = false;
    },
    /**
     * 打开编辑和自定义渠道的弹窗
     * @params type :类型 radarId:雷达id
     */
    openVisible(type, radarId) {
      this.radarId = radarId;
      type === 'edit'
        ? (this.addRadarDrawerVisible = true)
        : (this.customChannelVisible = true);
    },
    /**
     * 删除单个雷达
     * @param radarId 对应雷达id
     */
    handleDelete(radarId) {
      this.delRadar({
        //   需要删除的标签规则id列表
        idList: [radarId]
      });
    },
    /**
     * 批量删除雷达
     */
    batchDel() {
      if (this.ids.length <= 0) {
        this.msgWarn('请至少选择一个雷达');
        return;
      }
      this.delRadar({
        idList: this.ids
      });
    },
    /**
     * 删除雷达
     * @param
     * "idList": []
     */
    delRadar(params) {
      this.confirmModal(
        {
          msg: '删除后，员工不可继续使用该雷达链接，之前的统计数据也将被删除并不可恢复，是否继续？'
        },
        async() => {
          deleteRadar(params).then(() => {
            // TODO 后面需要考虑在第二页删除 页码不会跳到第一页的问题 兑换码也有该问题
            this.getRadaList();
          });
        }
      );
    },
    goRoute(row) {
      // 点击详情时记录当前所在tab页
      window.sessionStorage.setItem('radarActive', this.activeRadar);
      goRouteWithQuery(this.$router, 'radarDetail', this.query, {
        id: row.radarId
      });
    }
  }
};
</script>

<style scoped lang="scss">
/deep/ .el-table th.el-table__cell.is-sortable > .cell {
  display: flex;
  align-items: center;
}
.radar-handle-wrap {
  display: flex;
  justify-content: center;
  .config-offAccount {
    display: flex;
    align-items: center;
    height: 30px;
    line-height: 30px;
    cursor: pointer;
  }
  .error-span {
    color:red;
  }
  .success-span {
    color:#6DB4AB;
  }
}
.tagList {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.customBtn button {
  font-size: 14px;
}
</style>
