<script>
import { getList } from '@/api/drainageCode/group';
import { PAGE_LIMIT } from '@/utils/constant';
import RightContainer from '@/components/RightContainer';
import EmptyDefaultIcon from '@/components/EmptyDefaultIcon';

export default {
  components: { RightContainer, EmptyDefaultIcon },
  props: {
    // 添加标签显隐
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择群活码'
    },
    selected: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: true, // 遮罩层
      query: {
        pageNum: 1,
        pageSize: PAGE_LIMIT,
        activityName: '',
        createBy: '',
        beginTime: '',
        endTime: ''
      },
      list: [], // 列表
      total: 0, // 总条数
      radio: ''
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
    selected(val) {
      this.setSelected();
    },
    list(val) {
      this.setSelected();
    }
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    resetQuery() {
      this.query.activityName = '';
      this.$nextTick(() => {
        this.getList(1);
      });
    },
    // 获取列表
    getList(page) {
      page && (this.query.pageNum = page);
      this.loading = true;
      getList(this.query)
        .then(({ rows, total }) => {
          this.list = rows;
          this.total = +total;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    submit() {
      this.Pvisible = false;
      this.$emit('success', this.radio);
    },
    setSelected() {
      if (!this.selected.length) return;
      this.list.forEach((code) => {
        if (code.id === this.selected[0].id) {
          this.radio = code;
        }
      });
    }
  }
};
</script>

<template>
  <el-dialog
    :title="title"
    :visible.sync="Pvisible"
    width="650px"
    append-to-body
    :close-on-click-modal="false"
    class="dialog-me"
  >
    <div class="selecte-code">
      <RightContainer>
        <template v-slot:search>
          <el-form ref="form" :model="query" style="padding: 0">
            <el-form-item>
              <el-input
                v-model="query.activityName"
                style="width: 240px;"
                placeholder="请输入活码名称"
                @keydown.enter="getList(1)"
              />
              <el-button
                type="primary"
                @click="getList(1)"
              >
                查询
              </el-button>
              <el-button
                class="btn-reset"
                @click="resetQuery()"
              >重置</el-button>
            </el-form-item>
          </el-form>
        </template>
        <template v-slot:data>
          <el-table v-loading="loading" :data="list">
            <template slot="empty">
              <empty-default-icon
                :length="list.length"
              />
            </template>
            <el-table-column width="30">
              <template slot-scope="scope">
                <el-radio v-model="radio" :label="scope.row">'</el-radio>
              </template>
            </el-table-column>
            <el-table-column
              prop="codeUrl"
              label="活码预览"
              align="center"
              width="80"
            >
              <template #default="{ row }">
                <el-popover placement="bottom" trigger="hover">
                  <el-image
                    slot="reference"
                    :src="row.codeUrl"
                    class="code-image--small"
                    style="border: 1px solid #eee;"
                  />
                  <el-image :src="row.codeUrl" class="code-image" />
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column
              prop="activityName"
              label="活码名称"
              align="center"
            >
              <template #default="{ row }">
                <el-tooltip :content="row.activityName" placement="bottom-end" effect="dark">
                  <div class="ellipsis-style">
                    {{ row.activityName }}
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="activityDesc"
              label="活码描述"
              align="center"
              width="160"
            >
              <template #default="{ row }">
                <el-tooltip :content="row.activityDesc" placement="bottom-end" effect="dark">
                  <div class="ellipsis-style">
                    {{ row.activityDesc }}
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="availableCodes"
              label="可用群码/总群码"
              align="center"
            >
              <template #default="{ row }">
                {{ row.availableCodes }}/{{ (row.actualList && row.actualList.length) || 0 }}
                <el-popover
                  v-if="row.aboutToExpireCodes > 0"
                  placement="bottom"
                  width="200"
                  trigger="hover"
                  :content="'有' + row.aboutToExpireCodes + '个实际群码即将过期。'"
                >
                  <i slot="reference" class="el-icon-warning expire-icon" />
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </RightContainer>
    </div>
    <div slot="footer" class="footer-flex">
      <pagination
        v-show="total > 0"
        layout="prev, pager, next"
        :total="total"
        :page.sync="query.pageNum"
        :limit.sync="query.pageSize"
        :pager-count="5"
        class="footer-left"
        @pagination="getList()"
      />
      <div class="footer-right">
        <el-button @click="Pvisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.code-image {
  width: 200px;
  height: 200px;
}

.code-image--small {
  width: 50px;
  height: 50px;
}

.expire-icon {
  color: red;
}
.footer-left{
  text-align: left;
  padding: 0;
}
.footer-right{
  flex: 1;
}
.footer-flex{
  display: flex;
  justify-content: space-between;
}
</style>
<style>
.selecte-code .show-data-wrapper {
  padding: 0;
  padding-top: 5px;
}
.dialog-me .el-dialog__body {
  padding-top: 0px;
  padding-bottom: 0px;
}
.dialog-me .el-dialog__footer {
  padding-left: 10px;
  padding-top: 20px;
}
</style>
