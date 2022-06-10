<!--
 * @Description: 场景列表布局
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->
<template>
  <div class="scene-list timeline-list">
    <el-timeline class="timeline-div">
      <el-timeline-item v-for="(sceneItem, sceneIndex) in sceneList" :key="sceneIndex" placement="top">
        <template #dot>
          <div class="step-dot">{{ sceneIndex + 1 }}</div>
        </template>
        <div class="custom-timestamp">
          场景{{ sceneIndex + 1 }}
        </div>
        <div class="rule-content">
          <SceneItem :rule-detail="ruleDetail" :label-type="labelType" :update-scene-list="(item, type) => updateSceneList(item, sceneIndex, type)" :scene-index="sceneIndex" :scene-list="sceneList" />
          <div v-if="showTool" class="tool-div">
            <i
              class="iconfont icon-remove"
              title="删除"
              @click="handleDelete(sceneIndex, sceneItem)"
            />
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>
<script>
import { AUTOLABEL_TYPE } from '@/utils/constant';
import SceneItem from './sceneItem.vue';
import { deepClone } from '@/utils/index';

export default {
  name: '',
  components: { SceneItem },
  props: {
    /**
     * 场景列表
     */
    sceneList: {
      type: Array,
      default: () => []
    },
    /**
     * 是否显示工具栏
     */
    showTool: {
      type: Boolean,
      default: false
    },
    /**
     * 标签类型
     */
    labelType: {
      type: Number,
      default: AUTOLABEL_TYPE['keyWords']
    },
    /**
     * 被删除的场景列表
     */
    removeSceneList: {
      type: Array,
      default: () => []
    },
    /**
     * 是否是规则详情的子组件
     */
    ruleDetail: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      AUTOLABEL_TYPE
    };
  },
  created() {},
  mounted() { },
  methods: {
    handleDelete(sceneIndex) {
      this.confirmModal({
        msg: '该规则即将被删除，是否继续？'
      }, async() => {
        const sceneList = deepClone(this.sceneList);
        const removeSceneList = [...this.removeSceneList];
        removeSceneList.push(sceneList[sceneIndex]);
        sceneList.splice(sceneIndex, 1);
        this.$emit('update:sceneList', sceneList);
        this.$emit('update:removeSceneList', removeSceneList);
      });
    },
    /**
     * 更新sceneList
     */
    updateSceneList(item, index, type) {
      const sceneList = [...this.sceneList];
      sceneList[index][type] = item;
      this.$emit('update:sceneList', sceneList);
    }
  }

};
</script>
<style lang="scss" src="@/styles/timelineList.scss" scoped>
</style>
<style scoped lang='scss'>
.scene-list {
    padding-left: 24px;
    .timeline-div {
      .custom-timestamp {
          font-size: 12px;
          padding-top: 7px;
      }
    }
}
</style>
