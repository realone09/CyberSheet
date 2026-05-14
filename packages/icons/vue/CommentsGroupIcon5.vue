<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 20"
    :height="height || 20"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    {/* Comment bubble with eye */} <rect x="2" y="5" width="14" height="10" rx="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M8 15 L10 18 L12 15" fill="#0078D4" /> <ellipse cx="8" cy="10" rx="2.5" ry="1.5" fill="none" stroke="#0078D4" strokeWidth="1" /> <circle cx="8" cy="10" r="0.8" fill="#0078D4" />
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
  width: 20,
  height: 20
});
</script>
