<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 20;
  export let height: string | number = 16;
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
  viewBox="0 0 20 16"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  {/* Flash fill icon - lightning bolt */} <path d="M10 2 L6 8 L10 8 L8 14 L14 6 L10 6 L12 2 Z" fill="#FFB900" stroke="#333" strokeWidth="0.5"/>
</svg>
