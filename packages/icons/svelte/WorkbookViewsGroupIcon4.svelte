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
  <rect x="3" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="13" y="5" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="3" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <rect x="13" y="13" width="8" height="6" stroke="#0078D4" strokeWidth="1.5" fill="none"/>
</svg>
