<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 14;
  export let height: string | number = 14;
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
  viewBox="0 0 14 14"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <rect x="1" y="1" width="12" height="12" fill="none" stroke="currentColor"/> <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeDasharray="2"/> <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeDasharray="2"/>
</svg>
