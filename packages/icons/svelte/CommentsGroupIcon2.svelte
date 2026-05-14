<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 16;
  export let height: string | number = 16;
  export let fill: string = 'currentColor';
  export let stroke: string = '';
</script>

<svg
  class={className}
  {style}
  {width}
  {height}
  {fill}
  {stroke}
  viewBox="0 0 16 16"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  {/* Trash can icon */} <rect x="4" y="5" width="8" height="9" rx="1" fill="none" stroke="#D13438" strokeWidth="1.5" /> <line x1="3" y1="5" x2="13" y2="5" stroke="#D13438" strokeWidth="1.5" /> <path d="M6 3 L10 3" stroke="#D13438" strokeWidth="1.5" strokeLinecap="round" /> <line x1="6.5" y1="7" x2="6.5" y2="12" stroke="#D13438" strokeWidth="1" /> <line x1="9.5" y1="7" x2="9.5" y2="12" stroke="#D13438" strokeWidth="1" />
</svg>
