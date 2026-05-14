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
    <rect x="2" y="2" width="6" height="12" stroke="#0078D4" strokeWidth="1" fill="none"/> <rect x="12" y="2" width="6" height="12" stroke="#0078D4" strokeWidth="1" fill="none"/> <path d="M8 8 L12 8" stroke="#00A859" strokeWidth="1.5"/>
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
