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
    <rect x="4" y="2" width="16" height="20" stroke="#0078D4" strokeWidth="2" fill="none"/> <rect x="6" y="4" width="12" height="14" fill="#E3F2FD"/> <line x1="4" y1="18" x2="20" y2="18" stroke="#0078D4" strokeWidth="1"/>
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
