<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 24;
  export let height: string | number = 24;
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
  <defs> <pattern id={`pattern-${pattern.type}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" > <rect width="8" height="8" fill={backgroundColor} /> <path d={pattern.svgPattern} stroke={foregroundColor} fill="none" strokeWidth="1" /> </pattern> </defs> <rect width="24" height="24" fill={`url(#pattern-${pattern.type})`} />
</svg>
