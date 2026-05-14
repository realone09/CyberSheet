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
    {/* Magnifying glass over document icon */} <rect x="3" y="2" width="10" height="13" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="5" y1="5" x2="11" y2="5" stroke="#0078D4" strokeWidth="1" /> <line x1="5" y1="8" x2="9" y2="8" stroke="#0078D4" strokeWidth="1" /> <circle cx="13" cy="11" r="3" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="15" y1="13" x2="17.5" y2="15.5" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
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
