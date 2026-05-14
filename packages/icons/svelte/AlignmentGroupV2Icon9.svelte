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
  <path d="M2 3h12v2H2V3zm0 3h10c1.1 0 2 .9 2 2s-.9 2-2 2H9l2-2-2-2v4H7V7h3c.55 0 1-.45 1-1H2V6zm0 5h8v2H2v-2z"/>
</svg>
