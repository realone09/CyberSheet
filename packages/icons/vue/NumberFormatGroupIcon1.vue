<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 18"
    :height="height || 18"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <circle cx="4" cy="14" r="1.5" /> <text x="7" y="13" fontSize="12" fontWeight="600">0</text> <text x="12" y="11" fontSize="10" fontWeight="600" fill="#06c">+</text>
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
  width: 18,
  height: 18
});
</script>
