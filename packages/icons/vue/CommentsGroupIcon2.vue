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
    {/* Trash can icon */} <rect x="4" y="5" width="8" height="9" rx="1" fill="none" stroke="#D13438" strokeWidth="1.5" /> <line x1="3" y1="5" x2="13" y2="5" stroke="#D13438" strokeWidth="1.5" /> <path d="M6 3 L10 3" stroke="#D13438" strokeWidth="1.5" strokeLinecap="round" /> <line x1="6.5" y1="7" x2="6.5" y2="12" stroke="#D13438" strokeWidth="1" /> <line x1="9.5" y1="7" x2="9.5" y2="12" stroke="#D13438" strokeWidth="1" />
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
