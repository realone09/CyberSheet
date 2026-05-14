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
  <path d="M10 3 L10 7 L6 7 M10 3 C7 3 5 5 5 7 M10 13 L10 9 L14 9 M10 13 C13 13 15 11 15 9" stroke="#00A859" strokeWidth="1.5" fill="none"/>
</svg>
