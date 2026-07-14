<script lang="ts">
  import { message, subscribe, type ToastMessage } from '../utils/message'
  import { onDestroy } from 'svelte'

  let toasts: ToastMessage[] = []
  const unsubscribe = subscribe((list) => {
    toasts = list
  })
  onDestroy(unsubscribe)
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div class="toast toast-{toast.type}">
      {toast.message}
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .toast {
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.2s ease;
  }
  .toast-success { background: #22c55e; }
  .toast-error { background: #ef4444; }
  .toast-warning { background: #f59e0b; }
  .toast-info { background: #3b82f6; }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
</style>
