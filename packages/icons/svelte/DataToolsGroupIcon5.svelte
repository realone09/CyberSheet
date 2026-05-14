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
  {/* Remove duplicates icon - two squares with X */} <rect x="2" y="2" width="8" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="10" y="6" width="8" height="8" stroke="#0078D4" strokeWidth="1.5" fill="none" opacity="0.5"/> <path d="M4 4 L8 8 M8 4 L4 8" stroke="#E83E3E" strokeWidth="1.5"/>
</svg>
