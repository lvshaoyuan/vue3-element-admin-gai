<!--
 * @Author: oldlv 15237336850@163.com
 * @Date: 2022-07-03 18:25:35
 * @LastEditors: oldlv 15237336850@163.com
 * @LastEditTime: 2022-07-03 22:52:01
 * @FilePath: /vue3-element-admin-gai/src/layout/components/Topbar/Hamburger.vue
 * @Description: 
 * 
 * Copyright (c) 2022 by oldlv 15237336850@163.com, All Rights Reserved. 
-->
<template>
  <el-icon
    class="fold-btn"
    :class="{ collapse: collapse }"
    @click="handleToggleMenu"
  >
    <fold />
  </el-icon>
</template>
<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  setup() {
    const store = useStore()
    const collapse = computed(() => !!store.state.app.sidebar.collapse)
    const handleToggleMenu = () => {
      store.commit('app/setCollapse', +!collapse.value)
    }
    return {
      collapse,
      handleToggleMenu,
    }
  },
})
</script>
<style lang="scss" scoped>
.fold-btn {
  line-height: 48px;
  padding: 0 10px;
  font-size: 18px;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
  &.collapse {
    transform: scale(-1, 1);
  }
}
</style>
