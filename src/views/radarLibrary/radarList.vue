<!--
 * @Description: 雷达列表
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div class="tip-div">
      <el-alert
        class="warn-tip"
        type="warning"
        :closable="false"
      >
        <span>渠道点击次数的统计需要将企业微信绑定unionId方可使用，点击<span class="open-tip cp" @click="openTip"> 配置引导 </span>查看配置步骤</span>
      </el-alert>
      <el-drawer
        class="drawer-div"
        title="企业微信绑定unionId"
        :visible.sync="tipDrawer"
        :before-close="handleClose"
        :size="780"
      >
        <ConfigTip @closeDrawer="closeDrawer" @closeTip="closeTip" />
      </el-drawer>
    </div>
    <div v-if="showTip">
      <EmptyDefaultIcon>
        <template slot="customBtn">
          <div class="customBtn">需要将企业微信绑定unionId后方可使用，前往<el-button type="text" @click="openTip">配置</el-button></div>
        </template>
      </EmptyDefaultIcon>
    </div>
    <RightContainer v-else>
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
        <div v-if="roleKey" class="operate-btn">
          <el-button class="btn-reset" @click="batchDel">批量删除</el-button>
          <el-button type="primary" @click="addRadarDrawer">添加雷达</el-button>
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
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import AddRararDrawer from './components/addRadarDrawer.vue';
import CustomChannel from './components/customChannel.vue';
import { goRouteWithQuery } from '@/utils';
import { getRadaList, deleteRadar } from '@/api/radar';
import RadarLink from './components/radarLink.vue';
import ConfigTip from './components/ConfigTip.vue';
export default {
  name: 'RadarList',
  components: {
    RightContainer,
    EmptyDefaultIcon,
    AddRararDrawer,
    CustomChannel,
    RadarLink,
    ConfigTip
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
      showTip: true,
      hasRole: this.roleKey
    };
  },
  computed: {
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
    }
  },
  created() {
    this.init();
  },
  methods: {
    /**
     * 表格排序
     */
    changeTableSort(obj) {
      this.query.enableSort = null;
      this.query.enableSort = SORT[obj.order];
      this.getRadaList(1);
    },
    async init() {
      const list = await this.getRadaList();
      const configRes = await getConfig();
      this.showTip = !list.length && !configRes.data;
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
    },
    handleClose() {
      this.tipDrawer = false;
    },
    openTip() {
      this.tipDrawer = true;
    },
    closeDrawer() {
      this.handleClose();
    },
    closeTip() {
      this.showTip = false;
    }
  }
};
</script>

<style scoped lang="scss">
/deep/ .el-table th.el-table__cell.is-sortable > .cell {
  display: flex;
  align-items: center;
}
.tagList {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.tip-div {
  padding: 15px 15px 0 15px;
  background: #fff;
  .open-tip {
    color: $light-blue;
  }
  /deep/ .el-drawer__body {
    padding: 0 20px;
    height: calc(100% - 43px);
  }
}
.customBtn button {
  font-size: 14px;
}
</style>
