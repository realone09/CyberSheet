<template>
  <svg
    :class="className"
    :style="style"
    :width="width || 24"
    :height="height || 24"
    :fill="fill || 'currentColor'"
    :stroke="stroke"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    <rect x="4" y="4" width="16" height="16" fill="none" stroke={hasBorder('top') || hasBorder('bottom') || hasBorder('left') || hasBorder('right') ? '#ccc' : 'none'} strokeWidth="0.5" /> {/* Top border */} {hasBorder('top') && ( <line x1="4" y1="4" x2="20" y2="4" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'top' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Bottom border */} {hasBorder('bottom') && ( <line x1="4" y1="20" x2="20" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'bottom' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Left border */} {hasBorder('left') && ( <line x1="4" y1="4" x2="4" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'left' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Right border */} {hasBorder('right') && ( <line x1="20" y1="4" x2="20" y2="20" stroke="#000" strokeWidth={preset.borders.find(b => b.edge === 'right' || b.edge === 'all')?.style === 'thick' ? 2 : 1} /> )} {/* Inside horizontal */} {preset.borders.some(b => b.edge === 'insideHorizontal') && ( <line x1="4" y1="12" x2="20" y2="12" stroke="#000" strokeWidth="1" /> )} {/* Inside vertical */} {preset.borders.some(b => b.edge === 'insideVertical') && ( <line x1="12" y1="4" x2="12" y2="20" stroke="#000" strokeWidth="1" /> )}
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
  width: 24,
  height: 24
});
</script>
