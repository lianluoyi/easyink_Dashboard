<!--
 * @Description: 信息动态
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div :class="['content-wrapper', newsItem.subType === EDIT_PIC ? 'content-img' : '']">
    <span>{{ newsItem.content }}</span>
    <div v-if="newsItem.subType === EDIT_TAG">
      <el-tag
        v-for="(tagItem, tagIndex) in dealContent(newsItem.detail)"
        :key="tagIndex"
        type="info"
      >{{ tagItem }}
      </el-tag>
    </div>
    <div v-else-if="newsItem.subType === EDIT_MULTI">
      <el-tag
        v-for="(tagItem, tagIndex) in dealContent(newsItem.detail)"
        :key="tagIndex"
        type="info"
      >{{ tagItem }}
      </el-tag>
    </div>
    <div v-else-if="newsItem.subType === EDIT_PIC">
      <el-image
        v-for="(imgItem, imgIndex) in dealContent(newsItem.detail)"
        :key="imgIndex"
        style="width:70px;height:70px;"
        fit="cover"
        :src="imgItem"
      />
    </div>
    <div v-else-if="newsItem.subType === EDIT_FILE">
      <div v-for="(fileItem, fileIndex) in dealFile(newsItem.detail)" :key="fileIndex" class="file-name" @click="downloadFile(fileItem)">
        {{ fileItem.name }}
        <template v-if="fileIndex !== dealFile(newsItem.detail).length - 1">、</template>
      </div>
    </div>
    <div v-else>{{ newsItem.detail }}</div>
  </div>
</template>
<script>
import { downloadFile } from '@/utils/common';
// 修改标签
const EDIT_TAG = 'edit_tag';
// 修改多选
const EDIT_MULTI = 'edit_multi';
// 修改图片
const EDIT_PIC = 'edit_pic';
// 修改文件
const EDIT_FILE = 'edit_file';
// 修改备注
const EDIT_REMARK = 'edit_remark';
// 修改单选
const EDIT_CHOICE = 'edit_choice';

export default {
  name: 'NewsContent',
  components: {},
  props: {
    newsItem: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      EDIT_TAG,
      EDIT_MULTI,
      EDIT_PIC,
      EDIT_FILE,
      EDIT_REMARK,
      EDIT_CHOICE
    };
  },
  methods: {
    dealFile(value) {
      const list = value.split('|');
      const newList = [];
      try {
        list.map(item => {
          item && newList.push(JSON.parse(item));
        });
      } catch (e) { console.error('处理文件异常', e); }
      return newList;
    },
    dealContent(value) {
      return (value && value.split(',')) || '';
    },
    downloadFile(file) {
      downloadFile(file.url, file.name);
    }
  }
};
</script>
<style scoped lang='scss'>
.content-wrapper {
  display: flex;
  align-items: center;
  &.content-img {
    span {
      margin-right: 15px;
    }
  }
  flex-wrap: wrap;
}
.file-name {
  color: #377aff;
  cursor: pointer;
}
</style>
