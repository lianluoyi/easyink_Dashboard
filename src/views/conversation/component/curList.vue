<template>
  <div v-loading="loading" class="list">
    <div v-if="personList.length >= 1">
      <ul>
        <li
          v-for="(item, index) in personList"
          :key="index"
          @click="liClick(item)"
        >
          <el-row style="padding:10px">
            <span class="fl">
              <img
                :src="item.finalChatContext.fromInfo.avatar"
              ></span>
            <span class="fl" style="margin-left:8px;">
              <p>
                {{ item.roomInfo.groupName }}
                <span class="fr gray">{{
                  parseTime(item.finalChatContext.msgtime)
                }}</span>
              </p>
              <p v-if="item.finalChatContext.text" class="gray ">
                {{ item.finalChatContext.text.content }}
              </p>
            </span>
          </el-row>
        </li>
      </ul>
    </div>
    <div v-else />
  </div>
</template>
<script>
export default {
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
      loadings: true
    };
  },
  methods: {
    liClick(e) {
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
.fl {
  float: left;
}
.list {
  overflow: auto;
  height: 652px;
  ::-webkit-scrollbar {
    display: none;
  }

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
  ul li {
    overflow: hidden;
    border-bottom: 1px solid #efefef;
    cursor: pointer;
    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    :hover {
      background: #efefef;
    }
    img {
      width: 40px;
      height: 40px;
      float: left;
    }
  }
}
</style>
