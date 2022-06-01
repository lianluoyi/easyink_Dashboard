<!--
 * @Description: 群日历界面
 * @Author: broccoli
 * @LastEditors: broccoli
-->
<template>
  <div class="group-sop-page">
    <div class="content-container">
      <SOPList
        :type="'groupCalendar'"
        :sop-type="SOP_TYPE['groupCalendar']"
        :show-use-employees="false"
        sop-tip="对指定的群聊定时发送指定内容"
        sop-name="日历"
      />
    </div>
  </div>
</template>
<script>
import SOPList from '../components/SOPList.vue';
import { SOP_TYPE } from '@/utils/constant';

export default {
  name: '',
  components: { SOPList },
  props: {},
  data() {
    return {
      SOP_TYPE
    };
  },
  created() {
    this.$store.dispatch(
      'app/setBusininessDesc',
      `
        <div>对客户群制定更细化的运营方案，在指定日期提醒群主推送指定内容</div>
      `
    );
  },
  mounted() {}

};
</script>
<style scoped lang='scss'>
</style>
