
<template>
  <div v-loading="loading" class="list">
    <empty-default-icon
      v-if="!loading"
      text="暂无聊天对象"
      :length="list.length"
      class="h100"
    >
      <ul v-if="personList.length >= 1">
        <li
          v-for="(item, index) in list"
          :key="index"
          :class="{ liActive: index == personIndex }"
          @click="liClick(item, index)"
        >
          <el-row class="row-div">
            <span class="fl"> <img :src="getHeadImgUrl(item.receiveWeUser.avatarMediaid)"></span>
            <span class="fl" style="margin-left: 10px">
              <p class="intwoline">{{ item.receiveWeUser.name }}</p>
            </span>
            <span v-if="item.finalChatContext" class="time">{{ dealTime(item.finalChatContext.msgtime) }}</span>
          </el-row>
        </li>
      </ul>
    </empty-default-icon>
  </div>
</template>
<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { getHeadImgUrl } from '@/utils/common';
import { dealTime } from '@/utils';
export default {
  components: { EmptyDefaultIcon },
  props: {
    personList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      defluat: false
    }
  },
  data() {
    return {
      loadings: true,
      personIndex: -1,
      list: []
    };
  },
  watch: {
    personList(newval) {
      // 在personlist更新时赋值给list
      this.personIndex = -1;
      this.list = newval;
    }
  },
  methods: {
    dealTime(time) {
      return dealTime(time);
    },
    getHeadImgUrl,
    liClick(e, index) {
      this.personIndex = index;
      this.$emit('chatFn', e);
    }
  }
};
</script>
<style lang="scss" scoped>
* {
  padding: 0;
  margin: 0;
}
.time {
  margin-left: auto;
  font-size: 14px;
  width: 40px;
  color: #B8BCC5;
  flex-shrink: 0;
}
.fl {
  float: left;
}
.list {
  height: 100%;
  /deep/ .el-loading-spinner {
    margin-top: 20px;
  }
  .fr {
    float: right;
  }
  .gray {
    color: #999;
  }
  .padt10 {
    padding-top: 10px;
  }
  ul{
    height: calc(100% - 40px);
    overflow: auto;
    li {
      padding: 10px;
      overflow: hidden;
      border-bottom: 1px solid #efefef;
      cursor: pointer;
      .row-div {
        display: flex;
        align-items: center;
      }
      img {
        width: 40px;
        height: 40px;
        float: left;
      }
    }
    li:hover {
      background: #efefef;
    }
  }
  .liActive {
    background-color: #eeeeee;
  }
}

</style>
