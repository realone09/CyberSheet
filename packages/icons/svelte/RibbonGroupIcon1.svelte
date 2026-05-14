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
  <path d="M11 11L7 7M7 7L3 3M7 7L11 3M7 7L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
</svg>
