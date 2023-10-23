<script>
import {
  ONE_HOUR,
  MS_TO_SECONDS,
  ONE_DAY,
  MEDIA_TYPE_POSTER,
  MEDIA_TYPE_AUDIO,
  MEDIA_TYPE_VIDEO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_MINIAPP,
  MEDIA_TYPE_IMGLINK,
  IMG_LINK_DIGEST,
  RADAR_TYPE
} from '@/utils/constant/index';
import { add, update } from '@/api/material';
import SelectTagModal from './SelectTagModal.vue';
import AddPosterForm from '@/components/MaterialModal/AddPosterForm.vue';
import AddVideoForm from '@/components/MaterialModal/AddVideoForm.vue';
import AddMiniAppForm from '@/components/MaterialModal/AddMiniAppForm.vue';
import AddFileForm from '@/components/MaterialModal/AddFileForm.vue';
import AddImgLinkForm from '@/components/MaterialModal/AddImgLinkForm.vue';
import { checkPermi } from '@/utils/permission';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import differenceBy from 'lodash/differenceBy';
import SelectTag from '@/components/SelectTag';
import { addRadar } from '@/api/radar';
const LIMIT_FILE_NAME = 32;
const THREE_DAYS = 3;
const SEVEN_DAYS = 7;

export default {
  name: 'MaterialAddModal',
  components: {
    SelectTagModal,
    AddPosterForm,
    AddVideoForm,
    AddFileForm,
    AddMiniAppForm,
    AddImgLinkForm,
    RequestButton,
    SelectTag
  },
  props: {
    form: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: '0'
    },
    showMaterialSave: {
      type: Boolean,
      default: false
    },
    showMaterialSetting: {
      type: Boolean,
      default: false
    },
    modalTitle: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    getList: {
      type: Function,
      default: () => {}
    },
    isOperatingMaterial: {
      type: Boolean,
      default: true
    },
    hideVideoCover: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      RADAR_TYPE,
      limitFileName: LIMIT_FILE_NAME,
      MEDIA_TYPE_POSTER,
      MEDIA_TYPE_AUDIO,
      MEDIA_TYPE_VIDEO,
      MEDIA_TYPE_FILE,
      MEDIA_TYPE_MINIAPP,
      MEDIA_TYPE_IMGLINK,
      IMG_LINK_DIGEST,
      titlePlaceholder: {
        [MEDIA_TYPE_POSTER]: '请输入海报标题，不填写则默认取文件名',
        [MEDIA_TYPE_VIDEO]: '请输入视频标题，不填写则默认取文件名',
        [MEDIA_TYPE_FILE]: '请输入文件标题，不填写则默认取文件名',
        [MEDIA_TYPE_MINIAPP]: '请输入小程序的标题',
        [MEDIA_TYPE_IMGLINK]: '请输入链接的标题'
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '明天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + ONE_HOUR * MS_TO_SECONDS * ONE_DAY);
              picker.$emit('pick', date);
            }
          },
          {
            text: '3天后',
            onClick(picker) {
              const date = new Date();
              date.setTime(
                date.getTime() + ONE_HOUR * MS_TO_SECONDS * ONE_DAY * THREE_DAYS
              );
              picker.$emit('pick', date);
            }
          },
          {
            text: '一周后',
            onClick(picker) {
              const date = new Date();
              date.setTime(
                date.getTime() + ONE_HOUR * MS_TO_SECONDS * ONE_DAY * SEVEN_DAYS
              );
              picker.$emit('pick', date);
            }
          }
        ],
        // 禁用之前的日期
        disabledDate(time) {
          return (
            time.getTime() + ONE_HOUR * MS_TO_SECONDS * ONE_DAY < Date.now()
          );
        }
      },
      // 选择标签弹窗显示
      dialogVisible: false,
      rules: {
        materialName: [
          { required: true, message: '该项为必填项', trigger: 'blur' }
        ],
        materialUrl: [
          { required: true, message: '该项为必填项', trigger: 'blur' }
        ]
      },

      miniAppRules: {
        appid: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        accountOriginalId: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
        materialUrl: [
          { required: true, message: '该项为必填项', trigger: 'blur' }
        ],
        materialName: [
          { required: true, message: '该项为必填项', trigger: 'blur' }
        ],
        coverUrl: [
          { required: true, message: '该项为必填项', trigger: 'blur' }
        ]
      },
      imgLinkRules: {
        materialUrl: [
          { required: true, message: '该项为必填项', trigger: 'blur' }
        ],
        materialName: [
          { required: true, message: '该项为必填项', trigger: 'blur' }
        ]
      },
      /**
       * 已被选中的标签列表
       */
      selectedTagIdList: [],
      radarType: RADAR_TYPE['enterprise'],
      radarFormRules: {
        radarTitle: [
          { required: true, message: '该项为必填项', trigger: 'blur' }
        ]
      },
      radarForm: {
        radarTitle: '',
        enableClickNotice: false,
        enableBehaviorRecord: false,
        enableCustomerTag: false,
        enableUpdateNotice: false
      },
      // 设为雷达链接时选择的客户标签
      customerTags: [],
      dialogVisibleSelectTag: false,
      // 移除的标签列表
      removeTagList: [],
      // 链接是否转为雷达
      isRadarLink: false
    };
  },
  computed: {
    // 判断是否是admin
    isAdmin() {
      return this.$store.state.user.isSuperAdmin;
    },
    formRules() {
      let rule = this.rules;
      switch (this.type) {
        case MEDIA_TYPE_MINIAPP: {
          rule = this.miniAppRules;
          break;
        }
        case MEDIA_TYPE_IMGLINK: {
          rule = this.imgLinkRules;
          break;
        }
      }
      return rule;
    },
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    /**
     * 素材标签选项
     */
    materialOptions() {
      return (
        this.$store.state.materialInfo.allTagObj &&
        Object.values(this.$store.state.materialInfo.allTagObj)
      );
    },
    formTagList() {
      const list = [];
      const allTagObj = this.$store.state.materialInfo.allTagObj;
      this.form.tagList &&
        this.form.tagList.map((item) => {
          if (allTagObj[item.materialTagId]) {
            list.push({
              id: item.materialTagId,
              tagName: allTagObj[item.materialTagId].tagName
            });
          }
        });
      return list;
    }
  },
  watch: {
    visible(val) {
      // 弹窗打开后再次处理标签id列表数据
      if (val) this.selectedTagIdList = this.dealTagIdList();
    },
    'form.enableConvertRadar'(val) {
      this.isRadarLink = val;
    }
  },
  created() {},
  mounted() {
    const newForm = { ...this.form, showMaterial: true };
    this.$emit('update:form', newForm);
    this.selectedTagIdList = this.dealTagIdList();
  },
  methods: {
    /**
     * 选择客户标签
     */
    submitSelectTag(data) {
      // 过滤出弹窗中取消选中的标签
      let removeList = differenceBy(this.customerTags, data, 'tagId');
      this.customerTags = [...data];
      this.dialogVisibleSelectTag = false;
      removeList = this.removeTagList.concat(removeList);
      this.removeTagList = removeList;
    },
    /**
     * 移除客户标签
     */
    closeTag(item, index) {
      this.customerTags.splice(index, 1);
      this.removeTagList.push(item);
    },
    onFocus(e) {
      this.dialogVisible = true;
    },
    /**
     * 确认选择素材标签
     */
    submitSelectTags(tagList) {
      this.dialogVisible = false;
      const selectedList = [];
      tagList.map((item) => {
        selectedList.push(item.id);
      });
      this.selectedTagIdList = selectedList;
    },
    /**
     * 移除已上传的文件
     */
    removeFile() {
      const newForm = { ...this.form, materialUrl: '' };
      this.$emit('update:form', newForm);
    },
    submit() {
      // this.$refs['form'].validateField
      this.$refs['form'].validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'submit');
        const form = JSON.parse(JSON.stringify(this.form));
        const params = {
          ...form,
          mediaType: this.type,
          tagIdList: this.selectedTagIdList,
          categoryId:
            this?.$store?.state?.materialInfo?.categoryInfo[this.type]?.id || ''
        };
        // 链接设置默认摘要
        if (params.mediaType === MEDIA_TYPE_IMGLINK) {
          params.digest = form.digest || IMG_LINK_DIGEST;
          // 用来获取链接类型
          params.isDefined = this.$refs.imgLink.isDefined;
        }
        // 添加标题的检验
        if (!params.materialName) {
          changeButtonLoading(this.$store, 'submit');
          return this.msgInfo('请填写链接标题');
        }
        // 校验发布素材的权限;
        if (!checkPermi(['wechat:material:publish'])) {
          params.showMaterial = false;
        }
        // 链接设置是否设为雷达链接
        // 新增链接
        if (this.isRadarLink && !form.enableConvertRadar) {
          if (!this.radarForm.radarTitle) {
            changeButtonLoading(this.$store, 'submit');
            return this.msgInfo('请填写雷达标题');
          }
          params.enableConvertRadar = this.isRadarLink;
          // 增加雷达传递的参数
          // 从params中拿出链接的信息
          const { isDefined, materialName: title, materialUrl: url, coverUrl, digest: content } = params;
          const radarParams = {
            ...this.radarForm,
            radarTagList: this.customerTags.map((item) => {
              return {
                tagId: item.tagId
              };
            }),
            type: this.radarType,
            weRadarUrl: {
              isDefined: isDefined,
              title: title, // 标题
              url: url, // 链接url
              coverUrl: coverUrl, // 封面图
              content: content // 摘要
            }
          };
          addRadar(radarParams);
        }
        if (this.isOperatingMaterial) {
          (form.id ? update : add)(params)
            .then(() => {
              this.msgSuccess('操作成功');
              if (form.id) {
                this.getList();
              } else {
                this.$parent.resetQuery();
              }
              this.$refs['form'].resetFields();
            })
            .finally(() => {
              changeButtonLoading(this.$store, 'submit');
              this.Pvisible = false;
            });
        } else {
          // 编辑海报
          this.$refs['form'].resetFields();
          this.Pvisible = false;
          if (params.saveToMaterial) {
            add(params).then(() => {
              this.$emit('submit', params);
            }).finally(() => {
              changeButtonLoading(this.$store, 'submit');
            });
          } else {
            changeButtonLoading(this.$store, 'submit');
            this.$emit('submit', params, params.saveToMaterial);
          }
        }
      });
    },
    /**
     * 关闭弹窗
     */
    closeModal() {
      this.Pvisible = false;
    },
    /**
     * 处理已选择的标签列表
     */
    dealTagIdList() {
      const list = [];
      this.form.tagList &&
        this.form.tagList.map((item) => {
          if (this.$store.state?.materialInfo?.allTagObj[item.materialTagId]) {
            list.push(item.materialTagId);
          }
        });
      return list;
    },
    changeShowMaterial() {
      const newForm = { ...this.form, showMaterial: true };
      this.$emit('update:form', newForm);
    },
    changeForm(newForm) {
      this.$emit('update:form', { ...newForm });
    },
    // 点击确认选择时间
    confirmTime(val) {
      if (val && new Date(val).getTime() < new Date().getTime()) {
        this.msgWarn('过期时间不能小于当前时间');
      }
    }
  }
};
</script>

