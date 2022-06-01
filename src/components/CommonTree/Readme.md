```vue

<script>
    export default {
        data() {
            return {
            filterVal: '',
            defaultProps: {
                children: 'children',
                label: 'label'
            },
            treeData: [{
                label: '一级 1',
                children: [{
                    label: '二级 1-1',
                    children: [{
                        label: '三级 1-1-1'
                    }]
                    }]
                }, {
                    label: '一级 2',
                    children: [{
                    label: '二级 2-1',
                    children: [{
                        label: '三级 2-1-1'
                    }]
                    }, {
                    label: '二级 2-2',
                    children: [{
                        label: '三级 2-2-1'
                    }]
                    }]
                }, {
                    label: '一级 3',
                    children: [{
                    label: '二级 3-1',
                    children: [{
                        label: '三级 3-1-1'
                    }]
                    }, {
                    label: '二级 3-2',
                    children: [{
                        label: '三级 3-2-1'
                    }]
                    }]
                }]
            }
        },
        methods: {
            filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
            }
        },
        watch: {
            filterVal(val) {
            this.$refs.tree.filter(val);
            }
        }
    }
</script>
<template>
    <div>
    <el-input v-model="filterVal" placeholder="请输入内容"></el-input>
    <common-tree
      ref="tree"
      :data="treeData"
      :props="defaultProps"
      :filter-node-method="filterNode"
    >
      <template slot="empty">
        <empty-default-icon
          text="暂无部门"
        />
      </template>
      <div slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
      </div>
    </common-tree>
    </div>
</template>
```


