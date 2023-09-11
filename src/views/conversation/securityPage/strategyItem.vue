<!--
 * @Description: 单个策略布局
 * @Author: broccoli
 * @LastEditors: xulinbin
-->
<!-- 敏感词设置页面 -->
<template>
  <div class="strategy-item-div">
    <div class="title section-title-border">{{ item.strategyName }}</div>
    <div class="content">
      <div class="word strategy-item">
        <div class="label">敏感词</div>
        <div class="audit-scope-column">
          <el-tag v-for="(wordItem, index) in wordList" :key="index" class="tag-item theme-text-color" size="medium">
            {{ wordItem }}
          </el-tag>
        </div>
      </div>
      <div class="scope strategy-item">
        <div class="label">审计范围</div>
        <ByLengthUserShow
          :max-length="MAX_SHOW_LENGTH"
          :user-list="item.auditUserScope.filter(item => item.scopeType === SCOPELIST_TYPE.USER || item.scopeType === SCOPELIST_TYPE.ALL_USER ).map(item => { return { ...item, userName: item.auditScopeName } } )"
          :department-list="item.auditUserScope.filter(item => item.scopeType === SCOPELIST_TYPE.DEPARTMENT).map(item => { return { ...item, departmentName: item.auditScopeName, departmentId:item.id } })"
        />
        <span v-if="item.auditUserScope && item.auditUserScope.length > MAX_SHOW_LENGTH">
          等{{ item.auditUserScope.length }}人
        </span>
      </div>
      <div class="user-list strategy-item">
        <div class="label">审计人员</div>
        <div>{{ item.auditUserName }}</div>
      </div>
      <div class="notify-switch strategy-item" style="margin-bottom: 0">
        <div class="label">提醒通知</div>
        <div>
          <el-switch
            v-model="item.alertFlag"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(item)"
          />
        </div>
        <div class="desc">当审计范围内员工发送敏感词给客户，将给审计人员发送应用通知</div>
      </div>
      <div class="tool">
        <el-button
          v-hasPermi="['wecom:sensitive:edit']"
          class="iconfont icon-tool-edit"
          size="mini"
          type="text"
          @click="handleUpdate(item)"
        >编辑</el-button>
        <el-button
          v-hasPermi="['wecom:sensitive:remove']"
          icon="el-icon-delete"
          size="mini"
          type="text"
          @click="handleDelete(item)"
        >删除</el-button>
      </div>
    </div>
  </div>
</template>
<script>
// 审计范围类型（1:员工、2:部门、3:所有）
const DEPART_TYPE = 1;
const ALL_TYPE = 3;
// 审计范围显示人数最大值
const MAX_SHOW_LENGTH = 10;
import { SCOPELIST_TYPE } from '@/utils/constant/index';
import ByLengthUserShow from '@/components/ByLengthUserShow';
export default {
  components: { ByLengthUserShow },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    handleStatusChange: {
      type: Function,
      default: () => {}
    },
    handleUpdate: {
      type: Function,
      default: () => {}
    },
    handleDelete: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      departType: [DEPART_TYPE, ALL_TYPE],
      MAX_SHOW_LENGTH,
      SCOPELIST_TYPE
    };
  },
  computed: {
    wordList() {
      const list = this.item.patternWords.split(',') || [];
      return list;
    }
  }
};
</script>
<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
  .strategy-item-div {
    background-color: #fff;
    padding: 15px;
    border: 1px solid $borderColor;
    margin-bottom: 15px;
    border-radius: 3px;
    &:hover {
      @include box_shadow_color(0px, 0px, 5px, 0px, $color-theme2-1);
    }
    .title {
      margin-bottom: 10px;
      color: $black;
      height: 20px;
      line-height: 20px;
      font-weight: bold;
    }
    .content {
      padding-left: 10px;
    }
    .strategy-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .label {
        width: 60px;
        text-align: right;
        margin-right: 10px;
        color: #606266;
      }
      .desc {
        color: #7F7F7F;
        font-size: 12px;
        margin-left: 10px;
      }
      .tag-item {
        @include border_style($width: 1px);
        padding: 5px 10px;
        line-height: 16px;
        font-size: 12px;
        margin-right: 5px;
      }
      .icon-folder {
        margin-right: 3px;
      }
      &:last-child {
        margin-bottom: 0;
      }
      .scope-item {
        display: flex;
        align-items: center;
      }
    }
    .tool {
      text-align: right;
      button {
        @include text_btn_color($color-theme2-1);
        padding: 0;
        font-size: 14px;
      }
    }
  }
</style>
