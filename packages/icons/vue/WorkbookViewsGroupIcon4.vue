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
    <rect x="3" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="13" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="3" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="13" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
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
