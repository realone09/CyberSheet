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
  <rect x="4" y="4" width="16" height="16" stroke="#0078D4" strokeWidth="2" fill="none"/> <line x1="4" y1="10" x2="20" y2="10" stroke="#0078D4" strokeWidth="1"/> <line x1="10" y1="4" x2="10" y2="20" stroke="#0078D4" strokeWidth="1"/>
</svg>
