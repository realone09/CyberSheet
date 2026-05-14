<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 16;
  export let height: string | number = 16;
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
  viewBox="0 0 16 16"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <path d="M2 2h12v2H2V2zm2 4h8v2H4V6z"/>
</svg>
