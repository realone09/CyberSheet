<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 24"
    :height="height || 24"
    :fill="fill || 'none'"
    :stroke="stroke"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <rect x="3" y="3" width="18" height="18" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="3" y1="12" x2="21" y2="12" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/> <line x1="12" y1="3" x2="12" y2="21" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  className?: string;
  style?: string | Record<string, any>;
  width?: string | number;
  height?: string | number;
  fill?: string;
  stroke?: string;
}

withDefaults(defineProps<Props>(), {
  className: '',
  fill: 'none',
  width: 24,
  height: 24
});
</script>
