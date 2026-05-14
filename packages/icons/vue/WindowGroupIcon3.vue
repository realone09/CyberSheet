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
    <rect x="2" y="2" width="16" height="16" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <line x1="2" y1="10" x2="18" y2="10" stroke="#0078D4" strokeWidth="2"/> <line x1="10" y1="2" x2="10" y2="18" stroke="#0078D4" strokeWidth="2"/> <circle cx="10" cy="10" r="2" fill="#0078D4"/>
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
