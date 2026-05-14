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
  {/* Comment bubble with plus */} <rect x="2" y="4" width="14" height="10" rx="2" fill="none" stroke="#0078D4" strokeWidth="1.5" /> <path d="M8 14 L10 17 L12 14" fill="#0078D4" /> <line x1="9" y1="7" x2="9" y2="11" stroke="#0078D4" strokeWidth="1.5" /> <line x1="7" y1="9" x2="11" y2="9" stroke="#0078D4" strokeWidth="1.5" />
</svg>
