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
  {/* Z→A icon with down arrow */} <text x="2" y="6" fontSize="10" fontWeight="bold" fill="#333">Z</text> <text x="2" y="14" fontSize="8" fill="#666">A</text> <path d="M15 8 L12 5 L15 8 L18 5 M15 15 L15 5" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
</svg>
