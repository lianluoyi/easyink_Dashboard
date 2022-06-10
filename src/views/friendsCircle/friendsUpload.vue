<!--
 * @Description: 图片的上传
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<script>
import { uploadFile2Cos } from '@/api/common';
import { MEDIA_TYPE_POSTER } from '@/utils/constant';
import { dealUploadSize, dealFormat } from '@/utils/common';
import draggable from 'vuedraggable';
const FILE_NAME_LENGTH = 32;
const IMAGELENGTH = 9;
// 上传图片的大小
const IMG_BYTE = 10;
// 上传图片的分辨率
const MAX_HEIGHT = 1080;
const MAX_WIDTH = 1440;
export default {
  name: 'Upload',
  components: { draggable },
  props: {
    // 上传列表
    uploadList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 定义一个数组来存储临时上传的图片文件，用来解决图片未渲染成功的问题
      temporary: [],
      MAX_HEIGHT,
      MAX_WIDTH,
      drag: false,
      showIcon: false,
      // 上传成功的次数
      onSuccessTime: 0,
      showBtnDealImg: true,
      noneBtnImg: false,
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: [],
      loading: false,
      action: process.env.VUE_APP_BASE_API + '/common/uploadFile2Cos',
      MEDIA_TYPE_POSTER,
      // 上传的最大照片数量
      limitNum: IMAGELENGTH,
      FILE_NAME_LENGTH
    };
  },
  computed: {},
  watch: {
    uploadList(newval) {
      this.fileList = newval;
      if (newval.length === 0) {
        this.showMedia = true;
        this.noneBtnImg = false;
      }
      this.onSuccessTime = this.fileList.length;
      if (this.fileList.length === IMAGELENGTH) {
        this.noneBtnImg = true;
      }
    }
  },
  created() {},
  methods: {
    enter() {
      this.showIcon = true;
    },
    leave() {
      this.showIcon = false;
    },
    // 预览图片
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    /**
     * @description: 截取掉文件名超出限制的部分
     * @param {*} oldFileName 原有文件名
     * @return {*} 截取后文件名
     */
    dealImgName(oldFileName) {
      const index = oldFileName.lastIndexOf('.');
      const ext = oldFileName.substring(index);
      const fileName = oldFileName.substring(0, index);
      const newFileName = fileName.slice(0, this.FILE_NAME_LENGTH - ext.length) + ext;
      return newFileName;
    },
    /**
     * 上传前校验格式和大小
     */
    handleBeforeUpload(file) {
      this.loading = true;
      let isFormat = true;
      let isSize = true;
      isFormat = dealFormat(MEDIA_TYPE_POSTER, file, this);
      isSize = dealUploadSize(MEDIA_TYPE_POSTER, file, this, IMG_BYTE);
      if (!isFormat || !isSize) {
        this.loading = false;
      }
      return isFormat && isSize;
    },
    onSuccess(res, file) {
      this.loading = false;
      this.fileList[this.onSuccessTime].title = res.data.fileName;
      this.fileList[this.onSuccessTime].url = res.data.url;
      this.fileList[this.onSuccessTime].mediaType = 0;
      this.onSuccessTime++;
      if (this.fileList.length === this.onSuccessTime) {
        this.$emit('getType', this.fileList);
      }
    },
    onError() {
      this.loading = false;
      this.msgError('上传文件失败');
    },
    customUploadFile(params) {
      const { file } = params;
      let newFile = file;
      // 名字长度超过于上限
      let newFileName = file.name;
      if (file.name.length > this.FILE_NAME_LENGTH) {
        newFileName = this.dealImgName(file.name);
        newFile = new File([file], newFileName, { type: 'image/jpg' });
      }
      // 封装数据
      const form = new FormData();
      form.append('file', newFile);
      form.append('mediaType', MEDIA_TYPE_POSTER);
      form.append('fileName', newFileName);
      uploadFile2Cos(form).then(res => {
        // 自行处理各种情况
        this.onSuccess(res, file);
      })
        .catch(() => {
          this.onError();
        });
    },
    beforeUpload(file) {
      return new Promise((resolve, reject) => {
        const flag = this.handleBeforeUpload(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          // 让页面中的img标签的src指向读取的路径
          const img = new Image();
          img.src = reader.result;
          img.onload = () => {
            if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
              reject();
              // 遍历数组，将不符合条件的数组项删除
              this.temporary = this.temporary.filter(item => item.uid !== file.uid);
              this.fileList = this.temporary;
              // 判断按钮状态
              this.noneBtnImg = this.fileList.length >= this.limitNum;
              this.msgWarn(`上传图片分辨率不能超过1440 x 1080 ,当前文件${img.width}×${img.height}`);
            } else {
              if (!flag) {
                reject();
              } else {
                this.fileList = this.temporary;
                resolve();
              }
            }
          };
        };
      });
    },

    handleEditChange(file, fileList) {
      this.noneBtnImg = fileList.length >= this.limitNum;
      // 在图片改变时将图片存到临时数组中
      this.temporary = [...fileList];
    },

    // 处理图片的移除
    handleDealImgRemove(file, index) {
      this.fileList.splice(index, 1);
      this.noneBtnImg = this.fileList.length >= this.limitNum;
      this.$emit('deleteFileList', this.fileList);
    },
    // 打开素材库
    openMaterial() {
      this.$emit('openMaterial', true);
    },
    // 拖拽更新事件函数
    updateList(list) {
      this.$emit('getType', list);
    }
  }
};
</script>

