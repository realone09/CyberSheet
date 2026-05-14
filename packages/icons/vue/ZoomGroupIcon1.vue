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
    <rect x="3" y="3" width="14" height="14" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2" fill="none"/> <circle cx="15" cy="15" r="3" fill="#0078D4"/> <path d="M17 17 L19 19" stroke="#0078D4" strokeWidth="2" strokeLinecap="round"/>
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
