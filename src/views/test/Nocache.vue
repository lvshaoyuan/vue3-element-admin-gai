<template>
  <dl>
    <dt>有以下两种方式设置页面不缓存：</dt>
    <dd>- 当前页面不设置name属性</dd>
    <dd>- 或者路由配置的meta增加noCache: true</dd>
  </dl>
</template>

<script setup lang="ts" name="test-no-cache">
console.log('nocache')
</script>
