<template>
  <div v-loading="loading" class="list">
    <div class="search">
      <el-input v-model="listretrieveName" placeholder="请输入聊天对象昵称" clearable prefix-icon="el-icon-search" @input="input" @clear="clear" />
    </div>
    <empty-default-icon
      v-if="!loading"
      text="暂无聊天对象"
      :length="list.length"
    >
      <div v-if="personList.length >= 1" style="margin-top:45px">
        <ul>
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
      </div>
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
      list: [],
      // 员工检索姓名
      listretrieveName: ''
    };
  },
  watch: {
    personList(newval) {
      // 在personlist更新时赋值给list
      this.list = newval;
      this.personIndex = -1;
      if (this.listretrieveName) {
        this.list = this.personList.filter(item => {
          return item.receiveWeCustomer.name.includes(this.listretrieveName);
        });
      }
    },
    listretrieveName(val) {
      sessionStorage.setItem('list', val);
      this.list = this.personList.filter(item => {
        return item.receiveWeCustomer.name.includes(val);
      });
    }
  },
  created() {
    if (sessionStorage.getItem('list') !== null) {
      this.listretrieveName = sessionStorage.getItem('list');
    }
  },
  methods: {
    dealTime(time) {
      return dealTime(time);
    },
    // 输入框值改变时
    input(value) {
      // 当输入框值变为空的时候
      if (!value) {
        this.list = this.personList;
      }
    },
    // 清除输入框
    clear() {
      sessionStorage.removeItem('list');
      this.list = this.personList;
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
        overflow-y: auto;
        height: 100%;
        ::-webkit-scrollbar {
            display: none;
        }
        /deep/ .el-loading-spinner{margin-top: 20px;}
       .fr{float:right;}
       .gray{color: #999;}
       .padt10{padding-top: 10px;}
        ul {
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
.search {
 position: absolute;
  padding: 6px 11px;
  z-index :999;
  background-color: #F6F6F6;
  width: 100%;
}
.fl:last-child {
  margin-left:auto;
  color: #B8BCC5;
  width: 40px !important;
}
</style>
