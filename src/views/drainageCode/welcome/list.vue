<!--
 * @Description: 欢迎语列表
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<template>
  <div class="welcome-list-page">
    <div class="header-radio-group">
      <el-radio-group v-model="activeName" class="radio-group-div" size="medium">
        <el-radio-button :label="EMPLOYEES_WELCOME">好友欢迎语</el-radio-button>
        <el-radio-button :label="INTO_GROUP">入群欢迎语</el-radio-button>
      </el-radio-group>
    </div>
    <RightContainer>
      <template v-slot:data-stat>
        <div v-if="activeName === EMPLOYEES_WELCOME">
          员工添加新客户后，回复预设欢迎语
        </div>
        <div v-else>
          当前企业入群欢迎语素材已创建 <span class="data-count-num">{{ createdNum }}/100</span>
          <el-popover
            placement="top-start"
            trigger="hover"
            popper-class="tip-popover"
          >
            <i slot="reference" class="iconfont icon-question" />
            <div>
              <div>企业入群欢迎语素材最多可创建100条，包含在企业微信管理后台创建的；</div>
              <div>受企业微信限制，EasyInk不能管理和统计在企业微信后台或其他第三方应用创建的素材。</div>
            </div>
          </el-popover></div>
      </template>
      <template v-slot:operate-btn>
        <el-button
          v-show="checkPermi(`${activeName === EMPLOYEES_WELCOME ? 'remove' : 'del'}`)"
          class="btn-reset"
          @click="batchDel"
        >批量删除</el-button>
        <el-button
          v-show="checkPermi('add')"
          type="primary"
          @click="addWelcome"
        >新增欢迎语</el-button>
      </template>
      <template v-slot:data>
        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
          <template slot="empty">
            <empty-default-icon
              text="暂无数据"
              :length="list.length"
            />
          </template>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="欢迎语" align="center" prop="welcomeMsg">
            <template slot-scope="{ row }">
              <div>
                <div class="intwoline" :title="row.defaultWelcomeMsg">{{ row.defaultWelcomeMsg }}</div>
                <div v-for="(item, index) in row.defaultMaterialList.slice(0, checkShowMoreLimit(row))" :key="index" class="content-div">
                  <VerbalTrickDetailPreview :item="transferMaterialTypeItem(item)" />
                </div>
                <div
                  v-if="row.defaultMaterialList && row.defaultMaterialList.length > (checkShowMoreLimit(row))"
                  class="check-more theme-text-color"
                  @click="handleCheckMore(row)"
                >共{{ (row.defaultMaterialList.length + (row.defaultWelcomeMsg ? 1 : 0)) }}条 查看更多</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="activeName === EMPLOYEES_WELCOME" label="使用员工" align="center" prop="welcomeMsg">
            <template slot-scope="{ row }">
              <span v-for="(userItem, userIndex) in row.useUsers" :key="userIndex">
                {{ `${userIndex !== 0 ? ',' : ''}${userItem && userItem.userName}` }}
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="activeName === EMPLOYEES_WELCOME" label="创建人" align="center" prop="createBy">
            <template slot-scope="{ row }">
              <div class="al">
                <div class="cus-owner">{{ row.createName }}</div>
                <div class="cus-dept">{{ row.mainDepartmentName }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-if="activeName === EMPLOYEES_WELCOME"
                size="mini"
                type="text"
                @click="handleCheckMore(scope.row)"
              >
                详情
              </el-button>
              <el-button
                v-show="checkPermi('edit')"
                size="mini"
                type="text"
                @click="onEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-show="checkPermi(`${activeName === EMPLOYEES_WELCOME ? 'remove' : 'del'}`)"
                size="mini"
                type="text"
                @click="remove(scope.row.id)"
              >
                删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="query.pageNum"
          :limit.sync="query.pageSize"
          @pagination="getList()"
        />
      </template>
    </RightContainer>
    <WelcomeDetailDrawer
      title="欢迎语详情"
      :visible.sync="welcomeDetailDrawerVisible"
      :item="welcomeMsgDetail"
      :handle-edit="onEdit"
      :transfer-material-type-item="transferMaterialTypeItem"
      :check-permi="checkPermi"
    />
  </div>
</template>

<script>
import { EMPLOYEES_WELCOME, INTO_GROUP, PAGE_LIMIT, WELCOME_TO_MEDIA_TYPE, WELCOME_APPENDIX_TYPE } from '@/utils/constant/index';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { goRouteWithQuery } from '@/utils';
import { getEmployWelList, delEmployWel, delGroupWel, getGroupWelcomeCount } from '@/api/tlp';
import VerbalTrickDetailPreview from '@/views/verbalTrickLibrary/component/verbalTrickDetailPreview.vue';
import WelcomeDetailDrawer from './components/WelcomeDetailDrawer.vue';
import { removeUrlParams } from '@/utils/common';
import { checkPermi } from '@/utils/permission';

export default {
  name: 'Welcome',
  components: { RightContainer, EmptyDefaultIcon, VerbalTrickDetailPreview, WelcomeDetailDrawer },
  props: {},
  data() {
    return {
      activeName: window.location.hash.match(/welcomeMsgTplType=(\d)/) ? Number(window.location.hash.match(/welcomeMsgTplType=(\d)/)[1]) : EMPLOYEES_WELCOME,
      EMPLOYEES_WELCOME,
      INTO_GROUP,
      list: [],
      loading: false,
      total: 0,
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT
      },
      /**
       * 欢迎语详情抽屉显示
       */
      welcomeDetailDrawerVisible: false,
      welcomeMsgDetail: {},
      // 选中的欢迎语
      multiSelected: [],
      // 以创建的入群欢迎语素材个数
      createdNum: 0
    };
  },
  computed: {
  },
  watch: {
    /**
     * 切换欢迎语类型
     */
    activeName(val) {
      var url = window.location.href;
      url = removeUrlParams(url);
      window.history.pushState({}, 0, `${url}?welcomeMsgTplType=${val}`);
      // 先清空欢迎语列表
      this.list = [];
      // 切换时获取对应类型欢迎语
      this.getList();
      // 若切换到入群欢迎语则调用获取统计接口
      if (val === INTO_GROUP) {
        this.getGroupWelcomeCount();
      }
    }
  },
  created() {
    this.getList();
    // 入群欢迎语tab需调用统计接口
    if (this.activeName && Number(this.activeName) === INTO_GROUP) {
      this.getGroupWelcomeCount();
    }
  },
  mounted() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>一、好友欢迎语</div>
        <div>管理员为企业成员设置欢迎语，客户添加成员后自动回复欢迎语，让其第一时间感受服务体验；</div>
        <div>二、入群欢迎语</div>
        <div>管理员创建入群欢迎语素材，员工为客户群选择入群欢迎语模版后，客户入群将收到欢迎语；</div>
      `
    );
  },
  // beforeRouteLeave(to, from, next) {
  //   // this.$store.dispatch(('app/setBusininessDesc', ''))
  //   this.$store.state.app.busininessDesc = ''
  //   next()
  // },
  methods: {
    /**
     * 新增欢迎语
     */
    addWelcome() {
      const query = {};
      query.welcomeMsgTplType = this.activeName;
      goRouteWithQuery(
        this.$router, query.welcomeMsgTplType === EMPLOYEES_WELCOME ? 'welcomeAdd' : 'groupWelcomeAdd',
        {},
        query);
    },
    /**
     * 批量删除
     */
    batchDel() {
      if (!this.multiSelected.length) {
        this.msgWarn('请至少选择一个欢迎语');
        return;
      }
      this.delWel({ ids: this.multiSelected.map(item => item.id) }, 'batch');
    },
    /**
     * 编辑
     */
    onEdit(item) {
      const query = { id: item.id };
      query.welcomeMsgTplType = this.activeName;
      goRouteWithQuery(this.$router, query.welcomeMsgTplType === EMPLOYEES_WELCOME ? 'welcomeAdd' : 'groupWelcomeAdd', {}, query);
    },
    /**
     * 单个删除欢迎语
     */
    remove(id) {
      this.delWel({ ids: [id] });
    },
    /**
     * 删除欢迎语
     */
    delWel(params, type) {
      this.confirmModal({
        msg: '选中的欢迎语将被删除，是否继续？'
      }, async() => {
        const delRes = await (this.activeName === EMPLOYEES_WELCOME ? delEmployWel : delGroupWel)(params);
        if (delRes) {
          this.msgSuccess('删除成功');
          const removeLength = type ? this.multiSelected.length : 1;
          // 删除的时候页码跳到上一页，获取上一页数据
          const page = this.list.length === removeLength && this.query.pageNum > 1
            ? this.query.pageNum - 1
            : this.query.pageNum;
          this.getList({ pageNum: page });
        }
      });
    },
    getList(params) {
      this.loading = true;
      getEmployWelList({ welcomeMsgTplType: this.activeName,
        ...this.query,
        ...params
      }).then(({ rows, total }) => {
        this.loading = false;
        this.list = rows;
        this.total = total;
      });
    },
    /**
     * 将欢迎语附件类型转换为素材库的素材类型（便于兼容组件里的样式类型判断）
     */
    transferMaterialTypeItem(item) {
      const newItem = { ...item,
        mediaType: WELCOME_TO_MEDIA_TYPE[item.type],
        url: [WELCOME_APPENDIX_TYPE['img'], WELCOME_APPENDIX_TYPE['file']].includes(item.type) ? item.picUrl : item.url,
        coverUrl: item.picUrl,
        content: item.description,
        title: item.content,
        radarTitle: item.radar?.radarTitle
      };
      return newItem;
    },
    /**
     * 查看更多欢迎语附件
     */
    handleCheckMore(detail) {
      this.welcomeDetailDrawerVisible = true;
      this.welcomeMsgDetail = detail;
    },
    handleSelectionChange(val) {
      this.multiSelected = val;
    },
    /**
     * 获取入群欢迎语模板统计数
     */
    getGroupWelcomeCount() {
      getGroupWelcomeCount().then(res => {
        this.createdNum = res?.data?.createdNum || 0;
      });
    },
    /**
     * 处理新增欢迎语权限
     */
    checkPermi(type) {
      const permissionKey = this.activeName === EMPLOYEES_WELCOME ? [`wecom:tlp:${type}`] : [`wecom:groupWelcome:${type}`];
      return checkPermi(permissionKey);
    },
    /**
     * 显示查看更多判断的上限个数
     */
    checkShowMoreLimit(row) {
      const LIMIT = 2;
      // 默认欢迎语也算一条，所以要计算进去
      return (row.defaultWelcomeMsg ? 1 : LIMIT);
    }
  }
};
</script>

<style lang="scss" scoped>
.welcome-list-page {
  display: flex;
  flex-direction: column;
  .check-more {
    cursor: pointer;
  }
  /deep/ .right-container {
    flex: 1;
    overflow: auto;
    position: relative;
    .show-data-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      .data-container {
        flex: 1;
        overflow: auto;

      }
    }
  }
}
</style>
