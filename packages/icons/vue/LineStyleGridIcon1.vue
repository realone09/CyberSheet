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
    <line x1="0" y1="3" x2="100" y2="3" stroke={color} strokeWidth="1" /> <line x1="0" y1="9" x2="100" y2="9" stroke={color} strokeWidth="1" />
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
