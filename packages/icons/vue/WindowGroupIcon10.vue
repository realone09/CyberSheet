<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 8"
    :height="height || 5"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 8 5"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <path d="M0 0 L4 4 L8 0" fill="#333"/>
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
  width: 8,
  height: 5
});
</script>
