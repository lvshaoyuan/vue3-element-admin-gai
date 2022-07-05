<!--
 * @Author: oldlv 15237336850@163.com
 * @Date: 2022-07-03 18:25:35
 * @LastEditors: oldlv 15237336850@163.com
 * @LastEditTime: 2022-07-05 00:16:54
 * @FilePath: /vue3-element-admin-gai/src/layout/components/Sidebar/Item.vue
 * @Description: 
 * 
 * Copyright (c) 2022 by oldlv 15237336850@163.com, All Rights Reserved. 
-->
<template>
  <component v-if="isElementIcon" class="icon" :is="icons[icon]"></component>
  <svg-icon
    class="icon"
    v-if="!isElementIcon && typeof icon === 'string'"
    :name="icon"
  />

  <span>{{ title }}</span>
</template>

<script>
import { computed, defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  props: ['title', 'icon'],
  setup({ icon }) {
    const isElementIcon = computed(
      () =>
        typeof icon === 'string' &&
        !icon.startsWith('el-icon') &&
        /[A-Z]/.test(icon[0])
    )
    const icons = getCurrentInstance()?.appContext.config.globalProperties.$icon
    return {
      isElementIcon,
      icons,
    }
  },
})
</script>
<style lang="scss" scoped>
.icon {
  margin-right: 10px;
  width: 16px !important;
  height: 16px !important;
  font-size: 16px;
  text-align: center;
  color: currentColor;
}
</style>
