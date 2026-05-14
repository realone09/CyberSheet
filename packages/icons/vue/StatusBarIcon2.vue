<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 14"
    :height="height || 14"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 14 14"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <rect x="2" y="1" width="10" height="12" fill="none" stroke="currentColor"/> <line x1="4" y1="4" x2="10" y2="4" stroke="currentColor"/> <line x1="4" y1="6" x2="10" y2="6" stroke="currentColor"/> <line x1="4" y1="8" x2="10" y2="8" stroke="currentColor"/>
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
  width: 14,
  height: 14
});
</script>
