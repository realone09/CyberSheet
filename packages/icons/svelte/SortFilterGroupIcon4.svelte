<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 14;
  export let height: string | number = 14;
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
  viewBox="0 0 14 14"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <path d="M1 2 L6 8 L6 12 L8 13 L8 8 L13 2 Z" stroke="#333" strokeWidth="1" fill="none"/>
</svg>
