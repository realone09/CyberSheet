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
  {/* Grid cells with unlock icon */} <rect x="3" y="3" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <rect x="11" y="3" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <rect x="3" y="11" width="6" height="6" fill="none" stroke="#0078D4" strokeWidth="1.5" /> {/* Unlocked padlock */} <rect x="12" y="13" width="4" height="4" rx="0.5" fill="#107C10" /> <path d="M13 13 L13 11.5 Q13 10.5 14 10.5 Q15 10.5 15 11.5 L15 12" fill="none" stroke="#107C10" strokeWidth="1.2" />
</svg>
