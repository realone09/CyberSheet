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
  <path d="M8 3H3.41L5.71 0.71L5 0L1 4L5 8L5.71 7.29L3.41 5H8C10.21 5 12 6.79 12 9C12 11.21 10.21 13 8 13H4V11H8C9.1 11 10 10.1 10 9C10 7.9 9.1 7 8 7H3.41L5.71 9.29L5 10L1 6"/>
</svg>
