<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 24"
    :height="height || 20"
    :fill="fill || 'none'"
    :stroke="stroke"
    viewBox="0 0 24 20"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    {/* Document */} <rect x="4" y="2" width="12" height="16" fill="none" stroke="#0078D4" strokeWidth="1.5" rx="1"/> <line x1="7" y1="6" x2="13" y2="6" stroke="#0078D4" strokeWidth="1"/> <line x1="7" y1="9" x2="13" y2="9" stroke="#0078D4" strokeWidth="1"/> <line x1="7" y1="12" x2="11" y2="12" stroke="#0078D4" strokeWidth="1"/> {/* Pencil overlay */} <path d="M15 10 L18 7 L20 9 L17 12 Z" fill="#FFB900" stroke="#333" strokeWidth="0.5"/> <path d="M15 10 L14 13 L17 12 Z" fill="#FFE699"/>
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
  fill: 'none',
  width: 24,
  height: 20
});
</script>
