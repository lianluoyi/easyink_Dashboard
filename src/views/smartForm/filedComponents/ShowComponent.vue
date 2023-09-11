<!--
 * @Description: 文字/图片/轮播图 字段设置组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="form-setting">
    <el-form label-position="top" label-width="80px" :model="filedForm">
      <template v-if="component.type === TEXT_COMPONENT">
        <el-form-item>
          <div slot="label" class="form-label">
            <span class="label-name">内容</span>
          </div>
          <el-input
            v-model="filedForm.content"
            resize="none"
            show-word-limit
            :maxlength="100"
            type="textarea"
            :rows="6"
          />
          <el-color-picker v-model="filedForm.textColor" class="mt15" />
        </el-form-item>
      </template>
      <template v-if="component.type === IMAGE_COMPONENT">
        <el-form-item>
          <div slot="label" class="form-label">
            <span class="label-name">图片</span>
          </div>
          <UploadFile
            text="将图片拖到此处，或"
            tip="支持jpg、png，不超过2M"
            :file-url.sync="filedForm.imageUrl"
            :multiple="false"
            :show-type="DRAG_ONE_TYPE"
            class="upload-drag-div"
            drag
            accept=".jpg,.png,.gif"
          />
        </el-form-item>
      </template>
      <template v-if="component.type === CAROUSEL_COMPONENT">
        <el-form-item>
          <div slot="label" class="form-label">
            <span class="label-name">图片</span>
          </div>
          <UploadFile
            tip="支持jpg、png，不超过2M，建议尺寸375*150"
            :file-url-list.sync="filedForm.imageUrlList"
            :show-type="MULTIPLE_TYPE"
            :multiple="false"
            :limit="MAX_APPENDIX_NUM"
          />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
import { TEXT_COMPONENT, IMAGE_COMPONENT, CAROUSEL_COMPONENT, MAX_APPENDIX_NUM, MULTIPLE_TYPE, DRAG_ONE_TYPE } from '@/utils/constant/index';
import { EventBus } from '@/event-bus.js';
import UploadFile from '../components/UploadFile.vue';
export default {
  components: { UploadFile },
  props: {
    component: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      filedForm: {
        content: '文字',
        textColor: '#101010',
        imageUrl: '',
        imageUrlList: []
      },
      TEXT_COMPONENT,
      IMAGE_COMPONENT,
      CAROUSEL_COMPONENT,
      MAX_APPENDIX_NUM,
      MULTIPLE_TYPE,
      DRAG_ONE_TYPE
    };
  },
  watch: {
    filedForm: {
      deep: true,
      handler: function(val) {
        EventBus.$emit('changeFiledSettingValue', { ...this.returnFiled(val) });
      }
    }
  },
  mounted() {
    // 在组件挂载的时候将值传回去给预览组件
    this.filedForm = { ...this.filedForm, ...this.component };
  },
  methods: {
    /**
     * @description 由于文字、图片、轮播图使用了同一个组件，返回给预览组件的时候根据类型返回字段设置
     * @param item
     */
    returnFiled(item) {
      let payload = {};
      switch (item.type) {
        case TEXT_COMPONENT: {
          payload = {
            content: item.content,
            textColor: item.textColor
          };
          break;
        }
        case IMAGE_COMPONENT: {
          payload = {
            imageUrl: item.imageUrl
          };
          break;
        }
        case CAROUSEL_COMPONENT: {
          payload = {
            imageUrlList: item.imageUrlList
          };
          break;
        }
      }
      return { ...this.component, ...payload };
    }
  }
};
</script>

<style  lang="scss" scoped>
.form-setting {
  /deep/ .el-form-item__label {
    width: 100%;
  }
  /deep/ .el-input__count {
      height: 20px;
      line-height: 20px;
  }
  /deep/ .el-form-item  {
    border-bottom: 1px solid #eee;
    .el-form-item__label {
      padding: 0;
    }
  }
  /deep/ .el-form-item:hover  {
    background: none;
  }
  /deep/ .el-color-picker__trigger {
    width: 50px;
    height: 50px;
  }
  .form-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .label-name {
      font-size: 14px;
      color: #606266;
      font-weight: 700;
    }
  }
}
</style>

