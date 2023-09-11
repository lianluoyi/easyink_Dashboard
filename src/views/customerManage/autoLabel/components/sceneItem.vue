<!--
 * @Description: 单个场景布局样式
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="scene-item">
    <el-card v-if="labelType === AUTOLABEL_TYPE['intoGroup']" class="content-card">
      <div class="row-div flex mb10">
        <div class="mr10 mt15">客户进入群聊</div>
        <div class="content-div">
          <el-button
            v-if="!ruleDetail"
            class="mr10 mt10"
            icon="el-icon-plus"
            size="mini"
            @click="addGroup"
          >添加群聊</el-button>
          <el-tag
            v-for="(unit, unique) in chatRoomList"
            :key="unique"
            type="info"
            class="user-tag mb5"
            size="medium"
            :closable="!ruleDetail"
            @close="handleCloseGroup(unit)"
          >{{ unit.groupName }}</el-tag>
        </div>
      </div>
      <div class="row-div flex">
        <div class="mr10 mt15">打上客户标签</div>
        <div class="content-div">
          <el-button
            v-if="!ruleDetail"
            class="mr10 mt10"
            icon="el-icon-plus"
            size="mini"
            @click="openTagDialog"
          >添加标签</el-button>
          <el-tag
            v-for="(item, index) in tagList"
            :key="index"
            class="mb5"
            :type="ruleDetail ? 'info':'' "
            size="medium"
            :closable="!ruleDetail"
            @close="handleClose(item)"
          >{{ item.name || item.tagName }}</el-tag>
        </div>
      </div>
    </el-card>
    <el-card v-if="labelType === AUTOLABEL_TYPE['newCustomer']" class="content-card">
      <div class="row-div flex " style="align-items:center;margin-bottom:10px">
        <div class="mr10">在每</div>
        <el-select :value="sceneType" style="width: 70px;" :disabled="ruleDetail" @change="changeScene">
          <el-option
            v-for="item in sceneOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select v-if="sceneType === NEWCUSOMTER_SCENE_TYPE['week']" v-model="loopPoint" placeholder="请选择" style="width: 70px;" class="ml5" :disabled="ruleDetail">
          <el-option
            v-for="item in weekOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <MonthDateSelect v-if="sceneType === NEWCUSOMTER_SCENE_TYPE['month']" :disable="ruleDetail" :month-date-val.sync="loopPoint" />
        <el-time-picker
          v-model="loopBeginTime"
          :disabled="ruleDetail"
          placeholder="开始时间"
          style="width: 102px;"
          class="mr5 ml5"
          value-format="HH:mm"
          format="HH:mm"
        />
        <span>~</span>
        <el-time-picker
          v-model="loopEndTime"
          :disabled="ruleDetail"
          class="ml5"
          placeholder="结束时间"
          style="width: 102px;"
          value-format="HH:mm"
          format="HH:mm"
          :picker-options="{
            minTime: loopBeginTime
          }"
        />
        <span class="ml5">成为员工的客户</span>
      </div>
      <div class="row-div flex " style="width:600px">
        <div class="mr10 mt15" style="width:90px">打上客户标签</div>
        <div style="width:470px;">
          <el-button
            v-if="!ruleDetail"
            class="mr10 mt10"
            icon="el-icon-plus"
            size="mini"
            @click="openTagDialog"
          >添加标签</el-button>
          <el-tag
            v-for="(item, index) in tagList"
            :key="index"
            size="medium"
            :type="ruleDetail ? 'info':'' "
            :closable="!ruleDetail"
            @close="handleClose(item)"
          >
            {{ item.name || item.tagName }}</el-tag>
        </div>
      </div>
    </el-card>
    <!-- 选择标签弹窗 -->
    <SelectTag
      v-if="dialogVisibleSelectTagLoaded"
      :visible.sync="dialogVisibleSelectTag"
      title="选择标签"
      type="search"
      :selected="tagList"
      tag-type="customer"
      :is-show-add="true"
      @success="submitSelectTag"
    />
    <!-- 选择客户群聊 -->
    <CustomerGroupModal
      v-if="labelType === AUTOLABEL_TYPE['intoGroup'] && customerGroupVisibleLoaded"
      ref="customer"
      :visible.sync="customerGroupVisible"
      append-to-body
      :close-on-click-modal="false"
      :cancel-click="cancelClick"
      :ok-click="handleSelectCustomerGroup"
      :customer-group-list.sync="customerGroupList"
      :select-single="false"
      @callback="getSelectCustomerGroup"
    />
  </div>
</template>
<script>
import { AUTOLABEL_TYPE, WEEK_OPTIONS, NEWCUSOMTER_SCENE_TYPE } from '@/utils/constant/index';
import MonthDateSelect from '@/components/MonthDateSelect.vue';
import SelectTag from '@/components/SelectTag';
import CustomerGroupModal from '@/views/drainageCode/group/customer.vue';
import differenceBy from 'lodash/differenceBy';

