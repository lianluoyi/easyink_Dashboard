<!--
 * @Description: sop时间线预览卡片
 * @Author: chenchengjie
 * @LastEditors: chenchengjie
-->
<template>
  <el-card class="box-card">
    <p class="card-title">消息发送时间线预览</p>
    <div class="card-content">
      <div v-for="{ day, data } in finalList" :key="day" class="day-block">
        <p class="day-title">{{ `第${day}天` }}</p>
        <div v-for="item in data" :key="item.id" class="record">
          <el-popover
            placement="right"
            :title="item.name"
            width="200"
            trigger="hover"
            :close-delay="300"
            popper-class="record-popper"
          >
            <template slot="reference">
              <p v-if="item.alertType === RULE_PERFORM_TYPE['hourMinute']">
                +{{ item.alertData1 }}小时{{ item.alertData2 }}分
              </p>
              <p v-if="item.alertType === RULE_PERFORM_TYPE['dayTime']">
                {{ item.alertData2 }}
              </p>
            </template>
            <div class="record-content">
              {{ mediaTypeTitle(item.materialList[0]) }}
            </div>
            <div class="record-foot">
              <p>共{{ item.materialList.length }}条</p>
              <i
                v-if="isEdit"
                class="iconfont icon-tool-edit"
                title="编辑"
                @click="handleEdit(item)"
              />
              <i
                v-else
                class="iconfont icon-details"
                title="详情"
                @click="handleShowDetail(item)"
              />
            </div>
          </el-popover>
        </div>
      </div>
    </div>
    <div v-if="allDaysList.length > PAGE_SIZE" class="card-footer">
      <el-button
        v-if="currentPage !== 1"
        type="primary"
        plain
        icon="el-icon-arrow-left"
        @click="currentPage -= 1"
      >向前查看30天</el-button>
      <el-button
        v-if="currentPage < maxPage"
        type="primary"
        plain
        class="next-button"
        @click="currentPage += 1"
      >向后查看30天<i class="el-icon-arrow-right el-icon--right" /></el-button>
    </div>
  </el-card>
</template>
<script>
import {
  MESSAGE_MEDIA_TYPE,
  RULE_PERFORM_TYPE,
  MEDIA_TYPE_TEXT,
  MEDIA_TYPE_SMARTFORM,
  MEDIA_TYPE_POSTER,
  MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_IMGLINK,
  MEDIA_TYPE_MINIAPP,
  MEDIA_TYPE_RADARLINK
} from '@/utils/constant/index';

const PAGE_SIZE = 30;
export default {
  props: {
    ruleList: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      MESSAGE_MEDIA_TYPE,
      RULE_PERFORM_TYPE,
      PAGE_SIZE,
      currentPage: 1
    };
  },
  computed: {
    // 按日期划分所有规则
    allDaysList() {
      const list = [];
      this.ruleList.forEach((item) => {
        const index = list.findIndex((x) => {
          if (item.alertType === RULE_PERFORM_TYPE['hourMinute']) {
            return x.day === 1;
          }
          return x.day === item.alertData1;
        });
        if (index === -1) {
          list.push({
            day: item.alertType === RULE_PERFORM_TYPE['hourMinute'] ? 1 : item.alertData1,
            data: [item]
          });
        } else {
          list[index].data.push(item);
        }
      });
      if (list.length === 0) {
        return [];
      }
      const result = [];
      const days = list.map((item) => item.day);
      const minDay = Math.min(...days);
      const maxDay = Math.max(...days);
      for (let i = minDay; i <= maxDay; i++) {
        const target = list.find((item) => item.day === i);
        result.push({
          day: i,
          data: target?.data || []
        });
      }
      return this.sortList(result);
    },
    finalList() {
      if (this.allDaysList.length <= PAGE_SIZE) {
        return this.allDaysList;
      }
      const start = (this.currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      return this.allDaysList.slice(start, end);
    },
    maxPage() {
      return Math.ceil(this.allDaysList.length / PAGE_SIZE);
    }
  },
  watch: {
    'allDaysList.length': {
      handler() {
        this.currentPage = 1;
      }
    }
  },
  methods: {
    mediaTypeTitle(data) {
      const mediaType = data.mediaType.toString();
      switch (mediaType) {
        case MEDIA_TYPE_TEXT:
          return data.content;
        case MEDIA_TYPE_POSTER:
        case MEDIA_TYPE_VIDEO:
        case MEDIA_TYPE_FILE:
        case MEDIA_TYPE_IMGLINK:
        case MEDIA_TYPE_MINIAPP:
          return `[${MESSAGE_MEDIA_TYPE[mediaType]}]` + data.title;
        case MEDIA_TYPE_SMARTFORM:
          return `[${MESSAGE_MEDIA_TYPE[mediaType]}]` + (data?.form?.formName || data?.formName || '');
        case MEDIA_TYPE_RADARLINK:
          return `[${MESSAGE_MEDIA_TYPE[mediaType]}]` + (data?.radar?.radarTitle || data?.radarTitle || '');
      }
    },
    handleEdit(item) {
      const index = this.ruleList.findIndex((it) => {
        return it.id === item.id;
      });
      this.$emit('handleEdit', item, index);
    },
    handleShowDetail(item) {
      this.$emit('handleShowDetail', item);
    },
    sortList(list) {
      list.forEach((item) => {
        // 同一天有两条记录及以上的排序
        if (item.data.length > 1) {
          const fomatToNumber = (timeString) =>
            Number(timeString.replace(':', ''));
          // 两种alertType分别进行排序
          const alertType0Data = item.data
            .filter((item) => item.alertType === RULE_PERFORM_TYPE['hourMinute'])
            .sort((a, b) => {
              return (
                Number('' + a.alertData1 + a.alertData2) -
                Number('' + b.alertData1 + b.alertData2)
              );
            });
          const alertType1Data = item.data
            .filter((item) => item.alertType === RULE_PERFORM_TYPE['dayTime'])
            .sort((a, b) => {
              return fomatToNumber(a.alertData2) - fomatToNumber(b.alertData2);
            });
          item.data = [...alertType0Data, ...alertType1Data];
        }
      });
      return list;
    }
  }
};
</script>
<style scoped lang="scss">
.box-card {
  max-height: 590px;
  position: relative;
  color: #101010;
  .card-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .card-content {
    display: flex;
    flex-wrap: wrap;
    width: 510px;
    max-height: 470px;
    overflow-y: scroll;
    .day-block {
      width: 90px;
      margin-top: 20px;
      margin-right: 10px;
      text-align: center;
      .day-title {
        font-size: 16px;
        font-weight: normal;
        margin-bottom: 5px;
      }
      .record {
        color: #606266;
        cursor: pointer;
        > span {
          line-height: 24px;
        }
        &:hover {
          background: #e5f1fc;
          border-radius: 4px;
        }
      }
    }
  }
  .card-footer {
    position: absolute;
    bottom: 20px;
    width: 510px;
    height: 32px;
    .next-button {
      position: absolute;
      right: 0;
    }
  }
}
</style>
<style lang="scss">
@import '~@/styles/mixin.scss';

.record-popper {
  .el-popover__title {
    font-weight: bold;
    margin-bottom: 5px;
  }
  .record-content {
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .record-foot {
    display: flex;
    align-items: flex-end;
    > i {
    margin-left: 8px;
    cursor: pointer;
    @include text_btn_color($color-theme2-1);
  }
  }
}
</style>
