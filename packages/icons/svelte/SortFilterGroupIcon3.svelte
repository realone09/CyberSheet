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
  {/* Multi-level sort icon */} <rect x="3" y="3" width="14" height="2" fill="#333"/> <rect x="5" y="7" width="12" height="2" fill="#666"/> <rect x="7" y="11" width="10" height="2" fill="#999"/> <rect x="9" y="15" width="8" height="2" fill="#BBB"/>
</svg>
