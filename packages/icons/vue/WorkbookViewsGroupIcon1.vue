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
    <rect x="4" y="4" width="16" height="16" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="4" y1="10" x2="20" y2="10" stroke="#0078D4" strokeWidth="1"/> <line x1="10" y1="4" x2="10" y2="20" stroke="#0078D4" strokeWidth="1"/>
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
