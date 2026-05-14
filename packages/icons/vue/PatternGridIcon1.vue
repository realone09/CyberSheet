<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 24"
    :height="height || 24"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <defs> <pattern id={`pattern-${pattern.type}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" > <rect width="8" height="8" fill={backgroundColor} /> <path d={pattern.svgPattern} stroke={foregroundColor} fill="none" strokeWidth="1" /> </pattern> </defs> <rect width="24" height="24" fill={`url(#pattern-${pattern.type})`} />
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
  width: 24,
  height: 24
});
</script>
