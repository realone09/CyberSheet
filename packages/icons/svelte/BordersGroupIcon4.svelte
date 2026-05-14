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
  <path d="M14 2l-12 12M13 1 l-1 1 1 1 1-1-1-1z"/> <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5"/>
</svg>
