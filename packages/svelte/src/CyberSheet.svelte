<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createCyberSheetStore, initializeCyberSheet, type CyberSheetState } from './cyberSheetStore';
  import type { Writable } from 'svelte/store';

  export let data: any[][] | undefined = undefined;
  export let enableFormulas = false;
  export let enableCollaboration = false;
  export let collaborationUrl: string | undefined = undefined;
  export let width: number | string = '100%';
  export let height: number | string = 600;
  export let className: string = '';
  export let style: Record<string, any> = {};
  export let onCellChange: ((row: number, col: number, value: any) => void) | undefined = undefined;
  export let onSelectionChange: ((selection: { start: { row: number; col: number }; end: { row: number; col: number } }) => void) | undefined = undefined;

  let containerRef: HTMLDivElement;
  let store: Writable<CyberSheetState> = createCyberSheetStore();
  let state: CyberSheetState;
  let cellChangeHandler: EventListener | null = null;

  $: state = $store;

  onMount(async () => {
    if (!containerRef) return;

    await initializeCyberSheet(containerRef, store, {
      data,
      enableFormulas,
      enableCollaboration,
      collaborationUrl
    });

    // Handle cell changes
    if (onCellChange) {
      cellChangeHandler = ((e: CustomEvent) => {
        const { row, col, value } = e.detail;
        onCellChange?.(row, col, value);
      }) as EventListener;

      document.addEventListener('cyber-sheet-cell-change', cellChangeHandler);
    }
  });

  onDestroy(() => {
    state?.collaboration?.disconnect();
    if (cellChangeHandler) {
      document.removeEventListener('cyber-sheet-cell-change', cellChangeHandler);
    }
  });

  export function setCell(row: number, col: number, value: any) {
    if (!state?.worksheet) return;
    state.worksheet.setCellValue({ row, col }, value);
  }

  export function getCell(row: number, col: number) {
    if (!state?.worksheet) return null;
    return state.worksheet.getCell({ row, col })?.value;
  }

  export function refresh() {
    if (state?.renderer && containerRef) {
      containerRef.dispatchEvent(new CustomEvent('cyber-sheet-refresh'));
    }
  }

  const computedStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative',
    overflow: 'hidden',
    ...style
  };
</script>

<div
  bind:this={containerRef}
  class={className}
  style={Object.entries(computedStyle).map(([k, v]) => `${k}: ${v}`).join('; ')}
/>
