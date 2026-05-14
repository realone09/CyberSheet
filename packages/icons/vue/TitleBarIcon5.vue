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
    <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/> <path d="M9 9L13 13" stroke="currentColor" strokeWidth="1.5"/>
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
