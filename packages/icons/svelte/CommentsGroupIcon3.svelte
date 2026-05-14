<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 16;
  export let height: string | number = 16;
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
  viewBox="0 0 16 16"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  {/* Up arrow */} <path d="M8 4 L8 12" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> <path d="M5 7 L8 4 L11 7" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</svg>
