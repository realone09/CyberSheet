<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 20;
  export let height: string | number = 20;
  export let fill: string = 'none';
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
  <text x="10" y="14" textAnchor="middle" fill="#0078D4" fontSize="12" fontWeight="bold">100</text> <text x="16" y="10" fill="#0078D4" fontSize="8">%</text>
</svg>
