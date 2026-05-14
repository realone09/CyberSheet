<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 100;
  export let height: string | number = 12;
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
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <line x1="0" y1="6" x2="100" y2="6" stroke={color} strokeWidth={metadata.strokeWidth} strokeDasharray={metadata.strokeDasharray} />
</svg>
