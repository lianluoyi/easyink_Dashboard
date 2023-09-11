<!--
 * @Description: 自定义渠道
 * @Author: wJiaaa
 * @LastEditors: broccoli
-->
<template>
  <div class="custom-channel">
    <el-dialog
      title="自定义渠道"
      width="1060px"
      :append-to-body="true"
      :visible.sync="Pvisible"
      :close-on-click-modal="false"
    >
      <div class="title-info">
        <i class="el-icon-info" />
        <div>
          <div class="info-desc">
            如果想要分析不同渠道的引流效果，可生成自定义渠道，分别投放到对应渠道，前往获客链接详情页可查看每个渠道的数据
          </div>
        </div>
      </div>
      <!-- 中间表格 -->
      <div class="content">
        <!-- 表格上方输入框 按钮 -->
        <div class="header-container">
          <el-input
            v-model="query.name"
            prefix-icon="el-icon-search"
            style="width: 240px"
            placeholder="请输入渠道，回车搜索"
            @keyup.enter.native="onSearch"
          />
          <div class="operate-btn">
            <el-button
              v-hasPermi="['customer:assistant:edit']"
              type="primary"
              @click="addChannel"
            >添加渠道</el-button>
          </div>
        </div>
        <!-- 表格体 -->
        <div class="content-container">
          <RightContainer>
            <template v-slot:data>
              <el-table v-loading="loading" :data="list" max-height="440">
                <template slot="empty">
                  <empty-default-icon :length="list.length" />
                </template>
                <el-table-column prop="name" label="渠道" align="center" />
                <el-table-column prop="channelUrl" label="渠道链接" align="center" width="286" />
                <el-table-column
                  label="创建人"
                  align="center"
                  prop="createBy"
                />
                <el-table-column
                  label="创建时间"
                  align="center"
                  prop="createTime"
                  width="180"
                />
                <el-table-column label="操作" align="center" width="180">
                  <template slot-scope="{ row }">
                    <el-button
                      v-copy="row.channelUrl"
                      size="mini"
                      type="text"
                    >复制链接</el-button>
                    <el-button v-hasPermi="['customer:assistant:edit']" size="mini" type="text" @click="editChannel(row)">编辑</el-button>
                    <el-button v-hasPermi="['customer:assistant:edit']" size="mini" type="text" @click="handleDelete(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </RightContainer>
        </div>
      </div>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="Pvisible = false">取 消</el-button>
        <el-button type="primary" @click="Pvisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加渠道的弹窗 -->
    <div class="add-channel-visible">
      <el-dialog
        :visible.sync="addChannelVisible"
        :close-on-click-modal="false"
        :title="channelId ? '编辑渠道' : '添加渠道'"
        width="500px"
        @close="close"
      >
        <el-form ref="form" :model="form" label-width="80px" :rules="rules">
          <el-form-item label="渠道名称" prop="name">
            <el-input
              v-model="form.name"
              show-word-limit
              style="width: 360px"
              :maxlength="MAX_INPUT_LENGTH"
              placeholder="请填写渠道名称，方便标记使用"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addChannelVisible = false">取 消</el-button>
          <RequestButton type="primary" button-type="submit" :request-method="submit">{{ channelId ? '保存' : '生成渠道链接' }} </RequestButton>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// 渠道名称最大长度
const MAX_INPUT_LENGTH = 16;
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
import { getChannelList, addChannel, updateChannel, removeChannel } from '@/api/drainageCode/customerAssistant';

export default {
  components: { RightContainer, EmptyDefaultIcon, RequestButton },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    empleCodeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      query: {
        // 渠道
        name: ''
      },
      loading: false,
      list: [],
      total: 0,
      form: {
        name: ''
      },
      rules: { name: [{ required: true, message: '请填写渠道名称', trigger: 'blur' }] },
      // 添加渠道
      addChannelVisible: false,
      MAX_INPUT_LENGTH,
      // 渠道id
      channelId: void 0
    };
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.getList(1);
      }
    }
  },
  methods: {
    /**
     * 获取自定义渠道列表
     */
    getList() {
      this.loading = true;
      getChannelList({ ...this.query, empleCodeId: this.empleCodeId, isFilterDefaultUrl: true }).then(({ rows, total }) => {
        this.list = rows.filter(item => !item.delFlag);
        this.total = this?.list?.length || 0;
      }).catch(() => {
        this.list = [];
        this.total = 0;
      }).finally(() => {
        this.loading = false;
      });
    },
    /**
     *  添加/修改渠道
     */
    submit() {
      this.$refs['form'].validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'submit');
        const params = { name: this.form.name };
        if (this.channelId) {
          params.channelId = this.channelId;
        } else {
          params.empleCodeId = this.empleCodeId;
        }
        (this.channelId ? updateChannel : addChannel)(params).then(() => {
          this.addChannelVisible = false;
          changeButtonLoading(this.$store, 'submit');
          this.getList();
        });
      });
    },
    /**
     * 回车搜索渠道
     */
    onSearch() {
      this.getList(1);
    },
    /**
     * 删除渠道
     * @param row 对应渠道
     */
    handleDelete(row) {
      this.confirmModal({
        msg: `自定义渠道“${row.name}”将被删除，是否继续？`
      }, async() => {
        removeChannel(row.channelId).then(() => {
          this.getList();
        });
      });
    },
    /**
     * 编辑渠道
     */
    editChannel(row) {
      this.$refs?.form?.resetFields();
      this.form.name = row.name;
      this.channelId = row.channelId;
      this.addChannelVisible = true;
    },
    addChannel() {
      this.form.name = '';
      this.channelId = void 0;
      this.addChannelVisible = true;
    },
    /**
     * 关闭添加/编辑渠道弹窗
     */
    close() {
      this.addChannelVisible = false;
    }
  }
};
</script>

<style scoped lang="scss">
/deep/ .show-data-wrapper {
  padding-top: 10px;
}
/deep/ .el-dialog__body {
  padding-top: 10px;
}
.add-channel-visible {
  ::v-deep .el-dialog__body {
    padding: 5px 15px;
  }
}
.title-info {
  background: #f2f2f2;
  display: flex;
  align-items: center;
  color: #909399;
  height: 36px;
  padding-left: 20px;
  margin-bottom: 10px;
  font-size: 12px;
  line-height: 12px;
  i {
    font-size: 14px;
    transform: rotate(-15deg);
    margin-right: 8px;
  }
}
.content {
  background-color: #fff;
  display: flex;
  flex-direction: column;
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }
  .content-container {
    flex: 1;
    overflow: auto;
    margin: 0 -15px;
  }
}
</style>
