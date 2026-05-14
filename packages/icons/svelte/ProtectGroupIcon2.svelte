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
  {/* Workbook with lock icon */} <rect x="3" y="2" width="12" height="15" rx="1" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <line x1="6" y1="5" x2="12" y2="5" stroke="#0078D4" strokeWidth="1" /> <line x1="6" y1="8" x2="10" y2="8" stroke="#0078D4" strokeWidth="1" /> {/* Lock */} <rect x="13" y="11" width="5" height="6" rx="0.5" fill="#0078D4" /> <path d="M14 11 L14 9.5 Q14 8 15.5 8 Q17 8 17 9.5 L17 11" fill="none" stroke="#0078D4" strokeWidth="1.2" />
</svg>
