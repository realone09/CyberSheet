<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 24;
  export let height: string | number = 24;
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
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <rect x="3" y="3" width="18" height="18" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="3" y1="12" x2="21" y2="12" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/> <line x1="12" y1="3" x2="12" y2="21" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 2"/>
</svg>
