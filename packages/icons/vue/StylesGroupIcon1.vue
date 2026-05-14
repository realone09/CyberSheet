<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 16"
    :height="height || 16"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <rect x="2" y="2" width="12" height="3" fill="#4472C4" /> <rect x="2" y="5" width="12" height="2" fill="#D9E2F3" /> <rect x="2" y="7" width="12" height="2" fill="#FFF" stroke="#ccc" strokeWidth="0.5" /> <rect x="2" y="9" width="12" height="2" fill="#D9E2F3" /> <rect x="2" y="11" width="12" height="2" fill="#FFF" stroke="#ccc" strokeWidth="0.5" />
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
  width: 16,
  height: 16
});
</script>
