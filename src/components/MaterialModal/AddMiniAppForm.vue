<!--
 * @Description: 添加小程序素材表单
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<script>
import GetAppIDDemo from '@/views/material/components/GetAppIDDemo.vue';
import GetPageUrlDemo from '@/views/material/components/GetPageUrlDemo.vue';
/**
 * 添加小程序素材表单
 */
export default {
  name: 'AddMiniAppForm',
  components: { GetAppIDDemo, GetPageUrlDemo },
  props: {
    /**
     * 表单数据
     */
    form: {
      type: Object,
      default: () => {}
    },
    /**
     * 文件名限制长度
     */
    limitFileName: {
      type: Number,
      default: null
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
      appidDrawerVisible: false,
      miniPageDrawerVisible: false
    };
  },
  methods: {
    /**
     * 打开抽屉
     */
    openDrawer(key) {
      this[key] = true;
    },
    /**
     * 关闭抽屉
     */
    handleClose(key) {
      this[key] = false;
    }
  }
};
</script>

<template>
  <div class="miniapp-material">
    <el-form-item label="AppID" prop="content">
      <el-input
        v-model="form.content"
        style="width: 380px"
        placeholder="请输入与企业有关联小程序的AppID"
      />
      <span class="help theme-text-color" @click="openDrawer('appidDrawerVisible')">如何获取？</span>
    </el-form-item>
    <el-form-item label="地址" prop="materialUrl">
      <el-input
        v-model="form.materialUrl"
        placeholder="请输入小程序的页面访问地址"
        style="width: 380px"
      />
      <span class="help theme-text-color" @click="openDrawer('miniPageDrawerVisible')">如何获取？</span>
    </el-form-item>
    <el-form-item label="标题" prop="materialName">
      <el-input
        v-model="form.materialName"
        :placeholder="placeholder"
        :maxlength="limitFileName"
        show-word-limit
        style="width: 380px"
      />
    </el-form-item>
    <el-form-item label="封面" prop="coverUrl">
      <upload :file-url.sync="form.coverUrl" type="0" upload-tip="上传封面" :show-remove-file-icon="true">
        <div slot="tip">
          支持PNG、JPG格式，图片大小不超过2M，建议尺寸520*416
        </div>
      </upload>
    </el-form-item>
    <el-drawer
      class="appid-drawer"
      title="获取小程序的AppID"
      :visible="appidDrawerVisible"
      :append-to-body="true"
      :before-close="() => handleClose('appidDrawerVisible')"
    >
      <GetAppIDDemo />
    </el-drawer>
    <el-drawer
      class="mini-page-drawer"
      title="获取小程序的页面路径"
      :visible="miniPageDrawerVisible"
      :append-to-body="true"
      :before-close="() => handleClose('miniPageDrawerVisible')"
    >
      <GetPageUrlDemo />
    </el-drawer>
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
  .help {
    margin-left: 5px;
    cursor: pointer;
  }
}
/deep/ .el-drawer {
  width: 780px !important;
}
.appid-drawer {
  /deep/ .el-drawer__body {
    padding: 0 20px;
    height: calc(100% - 43px);
  }
}
</style>

