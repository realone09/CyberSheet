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
  <rect x="2" y="2" width="16" height="16" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <line x1="2" y1="10" x2="18" y2="10" stroke="#0078D4" strokeWidth="2"/> <line x1="10" y1="2" x2="10" y2="18" stroke="#0078D4" strokeWidth="2"/> <circle cx="10" cy="10" r="2" fill="#0078D4"/>
</svg>
