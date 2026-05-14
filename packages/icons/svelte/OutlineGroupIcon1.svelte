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
  {/* Group icon - bracket with lines */} <path d="M4 3 L2 3 L2 13 L4 13" stroke="#0078D4" strokeWidth="1.5" fill="none"/> <line x1="6" y1="5" x2="14" y2="5" stroke="#333" strokeWidth="1"/> <line x1="6" y1="8" x2="14" y2="8" stroke="#333" strokeWidth="1"/> <line x1="6" y1="11" x2="14" y2="11" stroke="#333" strokeWidth="1"/> <circle cx="16" cy="8" r="2" fill="#0078D4"/> <text x="15" y="10" fontSize="4" fill="#FFF" fontWeight="bold">-</text>
</svg>
