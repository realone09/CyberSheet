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
    <path d="M8 3H3.41L5.71 0.71L5 0L1 4L5 8L5.71 7.29L3.41 5H8C10.21 5 12 6.79 12 9C12 11.21 10.21 13 8 13H4V11H8C9.1 11 10 10.1 10 9C10 7.9 9.1 7 8 7H3.41L5.71 9.29L5 10L1 6"/>
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
