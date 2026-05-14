<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 24;
  export let height: string | number = 24;
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
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  <rect x="4" y="2" width="16" height="20" stroke="#0078D4" strokeWidth="2" fill="none"/> <rect x="6" y="4" width="12" height="14" fill="#E3F2FD"/> <line x1="4" y1="18" x2="20" y2="18" stroke="#0078D4" strokeWidth="1"/>
</svg>
