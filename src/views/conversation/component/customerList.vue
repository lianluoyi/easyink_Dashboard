<template>
  <div v-loading="loading" class="list">
    <empty-default-icon
      v-if="!loading"
      text="暂无聊天对象"
      class="h100"
      :length="list.length"
    >
      <ul v-if="personList.length>=1" class="customer-list">
        <li v-for="(item,index) in list" :key="index" :class="{'liActive': index == personIndex}" @click="liClick(item, index)">
          <div class="img-div"><img :src="getHeadImgUrl(item.receiveWeUser && item.receiveWeUser.avatarMediaid)"></div>
          <div class="info-div">
            <p>{{ item.receiveWeUser && item.receiveWeUser.name }} <span class="fr gray">{{ item.finalChatContext ? parseTime(item.finalChatContext.msgtime) : '' }}</span></p>
            <p v-if="item.finalChatContext && item.finalChatContext.text" class="gray padt10 toe">{{ item.finalChatContext ? item.finalChatContext.text.content : '' }}</p>
          </div>
        </li>
      </ul>
    </empty-default-icon>
    <div v-else />
  </div>
</template>
<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import { getHeadImgUrl } from '@/utils/common';
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
      // 聊天对象列表
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
    getHeadImgUrl,
    liClick(e, index) {
      this.personIndex = index;
      this.$emit('chatFn', e);
    }
  }
};
</script>
<style lang="scss" scoped>
*{ padding: 0;
            margin: 0;}
    .list {
      height: 100%;
        /deep/ .el-loading-spinner{margin-top: 20px;}
       .fr{float:right;}
       .gray{color: #999;}
       .padt10{padding-top: 10px;}
        ul li {
          padding: 10px;
          overflow: hidden;
          border-bottom: 1px solid #efefef;
          cursor: pointer;
          p{white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;}
          img {
              width: 40px;
              height: 40px;
              float: left
          }
        }
        li:hover{ background: #efefef;}
        .liActive {
            background-color: #eeeeee;
        }
        .customer-list {
          height: calc(100% - 40px);
          overflow-y: auto;
          li {
              display: flex;
              .img-div {
                  width: 40px;
                  margin-right: 10px;
              }
              .info-div {
                  flex: 1;
                  width: 0;
              }
          }
        }
    }
 .search {
    padding: 6px 11px;
    z-index :999;
    background-color: #F6F6F6;
    width: 100%;
  }
</style>
