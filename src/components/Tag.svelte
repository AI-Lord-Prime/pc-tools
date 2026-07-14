<script lang="ts">
  export let type: 'success' | 'warning' | 'danger' | 'info' | 'default' = 'default'
  export let size: 'small' | 'default' = 'small'
</script>

<span class="tag tag-{type} tag-{size}">
  <slot />
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    font-weight: 500;
    border: 1px solid transparent;
  }
  .tag-small {
    padding: 2px 6px;
    font-size: 12px;
  }
  .tag-success {
    background: #dcfce7;
    color: #166534;
  }
  .tag-warning {
    background: #fef3c7;
    color: #92400e;
  }
  .tag-danger {
    background: #fee2e2;
    color: #991b1b;
  }
  .tag-info {
    background: #e0f2fe;
    color: #0c4a6e;
  }
  .tag-default {
    background: #f1f5f9;
    color: #475569;
  }
</style>
