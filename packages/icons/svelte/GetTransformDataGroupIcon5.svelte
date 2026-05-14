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
  <rect x="2" y="2" width="6" height="12" stroke="#0078D4" strokeWidth="1" fill="none"/> <rect x="12" y="2" width="6" height="12" stroke="#0078D4" strokeWidth="1" fill="none"/> <path d="M8 8 L12 8" stroke="#00A859" strokeWidth="1.5"/>
</svg>
