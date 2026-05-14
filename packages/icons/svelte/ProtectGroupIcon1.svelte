<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 20;
  export let height: string | number = 20;
  export let fill: string = 'currentColor';
  export let stroke: string = '';
</script>

<svg
  class={className}
  {style}
  {width}
  {height}
  {fill}
  {stroke}
  viewBox="0 0 20 20"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  {/* Shield with checkmark icon */} <path d="M10 2 L4 4 L4 10 Q4 14 10 18 Q16 14 16 10 L16 4 Z" fill="none" stroke="#0078D4" strokeWidth="1.5" strokeLinejoin="round" /> <path d="M7 10 L9 12 L13 8" stroke="#107C10" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</svg>
