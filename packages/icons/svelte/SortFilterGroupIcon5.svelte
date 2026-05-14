<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 8;
  export let height: string | number = 5;
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
  viewBox="0 0 8 5"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <path d="M0 0 L4 5 L8 0" fill="#333"/>
</svg>
