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
  {/* Data validation icon - check mark with exclamation */} <path d="M2 8 L6 12 L14 2" stroke="#00A859" strokeWidth="2" fill="none"/> <circle cx="16" cy="12" r="3" fill="#E83E3E"/> <text x="15.5" y="14.5" fontSize="5" fill="#FFF" fontWeight="bold">!</text>
</svg>
