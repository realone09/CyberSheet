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
  <path d="M11 1H3C1.9 1 1 1.9 1 3V11C1 12.1 1.9 13 3 13H11C12.1 13 13 12.1 13 11V3C13 1.9 12.1 1 11 1ZM7 11C5.9 11 5 10.1 5 9C5 7.9 5.9 7 7 7C8.1 7 9 7.9 9 9C9 10.1 8.1 11 7 11ZM9 5H3V3H9V5Z"/>
</svg>
