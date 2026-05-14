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
  <circle cx="10" cy="10" r="7" fill="none" stroke="#0078D4" strokeWidth="1.5"/> <path d="M10 6 L10 10 L13 13" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/> <path d="M3 8 L1 10 L3 12" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
