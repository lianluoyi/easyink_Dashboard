<template>
  <div>
    <div class="avatar-container">
      <img :src="avatarUrl" class="img-circle img-lg" @error="loadAvatarError">
      <el-button v-if="!$store.state.serverInfo.dkCorp" @click="editCropper()"><i class="iconfont icon-export" />更换头像</el-button>
    </div>
    <TailoringImg
      ref="tailoringImg"
      :title="title"
      :visible.sync="open"
      :upload-img-url.sync="avatarUrl"
      upload-field-name="avatarfile"
      :use-blob="true"
      @handleUpload="handleUpload"
    />
  </div>
</template>

<script>
import store from '@/store';
// import { VueCropper } from 'vue-cropper';
import { uploadAvatar } from '@/api/system/user';
import TailoringImg from '@/components/TailoringImg.vue';

const DEFAULT_AVATAR = require('@/assets/image/default-avatar.svg');
// const AUTO_CROP_SIZE = 200;
export default {
  components: { TailoringImg },
  props: {
    user: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 是否显示弹出层
      open: false,
      // 弹出层标题
      title: '修改头像',
      avatarUrl: store.getters.avatar || DEFAULT_AVATAR
    };
  },
  methods: {
    // 编辑头像
    editCropper() {
      this.open = true;
    },
    // 打开弹出层结束时的回调
    modalOpened() {
      this.visible = true;
    },
    loadAvatarError() {
      this.avatarUrl = DEFAULT_AVATAR;
    },
    handleUpload(formData) {
      uploadAvatar(formData).then(response => {
        this.open = false;
        const { imgUrl } = response;
        const tailoringImg = this.$refs.tailoringImg;
        if (tailoringImg.options.img === imgUrl) {
          this.avatarUrl = '';
          store.commit('SET_AVATAR', '');
          setTimeout(() => {
            this.avatarUrl = imgUrl;
            store.commit('SET_AVATAR', imgUrl);
            // eslint-disable-next-line no-magic-numbers
          }, 100);
        } else {
          tailoringImg.options.img = imgUrl;
          this.avatarUrl = imgUrl;
          store.commit('SET_AVATAR', imgUrl);
        }
        this.msgSuccess('修改成功');
        tailoringImg.visible = false;
      });
    }
  }
};
</script>
<style scoped lang="scss">
  .avatar-container {
    display: flex;
    flex-direction: column;
    .iconfont {
      margin-right: 3px;
      font-size: 14px;
    }
    img {
      width: 150px;
      height: 150px;
    }
    .el-button {
      margin: 25px auto 0 auto;
    }
  }
</style>
