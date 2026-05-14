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
    {/* Data validation icon - check mark with exclamation */} <path d="M2 8 L6 12 L14 2" stroke="#00A859" strokeWidth="2" fill="none"/> <circle cx="16" cy="12" r="3" fill="#E83E3E"/> <text x="15.5" y="14.5" fontSize="5" fill="#FFF" fontWeight="bold">!</text>
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
