<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 20"
    :height="height || 20"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    {/* ABC with checkmark icon */} <text x="2" y="14" fill="#0078D4" fontSize="12" fontWeight="bold" fontFamily="Segoe UI" > ABC </text> <path d="M14 4 L16 6 L19 3" stroke="#107C10" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
  width: 20,
  height: 20
});
</script>
