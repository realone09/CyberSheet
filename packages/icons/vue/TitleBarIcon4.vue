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
    <path d="M6 3H10.59L8.29 0.71L9 0L13 4L9 8L8.29 7.29L10.59 5H6C3.79 5 2 6.79 2 9C2 11.21 3.79 13 6 13H10V11H6C4.9 11 4 10.1 4 9C4 7.9 4.9 7 6 7H10.59L8.29 9.29L9 10L13 6"/>
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
