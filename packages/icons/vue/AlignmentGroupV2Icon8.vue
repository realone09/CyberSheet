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
    <path d="M10 2l4 4-4 4V7H6v6H4V7H2V5h8V2z"/>
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
