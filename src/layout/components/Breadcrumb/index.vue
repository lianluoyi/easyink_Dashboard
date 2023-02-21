<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item key="1">
        <svg-icon
          icon-class="home"
          class="cp home theme-text-color"
          @click="handleLink({ path: '/index' })"
        />
      </el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <a v-if="item.isSpecial" @click.prevent="handleGoBack(item)">{{ item.title }}</a>
        <span
          v-else-if="
            item.redirect === 'noRedirect'
              || index == levelList.length - 1
              || !/^\//gi.test(item.redirect)
          "
          class="no-redirect"
        >{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
    <el-popover
      v-if="busininessDesc"
      placement="top-start"
      title=""
      trigger="hover"
    >
      <div v-html="busininessDesc" />
      <i slot="reference" class="el-icon-question" />
    </el-popover>
  </el-breadcrumb>
</template>

<script>
import pathToRegexp from 'path-to-regexp';

// 若跳转的路由存在于specialRoute，跳转路由时导航还会保留上一页的路由
// todo 具体还有没有其他用法还不清楚，待优化
const specialRoute = {
  '/customerManage/customerCenter/groupDetail': [
    {
      title: '客户群',
      path: '/customerManage/group'
    }
  ],
  '/customerManage/customerCenter/customerDetail': [
    {
      title: '客户',
      path: '/customerManage/customerCenter/customer',
      type: 'customer'
    },
    {
      title: '流失提醒',
      path: '/customerManage/extend/lossRemind',
      type: 'lossRemind'
    }, {
      title: '客户记录',
      path: '/customerManage/customerCenter/labelDetail',
      type: 'labelDetail'
    }
  ],
  '/customerManage/extend/allocatedStaffList': [
    {
      title: '离职继承',
      path: '/customerManage/extend/dimission'
    }
  ],
  '/customerManage/extend/allocatedStaffDetail': [
    {
      title: '离职继承',
      path: '/customerManage/extend/dimission'
    },
    {
      title: '已分配离职员工',
      path: '/customerManage/extend/allocatedStaffList'
    }
  ],
  '/customerManage/autoLabel/addRule': [
    {
      title: '自动标签',
      path: '/customerManage/autoLabel',
      type: 'autoLabel'
    }
  ],
  '/operationsCenter/groupMessage/detail': [
    {
      title: '群发记录',
      path: '/operationsCenter/groupMessage/record'
    }
  ],
  '/operationsCenter/drainageCode/staffAdd': [
    {
      title: '员工活码',
      path: '/operationsCenter/drainageCode/staff'
    }
  ],
  '/operationsCenter/drainageCode/staffDetail': [
    {
      title: '员工活码',
      path: '/operationsCenter/drainageCode/staff'
    }
  ],
  '/operationsCenter/drainageCode/groupAdd': [
    {
      title: '客户群活码',
      path: '/operationsCenter/drainageCode/customerGroup'
    }
  ],
  '/operationsCenter/drainageCode/customerGroupDetail': [
    {
      title: '客户群活码',
      path: '/operationsCenter/drainageCode/customerGroup'
    }
  ],
  '/operationsCenter/communityOperating/oldCustomerAev': [
    {
      title: '老客进群',
      path: '/operationsCenter/communityOperating/tag'
    }
  ],
  '/operationsCenter/communityOperating/newCustomerAev': [
    {
      title: '新客进群',
      path: '/operationsCenter/communityOperating/newCustomer'
    }
  ],
  '/operationsCenter/material/welcomeAdd': [
    {
      title: '好友欢迎语',
      path: '/operationsCenter/material/welcome'
    }
  ],
  '/operationsCenter/material/groupWelcomeAdd': [
    {
      title: '入群欢迎语',
      path: '/operationsCenter/material/welcome'
    }
  ],
  '/operationsCenter/retainedConversion/addSOP': [
    {
      title: '客户SOP',
      path: '/operationsCenter/retainedConversion/customerSOP',
      type: 'customerSOP'
    },
    {
      title: '群SOP',
      path: '/operationsCenter/retainedConversion/groupSOP',
      type: 'groupSOP'
    }
  ],
  '/operationsCenter/retainedConversion/SOPDetail': [
    {
      title: '客户SOP',
      path: '/operationsCenter/retainedConversion/customerSOP',
      type: 'customerSOP'
    },
    {
      title: '群SOP',
      path: '/operationsCenter/retainedConversion/groupSOP',
      type: 'groupSOP'
    }
  ],
  '/operationsCenter/marketingActivities/conversionCodeAdd': [
    {
      title: '兑换码',
      path: '/operationsCenter/marketingActivities/conversionCode'
    }
  ],
  '/operationsCenter/marketingActivities/conversionCodeDetail': [
    {
      title: '兑换码',
      path: '/operationsCenter/marketingActivities/conversionCode'
    }
  ],
  '/operationsCenter/material/radarDetail': [
    {
      title: '雷达库',
      path: '/operationsCenter/material/radarManage'
    }
  ],
  '/operationsCenter/material/editForm': [
    {
      title: '智能表单',
      path: '/operationsCenter/material/intelligentForm'
    }
  ],
  '/operationsCenter/material/formDetail': [
    {
      title: '智能表单',
      path: '/operationsCenter/material/intelligentForm'
    }
  ]
};

export default {
  data() {
    return {
      levelList: null
    };
  },
  computed: {
    busininessDesc() {
      return this.$store.state.app.busininessDesc;
    }
  },
  watch: {
    $route(route) {
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith('/redirect/')) {
        return;
      }
      this.$store.state.app.busininessDesc = '';
      this.getBreadcrumb();
    }
  },
  created() {
    this.getBreadcrumb();
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      const matched = this.$route.matched.filter(
        (item) => item.meta && item.meta.title
      );

      this.levelList = matched.filter(
        (item) => item.meta && item.meta.title && item.meta.breadcrumb !== false
      );
      if (specialRoute[this.$route.path]) {
        let list = specialRoute[this.$route.path];
        if (this.$route.query.prePageType) {
          list = list.filter(ele => ele.type === this.$route.query.prePageType);
        }
        list.forEach(route => {
          const { title, path } = route;
          this.levelList.splice(-1, 0, {
            isSpecial: true,
            title,
            path
          });
        });
      }
    },
    pathCompile(path) {
      const { params } = this.$route;
      var toPath = pathToRegexp.compile(path);
      return toPath(params);
    },
    handleLink(item) {
      const { redirect, path } = item;
      if (redirect) {
        this.$router.push(redirect);
        return;
      }
      this.$router.push(this.pathCompile(path));
    },
    handleGoBack(item) {
      const apiQuery = {};
      Object.keys(this.$route.query).forEach(key => {
        if (key.includes('_')) {
          apiQuery[key.slice(0, -1)] = this.$route.query[key];
        }
        if (key === 'welcomeMsgTplType_') {
          apiQuery.type = this.$route.query[key];
        }
      });
      this.$router.push({
        path: item.path,
        query: apiQuery
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  vertical-align: middle;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #999;
    cursor: text;
  }
}
.el-icon-question {
  color: #888;
  margin-left: 10px;
}
</style>
