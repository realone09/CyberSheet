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
    <path d="M6 8 L8 6 C9 5 11 5 12 6 L14 8 M14 8 L12 10 C11 11 9 11 8 10 L6 8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <circle cx="6" cy="8" r="2" fill="#0078D4"/> <circle cx="14" cy="8" r="2" fill="#0078D4"/>
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