<template>
  <div>
    <el-dialog
      :title="modalTitle"
      :before-close="closeModal"
      :close-on-press-escape="false"
      :visible.sync="Pvisible"
      width="680px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="material-add-modal">
        <el-form
          ref="form"
          :model.sync="form"
          :rules="formRules"
          label-width="80px"
        >
          <el-form-item
            v-if="![MEDIA_TYPE_MINIAPP, MEDIA_TYPE_IMGLINK].includes(type)"
            label="标题"
            prop="materialName"
          >
            <el-input
              v-model="form.materialName"
              :placeholder="titlePlaceholder[type]"
              :maxlength="limitFileName"
              show-word-limit
              style="width: 380px"
            />
          </el-form-item>
          <template v-if="type === MEDIA_TYPE_POSTER">
            <AddPosterForm
              :form="form"
              :limit-file-name="limitFileName"
              @changeForm="changeForm"
            />
          </template>
          <template v-else-if="type === MEDIA_TYPE_VIDEO">
            <AddVideoForm
              :form="form"
              :limit-file-name="limitFileName"
              :hide-video-cover="hideVideoCover"
              @changeForm="changeForm"
            />
          </template>

          <template v-else-if="type === MEDIA_TYPE_FILE">
            <AddFileForm
              :form.sync="form"
              :remove-file="removeFile"
              :limit-file-name="limitFileName"
              @changeForm="changeForm"
            />
          </template>
          <template v-else-if="type === MEDIA_TYPE_MINIAPP">
            <AddMiniAppForm
              :form="form"
              :limit-file-name="limitFileName"
              :placeholder="titlePlaceholder[type]"
            />
          </template>
          <template v-else-if="type === MEDIA_TYPE_IMGLINK">
            <AddImgLinkForm
              ref="imgLink"
              :form.sync="form"
              :placeholder="titlePlaceholder[type]"
            />
          </template>
          <el-form-item
            v-show="showMaterialSave"
            v-hasPermi="['wechat:material:add']"
            label="存为素材"
            prop="saveToMaterial"
          >
            <div class="field-item">
              <el-switch
                v-model="form.saveToMaterial"
                @change="changeShowMaterial"
              />
              <el-popover
                placement="top-start"
                content="将该附件添加到素材库"
                trigger="hover"
                popper-class="tip-popover"
              >
                <i slot="reference" class="iconfont icon-question" />
              </el-popover>
            </div>
          </el-form-item>
          <div v-show="showMaterialSetting">
            <el-form-item
              v-hasPermi="['wechat:material:publish']"
              label="发布素材"
              prop="showMaterial"
            >
              <div class="field-item">
                <el-switch v-model="form.showMaterial" />
                <el-popover
                  placement="top-start"
                  content="开启后，员工可在企业微信客户端侧边栏【素材库】查看，并发送给客户"
                  trigger="hover"
                  popper-class="tip-popover"
                >
                  <i slot="reference" class="iconfont icon-question" />
                </el-popover>
              </div>
            </el-form-item>
            <el-form-item label="素材标签" prop="labelId">
              <el-select
                v-model="selectedTagIdList"
                class="material-tag-select"
                popper-class="invisible-select-popover"
                multiple
                style="width: 380px"
                placeholder="设置素材标签，方便分类管理"
                @focus="onFocus"
              >
                <el-option
                  v-for="item in materialOptions"
                  :key="item.id"
                  :label="item.tagName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="过期时间" prop="expireTime">
              <div class="field-item">
                <el-date-picker
                  v-model="form.expireTime"
                  type="datetime"
                  placeholder="选择素材过期时间"
                  align="right"
                  :picker-options="pickerOptions"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  @change="confirmTime"
                />
                <el-popover
                  placement="top-start"
                  content="到期后自动移到过期素材，员工不可继续使用"
                  trigger="hover"
                  popper-class="tip-popover"
                >
                  <i slot="reference" class="iconfont icon-question" />
                </el-popover>
              </div>
            </el-form-item>
            <el-form-item v-if=" type === MEDIA_TYPE_IMGLINK " label="雷达链接" prop="isRadarLink" class="drawer-div">
              <el-switch
                v-model="isRadarLink"
                :disabled="form.enableConvertRadar"
                :active-value="true"
                :inactive-value="false"
              />
              <span class="back-text">设为雷达链接，可记录客户访问数据</span>
              <div v-show="isRadarLink && !form.enableConvertRadar">
                <el-form
                  ref="radarForm"
                  :model="radarForm"
                  label-width="80px"
                  class="radarForm"
                  :rules="radarFormRules"
                >
                  <el-form-item label="雷达标题" prop="radarTitle">
                    <el-input
                      v-model="radarForm.radarTitle"
                      maxlength="32"
                      show-word-limit
                      placeholder="请填写雷达使用场景，方便标记使用"
                      clearable
                    />
                  </el-form-item>
                  <el-form-item label="雷达类型">
                    <el-radio-group v-model="radarType">
                      <el-radio :label="RADAR_TYPE['enterprise']">公共</el-radio>
                      <el-radio v-if="!isAdmin" :label="RADAR_TYPE['department']">部门</el-radio>
                      <el-radio v-if="!isAdmin" :label="RADAR_TYPE['personal']">个人</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="行为通知" prop="enableClickNotice">
                    <el-switch
                      v-model="radarForm.enableClickNotice"
                      :active-value="true"
                      :inactive-value="false"
                    />
                    <span class="back-text">开启后，当客户点击雷达链接，将发送应用提醒通知所属员工</span>
                  </el-form-item>
                  <el-form-item label="轨迹记录" prop="enableBehaviorRecord">
                    <el-switch
                      v-model="radarForm.enableBehaviorRecord"
                      :active-value="true"
                      :inactive-value="false"
                    />
                    <span class="back-text">开启后，当客户点击雷达链接，会记录在其客户资料的活动轨迹下</span>
                  </el-form-item>
                  <el-form-item label="客户标签">
                    <el-switch
                      v-model="radarForm.enableCustomerTag"
                      :active-value="true"
                      :inactive-value="false"
                    />
                    <span class="back-text">开启后，当客户点击雷达链接，为其打上指定客户标签</span>
                  </el-form-item>
                  <el-form-item v-show="radarForm.enableCustomerTag" label="" prop="customerTags">
                    <div style="margin-left:60px;">
                      <el-button
                        icon="el-icon-plus"
                        size="mini"
                        @click="dialogVisibleSelectTag = true"
                      >添加标签</el-button>
                      <el-tag
                        v-for="(item, index) in customerTags"
                        :key="index"
                        size="medium"
                        closable
                        @close="closeTag(item, index)"
                      >{{ item.name }}</el-tag>
                    </div>
                  </el-form-item>
                </el-form>
              </div>
            </el-form-item>
          </div>
          <slot />
        </el-form>
        <SelectTagModal
          :visible.sync="dialogVisible"
          :show-add-tag="true"
          modal-title="选择标签"
          :tag-list="
            this.$store.state.materialInfo
              ? Object.values(this.$store.state.materialInfo.allTagObj)
              : []
          "
          :default-tag-list="formTagList"
          @submitSelectTags="submitSelectTags"
        />

      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeModal">取 消</el-button>
        <RequestButton
          type="primary"
          :request-method="submit"
          button-type="submit"
        >确 定</RequestButton>
      </div>
    </el-dialog>
    <!-- 选择标签弹窗 -->
    <SelectTag
      :visible.sync="dialogVisibleSelectTag"
      :selected="customerTags"
      type="search"
      info-msg="通过活码添加员工的客户，将被自动打上选中的标签"
      :is-show-add="true"
      @success="submitSelectTag"
    />
  </div>
</template>

<style lang="scss" scoped>
.material-add-modal {
  .field-item {
    display: flex;
    align-items: center;
  }
  .material-tag-select {
    /deep/ .el-tag {
      background-color: #fff;
      font-size: 12px;
      color: #7f7f7f;
      border-color: #d9d9d9;
      padding: 3px 5px;
      display: flex;
      align-items: center;
      .el-tag__close {
        background-color: #fff;
        color: #7f7f7f;
        font-size: 16px;
      }
      .el-select__tags-text {
        line-height: 12px;
      }
    }
  }
  .icon-question {
    color: $grayColor;
    font-size: 14px;
    margin-left: 5px;
  }
  /deep/ .upload-button {
    border: 1px solid $borderColor;
    color: $grayColor;
  }
  .radarForm {
    /deep/ .el-form-item {
      padding: 5px 0px;
      .el-form-item__label {
        margin-left: -10px;
      }
      .el-form-item__content {
        margin-left: 10px !important;
      }
      .el-input {
        width: 360px;
      }
    }
  }
  .drawer-div {
    .back-text {
      color:#999999;
      margin-left: 5px;
    }
  }
}
</style>
