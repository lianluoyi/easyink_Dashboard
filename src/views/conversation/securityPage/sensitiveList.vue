<!-- 敏感词触发页面 -->
<template>
  <div>
    <el-tabs v-model="activeName" class="white-tabs">
      <el-tab-pane label="敏感消息记录" name="record">
        <RightContainer>
          <template v-slot:search>
            <el-form :inline="true" :model="form" class="demo-form-inline">
              <el-form-item>
                <div class="tag-input" @click="dialogVisibleSelectUser = true">
                  <span v-if="!queryUser.length" class="tag-place">请选择员工</span>
                  <template v-else>
                    <el-tag
                      v-for="(unit, unique) in queryUser"
                      :key="unique"
                      type="info"
                    >{{ unit.name }}</el-tag>
                  </template>
                </div>
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="form.keyword"
                  placeholder="请输入关键词"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="() => getSensitiveList(1)">查询</el-button>
                <el-button
                  class="btn-reset"
                  @click="resetQuery()"
                >重置</el-button>
              </el-form-item>
            </el-form>
          </template>
          <template v-slot:data>
            <el-table
              :data="tableData"
              size="medium"
              style="width: 100%"
            >
              <template slot="empty">
                <empty-default-icon
                  :length="tableData.length"
                />
              </template>
              <el-table-column label="发送者">
                <template slot-scope="scope">
                  <div v-if="scope.row.fromInfo" class="user-item">
                    <img :src="scope.row.fromInfo.avatarMediaid || scope.row.fromInfo.avatar || require('@/assets/image/default-avatar.svg')" @error="defImg">
                    <div class="name">
                      <span>{{ scope.row.fromInfo && (scope.row.fromInfo.name || scope.row.fromInfo.groupName) }}</span>
                      <div class="cus-dept">{{ (scope.row.fromInfo && departmentList[scope.row.fromInfo.mainDepartment]) ? departmentList[scope.row.fromInfo.mainDepartment].name : '' }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="接收者">
                <template slot-scope="scope">
                  <div v-if="scope.row.toListInfo" :class="`${(scope.row.toListInfo && scope.row.toListInfo.type) ? 'user-item-center' : ''} user-item`">
                    <img :src="scope.row.toListInfo.avatar || scope.row.toListInfo.avatarMediaid || require('@/assets/image/default-avatar.svg')" @error="defImg">
                    <div class="name">
                      <span>{{ scope.row.toListInfo && (scope.row.toListInfo.name || scope.row.toListInfo.groupName) }}</span>
                      <span :class="scope.row.toListInfo.type === wxType ? 'wx-type-flag' : 'customer-type'">{{ renderUserInfo(scope.row.toListInfo) }}</span>
                      <div class="cus-dept">{{ (scope.row.toListInfo && departmentList[scope.row.toListInfo.mainDepartment]) ? departmentList[scope.row.toListInfo.mainDepartment].name : '' }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="敏感词">
                <template slot-scope="scope">
                  <span>{{ scope.row.pattern_words || scope.row.patternWords }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="消息内容" />
              <!-- <el-table-column prop="status" label="消息状态">
              <template slot="header">
                {{ floorRange }}
                <el-select
                  size="mini"
                  v-model="floorRange"
                  class="noborder"
                  @change="chechName(floorRange)"
                >
                  <el-option
                    v-for="item in displayOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </template>
              <template slot-scope="scope">
                {{ STATUS_MAP[scope.row.status] }}
              </template>
            </el-table-column> -->
              <el-table-column prop="msgtime" label="发送时间">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.msgtime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template slot-scope="{ row }">
                  <el-button size="mini" type="text" @click="viewContext(row)">查看上下文</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="total > 0"
              :total="total"
              :page.sync="form.pageNum"
              :limit.sync="form.pageSize"
              @pagination="getSensitiveList()"
            />
            <!-- 选择添加人弹窗 -->
            <SelectUser
              :visible.sync="dialogVisibleSelectUser"
              title="选择添加人"
              :is-sigle-select="true"
              :selected-user-list="queryUser"
              @success="selectedUser"
            />
          </template>
        </RightContainer>
      </el-tab-pane>
      <el-tab-pane label="敏感词设置" name="settings">
        <set-sensitive-word />
      </el-tab-pane>
    </el-tabs>
    <CheckContext :visible.sync="checkContextVisible" :check-context-query="checkContextQuery" />
  </div>
</template>
<script>
import * as sensitiveApis from '@/api/conversation/security';
import SelectUser from '@/components/SelectUser/index.vue';
import { PAGE_LIMIT, SCOPE_TYPE, WX_TYPE } from '@/utils/constant/index';
import setSensitiveWord from './setSensitiveWord';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { dealAtInfo } from '@/utils/common';
import CheckContext from '../component/CheckContext.vue';
export default {
  components: {
    SelectUser,
    setSensitiveWord,
    RightContainer,
    EmptyDefaultIcon,
    CheckContext
  },
  data() {
    return {
      activeName: 'record',
      form: {
        pageSize: PAGE_LIMIT,
        pageNum: 1,
        scopeType: '',
        auditScopeId: '',
        keyword: '' // 关键词
      },
      selectDate: '',
      dateRangeValue: '', // 时间选择
      tableData: [],
      queryUser: [], // 搜索框选择的添加人
      total: 0,
      dialogVisibleSelectUser: false, // 选择添加人弹窗显隐
      floorRange: '全部',
      displayOptions: [
        {
          value: '0',
          label: '全部'
        },
        {
          value: '1',
          label: '已发送'
        },
        {
          value: '2',
          label: '已撤回'
        },
        {
          value: '3',
          label: '已删除'
        }
      ],
      STATUS_MAP: {
        '0': '全部',
        '1': '已发送',
        '2': '已撤回',
        '3': '已删除'
      },
      wxType: WX_TYPE,
      departmentList: [],
      checkContextVisible: false,
      checkContextQuery: null
    };
  },
  mounted() {
    this.getSensitiveList();
  },
  created() {
    this.getDepartmentList();
  },
  methods: {
    viewContext(row) {
      this.checkContextQuery = {
        msgId: row.msgId,
        fromId: row?.fromInfo.userId || row?.fromInfo.externalUserid
      };
      if (row.roomId) {
        this.checkContextQuery.roomId = row.roomId;
      } else {
        this.checkContextQuery.receiveId = row?.toListInfo.userId || row?.toListInfo.externalUserid;
      }
      this.checkContextVisible = true;
    },
    async getDepartmentList() {
      const data = await this.$store.dispatch('GetDepartmentList');
      const departmentList = {};
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          departmentList[data[i].id] = data[i];
        }
      }
      this.departmentList = departmentList;
    },
    /**
     * @description: 获取异常消息列表
     * @param {*} pageNum 页码
     * @return {*}
     */
    getSensitiveList(pageNum) {
      if (pageNum) this.form.pageNum = pageNum;
      this.form.scopeType = SCOPE_TYPE['personal'];
      sensitiveApis.getSecurityList(this.form).then((res) => {
        this.tableData = res.rows;
        this.total = Number(res.total);
      });
    },
    chechName(e) {
      if (e === '0') {
        this.floorRange = '全部';
      } else if (e === '1') {
        this.floorRange = '已发送';
      } else if (e === '2') {
        this.floorRange = '已撤回';
      } else {
        this.floorRange = '已删除';
      }
    },
    defImg(event) {
      const img = event.srcElement;
      img.src = require('@/assets/image/default-avatar.svg');
      img.onerror = null;
    },
    selectedUser(list) {
      // console.log(list)
      this.queryUser = list;
      // this.form.scopeType = list.map((d) => d.department) + ''
      this.form.auditScopeId = list.map((d) => d.userId) + '';
    },
    // 重置查询条件并调用查询接口
    resetQuery() {
      this.form = {
        pageSize: PAGE_LIMIT,
        pageNum: 1,
        scopeType: '',
        auditScopeId: '',
        keyword: '' // 关键词
      };
      // 选择的员工
      this.queryUser = [];
      this.getSensitiveList(1);
    },
    renderUserInfo(item) {
      return dealAtInfo(item);
    }
  }
};
</script>
<style lang="scss" scoped>
.demo-form-inline {
  background: #efefef;
  padding: 18px 10px 0 10px;
  margin-bottom: 0 !important;
}

.search-content {
  height: 40px;
  margin-top: 15px;
  padding: 10px;
  .left-title {
    height: 40px;
    line-height: 40px;
  }
  .date-range {
    margin-left: 10px;
    width: 338px;
  }
}
.noborder {
  /deep/ .el-input--mini .el-input__inner {
    width: 2px;
    border: none;
  }
  /deep/ input {
    padding-left: 17px;
    padding-right: 17px;
  }
}
.content {
  margin-top: 15px;
  padding: 10px;
}
.white-tabs {
  padding: 10px 0;
  background: #fff;
  height:  calc(100% - 40px - 15px);
  display: flex;
  flex-direction: column;
  /deep/ .el-tabs__header {
    margin-bottom: 0;
    height: 40px;
  }
  /deep/ .el-tabs__content {
    flex: 1;
    .el-tab-pane {
      height: 100%;
    }
  }
  /deep/ .el-tabs__nav-wrap::after {
    height: 0;
  }
  .user-item {
    display: flex;
    img {
      margin-right: 5px;
      width: 35px;
      height: 35px;
    }
    .wx-type-flag {
      margin-left: 3px;
    }
    .customer-type {
      color: $orange;
      margin-left: 3px;
    }
  }
  .user-item-center {
    display: flex;
    align-items: center;
  }
  /deep/ .show-data-wrapper {
    padding-top: 0;
    overflow: auto;
  }
}
</style>
