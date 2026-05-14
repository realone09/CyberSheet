<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 18;
  export let height: string | number = 18;
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
  viewBox="0 0 18 18"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <circle cx="4" cy="14" r="1.5" /> <text x="7" y="13" fontSize="12" fontWeight="600">0</text> <text x="12" y="11" fontSize="10" fontWeight="600" fill="#06c">+</text>
</svg>
