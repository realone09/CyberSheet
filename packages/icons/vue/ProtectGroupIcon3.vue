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
    {/* Grid cells with unlock icon */} <rect x="3" y="3" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <rect x="11" y="3" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <rect x="3" y="11" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> {/* Unlocked padlock */} <rect x="12" y="13" width="4" height="4" rx="0.5" fill="#107C10" /> <path d="M13 13 L13 11.5 Q13 10.5 14 10.5 Q15 10.5 15 11.5 L15 12" fill="none" stroke="#107C10" strokeWidth="1.2" />
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
