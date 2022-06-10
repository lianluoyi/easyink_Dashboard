<!--
 * @Description: 添加链接素材表单
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<script>
import { CUSTOM_LINK, DEFAULT_LINK, IMG_LINK_DIGEST, LINK_TITLE_MAXLENGTH, LINK_CONTENT_MAXLENGTH } from '@/utils/constant';
import VerbalTrickImgLink from '../../views/verbalTrickLibrary/component/verbalTrickPreview/verbalTrickImgLink.vue';
import { getWordsUrlContent } from '@/api/wordsGroup';
/**
 * 添加链接素材表单
 */
export default {
  name: 'AddImgLinkForm',
  components: { VerbalTrickImgLink },
  props: {
    /**
     * 表单数据
     */
    form: {
      type: Object,
      default: () => {}
    },
    /**
     * 标题输入框的placeholder
     */
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      LINK_TITLE_MAXLENGTH,
      LINK_CONTENT_MAXLENGTH,
      DEFAULT_LINK,
      CUSTOM_LINK,
      IMG_LINK_DIGEST,
      // 是否是自定义链接 默认为false
      isDefined: DEFAULT_LINK
    };
  },
  watch: {
    // 监听选择的素材，修改isDefined
    'form.isDefined': {
      handler(val) {
        this.isDefined = val === undefined ? DEFAULT_LINK : val;
      },
      deep: true
    }
  },
  methods: {
    // 监听链接类型的改变
    change(val) {
      this.$set(this.form, 'isDefined', val);
    },
    /**
    * 输入链接后获取链接的标题、封面信息
    */
    sendWordsUrl() {
      if (this.form.materialUrl && !this.isDefined) {
        getWordsUrlContent({ url: this.form.materialUrl }).then(res => {
          // Vue无法检测数据的改变，当获取异步请求回来的值之后，可以用$set设置
          this.$set(this.form, 'digest', res.data?.desc?.substring(0, LINK_CONTENT_MAXLENGTH));
          this.$set(this.form, 'materialName', res.data?.title?.substring(0, LINK_TITLE_MAXLENGTH));
          if (!res.data.isUrl && res.data.image) {
            // 这里定义一个url来获取链接中的域名部分
            const url = this.form.materialUrl.split('/');
            const newCoverUrl = 'https://' + url[2] + (res.data.image[0] !== '/' ? '/' : '') + res.data.image;
            this.$set(this.form, 'coverUrl', newCoverUrl);
          } else {
            this.$set(this.form, 'coverUrl', res.data.image);
          }
        });
      }
    }
  }
};
</script>

<template>
  <div class="imgLink-material">
    <el-form-item label="地址" prop="materialUrl">
      <el-input
        v-model="form.materialUrl"
        style="width: 380px"
        placeholder="请输入链接的访问地址"
        clearable
        @change="sendWordsUrl"
      />
    </el-form-item>
    <el-form-item>
      <el-radio-group v-model="isDefined" @change="change">
        <el-radio :label="DEFAULT_LINK">使用链接默认信息</el-radio>
        <el-radio :label="CUSTOM_LINK">自定义链接信息</el-radio>
      </el-radio-group>
    </el-form-item>
    <div v-if="isDefined !== DEFAULT_LINK">
      <el-form-item label="标题" prop="materialName">
        <el-input
          v-model="form.materialName"
          style="width: 380px"
          :placeholder="placeholder"
          type="textarea"
          :maxlength="LINK_TITLE_MAXLENGTH"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="摘要" prop="digest">
        <el-input
          v-model="form.digest"
          type="textarea"
          style="width: 380px"
          :placeholder="`请输入链接的摘要，默认是“${IMG_LINK_DIGEST}”`"
          :maxlength="LINK_CONTENT_MAXLENGTH"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="封面" prop="coverUrl">
        <upload :file-url.sync="form.coverUrl" type="0" upload-tip="上传封面" :show-remove-file-icon="true">
          <div slot="tip">
            支持PNG、JPG格式，图片大小不超过2M，建议尺寸200*200
          </div>
        </upload>
      </el-form-item>
    </div>
    <div v-else>
      <el-form-item>
        <VerbalTrickImgLink :title="form.materialName" :content="form.digest" :cover-url="form.coverUrl" />
      </el-form-item>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.miniapp-material {
  /deep/ .upload-div {
    display: flex;
    align-items: flex-end;
    .tip {
      margin-bottom: 10px;
      margin-left: 10px;
    }
  }
}
</style>
