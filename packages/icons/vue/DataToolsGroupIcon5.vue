<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 20"
    :height="height || 16"
    :fill="fill || 'none'"
    :stroke="stroke"
    viewBox="0 0 20 16"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    {/* Remove duplicates icon - two squares with X */} <rect x="2" y="2" width="8" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="10" y="6" width="8" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none" opacity="0.5"/> <path d="M4 4 L8 8 M8 4 L4 8" stroke="#E83E3E" strokeWidth="1.5"/>
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
  height: 16
});
</script>
