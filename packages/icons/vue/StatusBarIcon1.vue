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
    <rect x="1" y="1" width="5" height="5"/> <rect x="8" y="1" width="5" height="5"/> <rect x="1" y="8" width="5" height="5"/> <rect x="8" y="8" width="5" height="5"/>
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
