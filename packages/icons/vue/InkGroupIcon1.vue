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
    {/* Pen with slash icon */} <path d="M15 3 L17 5 L8 14 L5 15 L6 12 Z" fill="none" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> <circle cx="16" cy="4" r="1.5" fill="#0078D4" /> {/* Slash through */} <line x1="3" y1="17" x2="17" y2="3" stroke="#D13438" strokeWidth="2" strokeLinecap="round" />
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
