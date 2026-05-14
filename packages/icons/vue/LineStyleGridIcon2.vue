<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 100"
    :height="height || 12"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <line x1="0" y1="6" x2="100" y2="6" stroke={color} strokeWidth={metadata.strokeWidth} strokeDasharray={metadata.strokeDasharray} />
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
  width: 100,
  height: 12
});
</script>
