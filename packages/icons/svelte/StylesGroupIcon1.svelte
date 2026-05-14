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
  <rect x="2" y="2" width="12" height="3" fill="#4472C4" /> <rect x="2" y="5" width="12" height="2" fill="#D9E2F3" /> <rect x="2" y="7" width="12" height="2" fill="#FFF" stroke="#ccc" strokeWidth="0.5" /> <rect x="2" y="9" width="12" height="2" fill="#D9E2F3" /> <rect x="2" y="11" width="12" height="2" fill="#FFF" stroke="#ccc" strokeWidth="0.5" />
</svg>
