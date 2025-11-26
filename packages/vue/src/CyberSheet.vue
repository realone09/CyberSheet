/**
 * CyberSheet.vue
 * 
 * Vue 3 component wrapper for Cyber Sheet
 */

<template>
  <div
    ref="containerRef"
    :class="className"
    :style="computedStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCyberSheet } from './useCyberSheet';
import type { CyberSheetProps } from './types';

const props = withDefaults(defineProps<CyberSheetProps>(), {
  width: '100%',
  height: 600
});

const { containerRef } = useCyberSheet({
  data: props.data,
  enableFormulas: props.enableFormulas,
  enableCollaboration: props.enableCollaboration,
  collaborationUrl: props.collaborationUrl,
  onCellChange: props.onCellChange,
  onSelectionChange: props.onSelectionChange
});

const computedStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  position: 'relative',
  overflow: 'hidden',
  ...props.style
}));
</script>
