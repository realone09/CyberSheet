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
    {/* Workbook with lock icon */} <rect x="3" y="2" width="12" height="15" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="6" y1="5" x2="12" y2="5" stroke="#0078D4" strokeWidth="1" /> <line x1="6" y1="8" x2="10" y2="8" stroke="#0078D4" strokeWidth="1" /> {/* Lock */} <rect x="13" y="11" width="5" height="6" rx="0.5" fill="#0078D4" /> <path d="M14 11 L14 9.5 Q14 8 15.5 8 Q17 8 17 9.5 L17 11" fill="none" stroke="#0078D4" strokeWidth="1.2" />
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
