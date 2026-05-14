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
  {/* Accessibility person icon with checkmark */} <circle cx="10" cy="5" r="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M6 9 L10 7 L14 9" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" /> <line x1="10" y1="7" x2="10" y2="12" stroke="#0078D4" strokeWidth="1.5" /> <path d="M7 12 L10 12 L13 12" stroke="#0078D4" strokeWidth="1.5" fill="none" strokeLinecap="round" /> <line x1="8" y1="12" x2="7" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> <line x1="12" y1="12" x2="13" y2="16" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" /> {/* Checkmark */} <path d="M14 3 L15.5 4.5 L18 2" stroke="#107C10" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</svg>
