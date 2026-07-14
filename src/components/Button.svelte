<script lang="ts">
  export let type: 'primary' | 'success' | 'danger' | 'warning' | 'default' = 'default'
  export let size: 'small' | 'default' = 'default'
  export let loading: boolean = false
  export let disabled: boolean = false
  export let className: string = ''
</script>

<button class="btn btn-{type} btn-{size} {loading ? 'btn-loading' : ''} {className}" {disabled} on:click>
  {#if loading}
    <span class="spinner" />
  {/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-default {
    background: #ffffff;
    border-color: #e2e8f0;
    color: #334155;
  }
  .btn-default:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  .btn-primary {
    background: #3b82f6;
    color: #ffffff;
  }
  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }
  .btn-success {
    background: #22c55e;
    color: #ffffff;
  }
  .btn-success:hover:not(:disabled) {
    background: #16a34a;
  }
  .btn-danger {
    background: #ef4444;
    color: #ffffff;
  }
  .btn-danger:hover:not(:disabled) {
    background: #dc2626;
  }
  .btn-warning {
    background: #f59e0b;
    color: #ffffff;
  }
  .btn-warning:hover:not(:disabled) {
    background: #d97706;
  }
  .btn-default {
    padding: 8px 16px;
    font-size: 14px;
  }
  .btn-small {
    padding: 5px 10px;
    font-size: 12px;
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
