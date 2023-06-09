<!--
 * @Description: 自定义字段
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="custom-property-item">
    <div v-if="item.type === CUSTOMER_PROPERTY_VALUE['singleText']">
      <el-input
        v-if="editStatus"
        v-model="item.value"
        maxlength="32"
        show-word-limit
      />
      <div v-else>{{ item.value }}</div>
    </div>
    <div v-else-if="item.type === CUSTOMER_PROPERTY_VALUE['mulText']">
      <el-input
        v-if="editStatus"
        v-model="item.value"
        type="textarea"
        :rows="2"
        maxlength="200"
        show-word-limit
      />
      <div v-else>{{ item.value }}</div>
    </div>
    <div v-else-if="item.type === CUSTOMER_PROPERTY_VALUE['img']">
      <div v-if="editStatus">
        <upload
          v-if="!item.value || ((item.value && item.value.length) < maxUploadCount)"
          :only-show-file-name="true"
          upload-txt="点击上传"
          upload-btn-type="primary"
          :file-url.sync="fileUrl"
          :always-show-btn="true"
          :custom-file-name="true"
        >
          <template slot="tip">支持PNG、JPG格式，图片大小不超过2M</template>
        </upload>
        <div class="img-list-div">
          <div v-for="(imgItem, imgIndex) in item.value" :key="imgIndex" class="img-item">
            <i class="el-icon-circle-close" @click="() => removeImg(imgItem)" />
            <el-image fit="cover" class="img-preview" :src="imgItem" :preview-src-list="[imgItem]" />
          </div>
        </div>
      </div>
      <div v-else-if="item.value && item.value.length > 0">
        <el-image
          v-for="(imgItem, imgIndex) in item.value"
          :key="imgIndex"
          fit="cover"
          class="img-preview"
          :src="imgItem"
          :preview-src-list="[imgItem]"
        />
      </div>
    </div>
    <div v-else-if="item.type === CUSTOMER_PROPERTY_VALUE['file']">
      <div v-if="editStatus">
        <upload
          :only-show-file-name="true"
          upload-txt="点击上传"
          upload-btn-type="primary"
          :always-show-btn="true"
          multiple
          :file-list.sync="fileList"
          :show-file-list="true"
          :upload-success="uploadSuccess"
          :on-remove="onRemoveFile"
          :custom-file-name="true"
          :limit="maxUploadCount"
          :on-exceed="onExceed"
          :type="MEDIA_TYPE_FILE"
        >
          <template slot="tip">支持doc、pdf、ppt等格式，文件大小不超过20M</template>
        </upload>
      </div>
      <div v-else class="file-preview-list">
        <div v-for="(fileItem, fileIndex) in item.value" :key="fileIndex" class="file-preview-item" @click="downloadFile(fileItem.url)">
          {{ fileItem.name }}
        </div>
      </div>
    </div>
    <div v-else-if="item.type === CUSTOMER_PROPERTY_VALUE['singleRadio'] && !selectSingleRadio">
      <el-radio-group v-if="editStatus" v-model="item.optionValue">
        <el-radio v-for="(radioItem, radioIndex) in item.optionList" :key="radioIndex" :label="radioItem.id">
          {{ radioItem.multipleValue }}
        </el-radio>
      </el-radio-group>
      <div v-else>
        {{ item.value }}
      </div>
    </div>
    <div v-else-if="item.type === CUSTOMER_PROPERTY_VALUE['singleRadio'] && selectSingleRadio">
      <el-select v-model="item.optionValue" :placeholder="`请选择${item.name}`" clearable>
        <el-option
          v-for="(selectItem, selectIndex) in item.optionList"
          :key="selectIndex"
          :label="selectItem.multipleValue"
          :value="selectItem.id"
        />
      </el-select>
    </div>
    <div v-else-if="item.type === CUSTOMER_PROPERTY_VALUE['selectSingle']">
      <el-select v-if="editStatus" v-model="item.optionValue" :placeholder="`请选择${item.name}`" clearable>
        <el-option
          v-for="(selectItem, selectIndex) in item.optionList"
          :key="selectIndex"
          :label="selectItem.multipleValue"
          :value="selectItem.id"
        />
      </el-select>
      <div v-else>
        {{ item.value }}
      </div>
    </div>
    <div v-else-if="item.type === CUSTOMER_PROPERTY_VALUE['mulRadio']">
      <el-checkbox-group v-if="editStatus" v-model="item.optionValue">
        <el-checkbox v-for="(checkItem, checkIndex) in item.optionList" :key="checkIndex" :label="checkItem.id">
          {{ checkItem.multipleValue }}
        </el-checkbox>
      </el-checkbox-group>
      <el-tag
        v-for="(unit, unique) in item.value"
        v-else
        :key="unique"
        type="info"
      >{{ unit }}</el-tag>
    </div>

    <div v-else-if="item.type === CUSTOMER_PROPERTY_VALUE['dateField']">
      <template v-if="editStatus">
        <el-date-picker
          v-if="!isCustomerScoped"
          v-model="item.value"
          type="datetime"
          placeholder="请选择日期时间"
          value-format="yyyy-MM-dd HH:mm"
          format="yyyy-MM-dd HH:mm"
        />
        <el-date-picker
          v-else
          v-model="item.value"
          style="width:240px"
          value-format="yyyy-MM-dd HH:mm"
          type="datetimerange"
          format="yyyy-MM-dd HH:mm"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          prefix-icon="el-icon-date"
        />
      </template>
      <span v-else>{{ item.value }}</span>
    </div>
    <div v-else>{{ item.value }}</div>
  </div>
