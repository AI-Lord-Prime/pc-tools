<script lang="ts">
  export let title: string = ''
  export let shadow: 'never' | 'hover' | 'always' = 'always'
  export let clickable: boolean = false
  export let className: string = ''
</script>

<div class="card card-shadow-{shadow} {clickable ? 'card-clickable' : ''} {className}" on:click>
  {#if title}
    <div class="card-header">
      <slot name="header">
        <span>{title}</span>
      </slot>
    </div>
  {:else if $$slots.header}
    <div class="card-header">
      <slot name="header" />
    </div>
  {/if}
  <div class="card-body">
    <slot />
  </div>
</div>

<style>
  .card {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .card-shadow-never {
    box-shadow: none;
  }
  .card-shadow-hover:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  .card-clickable {
    cursor: pointer;
  }
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
    font-size: 15px;
    font-weight: 600;
  }
  .card-body {
    padding: 20px;
  }
  .card-header + .card-body {
    padding-top: 20px;
  }
</style>