export default {
  name: 'SceneItem',
  components: { MonthDateSelect, SelectTag, CustomerGroupModal },
  props: {
    /**
     * 标签类型
     */
    labelType: {
      type: Number,
      default: AUTOLABEL_TYPE['keyWords']
    },
    /**
     * 场景列表
     */
    sceneList: {
      type: Array,
      default: () => []
    },
    /**
     * 更新场景列表
     */
    updateSceneList: {
      type: Function,
      default: () => {}
    },
    /**
     * 场景下标
     */
    sceneIndex: {
      type: Number,
      default: null
    },
    /**
     * 是否是规则详情的子组件
     */
    ruleDetail: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      AUTOLABEL_TYPE,
      NEWCUSOMTER_SCENE_TYPE,
      // 生效时间类型下拉选项值
      sceneOptions: [{
        value: NEWCUSOMTER_SCENE_TYPE['day'],
        label: '天'
      }, {
        value: NEWCUSOMTER_SCENE_TYPE['week'],
        label: '周'
      }, {
        value: NEWCUSOMTER_SCENE_TYPE['month'],
        label: '月'
      }],
      weekOptions: WEEK_OPTIONS,
      // 标签弹窗显示状态
      dialogVisibleSelectTag: false,
      // 标签弹窗是否已挂载过，该标识为了防止重复调用标签列表接口
      dialogVisibleSelectTagLoaded: false,
      // 已选择的客户群
      customerGroupList: [],
      // 客户群选择弹窗显示状态
      customerGroupVisible: false,
      // 客户群选择弹窗是否已挂载过，该标识为了防止重复调用标签列表接口
      customerGroupVisibleLoaded: false,
      // 移除的群聊列表
      removeGroupList: [],
      // 移除的标签列表
      removeTagList: []
    };
  },
  computed: {
    chatRoomList() {
      return this.sceneList[this.sceneIndex].chatRoomList;
    },
    tagList() {
      return this.sceneList[this.sceneIndex].tagList;
    },
    // 场景类型
    sceneType: {
      get() {
        return this.sceneList[this.sceneIndex].sceneType;
      },
      set(value) {
        this.updateSceneList(value, 'sceneType');
      }
    },
    // 周几 或 几号
    loopPoint: {
      get() {
        return this.sceneList[this.sceneIndex].loopPoint;
      },
      set(value) {
        this.updateSceneList(value, 'loopPoint');
      }
    },
    // 生效开始时间
    loopBeginTime: {
      get() {
        return this.sceneList[this.sceneIndex].loopBeginTime;
      },
      set(value) {
        this.updateSceneList(value, 'loopBeginTime');
      }
    },
    // 生效结束时间
    loopEndTime: {
      get() {
        return this.sceneList[this.sceneIndex].loopEndTime;
      },
      set(value) {
        this.updateSceneList(value, 'loopEndTime');
      }
    }
  },
  created() {},
  methods: {
    /**
     * 选择标签确认按钮
     */
    submitSelectTag(data) {
      // 过滤出弹窗中取消选中的标签
      let removeList = differenceBy(this.tagList, data, 'tagId');
      this.updateSceneList([...data], 'tagList');
      this.dialogVisibleSelectTag = false;
      removeList = this.removeTagList.concat(removeList);
      this.updateSceneList(removeList, 'removeTagList');
    },
    /**
     * 移除客户标签
     */
    handleClose(tag) {
      const tagList = [...this.tagList];
      const index = tagList.findIndex(item => item.tagId === tag.tagId);
      tagList.splice(index, 1);
      this.updateSceneList(tagList, 'tagList');
      this.removeTagList.push(tag);
      this.updateSceneList(this.removeTagList, 'removeTagList');
    },
    /**
     * 移除选中的客户群
     */
    handleCloseGroup(group) {
      const chatRoomList = [...this.chatRoomList];
      const index = chatRoomList.findIndex(item => item.chatId === group.chatId);
      chatRoomList.splice(index, 1);
      this.updateSceneList(chatRoomList, 'chatRoomList');
      this.removeGroupList.push(group);
      this.updateSceneList(this.removeGroupList, 'removeGroupList');
    },
    /**
     * 关闭客户群聊选择弹窗
     */
    cancelClick() {
      this.customerGroupVisible = false;
    },
    // 客户群dialog选中数据
    handleSelectCustomerGroup() {
      this.$refs.customer.submit();
    },
    /**
     * 获取选中客户群
     * @param customerGroup 选中的客户群列表
     */
    getSelectCustomerGroup(customerGroup) {
      const chatRoomList = [...customerGroup];
      // 过滤出弹窗中取消选中的群
      let removeList = differenceBy(this.chatRoomList, customerGroup, 'chatId');
      this.updateSceneList(chatRoomList, 'chatRoomList');
      this.customerGroupVisible = false;
      removeList = this.removeGroupList.concat(removeList);
      this.updateSceneList(removeList, 'removeGroupList');
    },
    /**
     * 切换场景类型 周/月置为起始值
     */
    changeScene(value) {
      this.sceneType = value;
      this.loopPoint = 1;
    },
    /**
     * 添加群聊
     */
    addGroup() {
      this.customerGroupVisible = true;
      this.customerGroupVisibleLoaded = true;
      this.customerGroupList = [...this.chatRoomList];
    },
    /**
     * 打开标签弹窗
     */
    openTagDialog() {
      this.dialogVisibleSelectTag = true;
      this.dialogVisibleSelectTagLoaded = true;
    }
  }

};
</script>
<style scoped lang='scss'>
.scene-item {
    .content-card {
        color: #606266;
        width: 600px;
        /deep/ .el-card__body {
            padding-top: 22px;
        }
    }
    .row-div {
        .content-div {
          flex: 1;
        }
    }
    /deep/ .el-date-editor--time {
        .el-input__prefix {
            left: 2px;
        }
        .el-input__inner {
            padding-left: 26px;
            padding-right: 20px;
        }
    }
    /deep/ .el-select {
        .el-input__inner {
            padding-left: 8px;
            padding-right: 8px;
        }
        .el-input__suffix {
          right: 2px;
        }
    }
}
.el-tag{
  margin-top:10px;
}
</style>
