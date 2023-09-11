<!--
 * @Description: 朋友圈内容 图片、链接、视频
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div>
    <div v-if="data.mediaType===Number(MEDIA_TYPE_POSTER)">
      <!-- 图片大于3张 -->
      <div v-if="imgLength" class="list">
        <div class="imglist">
          <div v-for="item in list" :key="item.id" class="img">
            <el-image
              style="width: 40px; height: 40px"
              :src="item.url"
              fit="fill"
            />
          </div>
        </div>
      </div>
      <div v-else class="flex">
        <div v-for="item in list" :key="item.id">
          <el-image
            style="width: 50px; height: 50px; margin-right:5px"
            :src="item.url"
            fit="fill"
          />
        </div>
      </div>
    </div>
    <div v-if="data.mediaType===Number(MEDIA_TYPE_VIDEO)">
      <ContentVideo :data="list" />
    </div>
    <div v-if="data.mediaType===Number(MEDIA_TYPE_IMGLINK)">
      <VerbalTrickImgLink :title="list.title" :cover-url="list.coverUrl" />
    </div>
  </div>
</template>
<script>
import VerbalTrickImgLink from './Link.vue';
import ContentVideo from './ContentVideo.vue';
import {
  MEDIA_TYPE_POSTER, MEDIA_TYPE_IMGLINK, MEDIA_TYPE_VIDEO
} from '@/utils/constant/index';
const MAXIMGLENGTH = 3;
export default {
  components: { VerbalTrickImgLink, ContentVideo },
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_IMGLINK,
      MEDIA_TYPE_VIDEO,
      // 当附件为视频或者链接的时候
      list: {},
      showContent: true,
      // 附件为图片时，图片是否超过3张，默认为 false
      imgLength: undefined
    };
  },
  computed: {

  },
  watch: {
    // 数据变化时调用
    data: {
      handler(newval) {
        this.data = newval;
        this.imgLength = undefined;
        this.getContent();
      },
      deep: true
    }
  },
  mounted() {
    // 挂载时调用
    this.getContent();
  },
  methods: {
    getContent() {
      if (this.data.mediaType !== null) {
        if (this.data.mediaType === Number(MEDIA_TYPE_POSTER)) {
          // 附件为图片时判断typeLength
          this.list = this.data.weWordsDetailList;
          if (this.data.weWordsDetailList.length > MAXIMGLENGTH) {
            this.imgLength = true;
          }
        } else {
          // 附件为视频时
          this.list = this.data.weWordsDetailList[0];
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.list {
  width: 122px;
  border-radius: 5px;
  border: 1px solid #ccc;
  height: 122px;
  overflow: hidden;
  div:nth-child(2) {
    margin: 0 1px;
  }
   div:nth-child(4) {
   margin: 1px 0;
  }
   div:nth-child(5) {
    margin: 1px;
  }
   div:nth-child(6) {
    margin: 1px 0;
  }
   div:nth-child(8) {
    margin: 0 1px;
  }
}
.imglist {
  width: 122px;
  display: flex;
  flex-wrap: wrap;
  height: calc(100%/3)-10px;
}
.img {
  width: 40px;
  height: 40px;
  box-sizing: border-box;
}

</style>
