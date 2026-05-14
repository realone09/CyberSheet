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
  <rect x="2" y="4" width="10" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="8" y="8" width="10" height="8" stroke="#0078D4" strokeWidth="1.5" fill="#E3F2FD"/> <path d="M15 10 L17 12 L15 14" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
</svg>
