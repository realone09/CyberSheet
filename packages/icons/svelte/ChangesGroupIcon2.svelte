<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 6;
  export let height: string | number = 4;
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
  viewBox="0 0 6 4"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <path d="M0,0 L3,3 L6,0" stroke="#333" strokeWidth="1" fill="none"/>
</svg>
