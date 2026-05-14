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
  <rect x="1" y="1" width="5" height="5"/> <rect x="8" y="1" width="5" height="5"/> <rect x="1" y="8" width="5" height="5"/> <rect x="8" y="8" width="5" height="5"/>
</svg>
