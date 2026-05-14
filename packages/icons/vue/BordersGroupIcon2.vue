<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 16"
    :height="height || 16"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
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
  width: 16,
  height: 16
});
</script>
