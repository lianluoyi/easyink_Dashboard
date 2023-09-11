<!--
 * @Description: 自定义渠道
 * @Author: wJiaaa
 * @LastEditors: broccoli
-->
<template>
  <div>
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
            除了可在员工活码、客户群发、好友欢迎语等系统功能使用雷达链接外，还可生成自定义渠道，在其他渠道使用雷达链接，并统计数据
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
            @input="clear"
            @keyup.enter.native="onSearch"
          />
          <div class="operate-btn">
            <el-button
              v-if="hasRole"
              type="primary"
              @click="addChannelVisible = true"
            >添加渠道</el-button>
          </div>
        </div>
        <!-- 表格体 -->
        <div class="content-container">
          <RightContainer>
            <template v-slot:data>
              <el-table v-loading="loading" :data="list">
                <template slot="empty">
                  <empty-default-icon :length="list.length" />
                </template>
                <el-table-column prop="name" label="渠道" align="center" />
                <el-table-column prop="shortUrl" label="渠道链接" align="center" />
                <el-table-column
                  label="创建人"
                  align="center"
                  prop="createName"
                />
                <el-table-column
                  label="创建时间"
                  align="center"
                  prop="createTime"
                  width="180"
                />
                <el-table-column label="操作" align="center" width="140">
                  <template slot-scope="{ row }">
                    <div>
                      <el-button
                        v-copy="row.shortUrl"
                        size="mini"
                        type="text"
                      >复制链接</el-button>
                    </div>
                    <div>
                      <el-button v-if="hasRole" size="mini" type="text" @click="editChannel(row)">编辑</el-button>
                      <el-button v-if="hasRole" size="mini" type="text" @click="handleDelete(row)">删除</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <pagination
                v-show="list.length > 0"
                :total="total"
                :limit.sync="query.pageSize"
                :page.sync="query.pageNum"
                @pagination="getList()"
              />
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
        :title="id ? '编辑渠道' : '添加渠道'"
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
          <RequestButton type="primary" button-type="submit" :request-method="submit">{{ id ? '保存' : '生成渠道链接' }} </RequestButton>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// 渠道名称最大长度
const MAX_INPUT_LENGTH = 32;
import RightContainer from '@/components/RightContainer';
import { PAGE_LIMIT, DEFAULT_PAGE_NUM } from '@/utils/constant/index';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon.vue';
import { getRadarChannelList, addCustomChannel, deleteCustomChannel, updateChannel } from '@/api/radar';
import RequestButton from '@/components/Button/RequestButton.vue';
import { changeButtonLoading } from '@/utils/common';
export default {
  components: { RightContainer, EmptyDefaultIcon, RequestButton },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    radarId: {
      type: String,
      default: ''
    },
    roleKey: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      query: {
        // 渠道
        name: '',
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: PAGE_LIMIT,
        radarId: this.radarId
      },
      loading: false,
      list: [],
      total: 0,
      form: {
        name: ''
      },
      rules: { name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }] },
      // 添加渠道
      addChannelVisible: false,
      MAX_INPUT_LENGTH,
      // 渠道id
      id: '',
      // 是否有权限
      hasRole: this.roleKey
    };
  },
  computed: {
    Pvisible: {
      get(val) {
        if (val.visible) {
          this.getList(1);
        }
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  watch: {
    radarId(val) {
      this.query.radarId = val;
    },
    roleKey(val) {
      this.hasRole = val;
    }
  },
  created() {
  },
  methods: {
    /**
     * 获取自定义渠道列表
     */
    getList(pageNum) {
      pageNum && (this.query.pageNum = pageNum);
      this.loading = true;
      getRadarChannelList(this.query).then(({ rows, total }) => {
        this.list = rows;
        this.total = total;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    /**
     *  添加/修改渠道
     */
    submit() {
      this.$refs['form'].validate((valid) => {
        if (!valid) return changeButtonLoading(this.$store, 'submit');
        const params = {
          radarId: this.radarId,
          name: this.form.name
        };
        if (this.id) {
          params.id = this.id;
        }
        (this.id ? updateChannel : addCustomChannel)(params).then(() => {
          this.addChannelVisible = false;
          changeButtonLoading(this.$store, 'submit');
          this.getList(1);
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
     * 清空渠道输入框触发的条件
     */
    clear(val) {
      if (!val) {
        this.getList(1);
      }
    },
    /**
     * 删除渠道
     * @param row 对应渠道
     */
    handleDelete(row) {
      this.confirmModal({
        msg: '删除后，该渠道链接将失效，之前的统计数据也将被删除并不可恢复，是否继续？'
      }, async() => {
        deleteCustomChannel({
          idList: [row.id]
        }).then(res => {
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
      this.id = row.id;
      this.addChannelVisible = true;
    },
    /**
     * 关闭弹窗
     */
    close() {
      this.form.name = '';
      this.id = '';
    }
  }
};
</script>

<style scoped lang="scss">
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
