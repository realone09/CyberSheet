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
    {/* Accessibility person icon with checkmark */} <circle cx="10" cy="5" r="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M6 9 L10 7 L14 9" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" /> <line x1="10" y1="7" x2="10" y2="12" stroke="#0078D4" strokeWidth="1.5" /> <path d="M7 12 L10 12 L13 12" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" /> <line x1="8" y1="12" x2="7" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> <line x1="12" y1="12" x2="13" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> {/* Checkmark */} <path d="M14 3 L15.5 4.5 L18 2" stroke="#107C10" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
