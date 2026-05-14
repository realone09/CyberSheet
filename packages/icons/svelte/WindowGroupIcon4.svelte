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
  <rect x="3" y="4" width="14" height="12" stroke="#888" strokeWidth="1.5" fill="none"/> <line x1="2" y1="2" x2="18" y2="18" stroke="#888" strokeWidth="2"/>
</svg>
