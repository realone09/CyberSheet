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
    {/* Multi-level sort icon */} <rect x="3" y="3" width="14" height="2" fill="#333"/> <rect x="5" y="7" width="12" height="2" fill="#666"/> <rect x="7" y="11" width="10" height="2" fill="#999"/> <rect x="9" y="15" width="8" height="2" fill="#BBB"/>
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
