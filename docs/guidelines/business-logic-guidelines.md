<!--
 * @Description: 公用业务逻辑编写规范文档
 * @Author: broccoli
 * @LastEditors: wJiaaa
-->

# 公用业务逻辑编写规范

本文档提供了关于如何编写和组织项目中的一些公用业务逻辑的指导。

## 目录

- [表格查询条件持久化](#表格查询条件持久化)

## 表格查询条件持久化

业务需求：在表格页面中，当用户设置了特定的查询条件进行数据筛选，并随后跳转至其他子页面（例如编辑、新增或详情界面），当返回至原表格页面时，系统应确保先前设置的查询条件和页码状态被准确地保留并显示。

### 实践

- ### 搜索条件存在了 vuex 中 文件是 <u>searchConditions.js</u> 在 vuex 中 保存了如下几个参数。
  1. searchQuery 每个页面的搜索条件对象
  2. saveCondition 是否需要保存搜索条件
  3. addFlag 是否是新增的标识
- ### 在 <u>App.Vue</u> 文件中 使用 watch 方法监听了路由 route 用来判断是否需要保存条件以及是否是新增的跳转。代码如下

```
$route(to, from) {
      /**
       * @description 设置是否需要保留搜索条件 1.是否是从列表页进去的页面 比如 详情、编辑、新增。2.是否是新增
       * 编辑：进入编辑页后，点击保存按钮，保存成功，回到当前页，保留之前的搜索条件；
       * 新增/导入：进入编辑页后，点击保存按钮，新增成功，切换到第一页，不保留搜索条件；
       * 返回：点击新增或编辑按钮，进入编辑页，此时没有保存，点击了页面顶部的返回按钮，则回到当前页，保留之前的搜索条件；
       * 进入详情页：点击页面顶部的返回按钮，则回到当前页，保留之前的搜索条件；
       * 删除/批量删除：操作成功后，更新当前页数据（假设当前页所有数据删除，导致页面空白，为正常情况），保留之前的搜索条件；
       * 批量操作（批量打标签/批量移除标签）：操作成功后，更新当前页数据，保留之前的搜索条件；
       */
      this.$store.commit('SET_SAVE_CONDITION', Boolean(PAGE_FROM_PATH[to.name]?.includes(from.name) && !this.$store.state.searchConditions.addFlag));
      if (PAGE_FROM_PATH[to.name]) {
        this.$store.commit('SET_ADD_FLAG', false);
      }
    }
```

其中 SET_SAVE_CONDITION、SET_ADD_FLAG 都是用来设置 vuex 中值的方法。

- ### 具体使用方法（使用员工活码进行举例）

## 1.在表格页面组件的 created 方法中，设置之前保存的查询条件(用于回显查询条件)。代码如下：

```
if (this.$store.getters.saveCondition && Object.keys(this.$store.getters.searchQuery[this.$route.name] || {}).length) {
  const { beginTime, endTime } = this.$store.getters.searchQuery[this$routename];
  if (beginTime && endTime) {
    this.dateRange = [beginTime, endTime];
  }
  this.query = this.$store.getters.searchQuery[this.$route.name];
}
```

部分查询条件需要特殊处理，如日期、员工、部门、标签等需要转换数据格式查询条件

## 2.处理从表格页跳转至其他子页面的情况（例如编辑、新增或详情界面）

跳转子页面方法需要调用“SET_SEARCH_QUERY”的方法设置查询条件, 代码如下

```
this.$store.commit('SET_SEARCH_QUERY', {
  pageName: this.$route.name,
  query: this.query
});
goRouteWithQuery(this.$router, path, {}, { id });
```

使用 vuex 中 SET_SEARCH_QUERY 保存当前页面的搜索条件。其中 key 为当前路由名称，query 就是当前的搜索条件。

## 3.需在子页面中的确认点击事件，设置是否需要回显查询条件的标识

点击新增页面中的确认按钮后返回页面不需要回显查询条件，点击编辑页面中的确认按钮后返回页面需要回显查询条件。

```
this.$store.commit('SET_ADD_FLAG', payload);
```

payload 根据当前是编辑还是新增进行修改。

## 4. 将需要保存搜索条件的页面路径存到 constant 中 routePath.JS 文件中.

将所有路由名定义在该文件中，其中 PAGE_FROM_PATH 的 key 是表格页面，value 是从哪些页面返回可以保存搜索条件。PAGE_FROM_PATH 在 APP.vue 中使用到。

## 5.注意点

- 重置按钮的时候不能使用 element 自带的重置方法。可以使用 this.$options.data() 中的参数 或者手动进行赋值
- 处理一些特定需求的功能点时，不要修改到全局的方法。为该功能点单独进行处理，例如智能表单。
