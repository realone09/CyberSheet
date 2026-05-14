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
  <rect x="2" y="1" width="10" height="12" fill="none" stroke="currentColor"/> <line x1="4" y1="4" x2="10" y2="4" stroke="currentColor"/> <line x1="4" y1="6" x2="10" y2="6" stroke="currentColor"/> <line x1="4" y1="8" x2="10" y2="8" stroke="currentColor"/>
</svg>
