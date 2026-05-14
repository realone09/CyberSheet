<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 20"
    :height="height || 16"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <rect width="20" height="16" fill={fill.background} /> {/* Simplified pattern preview */} <text x="10" y="12" fontSize="10" textAnchor="middle" fill={fill.foreground}> ⊞ </text>
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
  fill: 'currentColor',
  width: 20,
  height: 16
});
</script>
