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
    <rect x="2" y="2" width="16" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <path d="M6 6 L10 10 L14 6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
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