<template>
  <div style="display:flex" class="upload-queue">
    <draggable v-model="fileList" class="el-upload-list el-upload-list--picture-card" style="display:flex" group="people" @start="drag=true" @end="drag=false" @change="updateList(fileList)">
      <div v-for="(item, index) in fileList" :key="index" class="el-upload-list__item">
        <el-image
          class="el-upload-list__item-thumbnail"
          style="width: 70px; height: 70px"
          :src="item.url"
          fit="fill"
        />
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(item)">
            <i class="el-icon-zoom-in" />
          </span>
          <span class="el-upload-list__item-delete" @click="handleDealImgRemove(item, index)">
            <i class="el-icon-delete" />
          </span>
        </span>
      </div>
    </draggable>
    <el-upload
      :class="{uoloadSty:showBtnDealImg,disUoloadSty:noneBtnImg}"
      :action="action"
      list-type="picture-card"
      :file-list="fileList"
      :drag="true"
      :http-request="customUploadFile"
      :multiple="true"
      accept=".jpg,.png"
      :before-upload="beforeUpload"
      :on-change="handleEditChange"
      :limit="limitNum"
      :show-file-list="false"
    >
      <div
        @mouseenter="enter"
        @mouseleave="leave"
      >
        <div v-show="!showIcon" class="upload-icon">
          <i slot="default" class="el-icon-plus" />
          <span>上传图片</span>
        </div>
        <div v-show="showIcon" class="upload-icon">
          <el-button class="hover-button">本地上传</el-button>
          <el-button class="hover-button" @click.stop="openMaterial">素材库</el-button>
        </div>
      </div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>

</template>

<style lang="scss" scoped>
// 隐藏上传按钮
/deep/.uoloadSty .el-upload--picture-card{
  width:70px !important;
  height:70px!important;
  line-height:70px;
}
/deep/.disUoloadSty .el-upload--picture-card{
  display:none;   /* 上传按钮隐藏 */
}
/deep/ .el-upload--picture-card {
  border: 0px !important;
}
/deep/ .el-upload-list--picture-card .el-upload-list__item {
  width: 70px;
  height: 70px;
}
/deep/.el-upload-list__item {
  transition: none !important;
}
/deep/ .el-button + .el-button {
  margin-left: 0;
}
.upload-icon {
  display: flex;
  font-size: 12px;
  height: 70px;
  justify-content: center;
  line-height: 23px;
  flex-direction: column;
}
.hover-button {
  width:68px;
  height:28px;
}
/deep/ .el-button--small {
  padding:9px 9px;
}
.upload-queue{
  height: 81px;
  .el-upload-list__item:hover{
    .el-upload-list__item-actions{
      display: block;
      opacity: 1;
    }
  }
}
</style>
