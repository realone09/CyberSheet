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
  <path d="M6 3H10.59L8.29 0.71L9 0L13 4L9 8L8.29 7.29L10.59 5H6C3.79 5 2 6.79 2 9C2 11.21 3.79 13 6 13H10V11H6C4.9 11 4 10.1 4 9C4 7.9 4.9 7 6 7H10.59L8.29 9.29L9 10L13 6"/>
</svg>
