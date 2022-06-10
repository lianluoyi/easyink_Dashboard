<!--
 * @Description:  标签规则详情tab页
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
-->
<template>
  <div class="label-detail-tab">
    <el-card shadow="hover" class="mb10 detail-card-div">
      <svg class="icon-labelDetail" :width="100" :height="100">
        <use href="#icon-labelDetail" />
      </svg>
      <div class="info-div ml15">
        <div class="title mb15">
          {{ labelDetail.ruleName }}
        </div>
        <div class="creator-div flex">
          <div class="label-item flex">
            <div class="label">创建时间：</div>
            <span class="message-content">{{ labelDetail.createTime }}</span>
          </div>
          <div class="label-item flex" style="margin-left:50px">
            <div class="label">创建人：</div>
            <span class="message-content">{{ labelDetail.createBy }}</span>
          </div>
        </div>
        <div v-if="labelType ===3||labelType==1" class="mt5 flex label-item">
          <div class="label">使用员工：</div>
          <div class="message-content">
            <span>{{ dealName(userList) }}</span>
            <span v-if="Object.keys(labelDetail).length!==0 && userList.length > MAXSHOWLENGTH" class="ml10 theme-text-color" @click="onShowMore">查看</span>
          </div>
        </div>
        <div v-if="labelType ===3" class="cycle-div flex">
          <div class="mt5 label-item flex">
            <div class="label">生效周期：</div>
            <span v-if="labelDetail.effectBeginTime && labelDetail.effectEndTime" class="message-content">{{ labelDetail.effectBeginTime }} ~ {{ labelDetail.effectEndTime }} </span>
          </div>
        </div>
      </div>
    </el-card>
    <div class="rule-list-container">
      <div class="rule-list-header mb20">
        <div class="config-title">场景</div>
        <div>
          <div v-if="labelType === AUTOLABEL_TYPE['keyWords']" class="ml20">
            <div class="flex mb5">
              <div class="scene-text">为触发以下关键词的客户打上标签</div>
              <div v-if="Object.keys(labelDetail).length!==0" class="tag-list">
                <el-tag v-for="item in labelDetail.tagList" :key="item.tagId" type="info">{{ item.tagName }}</el-tag>
              </div>
            </div>
            <el-card style="width:600px;">
              <div style="display:flex">
                <div class="key-words">模糊匹配:</div>
                <div style="width:500px">
                  <el-tag
                    v-for="(item, index) in labelDetail.fuzzyMatchKeywordList"
                    :key="index"
                    size="medium"
                    class="user-tag"
                  >
                    {{ item }}
                  </el-tag>
                </div>
              </div>
              <div style="display:flex;margin-top:5px">
                <div class="key-words">精准匹配:</div>
                <div style="width:500px">
                  <el-tag
                    v-for="(item, index) in labelDetail.exactMatchKeywordList"
                    :key="index"
                    class="user-tag"
                    size="medium"
                  >
                    {{ item }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </div>
          <SceneList :rule-detail="true" :scene-list.sync="sceneList" :label-type="labelType" />
        </div>
      </div>
    </div>
    <!-- 使用员工弹窗 -->
    <UseEmployeeModal
      title="使用员工"
      :visible.sync="useEmployeeVisible"
      :user-list="userList"
    />
  </div>
</template>

<script>
import SceneList from './sceneList.vue';
import { AUTOLABEL_TYPE } from '@/utils/constant';
import { getKeywordRuleInfo, getIntoGroupRuleInfo, getNewCustomerRuleInfo } from '@/api/customer/auto';
import UseEmployeeModal from '@/views/retainedConversion/components/UseEmployeeModal.vue';
// 使用员工最多显示的人数
const MAXSHOWLENGTH = 5;
// 模糊匹配
const FUZZYKEYWORDS = 1;
// 精准匹配
const ACCURATEKEYWORDS = 2;
export default {
  name: '',
  components: { UseEmployeeModal, SceneList },
  inject: ['labelRuleInfo'],
  data() {
    return {
      sceneList: [],
      reluDetail: true,
      AUTOLABEL_TYPE,
      MAXSHOWLENGTH,
      FUZZYKEYWORDS,
      ACCURATEKEYWORDS,
      // 查看使用员工弹窗
      useEmployeeVisible: false,
      labelDetail: {}
    };
  },
  computed: {
    //   自动标签类型
    labelType() {
      return this.labelRuleInfo.labelType;
    },
    // 规则id 用来查询场景
    ruleId() {
      return this.labelRuleInfo.ruleId;
    },

    /**
     * 使用员工
     */
    userList() {
      const list = this.labelDetail.userList;
      return (list && [...list]) || [];
    }
  },
  created() {
    this.getRuleDetail();
  },
  mounted() {
  },
  methods: {
    /**
     * 获取标签规则详情
     */
    async getRuleDetail() {
      let delRes;
      const params = {
        ruleId: this.ruleId
      };
      switch (this.labelType) {
        case AUTOLABEL_TYPE['keyWords']:
          delRes = await getKeywordRuleInfo(params);
          break;
        case AUTOLABEL_TYPE['intoGroup']:
          delRes = await getIntoGroupRuleInfo(params);
          this.sceneList = delRes.data.groupSceneList?.map(item => {
            return {
              ...item,
              chatRoomList: item.groupList
            };
          });
          break;
        case AUTOLABEL_TYPE['newCustomer']:
          delRes = await getNewCustomerRuleInfo(params);
          this.sceneList = [...delRes.data.customerSceneList];
          break;
      }
      this.labelDetail = delRes.data;
    },
    //  查看使用员工
    onShowMore() {
    //   console.log(this.labelType);
      this.useEmployeeVisible = true;
    },
    // 处理使用员工
    dealName(userList) {
      if (userList.length === 0) {
        return '全部员工';
      } else {
        return this.dealSplit(userList) + (userList.length > MAXSHOWLENGTH ? '等' + userList.length + '人' : '');
      }
    },
    // 处理员工的间隔符号
    dealSplit(list) {
      let name = '';
      const userList = list.slice(0, MAXSHOWLENGTH);
      userList.map((item, index) => {
        name += index === userList.length - 1 ? item.userName : item.userName + '、';
      });
      return name;
    }
  }
};
</script>

<style scoped lang='scss'>
@import '~@/styles/mixin.scss';
.label-detail-tab {
    height: 100%;
    display: flex;
    flex-direction: column;
    .detail-card-div {
        /deep/ .el-card__body {
            display: flex;
            .info-div {
                .title {
                    font-size: 24px;
                }
                .label-item {
                    margin-right: 10px;
                    .label {
                        color: $grayColor;
                        line-height: 20px;
                    }
                    .look-more {
                        cursor: pointer;
                    }
                    .message-content {
                      line-height: 20px;
                    }
                }
            }
        }
    }
    .rule-list-container {
        background-color: #fff;
        flex: 1;
        padding: 20px;
        .rule-list-header {
          justify-content: space-between;
          .config-title {
              margin-bottom: 20px;
              font-size: 14px;
              line-height: 20px;
              text-align: left;
              font-family: Roboto;
              border-left: 3px solid $baseColor;;
              padding-left: 15px;
              height: 20px;
          }
        }
    }
}
/deep/ .el-card__body {
    padding:20px
}
.scene-text{
  color:#AEAEAE;
  font-size: 12px;
  display:flex;
  align-items:center;
  margin-right: 5px;
}
.tag-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.key-words{
  width:70px;
  margin-top:5px;
}
.user-tag{
  margin-bottom: 5px;
}
</style>