</template>
<script>
import { CUSTOMER_PROPERTY_VALUE, MEDIA_TYPE_FILE } from '@/utils/constant';
import { download } from '@/utils/download';
import { deepClone } from '@/utils/index';
const MAX_UPLOAD_COUNT = 9;
export default {
  name: '',
  components: {},
  props: {
    item: {
      type: Object,
      default: () => {
        return { optionValue: [], optionList: [] };
      }
    },
    editStatus: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: -1
    },
    selectSingleRadio: {
      type: Boolean,
      default: false
    },
    // 是否是客户范围中的其他属性
    isCustomerScoped: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      CUSTOMER_PROPERTY_VALUE,
      MEDIA_TYPE_FILE,
      fileUrl: '',
      fileList: [],
      maxUploadCount: MAX_UPLOAD_COUNT
    };
  },
  watch: {
    fileUrl(val) {
      const newList = [...this.list];
      const valueList = this.item?.value || [];
      valueList.push(val);
      newList[this.index] = { ...this.item, value: valueList };
      this.$emit('update:list', newList);
    },
    editStatus(val) {
      if (val && this.item.type === CUSTOMER_PROPERTY_VALUE['file'] && this.item.value) {
        this.fileList = deepClone([...this.item.value]);
      }
    }
  },
  created() {
  },
  mounted() {},
  methods: {
    /**
     * 移除已上传的图片
     */
    removeImg(item) {
      const newList = [...this.list];
      let valueList = this.item?.value || [];
      valueList = valueList.filter(valItem => valItem !== item);
      newList[this.index] = { ...this.item, value: valueList };
      this.$emit('update:list', newList);
    },
    /**
     * 文件上传成功后的回调
     */
    uploadSuccess(file, fileRes) {
      const newList = [...this.list];
      const valueList = this.item?.value || [];
      valueList.push({ url: fileRes.url, name: file.name, content: file.size });
      newList[this.index] = { ...this.item, value: valueList };
      this.$emit('update:list', newList);
    },
    /**
     * 下载文件
     */
    downloadFile(url) {
      download(url);
    },
    onRemoveFile(file, fileList) {
      const newList = [...this.list];
      newList[this.index] = { ...this.item, value: fileList };
      this.$emit('update:list', newList);
    },
    /**
     * 超出限制个数钩子
     */
    onExceed(files, fileList) {
      this.msgWarn(`最多可上传${this.maxUploadCount}个`);
    }
  }
};
</script>
<style scoped lang='scss'>
.custom-property-item {
    min-height: 21px;
    .img-preview {
        width: 70px;
        height: 70px;
        margin-right: 20px;
    }
    .img-list-div {
        display: flex;
        margin-top: 10px;
        .img-item {
            position: relative;
            margin-right: 20px;
            .img-preview {
                margin-right: 0px;
            }
            .el-icon-circle-close {
                position: absolute;
                right: -6px;
                top: -6px;
                z-index: 999;
                cursor: pointer;
            }
        }
    }
    .file-preview-list {
      .file-preview-item {
        color: #377AFF;
        cursor: pointer;
      }
    }
}
</style>
