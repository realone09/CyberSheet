<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 6"
    :height="height || 4"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 6 4"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <path d="M0 0 L3 4 L6 0" fill="#333"/>
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
  width: 6,
  height: 4
});
</script>
