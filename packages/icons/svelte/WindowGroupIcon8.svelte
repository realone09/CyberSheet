<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 20;
  export let height: string | number = 20;
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
  viewBox="0 0 20 20"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <rect x="3" y="3" width="12" height="12" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="5" y="5" width="12" height="12" stroke="#0078D4" strokeWidth="1.5" fill="#E3F2FD"/>
</svg>
