<div align="center"> <a href="https://github.com/huzhushan/vue3-element-admin"> <img alt="VEA Logo" width="160" src="https://huzhushan.gitee.io/vue3-element-admin-site/assets/logo.1d6978fb.svg"> </a> <br> <br>

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

<h1>Vue3 Element Admin</h1>
</div>

原项目地址：<https://github.com/huzhushan/vue3-element-admin>
原作者使用的element-plus，我在他的基础上升级为新的element-plus。
element-plus版本为v2.1.11，vue升级到了v3.2.33，增加了@element-plus/icons-vue版本v1.1.4。
主要改了以下几个地方：

#### 1. /src/main.js

```javascript
...
// 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/style/element-variables.scss'

...

// 引入全部icon
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component)
})
app.config.globalProperties.$icon = ElementPlusIconsVue
```

####  2. /src/layout/components/Sidebar/Item.vue
```javascript
<template>
  <component v-if="isElementIcon" class="icon" :is="icons[icon]"></component>
  <svg-icon class="icon" v-else-if="!!icon" :name="icon" />
  <span>{{ title }}</span>
</template>

<script>
import { computed, defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  props: ['title', 'icon'],
  setup({ icon }) {
    const isElementIcon = computed(() => icon && !icon.startsWith('el-icon') && /[A-Z]/.test(icon[0]))
    const icons = getCurrentInstance()?.appContext.config.globalProperties.$icon

    return {
      isElementIcon,
      icons
    }
  },
})
</script>
```


#### 3. /src/layout/components/Tagsbar/hooks/useScrollbar.js
```javascript
...
const moveToTarget = currentTag => {
    const containerWidth = scrollContainer.value.scrollbar$.offsetWidth
    const scrollWrapper = scrollContainer.value.wrap$
...
```


#### 4. /src/layout/components/Topbar/Breadcrumbs.vue
scss部分删除了
```scss
::v-deep(.el-breadcrumb__item) {
  float: none;
}
```

#### 5. /src/assets/style/element-variables
```scss
...
@import 'element-plus/theme-chalk/src/reset';
@import 'element-plus/theme-chalk/src/index';
```