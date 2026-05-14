<script lang="ts">
  export let className: string = '';
  export let style: string = '';
  export let width: string | number = 20;
  export let height: string | number = 20;
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
  viewBox="0 0 20 20"
  xmlns="http://www.w3.org/2000/svg"
  {...$$restProps}
>
  {/* ABC with checkmark icon */} <text x="2" y="14" fill="#0078D4" fontSize="12" fontWeight="bold" fontFamily="Segoe UI" > ABC </text> <path d="M14 4 L16 6 L19 3" stroke="#107C10" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</svg>
