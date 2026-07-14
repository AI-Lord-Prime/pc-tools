<script lang="ts">
  export let percentage: number
  export let color: string = '#3b82f6'
  export let strokeWidth: number = 8
  export let type: 'line' | 'dashboard' = 'line'
  export let width: number = 120
  export let showText: boolean = true

  $: clamped = Math.max(0, Math.min(100, percentage))
  $: radius = type === 'dashboard' ? (width - strokeWidth) / 2 : 0
  $: circumference = 2 * Math.PI * radius
  $: dashoffset = circumference * (1 - clamped / 100)
</script>

{#if type === 'line'}
  <div class="progress-line">
    <div class="progress-track" style="height: {strokeWidth}px; border-radius: {strokeWidth / 2}px;">
      <div class="progress-bar" style="width: {clamped}%; background-color: {color};"></div>
    </div>
    {#if showText}
      <slot />
    {/if}
  </div>
{:else}
  <div class="progress-dashboard" style="width: {width}px; height: {width}px;">
    <svg width={width} height={width}>
      <circle
        cx={width / 2}
        cy={width / 2}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        stroke-width={strokeWidth}
      />
      <circle
        cx={width / 2}
        cy={width / 2}
        r={radius}
        fill="none"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        style="stroke-dasharray: {circumference}; stroke-dashoffset: {dashoffset}; transform: rotate(-90deg); transform-origin: 50% 50%;"
      />
    </svg>
    {#if showText}
      <div class="progress-text">
        <slot>
          <span>{clamped}%</span>
        </slot>
      </div>
    {/if}
  </div>
{/if}

<style>
  .progress-line {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .progress-track {
    flex: 1;
    background: #e2e8f0;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    border-radius: inherit;
    transition: width 0.3s ease;
  }
  .progress-dashboard {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }
</style>
