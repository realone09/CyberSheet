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
    {/* Comment bubble with plus */} <rect x="2" y="4" width="14" height="10" rx="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M8 14 L10 17 L12 14" fill="#0078D4" /> <line x1="9" y1="7" x2="9" y2="11" stroke="#0078D4" strokeWidth="1.5" /> <line x1="7" y1="9" x2="11" y2="9" stroke="#0078D4" strokeWidth="1.5" />
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
