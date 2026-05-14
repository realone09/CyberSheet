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
  <path d="M6 8 L8 6 C9 5 11 5 12 6 L14 8 M14 8 L12 10 C11 11 9 11 8 10 L6 8" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <circle cx="6" cy="8" r="2" fill="#0078D4"/> <circle cx="14" cy="8" r="2" fill="#0078D4"/>
</svg>
