<script>
import { getList } from '@/api/customer/group';
const PAGESIZE = 10;
export default {
  components: {},
  props: {
    // 选择客户群聊显隐
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择客户群聊'
    },
    // 多选
    multiSelect: {
      type: Boolean,
      default: false
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
        pageSize: PAGESIZE,
        groupLeader: '',
        groupName: '',
        beginTime: '',
        endTime: ''
      },
      list: [], // 列表
      total: 0, // 总条数
      selectedGroup: '',
      multiSelectedGroups: []
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
      this.$emit('success', this.multiSelect ? this.multiSelectedGroups : this.selectedGroup);
    },

    setSelected() {
      if (!this.selected.length) return;
      this.list.forEach((code) => {
        if (code.id === this.selected[0].id) {
          this.selectedGroup = code;
        }
      });
    },

    handleSelectionChange(val) {
      this.multiSelectedGroups = val;
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
  >
    <div>
      <el-form ref="form" :model="query" label-width="">
        <el-form-item label="">
          <el-input
            v-model="query.groupName"
            class="ml10 mr10"
            style="width: 150px;"
            placeholder="请输入群名"
            clearable
            @keydown.enter="getList(1)"
            @clear="getList(1)"
          />
          <el-button
            icon="el-icon-search"
            circle
            @click="getList(1)"
          />

          <el-pagination
            class="fr"
            :current-page="query.pageNum"
            :page-size="query.pageSize"
            layout="prev, pager, next"
            :total="total"
            @current-change="getList"
          />
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
        <el-table-column v-if="multiSelect" type="selection" width="50" align="center" />
        <el-table-column v-else width="30">
          <template slot-scope="scope">
            <el-radio v-model="selectedGroup" :label="scope.row">'</el-radio>
          </template>
        </el-table-column>

        <el-table-column
          prop="groupName"
          label="群名"
          align="center"
        />

        <el-table-column
          prop="memberNum"
          label="群人数"
          align="center"
        />

        <el-table-column
          prop="groupLeaderName"
          label="群主"
          align="center"
        />

        <el-table-column
          prop="createTime"
          label="创建时间"
          align="center"
        />
      </el-table>
    </div>
    <div slot="footer">
      <el-button @click="Pvisible = false">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
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
</style>
