<!--
 * @Description: 下拉框字段设置组件
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="form-setting">
    <el-form label-position="top" label-width="80px" :model="filedForm">
      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">必填</span>
          <el-switch
            v-model="filedForm.required"
          />
        </div>
      </el-form-item>

      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">标题</span>
        </div>
        <el-input
          v-model="filedForm.title"
          resize="none"
          show-word-limit
          :maxlength="100"
          type="textarea"
          :rows="6"
        />
      </el-form-item>

      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">选项</span>
        </div>
        <div v-for="item in filedForm.options" :key="item.id" class="form-item-options">
          <el-input
            v-model="item.label"
            resize="none"
            show-word-limit
            :maxlength="50"
            type="textarea"
            :rows="3"
          />
          <i v-show="filedForm.options.length > 1" class="el-icon-remove-outline ml10" @click="removeOptions(item)" />
        </div>
        <el-button style="padding:9px;" icon="el-icon-plus" @click="addOptions">添加选项</el-button>
      </el-form-item>

      <el-form-item>
        <div slot="label" class="form-label">
          <span class="label-name">可选数量</span>
        </div>
        <div class="select-nums mb10">
          <span>最少</span>
          <el-select v-model="filedForm.minSelectNums" placeholder="不限制">
            <el-option
              v-for="item in selectOptionsNums"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="filedForm.maxSelectNums ? !(item.value <= filedForm.maxSelectNums) : false"
            />
          </el-select>
        </div>
        <div class="select-nums">
          <span>最多</span>
          <el-select v-model="filedForm.maxSelectNums" placeholder="请选择">
            <el-option
              v-for="item in selectOptionsNums"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="filedForm.minSelectNums ? !(item.value >= filedForm.minSelectNums) : false"
            />
          </el-select>
        </div>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { EventBus } from '@/event-bus.js';
export default {
  components: { },
  props: {
    component: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      filedForm: {
        required: true,
        title: '下拉框',
        options: [],
        minSelectNums: '',
        maxSelectNums: ''
      },
      selectOptionsNums: []
    };
  },
  watch: {
    filedForm: {
      deep: true,
      handler: function(val) {
        EventBus.$emit('changeFiledSettingValue', { ...val, ...this.filedForm });
      }
    }
  },
  created() {
    // 初始化表单字段传给预览组件
    this.initFiledForm();
  },
  mounted() {
    // 在组件挂载的时候将值传回去给预览组件
    this.filedForm = { ...this.filedForm, ...this.component };
    this.setSelectOptionsNums();
  },
  methods: {
    initFiledForm() {
      const OPTIONS_INIT_LENGTH = 3;
      for (let index = 0; index < OPTIONS_INIT_LENGTH; index++) {
        this.addOptions();
      }
    },
    removeOptions(item) {
      this.filedForm.options = this.filedForm.options.filter((arg) => arg.id !== item.id);
      this.setSelectOptionsNums();
    },
    addOptions() {
      const labelIndex = this.filedForm.options.length + 1;
      this.filedForm.options.push({
        id: uuidv4(),
        label: '选项' + labelIndex
      });
      this.setSelectOptionsNums();
    },
    setSelectOptionsNums() {
      this.selectOptionsNums = [{
        value: '',
        label: '不限制'
      }, ...this.filedForm.options.map((item, index) => {
        return {
          value: index + 1,
          label: `${index + 1}项`
        };
      })];
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
  .form-item-options {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    i {
      font-size: 18px;
      cursor: pointer;
    }
  }
  .select-nums {
    display: flex;
    justify-content: space-between;
  }
}
</style>

