<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 20;
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
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <rect width="20" height="16" fill={fill.background} /> {/* Simplified pattern preview */} <text x="10" y="12" fontSize="10" textAnchor="middle" fill={fill.foreground}> ⊞ </text>
</svg>
