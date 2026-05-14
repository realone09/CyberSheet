<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 20"
    :height="height || 20"
    :fill="fill || 'none'"
    :stroke="stroke"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    {/* A→Z icon with up arrow */} <text x="2" y="14" fontSize="10" fontWeight="bold" fill="#333">A</text> <text x="2" y="6" fontSize="8" fill="#666">Z</text> <path d="M15 12 L12 15 L15 12 L18 15 M15 5 L15 15" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
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
  width: 20,
  height: 20
});
</script>
