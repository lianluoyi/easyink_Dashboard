<script>
export default {
  name: 'CImg',
  components: {},
  props: {
    src: {
      type: Boolean,
      default: false
    },
    fit: {
      type: String,
      default: 'fit'
    },
    previewSrcList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  computed: {
    // Pvisible: {
    //   get() {
    //     // this.getTree();
    //     return this.visible
    //   },
    //   set(val) {
    //     this.$emit('update:visible', val)
    //   },
    // },
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {}
};
</script>

<template>
  <el-image :src="src" :fit="fit" :preview-src-list="previewSrcList" />
</template>

<style lang="scss" scoped></style>
