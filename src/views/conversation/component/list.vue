<template>
  <div v-loading="loading" class="list">
    <empty-default-icon
      v-if="!loading"
      class="h100"
      text="暂无聊天对象"
      :length="list.length"
    >
      <ul v-if="personList.length >= 1">
        <li v-for="(item,index) in list" :key="index" :class="{'liActive': index == personIndex}" @click="liClick(item, index)">
          <el-row class="row-div">
            <span class="fl"> <img :src="item.receiveWeCustomer ? item.receiveWeCustomer.avatar || defaultAvatar : defaultAvatar"></span>
            <span class="fl" style="margin-left:10px">
              <p class="intwoline">{{ item.receiveWeCustomer ? item.receiveWeCustomer.name : '' }} </p>
            </span>
            <div class="fl">
              <span v-if="item.finalChatContext" class="fl">{{ dealTime(item.finalChatContext.msgtime) }}</span>
            </div>
          </el-row>
        </li>
      </ul>
    </empty-default-icon>
  </div>
</template>
<script>
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';
import defaultImg from '@/assets/image/card-avatar.svg';
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
      defaultAvatar: defaultImg,
      // 聊天对象列表
      list: []
    };
  },
  watch: {
    personList(newval) {
      // 在personlist更新时赋值给list
      this.list = newval;
      this.personIndex = -1;
    }
  },
  methods: {
    dealTime(time) {
      return dealTime(time);
    },
    liClick(e, index) {
      this.personIndex = index;
      this.$emit('chatFn', e);
    }
  }
};
</script>
<style lang="scss" scoped>
*{
    padding: 0;
            margin: 0;}
            .fl{
                float: left;
                width: auto !important;
              }
    .list {
        height: 100%;
        /deep/ .el-loading-spinner{margin-top: 20px;}
       .fr{float:right;}
       .gray{color: #999;}
       .padt10{padding-top: 10px;}
        ul {
          height: calc(100% - 40px);
          overflow: auto;
            li {
                padding: 10px;
                overflow: hidden;
                border-bottom: 1px solid #efefef;
                cursor: pointer;
                img {
                    width: 40px;
                    height: 40px;
                    float: left
                }
                .row-div {
                  display: flex;
                  align-items: center;
                }
            }
            li:hover{ background: #efefef;}
        }
        .liActive {
            background-color: #eeeeee;
        }
    }
.fl:last-child {
  margin-left:auto;
  color: #B8BCC5;
  width: 40px !important;
}
</style>
